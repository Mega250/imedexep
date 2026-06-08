CREATE OR REPLACE FUNCTION set_session_context(
    p_user_id        bigint,
    p_user_role      text,
    p_institution_id bigint,
    p_ip_address     text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM set_config('app.current_user_id',         p_user_id::text,         true);
    PERFORM set_config('app.current_user_role',       p_user_role,             true);
    PERFORM set_config('app.current_institution_id',  p_institution_id::text,  true);
    PERFORM set_config('app.client_ip',               p_ip_address,            true);
END;
$$;

CREATE OR REPLACE FUNCTION get_session_user_id()
RETURNS bigint
LANGUAGE plpgsql STABLE
AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_id', true), '')::bigint;
END;
$$;

CREATE OR REPLACE FUNCTION get_session_user_role()
RETURNS text
LANGUAGE plpgsql STABLE
AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_user_role', true), '');
END;
$$;

CREATE OR REPLACE FUNCTION get_session_institution_id()
RETURNS bigint
LANGUAGE plpgsql STABLE
AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_institution_id', true), '')::bigint;
END;
$$;

CREATE OR REPLACE FUNCTION fn_get_patient_id_for_current_user()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT id
    FROM   patient
    WHERE  user_id    = NULLIF(current_setting('app.current_user_id', true), '')::bigint
      AND  deleted_at IS NULL
    LIMIT  1;
$$;

CREATE OR REPLACE FUNCTION fn_check_doctor_shift_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM doctor_shift ds
        WHERE ds.doctor_id  = NEW.doctor_id
          AND ds.weekday    = NEW.weekday
          AND ds.id        <> COALESCE(NEW.id, -1)
          AND ds.start_time < NEW.end_time
          AND ds.end_time   > NEW.start_time
    ) THEN
        RAISE EXCEPTION
            'Doctor id=% already has an overlapping shift on weekday % between % and %.',
            NEW.doctor_id, NEW.weekday, NEW.start_time, NEW.end_time
            USING ERRCODE = 'exclusion_violation';
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION audit.block_event_log_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION
        'Mutations on audit.event_log are not permitted. The audit log is append-only.'
        USING ERRCODE = 'restrict_violation';
END;
$$;

CREATE OR REPLACE FUNCTION audit.process_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_data     JSONB;
    v_new_data     JSONB;
    v_record_id    BIGINT;
    v_operation    audit_operation;
    v_changed_cols TEXT[];
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_old_data  := to_jsonb(OLD);
        v_new_data  := NULL;
        v_record_id := OLD.id;
        v_operation := 'DELETE';
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_data  := to_jsonb(OLD);
        v_new_data  := to_jsonb(NEW);
        v_record_id := NEW.id;
        v_operation := 'UPDATE';
        SELECT array_agg(key)
        INTO v_changed_cols
        FROM jsonb_each(v_old_data) o
        WHERE o.value IS DISTINCT FROM v_new_data->o.key;
    ELSIF TG_OP = 'INSERT' THEN
        v_old_data  := NULL;
        v_new_data  := to_jsonb(NEW);
        v_record_id := NEW.id;
        v_operation := 'INSERT';
    END IF;

    INSERT INTO audit.event_log (
        operation,
        table_schema,
        table_name,
        record_id,
        app_user_id,
        app_user_role,
        db_user,
        client_ip,
        institution_id,
        old_data,
        new_data,
        changed_columns,
        session_pid
    ) VALUES (
        v_operation,
        TG_TABLE_SCHEMA,
        TG_TABLE_NAME,
        v_record_id,
        get_session_user_id(),
        get_session_user_role(),
        current_user,
        current_setting('app.client_ip', true),
        NULLIF(current_setting('app.current_institution_id', true), '')::bigint,
        v_old_data,
        v_new_data,
        v_changed_cols,
        pg_backend_pid()::text
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION clinical.enforce_consultation_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.signed_at IS NOT NULL THEN
        RAISE EXCEPTION
            'Consultation record id=% is signed and immutable. Create an amendment row instead.',
            OLD.id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION clinical.enforce_prescription_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.signed_at IS NOT NULL THEN
        RAISE EXCEPTION
            'Prescription record id=% is signed and immutable.',
            OLD.id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION prevent_hard_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION
        'Hard deletes are not permitted on table "%.%". Use soft delete (deleted_at).',
        TG_TABLE_SCHEMA, TG_TABLE_NAME;
END;
$$;

CREATE OR REPLACE FUNCTION clinical.prevent_history_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    RAISE EXCEPTION
        'History table "%.%" is append-only. Updates and deletes are not permitted.',
        TG_TABLE_SCHEMA, TG_TABLE_NAME;
END;
$$;

CREATE OR REPLACE FUNCTION fn_refresh_retention_until(p_patient_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_last_attention DATE;
    v_date_of_birth  DATE;
    v_has_chronic    BOOLEAN;
    v_retention      DATE;
BEGIN
    SELECT MAX(consulted_at::date)
    INTO   v_last_attention
    FROM   clinical.consultation
    WHERE  patient_id = p_patient_id
      AND  is_current = true;

    SELECT date_of_birth
    INTO   v_date_of_birth
    FROM   patient
    WHERE  id = p_patient_id;

    SELECT EXISTS (
        SELECT 1
        FROM   clinical.persistent_disease_record
        WHERE  patient_id = p_patient_id
          AND  is_chronic  = true
          AND  (status IS NULL OR status <> 'resolved')
          AND  deleted_at IS NULL
    ) INTO v_has_chronic;

    v_retention := COALESCE(v_last_attention, CURRENT_DATE) + INTERVAL '5 years';

    IF v_date_of_birth IS NOT NULL THEN
        v_retention := GREATEST(
            v_retention,
            (v_date_of_birth + INTERVAL '23 years')::date
        );
    END IF;

    IF v_has_chronic THEN
        v_retention := '9999-12-31'::date;
    END IF;

    UPDATE patient
    SET    retention_until = v_retention
    WHERE  id = p_patient_id;
END;
$$;

CREATE OR REPLACE FUNCTION fn_trg_refresh_retention_on_consultation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM fn_refresh_retention_until(NEW.patient_id);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION fn_mark_for_archive()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count integer;
BEGIN
    UPDATE patient
    SET    archived_at = now()
    WHERE  retention_until < CURRENT_DATE
      AND  legal_hold     = false
      AND  archived_at   IS NULL;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    INSERT INTO audit.event_log (
        operation, table_schema, table_name,
        app_user_role, db_user, session_pid
    ) VALUES (
        'UPDATE', 'public', 'patient',
        'retention_job', current_user, pg_backend_pid()::text
    );

    RETURN v_count;
END;
$$;

GRANT USAGE ON SCHEMA public, clinical, catalog, audit, ui_meta TO app_api;

GRANT SELECT ON
    catalog.specialty,
    catalog.disease,
    catalog.vaccine,
    catalog.allergy,
    catalog.medication
TO app_api;

GRANT SELECT, INSERT, UPDATE ON institution TO app_api;

GRANT SELECT, INSERT, UPDATE ON "user" TO app_api;

GRANT SELECT, INSERT, UPDATE ON
    patient,
    patient_institution,
    emergency_contact,
    student_patient,
    appointment,
    qr_record_access,
    doctor,
    doctor_shift,
    secretary,
    secretary_doctor
TO app_api;

GRANT SELECT, INSERT, UPDATE ON
    catalog.institution_invitation
TO app_api;

GRANT SELECT, INSERT ON
    clinical.consultation,
    clinical.diagnosis,
    clinical.prescription,
    clinical.treatment_detail,
    clinical.vital_sign,
    clinical.vital_signs_history,
    clinical.glucose_history,
    clinical.habits_history,
    clinical.vaccine_record,
    clinical.surgery_record
TO app_api;

GRANT SELECT, INSERT, UPDATE ON
    clinical.menstrual_cycle,
    clinical.vital_signs_current,
    clinical.glucose_current,
    clinical.habits_current,
    clinical.allergy_record,
    clinical.persistent_disease_record,
    clinical.general_background
TO app_api;

GRANT SELECT ON
    ui_meta.screen,
    ui_meta.screen_field,
    ui_meta.role_screen_permission,
    ui_meta.role_field_permission
TO app_api;

GRANT EXECUTE ON FUNCTION
    set_session_context(bigint, text, bigint, text),
    get_session_user_id(),
    get_session_user_role(),
    get_session_institution_id(),
    fn_get_patient_id_for_current_user()
TO app_api;

GRANT USAGE  ON SCHEMA audit        TO app_readonly_audit;
GRANT SELECT ON audit.event_log     TO app_readonly_audit;
GRANT INSERT ON audit.event_log     TO app_api;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public, clinical, catalog, audit, ui_meta TO app_api;

REVOKE ALL ON FUNCTION fn_get_patient_id_for_current_user() FROM PUBLIC;

CREATE OR REPLACE FUNCTION fn_register_patient_user(
    p_email         text,
    p_password_hash text,
    p_curp_encrypted bytea,
    p_curp_hash     text,
    p_first_name    text,
    p_last_name     text,
    p_date_of_birth date,
    p_gender        gender_type,
    p_blood_type    blood_type,
    p_phone_encrypted bytea,
    p_street_address text,
    p_neighborhood   text,
    p_city          text,
    p_state         text,
    p_postal_code   varchar,
    p_health_questionnaire jsonb DEFAULT NULL
)
RETURNS TABLE(user_id bigint, patient_id bigint)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id    bigint;
    v_patient_id bigint;
BEGIN
    IF EXISTS (SELECT 1 FROM "user" WHERE email = p_email) THEN
        RAISE EXCEPTION 'DUPLICATE_EMAIL' USING ERRCODE = 'unique_violation';
    END IF;

    IF EXISTS (SELECT 1 FROM patient WHERE curp_hash = p_curp_hash) THEN
        RAISE EXCEPTION 'DUPLICATE_CURP' USING ERRCODE = 'unique_violation';
    END IF;

    INSERT INTO "user" (email, password_hash, role, access_attributes)
    VALUES (p_email, p_password_hash, 'patient', '{}')
    RETURNING id INTO v_user_id;

    INSERT INTO patient (
        user_id, curp_encrypted, curp_hash,
        first_name, last_name, date_of_birth,
        gender, blood_type, phone_encrypted,
        street_address, neighborhood, city, state, postal_code,
        privacy_attributes
    ) VALUES (
        v_user_id, p_curp_encrypted, p_curp_hash,
        p_first_name, p_last_name, p_date_of_birth,
        p_gender, p_blood_type, p_phone_encrypted,
        p_street_address, p_neighborhood, p_city, p_state, p_postal_code,
        jsonb_strip_nulls(
            jsonb_build_object(
                'sensitivity_level', 1,
                'registration_questionnaire', p_health_questionnaire,
                'registration_checkpoint_version', 1
            )
        )
    )
    RETURNING id INTO v_patient_id;

    RETURN QUERY SELECT v_user_id, v_patient_id;
END;
$$;

GRANT EXECUTE ON FUNCTION fn_register_patient_user(
    text, text, bytea, text, text, text, date,
    gender_type, blood_type, bytea, text, text, text, text, varchar, jsonb
) TO app_api;


CREATE OR REPLACE FUNCTION fn_get_user_for_login(p_email text)
RETURNS TABLE (
    id                 bigint,
    institution_id     bigint,
    email              text,
    password_hash      text,
    role               user_role,
    access_attributes  jsonb,
    is_active          boolean,
    email_verified     boolean,
    created_at         timestamptz,
    last_login_at      timestamptz,
    failed_login_count smallint,
    locked_until       timestamptz,
    deleted_at         timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id, u.institution_id, u.email, u.password_hash,
        u.role, u.access_attributes, u.is_active, u.email_verified, u.created_at,
        u.last_login_at, u.failed_login_count, u.locked_until, u.deleted_at
    FROM "user" u
    WHERE u.email = p_email
      AND u.is_active = true
      AND u.deleted_at IS NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION fn_get_user_for_login(text) TO app_api;


CREATE OR REPLACE FUNCTION fn_get_user_for_refresh(p_user_id bigint)
RETURNS TABLE (
    id                 bigint,
    institution_id     bigint,
    email              text,
    role               user_role,
    is_active          boolean,
    email_verified     boolean,
    deleted_at         timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id, u.institution_id, u.email, u.role,
        u.is_active, u.email_verified, u.deleted_at
    FROM "user" u
    WHERE u.id = p_user_id
      AND u.is_active = true
      AND u.deleted_at IS NULL
      AND u.email_verified = true;
END;
$$;

GRANT EXECUTE ON FUNCTION fn_get_user_for_refresh(bigint) TO app_api;


CREATE OR REPLACE FUNCTION fn_post_login_update(
    p_user_id bigint,
    p_success boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_success THEN
        UPDATE "user"
        SET failed_login_count = 0,
            last_login_at = now()
        WHERE id = p_user_id;
    ELSE
        UPDATE "user"
        SET failed_login_count = failed_login_count + 1,
            locked_until = CASE
                WHEN failed_login_count + 1 >= 5
                THEN now() + INTERVAL '30 minutes'
                ELSE locked_until
            END
        WHERE id = p_user_id;
    END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION fn_post_login_update(bigint, boolean) TO app_api;

CREATE OR REPLACE FUNCTION fn_register_doctor_user(
    p_email TEXT,
    p_password_hash TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_general_license TEXT,
    p_specialty_license TEXT,
    p_specialty_id BIGINT,
    p_sub_specialty_id BIGINT,
    p_graduation_university TEXT,
    p_contact_phone VARCHAR(10),
    p_office_location TEXT,
    p_institution_id BIGINT,
    p_clearance_level INT
)
RETURNS TABLE(user_id BIGINT, doctor_id BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id BIGINT;
    v_doctor_id BIGINT;
BEGIN
    IF EXISTS (SELECT 1 FROM "user" WHERE email = p_email) THEN
        RAISE EXCEPTION 'DUPLICATE_EMAIL';
    END IF;

    IF EXISTS (SELECT 1 FROM doctor WHERE general_license = p_general_license) THEN
        RAISE EXCEPTION 'DUPLICATE_LICENSE';
    END IF;

    INSERT INTO "user" (email, password_hash, role, institution_id, access_attributes)
    VALUES (p_email, p_password_hash, 'doctor', p_institution_id, 
            jsonb_build_object('clearance_level', p_clearance_level))
    RETURNING id INTO v_user_id;

    INSERT INTO doctor (
        user_id, general_license, specialty_license,
        first_name, last_name, specialty_id, sub_specialty_id,
        graduation_university, contact_phone, office_location
    )
    VALUES (
        v_user_id, p_general_license, p_specialty_license,
        p_first_name, p_last_name, p_specialty_id, p_sub_specialty_id,
        p_graduation_university, p_contact_phone, p_office_location
    )
    RETURNING id INTO v_doctor_id;

    RETURN QUERY SELECT v_user_id, v_doctor_id;
END;
$$;

GRANT EXECUTE ON FUNCTION fn_register_doctor_user(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BIGINT, BIGINT, TEXT, VARCHAR, TEXT, BIGINT, INT
) TO app_api;

CREATE OR REPLACE FUNCTION fn_bootstrap_superadmin(p_email text, p_hash text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  existing bigint;
  new_id bigint;
BEGIN
  SELECT id INTO existing FROM "user" WHERE role = 'superadmin' AND deleted_at IS NULL LIMIT 1;
  IF existing IS NOT NULL THEN
    RETURN existing;
  END IF;
  INSERT INTO "user" (email, password_hash, role, institution_id, is_active, email_verified)
  VALUES (lower(p_email), p_hash, 'superadmin', NULL, true, true)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$fn$;

GRANT EXECUTE ON FUNCTION fn_bootstrap_superadmin(text, text) TO app_api;
