CREATE OR REPLACE FUNCTION fn_qr_redeem(p_code text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
  v_id bigint;
  v_patient_id bigint;
BEGIN
  SELECT id, patient_id INTO v_id, v_patient_id
  FROM qr_record_access
  WHERE verification_code = p_code
    AND revoked_at IS NULL
    AND expires_at > now()
  LIMIT 1;
  IF v_id IS NULL THEN
    RETURN NULL;
  END IF;
  UPDATE qr_record_access SET revoked_at = now() WHERE id = v_id;
  RETURN v_patient_id;
END;
$fn$;

GRANT EXECUTE ON FUNCTION fn_qr_redeem(text) TO app_api;

CREATE OR REPLACE FUNCTION fn_get_patient_by_id(p_id bigint)
RETURNS SETOF patient
LANGUAGE sql
SECURITY DEFINER
AS $fn$
  SELECT * FROM patient WHERE id = p_id AND deleted_at IS NULL LIMIT 1;
$fn$;

GRANT EXECUTE ON FUNCTION fn_get_patient_by_id(bigint) TO app_api;
