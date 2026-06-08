CREATE TABLE institution (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type       institution_type NOT NULL,
    name       TEXT NOT NULL,
    address    TEXT,
    phone      TEXT,
    is_active  BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT chk_institution_name_length
        CHECK (char_length(trim(name)) BETWEEN 2 AND 255),
    CONSTRAINT chk_institution_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at > created_at)
);

CREATE TABLE "user" (
    id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    institution_id     BIGINT REFERENCES institution(id) DEFERRABLE INITIALLY DEFERRED,
    email              TEXT NOT NULL,
    password_hash      TEXT NOT NULL,
    role               user_role NOT NULL,
    access_attributes  JSONB NOT NULL DEFAULT '{}',
    is_active          BOOLEAN NOT NULL DEFAULT true,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login_at      TIMESTAMPTZ,
    failed_login_count SMALLINT NOT NULL DEFAULT 0,
    locked_until       TIMESTAMPTZ,
    deleted_at         TIMESTAMPTZ,
    email_verified     BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT uq_user_email
        UNIQUE (email),
    CONSTRAINT chk_user_email_format
        CHECK (email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_user_failed_login_count
        CHECK (failed_login_count >= 0),
    CONSTRAINT chk_user_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at > created_at),
    CONSTRAINT chk_user_locked_until_after_now
        CHECK (locked_until IS NULL OR locked_until > created_at),
    CONSTRAINT chk_user_access_attributes_is_object
        CHECK (jsonb_typeof(access_attributes) = 'object'),
    CONSTRAINT chk_user_no_admin_override_key
        CHECK (NOT (access_attributes ? 'admin_override')),
    CONSTRAINT chk_user_doctor_has_clearance_level
        CHECK (
            role <> 'doctor'::user_role OR (
                (access_attributes->>'clearance_level') IS NOT NULL
                AND (access_attributes->>'clearance_level')::int BETWEEN 1 AND 5
            )
        )
);

CREATE TABLE email_verification_code (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    BIGINT NOT NULL REFERENCES "user"(id) DEFERRABLE INITIALLY DEFERRED,
    code       VARCHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '10 minutes',
    used_at    TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_evc_expires_after_created 
        CHECK (expires_at > created_at)
);
CREATE INDEX idx_evc_user_id ON email_verification_code(user_id);
CREATE INDEX idx_evc_expires_at ON email_verification_code(expires_at);

CREATE TABLE doctor (
    id                    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id               BIGINT NOT NULL REFERENCES "user"(id) DEFERRABLE INITIALLY DEFERRED,
    general_license       TEXT NOT NULL,
    specialty_license     TEXT,
    first_name            TEXT NOT NULL,
    last_name             TEXT NOT NULL,
    specialty_id          BIGINT NOT NULL REFERENCES catalog.specialty(id) DEFERRABLE INITIALLY DEFERRED,
    sub_specialty_id      BIGINT REFERENCES catalog.specialty(id) DEFERRABLE INITIALLY DEFERRED,
    graduation_university TEXT,
    contact_phone         VARCHAR(10),
    office_location       TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at            TIMESTAMPTZ,
    CONSTRAINT uq_doctor_user_id
        UNIQUE (user_id),
    CONSTRAINT uq_doctor_general_license
        UNIQUE (general_license),
    CONSTRAINT chk_doctor_first_name_not_empty
        CHECK (char_length(trim(first_name)) > 0),
    CONSTRAINT chk_doctor_last_name_not_empty
        CHECK (char_length(trim(last_name)) > 0),
    CONSTRAINT chk_doctor_contact_phone_format
        CHECK (contact_phone IS NULL OR contact_phone ~ '^[0-9]{10}$'),
    CONSTRAINT chk_doctor_sub_specialty_differs_from_specialty
        CHECK (sub_specialty_id IS NULL OR sub_specialty_id <> specialty_id),
    CONSTRAINT chk_doctor_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at > created_at)
);

CREATE TABLE patient (
    id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id            BIGINT REFERENCES "user"(id) DEFERRABLE INITIALLY DEFERRED,
    registrado         BOOLEAN NOT NULL DEFAULT false,
    curp_encrypted     BYTEA NOT NULL,
    curp_hash          TEXT NOT NULL,
    first_name         TEXT NOT NULL,
    last_name          TEXT NOT NULL,
    date_of_birth      DATE NOT NULL,
    gender             gender_type,
    blood_type         blood_type,
    phone_encrypted    BYTEA,
    street_address     TEXT,
    neighborhood       TEXT,
    postal_code        VARCHAR(5),
    city               TEXT,
    state              TEXT,
    privacy_attributes JSONB NOT NULL DEFAULT '{"sensitivity_level": 1}',
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at         TIMESTAMPTZ,

    retention_until    DATE,
    legal_hold         BOOLEAN NOT NULL DEFAULT false,
    legal_hold_reason  TEXT,
    archived_at        TIMESTAMPTZ,

    CONSTRAINT uq_patient_curp_hash
        UNIQUE (curp_hash),
    CONSTRAINT uq_patient_user_id
        UNIQUE (user_id),
    CONSTRAINT chk_patient_dob_is_past
        CHECK (date_of_birth < CURRENT_DATE),
    CONSTRAINT chk_patient_dob_is_realistic
        CHECK (date_of_birth > '1900-01-01'),
    CONSTRAINT chk_patient_postal_code_format
        CHECK (postal_code IS NULL OR postal_code ~ '^[0-9]{5}$'),
    CONSTRAINT chk_patient_first_name_not_empty
        CHECK (char_length(trim(first_name)) > 0),
    CONSTRAINT chk_patient_last_name_not_empty
        CHECK (char_length(trim(last_name)) > 0),
    CONSTRAINT chk_patient_privacy_attrs_is_object
        CHECK (jsonb_typeof(privacy_attributes) = 'object'),
    CONSTRAINT chk_patient_privacy_attrs_has_sensitivity_level
        CHECK (
            (privacy_attributes->>'sensitivity_level') IS NOT NULL
            AND (privacy_attributes->>'sensitivity_level')::int BETWEEN 1 AND 5
        ),
    CONSTRAINT chk_patient_no_arbitrary_privilege_escalation
        CHECK (NOT (privacy_attributes ? 'admin_override')),
    CONSTRAINT chk_patient_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at > created_at),
    CONSTRAINT chk_patient_legal_hold_requires_reason
        CHECK (legal_hold = false OR legal_hold_reason IS NOT NULL),
    CONSTRAINT chk_patient_archived_after_created
        CHECK (archived_at IS NULL OR archived_at > created_at),
    CONSTRAINT chk_patient_no_archive_on_legal_hold
        CHECK (NOT (archived_at IS NOT NULL AND legal_hold = true))
);

CREATE TABLE emergency_contact (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id   BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    full_name    TEXT NOT NULL,
    phone        VARCHAR(10) NOT NULL,
    relationship TEXT NOT NULL,
    is_primary   BOOLEAN NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at   TIMESTAMPTZ,
    CONSTRAINT chk_ec_phone_format
        CHECK (phone ~ '^[0-9]{10}$'),
    CONSTRAINT chk_ec_full_name_not_empty
        CHECK (char_length(trim(full_name)) > 0),
    CONSTRAINT chk_ec_relationship_not_empty
        CHECK (char_length(trim(relationship)) > 0),
    CONSTRAINT chk_ec_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at > created_at)
);

CREATE TABLE patient_institution (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id     BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    institution_id BIGINT NOT NULL REFERENCES institution(id) DEFERRABLE INITIALLY DEFERRED,
    record_number  TEXT,
    linked_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    unlinked_at    TIMESTAMPTZ,
    CONSTRAINT uq_patient_institution
        UNIQUE (patient_id, institution_id),
    CONSTRAINT uq_institution_record_number
        UNIQUE (institution_id, record_number),
    CONSTRAINT chk_pi_unlinked_after_linked
        CHECK (unlinked_at IS NULL OR unlinked_at > linked_at)
);

CREATE TABLE student_patient (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id     BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    control_number TEXT NOT NULL,
    career         TEXT,
    semester       SMALLINT,
    study_group    TEXT,
    CONSTRAINT uq_student_patient
        UNIQUE (patient_id),
    CONSTRAINT uq_student_control_number
        UNIQUE (control_number),
    CONSTRAINT chk_student_semester_range
        CHECK (semester IS NULL OR semester BETWEEN 1 AND 20)
);

CREATE TABLE qr_record_access (
    id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id         BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    token_hash         TEXT NOT NULL,
    verification_code  VARCHAR(8) NOT NULL,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at         TIMESTAMPTZ NOT NULL,
    revoked_at         TIMESTAMPTZ,
    created_by_user_id BIGINT NOT NULL REFERENCES "user"(id) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT uq_qr_token_hash
        UNIQUE (token_hash),
    CONSTRAINT chk_qr_expires_after_created
        CHECK (expires_at > created_at),
    CONSTRAINT chk_qr_expiry_window
        CHECK (expires_at <= created_at + INTERVAL '24 hours'),
    CONSTRAINT chk_qr_revoked_after_created
        CHECK (revoked_at IS NULL OR revoked_at >= created_at)
);

CREATE TABLE ui_meta.screen (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    screen_key  TEXT NOT NULL,
    description TEXT,
    CONSTRAINT uq_screen_key
        UNIQUE (screen_key),
    CONSTRAINT chk_screen_key_not_empty
        CHECK (char_length(trim(screen_key)) > 0)
);

CREATE TABLE ui_meta.screen_field (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    screen_id     BIGINT NOT NULL REFERENCES ui_meta.screen(id) DEFERRABLE INITIALLY DEFERRED,
    field_key     TEXT NOT NULL,
    field_label   TEXT NOT NULL,
    field_type    TEXT NOT NULL,
    is_required   BOOLEAN NOT NULL DEFAULT false,
    display_order SMALLINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_screen_field
        UNIQUE (screen_id, field_key),
    CONSTRAINT chk_field_type_valid
        CHECK (field_type IN (
            'text', 'number', 'date', 'datetime',
            'boolean', 'select', 'textarea', 'hidden', 'readonly'
        )),
    CONSTRAINT chk_field_key_not_empty
        CHECK (char_length(trim(field_key)) > 0)
);

CREATE TABLE ui_meta.role_screen_permission (
    id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role      user_role NOT NULL,
    screen_id BIGINT NOT NULL REFERENCES ui_meta.screen(id) DEFERRABLE INITIALLY DEFERRED,
    can_view  BOOLEAN NOT NULL DEFAULT false,
    can_edit  BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT uq_role_screen_permission
        UNIQUE (role, screen_id),
    CONSTRAINT chk_rsp_edit_requires_view
        CHECK (NOT can_edit OR can_view)
);

CREATE TABLE ui_meta.role_field_permission (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role            user_role NOT NULL,
    screen_field_id BIGINT NOT NULL REFERENCES ui_meta.screen_field(id) DEFERRABLE INITIALLY DEFERRED,
    can_view        BOOLEAN NOT NULL DEFAULT false,
    can_edit        BOOLEAN NOT NULL DEFAULT false,
    is_masked       BOOLEAN NOT NULL DEFAULT false,
    mask_pattern    TEXT,
    CONSTRAINT uq_role_field_permission
        UNIQUE (role, screen_field_id),
    CONSTRAINT chk_rfp_edit_requires_view
        CHECK (NOT can_edit OR can_view),
    CONSTRAINT chk_rfp_mask_pattern_requires_masked
        CHECK (mask_pattern IS NULL OR is_masked = true)
);

CREATE TABLE doctor_shift (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    doctor_id       BIGINT NOT NULL REFERENCES doctor(id) DEFERRABLE INITIALLY DEFERRED,
    institution_id  BIGINT NOT NULL REFERENCES institution(id) DEFERRABLE INITIALLY DEFERRED,
    weekday         SMALLINT NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    assigned_office TEXT,
    shift_type      TEXT,
    CONSTRAINT uq_doctor_shift
        UNIQUE (doctor_id, institution_id, weekday, start_time),
    CONSTRAINT chk_doctor_shift_weekday_range
        CHECK (weekday BETWEEN 0 AND 6),
    CONSTRAINT chk_doctor_shift_time_order
        CHECK (end_time > start_time)
);

CREATE TABLE appointment (
    id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    institution_id     BIGINT NOT NULL REFERENCES institution(id) DEFERRABLE INITIALLY DEFERRED,
    patient_id         BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    doctor_id          BIGINT NOT NULL REFERENCES doctor(id) DEFERRABLE INITIALLY DEFERRED,
    created_by_user_id BIGINT NOT NULL REFERENCES "user"(id) DEFERRABLE INITIALLY DEFERRED,
    scheduled_at       TIMESTAMPTZ NOT NULL,
    reason             TEXT,
    status             appointment_status NOT NULL DEFAULT 'scheduled',
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at         TIMESTAMPTZ,
    CONSTRAINT uq_appointment_doctor_timeslot
        UNIQUE (doctor_id, scheduled_at),
    CONSTRAINT chk_appointment_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at > created_at)
);

CREATE TABLE secretary (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES "user"(id) DEFERRABLE INITIALLY DEFERRED,
    first_name      TEXT NOT NULL,
    last_name       TEXT NOT NULL,
    employee_number TEXT,
    contact_phone   VARCHAR(10),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at      TIMESTAMPTZ,
    
    CONSTRAINT uq_secretary_user_id
        UNIQUE (user_id),
    CONSTRAINT uq_secretary_employee_number
        UNIQUE (employee_number),
    CONSTRAINT chk_secretary_first_name_not_empty
        CHECK (char_length(trim(first_name)) > 0),
    CONSTRAINT chk_secretary_last_name_not_empty
        CHECK (char_length(trim(last_name)) > 0),
    CONSTRAINT chk_secretary_contact_phone_format
        CHECK (contact_phone IS NULL OR contact_phone ~ '^[0-9]{10}$'),
    CONSTRAINT chk_secretary_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at > created_at)
);

CREATE TABLE secretary_doctor (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    secretary_id        BIGINT NOT NULL REFERENCES secretary(id) DEFERRABLE INITIALLY DEFERRED,
    doctor_id           BIGINT NOT NULL REFERENCES doctor(id) DEFERRABLE INITIALLY DEFERRED,
    assigned_by_user_id BIGINT NOT NULL REFERENCES "user"(id) DEFERRABLE INITIALLY DEFERRED,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ,
    CONSTRAINT uq_secretary_doctor
        UNIQUE (secretary_id, doctor_id),
    CONSTRAINT chk_sec_doc_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at > created_at)
);
