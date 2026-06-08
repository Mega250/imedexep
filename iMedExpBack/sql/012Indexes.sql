CREATE INDEX idx_audit_event_time ON audit.event_log (event_time);
CREATE INDEX idx_audit_app_user   ON audit.event_log (app_user_id);
CREATE INDEX idx_audit_table      ON audit.event_log (table_schema, table_name);
CREATE INDEX idx_audit_record     ON audit.event_log (table_schema, table_name, record_id);
CREATE INDEX idx_audit_operation  ON audit.event_log (operation);

CREATE INDEX idx_patient_deleted_at
    ON patient (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_patient_user_id
    ON patient (user_id);
CREATE INDEX ids_patient_curp 
    ON patient(curp_hash) WHERE registrado = true;
CREATE INDEX idx_user_role
    ON "user" (role);
CREATE INDEX idx_user_institution
    ON "user" (institution_id);
CREATE INDEX idx_user_is_active
    ON "user" (is_active) WHERE is_active = true;

CREATE UNIQUE INDEX IF NOT EXISTS uq_pending_invitation 
    ON catalog.institution_invitation (institution_id, doctor_id) 
    WHERE (status = 'pending');

CREATE INDEX IF NOT EXISTS idx_invitation_doctor 
    ON catalog.institution_invitation(doctor_id) 
    WHERE (status = 'pending');

CREATE INDEX idx_appointment_patient
    ON appointment (patient_id);
CREATE INDEX idx_appointment_doctor
    ON appointment (doctor_id);
CREATE INDEX idx_appointment_institution
    ON appointment (institution_id);
CREATE INDEX idx_appointment_scheduled_at
    ON appointment (scheduled_at);
CREATE INDEX idx_appointment_deleted_at
    ON appointment (deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX idx_pi_institution
    ON patient_institution (institution_id);
CREATE INDEX idx_pi_patient
    ON patient_institution (patient_id);

CREATE INDEX idx_consultation_patient
    ON clinical.consultation (patient_id);
CREATE INDEX idx_consultation_doctor
    ON clinical.consultation (doctor_id);
CREATE INDEX idx_consultation_institution
    ON clinical.consultation (institution_id);
CREATE INDEX idx_consultation_is_current
    ON clinical.consultation (is_current) WHERE is_current = true;
CREATE INDEX idx_consultation_parent
    ON clinical.consultation (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_consultation_consulted_at
    ON clinical.consultation (consulted_at);

CREATE INDEX idx_prescription_consultation
    ON clinical.prescription (consultation_id);
CREATE INDEX idx_prescription_patient
    ON clinical.prescription (patient_id);
CREATE INDEX idx_prescription_doctor
    ON clinical.prescription (doctor_id);

CREATE INDEX idx_vsh_patient
    ON clinical.vital_signs_history (patient_id);
CREATE INDEX idx_vsh_recorded_at
    ON clinical.vital_signs_history (recorded_at);

CREATE INDEX idx_gh_patient
    ON clinical.glucose_history (patient_id);
CREATE INDEX idx_gh_recorded_at
    ON clinical.glucose_history (recorded_at);

CREATE INDEX idx_hh_patient
    ON clinical.habits_history (patient_id);

CREATE INDEX idx_allergy_patient
    ON clinical.allergy_record (patient_id);
CREATE INDEX idx_vaccine_patient
    ON clinical.vaccine_record (patient_id);
CREATE INDEX idx_surgery_patient
    ON clinical.surgery_record (patient_id);
CREATE INDEX idx_pdr_patient
    ON clinical.persistent_disease_record (patient_id);

CREATE INDEX idx_patient_retention
    ON patient (retention_until)
    WHERE archived_at IS NULL AND legal_hold = false;

CREATE INDEX idx_patient_legal_hold
    ON patient (legal_hold)
    WHERE legal_hold = true;

CREATE INDEX idx_qr_expires_at
    ON qr_record_access (expires_at) WHERE revoked_at IS NULL;

CREATE INDEX idx_doctor_shift_doctor
    ON doctor_shift (doctor_id);

CREATE INDEX idx_ui_role_screen
    ON ui_meta.role_screen_permission (role);
CREATE INDEX idx_ui_role_field
    ON ui_meta.role_field_permission (role);

CREATE INDEX idx_vital_sign_patient_date 
    ON clinical.vital_sign(patient_id, recorded_at DESC);

CREATE INDEX idx_menstrual_cycle_patient_start
    ON clinical.menstrual_cycle(patient_id, period_start_date DESC)
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX uq_menstrual_cycle_patient_start_active
    ON clinical.menstrual_cycle(patient_id, period_start_date)
    WHERE deleted_at IS NULL;
