CREATE TABLE IF NOT EXISTS public.password_reset_code (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES "user"(id) DEFERRABLE INITIALLY DEFERRED,
    code       VARCHAR(8) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '15 minutes',
    used_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_prc_expires_after_created
        CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_prc_user_id ON public.password_reset_code(user_id);
CREATE INDEX IF NOT EXISTS idx_prc_expires_at ON public.password_reset_code(expires_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.password_reset_code TO app_api;
GRANT USAGE, SELECT ON SEQUENCE public.password_reset_code_id_seq TO app_api;
