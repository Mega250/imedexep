CREATE TABLE IF NOT EXISTS pending_registration (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email           TEXT NOT NULL,
    role            user_role NOT NULL,
    password_hash   TEXT NOT NULL,
    payload         JSONB NOT NULL,
    curp_encrypted  BYTEA,
    curp_hash       TEXT,
    phone_encrypted BYTEA,
    general_license TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '24 hours',
    completed_at    TIMESTAMPTZ,
    deleted_at      TIMESTAMPTZ,
    CONSTRAINT chk_pending_registration_email_format
        CHECK (email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_pending_registration_payload_is_object
        CHECK (jsonb_typeof(payload) = 'object'),
    CONSTRAINT chk_pending_registration_patient_identifier
        CHECK (
            role <> 'patient'::user_role
            OR (curp_encrypted IS NOT NULL AND curp_hash IS NOT NULL)
        ),
    CONSTRAINT chk_pending_registration_doctor_identifier
        CHECK (
            role <> 'doctor'::user_role
            OR general_license IS NOT NULL
        ),
    CONSTRAINT chk_pending_registration_expires_after_created
        CHECK (expires_at > created_at),
    CONSTRAINT chk_pending_registration_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at > created_at)
);

CREATE TABLE IF NOT EXISTS pending_registration_code (
    id                       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pending_registration_id  BIGINT NOT NULL REFERENCES pending_registration(id) DEFERRABLE INITIALLY DEFERRED,
    code                     VARCHAR(6) NOT NULL,
    expires_at               TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '10 minutes',
    used_at                  TIMESTAMPTZ,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_pending_registration_code_expires_after_created
        CHECK (expires_at > created_at)
);

CREATE INDEX IF NOT EXISTS idx_pending_registration_email
    ON pending_registration (email)
    WHERE deleted_at IS NULL AND completed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_pending_registration_curp_hash
    ON pending_registration (curp_hash)
    WHERE role = 'patient' AND deleted_at IS NULL AND completed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_pending_registration_general_license
    ON pending_registration (general_license)
    WHERE role = 'doctor' AND deleted_at IS NULL AND completed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_pending_registration_expires_at
    ON pending_registration (expires_at)
    WHERE deleted_at IS NULL AND completed_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_pending_registration_code_pending_id
    ON pending_registration_code (pending_registration_id);

CREATE INDEX IF NOT EXISTS idx_pending_registration_code_expires_at
    ON pending_registration_code (expires_at);

GRANT SELECT, INSERT, UPDATE ON pending_registration TO app_api;
GRANT SELECT, INSERT, UPDATE ON pending_registration_code TO app_api;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_api;
