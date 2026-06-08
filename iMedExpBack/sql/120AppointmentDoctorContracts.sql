CREATE OR REPLACE FUNCTION fn_doctor_institution_id(p_doctor_id BIGINT)
RETURNS BIGINT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT u.institution_id
    FROM doctor d
    JOIN "user" u ON u.id = d.user_id
    JOIN institution i ON i.id = u.institution_id
    WHERE d.id = p_doctor_id
      AND d.deleted_at IS NULL
      AND u.deleted_at IS NULL
      AND u.is_active = true
      AND i.deleted_at IS NULL
      AND i.is_active = true
$$;

REVOKE ALL ON FUNCTION fn_doctor_institution_id(BIGINT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION fn_doctor_institution_id(BIGINT) TO app_api;

CREATE OR REPLACE FUNCTION fn_available_doctors_for_patient(p_user_id BIGINT)
RETURNS TABLE (
    doctor_id BIGINT,
    institution_id BIGINT,
    clearance_level INTEGER,
    last_name TEXT,
    first_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT DISTINCT
        d.id,
        u.institution_id,
        CASE
            WHEN u.access_attributes->>'clearance_level' ~ '^\d+$'
            THEN (u.access_attributes->>'clearance_level')::INTEGER
            ELSE 1
        END,
        d.last_name,
        d.first_name
    FROM patient p
    JOIN patient_institution pi
      ON pi.patient_id = p.id
     AND pi.unlinked_at IS NULL
    JOIN institution i
      ON i.id = pi.institution_id
     AND i.deleted_at IS NULL
     AND i.is_active = true
    JOIN "user" u
      ON u.institution_id = i.id
     AND u.role = 'doctor'
     AND u.deleted_at IS NULL
     AND u.is_active = true
    JOIN doctor d
      ON d.user_id = u.id
     AND d.deleted_at IS NULL
    WHERE p.user_id = p_user_id
      AND p.deleted_at IS NULL
$$;

REVOKE ALL ON FUNCTION fn_available_doctors_for_patient(BIGINT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION fn_available_doctors_for_patient(BIGINT) TO app_api;

DROP POLICY IF EXISTS rls_appointment_staff ON appointment;

CREATE POLICY rls_appointment_staff
    ON appointment FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'secretary', 'institution_admin', 'superadmin')
        AND (
            get_session_user_role() = 'superadmin'
            OR institution_id = get_session_institution_id()
        )
        AND deleted_at IS NULL
    )
    WITH CHECK (
        get_session_user_role() IN ('doctor', 'secretary', 'institution_admin', 'superadmin')
        AND (
            get_session_user_role() = 'superadmin'
            OR institution_id = get_session_institution_id()
        )
        AND deleted_at IS NULL
    );

DROP POLICY IF EXISTS rls_appointment_patient ON appointment;
DROP POLICY IF EXISTS rls_appointment_patient_select ON appointment;
DROP POLICY IF EXISTS rls_appointment_patient_insert ON appointment;
DROP POLICY IF EXISTS rls_appointment_patient_update ON appointment;

CREATE POLICY rls_appointment_patient_select
    ON appointment FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND deleted_at IS NULL
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_appointment_patient_insert
    ON appointment FOR INSERT TO app_api
    WITH CHECK (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
        AND created_by_user_id = get_session_user_id()
        AND institution_id = fn_doctor_institution_id(doctor_id)
        AND EXISTS (
            SELECT 1
            FROM patient_institution pi
            WHERE pi.patient_id = appointment.patient_id
              AND pi.institution_id = appointment.institution_id
              AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_appointment_patient_update
    ON appointment FOR UPDATE TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND deleted_at IS NULL
        AND patient_id = fn_get_patient_id_for_current_user()
        AND status IN ('scheduled', 'confirmed')
    )
    WITH CHECK (
        get_session_user_role() = 'patient'
        AND deleted_at IS NULL
        AND patient_id = fn_get_patient_id_for_current_user()
        AND institution_id = fn_doctor_institution_id(doctor_id)
        AND status IN ('scheduled', 'confirmed', 'cancelled')
    );

ALTER TABLE doctor_shift
    ADD COLUMN IF NOT EXISTS shift_type TEXT;

UPDATE doctor_shift
SET shift_type = 'Consulta'
WHERE shift_type IS NULL;
