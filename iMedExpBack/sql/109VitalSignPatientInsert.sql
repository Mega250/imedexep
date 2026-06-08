DROP POLICY IF EXISTS rls_vital_sign_patient_insert ON clinical.vital_sign;
CREATE POLICY rls_vital_sign_patient_insert
    ON clinical.vital_sign FOR INSERT TO app_api
    WITH CHECK (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );
