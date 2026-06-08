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
    VALUES (
        p_email, p_password_hash, 'patient',
        jsonb_build_object('display_name', btrim(p_first_name || ' ' || p_last_name))
    )
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
    VALUES (
        p_email, p_password_hash, 'doctor', p_institution_id,
        jsonb_build_object(
            'clearance_level', p_clearance_level,
            'display_name', btrim(p_first_name || ' ' || p_last_name)
        )
    )
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

UPDATE "user" u
SET access_attributes = COALESCE(u.access_attributes, '{}'::jsonb)
    || jsonb_build_object('display_name', btrim(p.first_name || ' ' || p.last_name))
FROM patient p
WHERE p.user_id = u.id
  AND u.role = 'patient'
  AND btrim(p.first_name || ' ' || p.last_name) <> ''
  AND COALESCE(btrim(u.access_attributes->>'display_name'), '') = '';

UPDATE "user" u
SET access_attributes = COALESCE(u.access_attributes, '{}'::jsonb)
    || jsonb_build_object('display_name', btrim(d.first_name || ' ' || d.last_name))
FROM doctor d
WHERE d.user_id = u.id
  AND u.role = 'doctor'
  AND btrim(d.first_name || ' ' || d.last_name) <> ''
  AND COALESCE(btrim(u.access_attributes->>'display_name'), '') = '';

UPDATE "user" u
SET access_attributes = COALESCE(u.access_attributes, '{}'::jsonb)
    || jsonb_build_object('display_name', btrim(s.first_name || ' ' || s.last_name))
FROM secretary s
WHERE s.user_id = u.id
  AND u.role = 'secretary'
  AND btrim(s.first_name || ' ' || s.last_name) <> ''
  AND COALESCE(btrim(u.access_attributes->>'display_name'), '') = '';
