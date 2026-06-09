CREATE OR REPLACE FUNCTION fn_admin_stats()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $fn$
  SELECT json_build_object(
    'institutions', (SELECT count(*) FROM institution WHERE deleted_at IS NULL),
    'patients', (SELECT count(*) FROM "user" WHERE role = 'patient' AND deleted_at IS NULL),
    'doctors', (SELECT count(*) FROM "user" WHERE role = 'doctor' AND deleted_at IS NULL),
    'secretaries', (SELECT count(*) FROM "user" WHERE role = 'secretary' AND deleted_at IS NULL),
    'institution_admins', (SELECT count(*) FROM "user" WHERE role = 'institution_admin' AND deleted_at IS NULL),
    'superadmins', (SELECT count(*) FROM "user" WHERE role = 'superadmin' AND deleted_at IS NULL),
    'events_24h', (SELECT count(*) FROM audit.event_log WHERE event_time > now() - interval '24 hours'),
    'events_total', (SELECT count(*) FROM audit.event_log)
  );
$fn$;

GRANT EXECUTE ON FUNCTION fn_admin_stats() TO app_api;

CREATE OR REPLACE FUNCTION fn_institution_stats(p_id bigint)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $fn$
  SELECT json_build_object(
    'doctors', (SELECT count(*) FROM "user" WHERE role = 'doctor' AND institution_id = p_id AND deleted_at IS NULL),
    'secretaries', (SELECT count(*) FROM "user" WHERE role = 'secretary' AND institution_id = p_id AND deleted_at IS NULL),
    'patients', (SELECT count(*) FROM patient_institution WHERE institution_id = p_id AND unlinked_at IS NULL)
  );
$fn$;

GRANT EXECUTE ON FUNCTION fn_institution_stats(bigint) TO app_api;

CREATE OR REPLACE FUNCTION fn_audit_events(p_limit int)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $fn$
  SELECT coalesce(json_agg(e), '[]'::json) FROM (
    SELECT event_time, operation::text AS operation, table_schema, table_name,
           record_id, app_user_id, app_user_role, institution_id
    FROM audit.event_log
    ORDER BY event_time DESC
    LIMIT p_limit
  ) e;
$fn$;

GRANT EXECUTE ON FUNCTION fn_audit_events(int) TO app_api;
