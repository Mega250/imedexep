set -eu

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<EOSQL
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_api') THEN
        EXECUTE format('CREATE ROLE app_api LOGIN PASSWORD %L', '${APP_API_PASSWORD}');
    ELSE
        EXECUTE format('ALTER ROLE app_api LOGIN PASSWORD %L LOGIN', '${APP_API_PASSWORD}');
    END IF;

    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_readonly_audit') THEN
        CREATE ROLE app_readonly_audit NOLOGIN;
    END IF;
END;
\$\$;
EOSQL
