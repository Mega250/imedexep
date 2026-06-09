CREATE OR REPLACE FUNCTION fn_institution_is_active(p_id bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $fn$
  SELECT (is_active AND deleted_at IS NULL) FROM institution WHERE id = p_id;
$fn$;

GRANT EXECUTE ON FUNCTION fn_institution_is_active(bigint) TO app_api;
