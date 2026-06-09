ALTER TABLE patient                            ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient                            FORCE  ROW LEVEL SECURITY;
ALTER TABLE "user"                             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user"                             FORCE  ROW LEVEL SECURITY;
ALTER TABLE appointment                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment                        FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.consultation              ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.consultation              FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.diagnosis                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.diagnosis                 FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.prescription              ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.prescription              FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.treatment_detail          ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.treatment_detail          FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.vital_sign                ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.vital_sign                FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.menstrual_cycle           ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.menstrual_cycle           FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.vital_signs_current       ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.vital_signs_current       FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.vital_signs_history       ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.vital_signs_history       FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.glucose_current           ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.glucose_current           FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.glucose_history           ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.glucose_history           FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.habits_current            ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.habits_current            FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.habits_history            ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.habits_history            FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.allergy_record            ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.allergy_record            FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.vaccine_record            ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.vaccine_record            FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.surgery_record            ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.surgery_record            FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.persistent_disease_record ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.persistent_disease_record FORCE  ROW LEVEL SECURITY;
ALTER TABLE clinical.general_background        ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical.general_background        FORCE  ROW LEVEL SECURITY;
ALTER TABLE emergency_contact                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contact                  FORCE  ROW LEVEL SECURITY;
ALTER TABLE patient_institution                ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_institution                FORCE  ROW LEVEL SECURITY;
ALTER TABLE student_patient                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_patient                    FORCE  ROW LEVEL SECURITY;
ALTER TABLE qr_record_access                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_record_access                   FORCE  ROW LEVEL SECURITY;

CREATE POLICY rls_patient_superadmin
    ON patient FOR ALL TO app_api
    USING (
        get_session_user_role() = 'superadmin'
        AND deleted_at IS NULL
    );

CREATE POLICY rls_patient_institution_admin
    ON patient FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'institution_admin'
        AND deleted_at IS NULL
        AND id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_patient_doctor
    ON patient FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'doctor'
        AND deleted_at IS NULL
        AND id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
        AND (privacy_attributes->>'sensitivity_level')::int <= (
            SELECT (u.access_attributes->>'clearance_level')::int
            FROM "user" u
            WHERE u.id = get_session_user_id()
        )
    );

CREATE POLICY rls_patient_secretary
    ON patient FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'secretary'
        AND deleted_at IS NULL
        AND id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
        AND (privacy_attributes->>'sensitivity_level')::int <= 2
    );

CREATE POLICY rls_patient_self
    ON patient FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND deleted_at IS NULL
        AND user_id = get_session_user_id()
    );

CREATE POLICY rls_patient_self_update
    ON patient FOR UPDATE TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND deleted_at IS NULL
        AND user_id = get_session_user_id()
    )
    WITH CHECK (
        get_session_user_role() = 'patient'
        AND deleted_at IS NULL
        AND user_id = get_session_user_id()
    );

CREATE POLICY rls_user_self_or_admin
    ON "user" FOR SELECT TO app_api
    USING (
        id = get_session_user_id()
        OR get_session_user_role() IN ('superadmin', 'institution_admin')
    );

CREATE POLICY rls_user_self_update
    ON "user" FOR UPDATE TO app_api
    USING (id = get_session_user_id())
    WITH CHECK (id = get_session_user_id());

CREATE POLICY rls_user_admin_insert
    ON "user" FOR INSERT TO app_api
    WITH CHECK (
        (
            get_session_user_role() = 'superadmin'
            AND role = 'institution_admin'
        )
        OR (
            get_session_user_role() = 'institution_admin'
            AND role = 'secretary'
            AND institution_id = get_session_institution_id()
        )
    );

CREATE POLICY rls_user_admin_update
    ON "user" FOR UPDATE TO app_api
    USING (
        (
            get_session_user_role() = 'superadmin'
            AND role = 'institution_admin'
        )
        OR (
            get_session_user_role() = 'institution_admin'
            AND role = 'secretary'
            AND institution_id = get_session_institution_id()
        )
    )
    WITH CHECK (
        (
            get_session_user_role() = 'superadmin'
            AND role = 'institution_admin'
        )
        OR (
            get_session_user_role() = 'institution_admin'
            AND role = 'secretary'
            AND institution_id = get_session_institution_id()
        )
    );

CREATE POLICY rls_appointment_staff
    ON appointment FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'secretary', 'institution_admin', 'superadmin')
        AND institution_id = get_session_institution_id()
        AND deleted_at IS NULL
    );

CREATE POLICY rls_appointment_patient
    ON appointment FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND deleted_at IS NULL
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_consultation_doctor
    ON clinical.consultation FOR ALL TO app_api
    USING (
        get_session_user_role() = 'doctor'
        AND is_current = true
        AND institution_id = get_session_institution_id()
        AND sensitivity_level <= (
            SELECT (u.access_attributes->>'clearance_level')::int
            FROM "user" u
            WHERE u.id = get_session_user_id()
        )
    );

CREATE POLICY rls_consultation_patient
    ON clinical.consultation FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND is_current = true
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_consultation_superadmin
    ON clinical.consultation FOR SELECT TO app_api
    USING (get_session_user_role() = 'superadmin');

CREATE POLICY rls_diagnosis_doctor
    ON clinical.diagnosis FOR ALL TO app_api
    USING (
        get_session_user_role() = 'doctor'
        AND consultation_id IN (
            SELECT id FROM clinical.consultation
            WHERE institution_id = get_session_institution_id()
              AND is_current = true
              AND sensitivity_level <= (
                  SELECT (u.access_attributes->>'clearance_level')::int
                  FROM "user" u WHERE u.id = get_session_user_id()
              )
        )
    );

CREATE POLICY rls_diagnosis_patient
    ON clinical.diagnosis FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND consultation_id IN (
            SELECT id FROM clinical.consultation
            WHERE patient_id = fn_get_patient_id_for_current_user()
              AND is_current = true
        )
    );

CREATE POLICY rls_prescription_doctor
    ON clinical.prescription FOR ALL TO app_api
    USING (
        get_session_user_role() = 'doctor'
        AND doctor_id IN (
            SELECT id FROM doctor
            WHERE user_id = get_session_user_id()
              AND deleted_at IS NULL
        )
    );

CREATE POLICY rls_prescription_patient
    ON clinical.prescription FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_treatment_detail_doctor
    ON clinical.treatment_detail FOR ALL TO app_api
    USING (
        prescription_id IN (
            SELECT pr.id
            FROM clinical.prescription pr
            WHERE pr.doctor_id IN (
                SELECT id FROM doctor
                WHERE user_id = get_session_user_id()
                  AND deleted_at IS NULL
            )
        )
    )
    WITH CHECK (
        prescription_id IN (
            SELECT pr.id
            FROM clinical.prescription pr
            WHERE pr.doctor_id IN (
                SELECT id FROM doctor
                WHERE user_id = get_session_user_id()
                  AND deleted_at IS NULL
            )
        )
    );

CREATE POLICY rls_treatment_detail_patient
    ON clinical.treatment_detail FOR SELECT TO app_api
    USING (
        prescription_id IN (
            SELECT pr.id
            FROM clinical.prescription pr
            WHERE pr.patient_id = fn_get_patient_id_for_current_user()
        )
    );

CREATE POLICY rls_vital_sign_staff
    ON clinical.vital_sign FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'institution_admin', 'superadmin')
        AND (
            get_session_user_role() = 'superadmin'
            OR patient_id IN (
                SELECT pi.patient_id FROM patient_institution pi
                WHERE pi.institution_id = get_session_institution_id()
                  AND pi.unlinked_at IS NULL
            )
        )
    )
    WITH CHECK (
        get_session_user_role() IN ('doctor', 'institution_admin', 'superadmin')
        AND (
            get_session_user_role() = 'superadmin'
            OR patient_id IN (
                SELECT pi.patient_id FROM patient_institution pi
                WHERE pi.institution_id = get_session_institution_id()
                  AND pi.unlinked_at IS NULL
            )
        )
    );

CREATE POLICY rls_vital_sign_patient
    ON clinical.vital_sign FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_menstrual_cycle_staff
    ON clinical.menstrual_cycle FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'institution_admin', 'superadmin')
        AND (
            get_session_user_role() = 'superadmin'
            OR patient_id IN (
                SELECT pi.patient_id FROM patient_institution pi
                WHERE pi.institution_id = get_session_institution_id()
                  AND pi.unlinked_at IS NULL
            )
        )
        AND deleted_at IS NULL
    )
    WITH CHECK (
        get_session_user_role() IN ('doctor', 'institution_admin', 'superadmin')
        AND (
            get_session_user_role() = 'superadmin'
            OR patient_id IN (
                SELECT pi.patient_id FROM patient_institution pi
                WHERE pi.institution_id = get_session_institution_id()
                  AND pi.unlinked_at IS NULL
            )
        )
    );

CREATE POLICY rls_menstrual_cycle_patient_select
    ON clinical.menstrual_cycle FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND deleted_at IS NULL
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_menstrual_cycle_patient_insert
    ON clinical.menstrual_cycle FOR INSERT TO app_api
    WITH CHECK (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_menstrual_cycle_patient_update
    ON clinical.menstrual_cycle FOR UPDATE TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND deleted_at IS NULL
        AND patient_id = fn_get_patient_id_for_current_user()
    )
    WITH CHECK (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_vital_signs_current_staff
    ON clinical.vital_signs_current FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'institution_admin', 'superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_vital_signs_current_patient
    ON clinical.vital_signs_current FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_vital_signs_history_staff
    ON clinical.vital_signs_history FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'institution_admin', 'superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_vital_signs_history_patient
    ON clinical.vital_signs_history FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_glucose_current_staff
    ON clinical.glucose_current FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'institution_admin', 'superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_glucose_current_patient
    ON clinical.glucose_current FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_glucose_history_staff
    ON clinical.glucose_history FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'institution_admin', 'superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_glucose_history_patient
    ON clinical.glucose_history FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_habits_current_staff
    ON clinical.habits_current FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'institution_admin', 'superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_habits_current_patient
    ON clinical.habits_current FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_habits_history_staff
    ON clinical.habits_history FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'institution_admin', 'superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_habits_history_patient
    ON clinical.habits_history FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_allergy_record_staff
    ON clinical.allergy_record FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'institution_admin', 'superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_allergy_record_patient
    ON clinical.allergy_record FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_vaccine_record_staff
    ON clinical.vaccine_record FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'institution_admin', 'superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_vaccine_record_patient
    ON clinical.vaccine_record FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_surgery_record_staff
    ON clinical.surgery_record FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'institution_admin', 'superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_surgery_record_patient
    ON clinical.surgery_record FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_persistent_disease_staff
    ON clinical.persistent_disease_record FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'institution_admin', 'superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_persistent_disease_patient
    ON clinical.persistent_disease_record FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_general_background_staff
    ON clinical.general_background FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'institution_admin', 'superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_general_background_patient
    ON clinical.general_background FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_emergency_contact_staff
    ON emergency_contact FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'secretary', 'institution_admin', 'superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_emergency_contact_patient
    ON emergency_contact FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_patient_institution_staff
    ON patient_institution FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'secretary', 'institution_admin', 'superadmin')
        AND institution_id = get_session_institution_id()
    );

CREATE POLICY rls_patient_institution_patient
    ON patient_institution FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_student_patient_staff
    ON student_patient FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'secretary', 'institution_admin', 'superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_student_patient_self
    ON student_patient FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_qr_record_access_staff
    ON qr_record_access FOR ALL TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'secretary', 'institution_admin', 'superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
              AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_qr_record_access_patient
    ON qr_record_access FOR SELECT TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_qr_record_access_creator
    ON qr_record_access FOR SELECT TO app_api
    USING (created_by_user_id = get_session_user_id());

CREATE POLICY rls_emergency_contact_staff_update
    ON emergency_contact FOR UPDATE TO app_api
    USING (
        get_session_user_role() IN ('secretary', 'institution_admin', 'superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
            AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_emergency_contact_patient_update
    ON emergency_contact FOR UPDATE TO app_api
    USING (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_emergency_contact_staff_insert
    ON emergency_contact FOR INSERT TO app_api
    WITH CHECK (
        get_session_user_role() IN ('secretary', 'institution_admin', 'superadmin')
        AND patient_id IN (
            SELECT pi.patient_id FROM patient_institution pi
            WHERE pi.institution_id = get_session_institution_id()
            AND pi.unlinked_at IS NULL
        )
    );

CREATE POLICY rls_emergency_contact_patient_insert
    ON emergency_contact FOR INSERT TO app_api
    WITH CHECK (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_qr_record_access_insert
    ON qr_record_access FOR INSERT TO app_api
    WITH CHECK (
        get_session_user_role() = 'patient'
        AND patient_id = fn_get_patient_id_for_current_user()
    );

CREATE POLICY rls_patient_institution_patient_update ON patient_institution FOR UPDATE TO app_api
    USING (get_session_user_role() = 'patient' AND patient_id = fn_get_patient_id_for_current_user())
    WITH CHECK (get_session_user_role() = 'patient' AND patient_id = fn_get_patient_id_for_current_user());
