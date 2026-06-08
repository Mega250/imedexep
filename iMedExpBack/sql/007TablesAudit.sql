CREATE TABLE audit.event_log (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_time      TIMESTAMPTZ NOT NULL DEFAULT now(),
    operation       audit_operation NOT NULL,
    table_schema    TEXT NOT NULL,
    table_name      TEXT NOT NULL,
    record_id       BIGINT,
    app_user_id     BIGINT,
    app_user_role   TEXT,
    db_user         TEXT NOT NULL DEFAULT current_user,
    client_ip       TEXT,
    institution_id  BIGINT,
    old_data        JSONB,
    new_data        JSONB,
    changed_columns TEXT[],
    session_pid     TEXT
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_api') THEN
        CREATE ROLE app_api LOGIN;
    ELSE
        ALTER ROLE app_api LOGIN;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_readonly_audit') THEN
        CREATE ROLE app_readonly_audit NOLOGIN;
    END IF;
END;
$$;
