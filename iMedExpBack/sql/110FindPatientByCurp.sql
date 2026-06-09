CREATE OR REPLACE FUNCTION fn_get_patient_by_curp_hash(p_hash text)
RETURNS SETOF patient
LANGUAGE sql
SECURITY DEFINER
AS $fn$
  SELECT * FROM patient WHERE curp_hash = p_hash AND deleted_at IS NULL LIMIT 1;
$fn$;

GRANT EXECUTE ON FUNCTION fn_get_patient_by_curp_hash(text) TO app_api;
