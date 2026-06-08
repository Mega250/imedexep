CREATE TABLE IF NOT EXISTS public.personal_log (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    role        TEXT NOT NULL CHECK (role IN ('estudiante', 'docente', 'admin')),
    fields      JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_personal_log_user_created
    ON public.personal_log (user_id, created_at DESC)
    WHERE deleted_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_log TO app_api;
GRANT USAGE, SELECT ON SEQUENCE public.personal_log_id_seq TO app_api;
