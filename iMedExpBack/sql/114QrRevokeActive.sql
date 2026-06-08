CREATE OR REPLACE FUNCTION fn_qr_revoke_active_for_patient(p_patient_id bigint)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $fn$
  UPDATE qr_record_access SET revoked_at = now() WHERE patient_id = p_patient_id AND revoked_at IS NULL;
$fn$;

GRANT EXECUTE ON FUNCTION fn_qr_revoke_active_for_patient(bigint) TO app_api;
