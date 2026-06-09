CREATE TRIGGER trg_block_event_log_update
    BEFORE UPDATE ON audit.event_log
    FOR EACH ROW EXECUTE FUNCTION audit.block_event_log_mutation();

CREATE TRIGGER trg_block_event_log_delete
    BEFORE DELETE ON audit.event_log
    FOR EACH ROW EXECUTE FUNCTION audit.block_event_log_mutation();

CREATE TRIGGER trg_doctor_shift_no_overlap
    BEFORE INSERT OR UPDATE ON doctor_shift
    FOR EACH ROW EXECUTE FUNCTION fn_check_doctor_shift_overlap();

CREATE TRIGGER audit_patient
    AFTER INSERT OR UPDATE OR DELETE ON patient
    FOR EACH ROW EXECUTE FUNCTION audit.process_audit_event();

CREATE TRIGGER audit_user
    AFTER INSERT OR UPDATE OR DELETE ON "user"
    FOR EACH ROW EXECUTE FUNCTION audit.process_audit_event();

CREATE TRIGGER audit_appointment
    AFTER INSERT OR UPDATE OR DELETE ON appointment
    FOR EACH ROW EXECUTE FUNCTION audit.process_audit_event();

CREATE TRIGGER audit_consultation
    AFTER INSERT OR UPDATE OR DELETE ON clinical.consultation
    FOR EACH ROW EXECUTE FUNCTION audit.process_audit_event();

CREATE TRIGGER audit_diagnosis
    AFTER INSERT OR UPDATE OR DELETE ON clinical.diagnosis
    FOR EACH ROW EXECUTE FUNCTION audit.process_audit_event();

CREATE TRIGGER audit_prescription
    AFTER INSERT OR UPDATE OR DELETE ON clinical.prescription
    FOR EACH ROW EXECUTE FUNCTION audit.process_audit_event();

CREATE TRIGGER audit_treatment_detail
    AFTER INSERT OR UPDATE OR DELETE ON clinical.treatment_detail
    FOR EACH ROW EXECUTE FUNCTION audit.process_audit_event();

CREATE TRIGGER audit_menstrual_cycle
    AFTER INSERT OR UPDATE OR DELETE ON clinical.menstrual_cycle
    FOR EACH ROW EXECUTE FUNCTION audit.process_audit_event();

CREATE TRIGGER audit_allergy_record
    AFTER INSERT OR UPDATE OR DELETE ON clinical.allergy_record
    FOR EACH ROW EXECUTE FUNCTION audit.process_audit_event();

CREATE TRIGGER audit_persistent_disease
    AFTER INSERT OR UPDATE OR DELETE ON clinical.persistent_disease_record
    FOR EACH ROW EXECUTE FUNCTION audit.process_audit_event();

CREATE TRIGGER immutable_consultation
    BEFORE UPDATE ON clinical.consultation
    FOR EACH ROW EXECUTE FUNCTION clinical.enforce_consultation_immutability();

CREATE TRIGGER immutable_prescription
    BEFORE UPDATE ON clinical.prescription
    FOR EACH ROW EXECUTE FUNCTION clinical.enforce_prescription_immutability();

CREATE TRIGGER no_hard_delete_patient
    BEFORE DELETE ON patient
    FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

CREATE TRIGGER no_hard_delete_consultation
    BEFORE DELETE ON clinical.consultation
    FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

CREATE TRIGGER no_hard_delete_prescription
    BEFORE DELETE ON clinical.prescription
    FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

CREATE TRIGGER no_hard_delete_menstrual_cycle
    BEFORE DELETE ON clinical.menstrual_cycle
    FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

CREATE TRIGGER trg_refresh_retention_after_consultation
    AFTER INSERT ON clinical.consultation
    FOR EACH ROW EXECUTE FUNCTION fn_trg_refresh_retention_on_consultation();

CREATE TRIGGER no_modify_vital_signs_history
    BEFORE UPDATE OR DELETE ON clinical.vital_signs_history
    FOR EACH ROW EXECUTE FUNCTION clinical.prevent_history_modification();

CREATE TRIGGER no_modify_glucose_history
    BEFORE UPDATE OR DELETE ON clinical.glucose_history
    FOR EACH ROW EXECUTE FUNCTION clinical.prevent_history_modification();

CREATE TRIGGER no_modify_habits_history
    BEFORE UPDATE OR DELETE ON clinical.habits_history
    FOR EACH ROW EXECUTE FUNCTION clinical.prevent_history_modification();

CREATE TRIGGER no_modify_vaccine_record
    BEFORE UPDATE OR DELETE ON clinical.vaccine_record
    FOR EACH ROW EXECUTE FUNCTION clinical.prevent_history_modification();

CREATE TRIGGER no_modify_surgery_record
    BEFORE UPDATE OR DELETE ON clinical.surgery_record
    FOR EACH ROW EXECUTE FUNCTION clinical.prevent_history_modification();
