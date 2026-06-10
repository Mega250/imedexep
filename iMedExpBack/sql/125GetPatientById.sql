CREATE OR REPLACE FUNCTION fn_get_patient_by_id(p_id bigint)
RETURNS SETOF patient
LANGUAGE sql
SECURITY DEFINER
AS $fn$
  SELECT * FROM patient WHERE id = p_id AND deleted_at IS NULL LIMIT 1;
$fn$;

GRANT EXECUTE ON FUNCTION fn_get_patient_by_id(bigint) TO app_api;
