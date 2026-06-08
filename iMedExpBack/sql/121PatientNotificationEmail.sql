CREATE OR REPLACE FUNCTION fn_patient_notification_email(p_patient_id BIGINT)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT u.email
    FROM patient p
    JOIN "user" u ON u.id = p.user_id
    WHERE p.id = p_patient_id
      AND p.deleted_at IS NULL
      AND u.deleted_at IS NULL
      AND (
          get_session_user_role() = 'superadmin'
          OR (
              get_session_user_role() = 'patient'
              AND p.user_id = get_session_user_id()
          )
          OR (
              get_session_user_role() IN ('doctor', 'secretary', 'institution_admin')
              AND EXISTS (
                  SELECT 1
                  FROM patient_institution pi
                  WHERE pi.patient_id = p.id
                    AND pi.institution_id = get_session_institution_id()
                    AND pi.unlinked_at IS NULL
              )
          )
      )
    LIMIT 1
$$;

REVOKE ALL ON FUNCTION fn_patient_notification_email(BIGINT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION fn_patient_notification_email(BIGINT) TO app_api;
