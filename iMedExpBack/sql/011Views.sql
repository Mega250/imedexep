CREATE OR REPLACE VIEW public.v_secretary_patient
WITH (security_invoker = true) AS
SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    p.gender,
    p.city,
    p.state,
    'XXXXX'                                          AS postal_code_masked,
    left(p.street_address, 3) || repeat('*', 10)     AS address_masked,
    a.id                                             AS appointment_id,
    a.scheduled_at,
    a.status                                         AS appointment_status,
    a.reason                                         AS appointment_reason
FROM patient p
LEFT JOIN appointment a
    ON a.patient_id = p.id AND a.deleted_at IS NULL
WHERE p.deleted_at IS NULL;

CREATE OR REPLACE VIEW public.v_doctor_patient
WITH (security_invoker = true) AS
SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    p.gender,
    p.blood_type,
    p.street_address,
    p.neighborhood,
    p.postal_code,
    p.city,
    p.state,
    (p.privacy_attributes->>'sensitivity_level')::int AS sensitivity_level,
    vsc.weight_kg,
    vsc.height_cm,
    vsc.bmi,
    vsc.systolic_bp,
    vsc.diastolic_bp,
    vsc.heart_rate,
    vsc.respiratory_rate,
    vsc.temperature_celsius,
    vsc.oxygen_saturation,
    gc.level_mg_dl    AS glucose_mg_dl,
    gc.risk           AS glucose_risk,
    gc.is_fasting     AS glucose_is_fasting,
    hc.is_smoker,
    hc.cigarettes_per_day,
    hc.consumes_alcohol,
    hc.exercises,
    hc.exercise_minutes_per_week,
    hc.uses_drugs
FROM patient p
LEFT JOIN clinical.vital_signs_current vsc ON vsc.patient_id = p.id
LEFT JOIN clinical.glucose_current gc      ON gc.patient_id  = p.id
LEFT JOIN clinical.habits_current hc       ON hc.patient_id  = p.id
WHERE p.deleted_at IS NULL;

CREATE OR REPLACE VIEW public.v_patient_self
WITH (security_invoker = true) AS
SELECT
    p.id,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    p.gender,
    p.blood_type,
    p.city,
    p.state,
    vsc.weight_kg,
    vsc.height_cm,
    vsc.bmi,
    vsc.systolic_bp,
    vsc.diastolic_bp,
    vsc.heart_rate,
    vsc.temperature_celsius,
    vsc.oxygen_saturation,
    gc.level_mg_dl AS glucose_mg_dl,
    gc.risk        AS glucose_risk
FROM patient p
LEFT JOIN clinical.vital_signs_current vsc ON vsc.patient_id = p.id
LEFT JOIN clinical.glucose_current gc      ON gc.patient_id  = p.id
WHERE p.deleted_at IS NULL
  AND p.user_id = get_session_user_id();

CREATE OR REPLACE VIEW public.v_doctor_consultation
WITH (security_invoker = true) AS
SELECT
    c.id,
    c.version,
    c.is_current,
    c.amendment_reason,
    c.parent_id,
    c.patient_id,
    c.doctor_id,
    c.institution_id,
    c.consulted_at,
    c.chief_complaint,
    c.symptoms,
    c.medical_notes,
    c.sensitivity_level,
    c.specialty_data,
    c.signature_hash,
    c.signed_at,
    d.first_name      AS doctor_first_name,
    d.last_name       AS doctor_last_name,
    d.general_license AS doctor_license
FROM clinical.consultation c
JOIN doctor d ON d.id = c.doctor_id
WHERE c.is_current = true;

CREATE OR REPLACE VIEW public.v_doctor_prescription
WITH (security_invoker = true) AS
SELECT
    pr.id,
    pr.consultation_id,
    pr.patient_id,
    pr.issued_at,
    pr.general_instructions,
    pr.signature_hash,
    pr.signed_at,
    d.first_name        AS doctor_first_name,
    d.last_name         AS doctor_last_name,
    d.general_license   AS doctor_license,
    td.medication_id,
    td.free_text_medication,
    td.dosage,
    td.frequency,
    td.duration_days,
    td.start_date,
    td.calculated_end_date,
    td.status           AS treatment_status,
    m.generic_name      AS medication_generic_name,
    m.commercial_name   AS medication_commercial_name
FROM clinical.prescription pr
JOIN doctor d ON d.id = pr.doctor_id
LEFT JOIN clinical.treatment_detail td ON td.prescription_id = pr.id
LEFT JOIN catalog.medication m         ON m.id = td.medication_id;