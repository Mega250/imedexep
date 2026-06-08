CREATE TABLE IF NOT EXISTS patient_notification (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id     BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    institution_id BIGINT REFERENCES institution(id) DEFERRABLE INITIALLY DEFERRED,
    kind           TEXT NOT NULL,
    message        TEXT NOT NULL,
    status         TEXT NOT NULL DEFAULT 'pending',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ,
    CONSTRAINT chk_pn_kind_not_empty CHECK (char_length(trim(kind)) > 0),
    CONSTRAINT chk_pn_message_not_empty CHECK (char_length(trim(message)) > 0),
    CONSTRAINT chk_pn_deleted_after_created CHECK (deleted_at IS NULL OR deleted_at > created_at)
);

CREATE TABLE IF NOT EXISTS medical_certificate (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id     BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    doctor_id      BIGINT NOT NULL REFERENCES doctor(id) DEFERRABLE INITIALLY DEFERRED,
    institution_id BIGINT REFERENCES institution(id) DEFERRABLE INITIALLY DEFERRED,
    title          TEXT NOT NULL,
    body           TEXT NOT NULL,
    issued_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ,
    CONSTRAINT chk_mc_title_not_empty CHECK (char_length(trim(title)) > 0),
    CONSTRAINT chk_mc_body_not_empty CHECK (char_length(trim(body)) > 0),
    CONSTRAINT chk_mc_deleted_after_created CHECK (deleted_at IS NULL OR deleted_at > created_at)
);

ALTER TABLE patient_notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_notification FORCE ROW LEVEL SECURITY;
ALTER TABLE medical_certificate ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_certificate FORCE ROW LEVEL SECURITY;

GRANT ALL PRIVILEGES ON TABLE patient_notification TO app_api;
GRANT ALL PRIVILEGES ON TABLE medical_certificate TO app_api;

CREATE POLICY rls_patient_notification_patient_all ON patient_notification FOR ALL TO app_api
    USING (get_session_user_role() = 'patient' AND patient_id = fn_get_patient_id_for_current_user())
    WITH CHECK (get_session_user_role() = 'patient' AND patient_id = fn_get_patient_id_for_current_user());

CREATE POLICY rls_patient_notification_staff_read ON patient_notification FOR SELECT TO app_api
    USING (
        get_session_user_role() IN ('doctor','secretary','institution_admin','superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id() AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_medical_certificate_staff_all ON medical_certificate FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor','institution_admin','superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id() AND pi.unlinked_at IS NULL
        )
    )
    WITH CHECK (
        get_session_user_role() IN ('doctor','institution_admin','superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id() AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_medical_certificate_patient_read ON medical_certificate FOR SELECT TO app_api
    USING (get_session_user_role() = 'patient' AND patient_id = fn_get_patient_id_for_current_user());

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_api;
