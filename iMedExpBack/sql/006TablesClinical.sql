CREATE TABLE clinical.consultation (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    parent_id         BIGINT REFERENCES clinical.consultation(id) DEFERRABLE INITIALLY DEFERRED,
    version           SMALLINT NOT NULL DEFAULT 1,
    is_current        BOOLEAN NOT NULL DEFAULT true,
    amendment_reason  record_amendment_reason,
    appointment_id    BIGINT REFERENCES appointment(id) DEFERRABLE INITIALLY DEFERRED,
    institution_id    BIGINT NOT NULL REFERENCES institution(id) DEFERRABLE INITIALLY DEFERRED,
    patient_id        BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    doctor_id         BIGINT NOT NULL REFERENCES doctor(id) DEFERRABLE INITIALLY DEFERRED,
    consulted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    chief_complaint   TEXT,
    symptoms          TEXT,
    medical_notes     TEXT,
    sensitivity_level SMALLINT NOT NULL DEFAULT 1,
    specialty_data    JSONB,
    signature_hash    TEXT,
    signed_at         TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_consultation_sensitivity_range
        CHECK (sensitivity_level BETWEEN 1 AND 5),
    CONSTRAINT chk_consultation_version_positive
        CHECK (version >= 1),
    CONSTRAINT chk_consultation_amendment_requires_parent
        CHECK (
            (parent_id IS NULL AND amendment_reason IS NULL)
            OR (parent_id IS NOT NULL AND amendment_reason IS NOT NULL)
        ),
    CONSTRAINT chk_consultation_signature_consistency
        CHECK (
            (signature_hash IS NULL AND signed_at IS NULL)
            OR (signature_hash IS NOT NULL AND signed_at IS NOT NULL)
        ),
    CONSTRAINT chk_consultation_signed_at_not_future
        CHECK (signed_at IS NULL OR signed_at <= now() + INTERVAL '1 minute'),
    CONSTRAINT chk_consultation_specialty_data_is_object
        CHECK (specialty_data IS NULL OR jsonb_typeof(specialty_data) = 'object')
);

CREATE TABLE clinical.diagnosis (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    consultation_id  BIGINT NOT NULL REFERENCES clinical.consultation(id) DEFERRABLE INITIALLY DEFERRED,
    disease_id       BIGINT NOT NULL REFERENCES catalog.disease(id) DEFERRABLE INITIALLY DEFERRED,
    diagnosis_type   diagnosis_type NOT NULL DEFAULT 'primary',
    additional_notes TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clinical.vital_signs_current (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id          BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    last_updated_at     TIMESTAMPTZ NOT NULL,
    weight_kg           DECIMAL(5,2),
    height_cm           DECIMAL(5,2),
    bmi                 DECIMAL(5,2),
    systolic_bp         SMALLINT,
    diastolic_bp        SMALLINT,
    heart_rate          SMALLINT,
    respiratory_rate    SMALLINT,
    temperature_celsius DECIMAL(4,2),
    oxygen_saturation   SMALLINT,
    CONSTRAINT uq_vital_signs_current_patient
        UNIQUE (patient_id),
    CONSTRAINT chk_vs_weight_range
        CHECK (weight_kg IS NULL OR weight_kg BETWEEN 0.5 AND 700),
    CONSTRAINT chk_vs_height_range
        CHECK (height_cm IS NULL OR height_cm BETWEEN 20 AND 280),
    CONSTRAINT chk_vs_bmi_range
        CHECK (bmi IS NULL OR bmi BETWEEN 5 AND 100),
    CONSTRAINT chk_vs_systolic_bp_range
        CHECK (systolic_bp IS NULL OR systolic_bp BETWEEN 50 AND 300),
    CONSTRAINT chk_vs_diastolic_bp_range
        CHECK (diastolic_bp IS NULL OR diastolic_bp BETWEEN 20 AND 200),
    CONSTRAINT chk_vs_bp_systolic_greater_than_diastolic
        CHECK (systolic_bp IS NULL OR diastolic_bp IS NULL OR systolic_bp > diastolic_bp),
    CONSTRAINT chk_vs_heart_rate_range
        CHECK (heart_rate IS NULL OR heart_rate BETWEEN 20 AND 300),
    CONSTRAINT chk_vs_respiratory_rate_range
        CHECK (respiratory_rate IS NULL OR respiratory_rate BETWEEN 1 AND 100),
    CONSTRAINT chk_vs_temperature_range
        CHECK (temperature_celsius IS NULL OR temperature_celsius BETWEEN 25.0 AND 45.0),
    CONSTRAINT chk_vs_oxygen_saturation_range
        CHECK (oxygen_saturation IS NULL OR oxygen_saturation BETWEEN 0 AND 100)
);

CREATE TABLE clinical.glucose_current (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id      BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    last_updated_at TIMESTAMPTZ NOT NULL,
    level_mg_dl     DECIMAL(6,2),
    risk            glucose_risk_level,
    is_fasting      BOOLEAN,
    CONSTRAINT uq_glucose_current_patient
        UNIQUE (patient_id),
    CONSTRAINT chk_glucose_level_range
        CHECK (level_mg_dl IS NULL OR level_mg_dl BETWEEN 10 AND 2000)
);

CREATE TABLE clinical.habits_current (
    id                        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id                BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    last_updated_at           TIMESTAMPTZ NOT NULL,
    is_smoker                 BOOLEAN,
    cigarettes_per_day        SMALLINT,
    consumes_alcohol          BOOLEAN,
    alcohol_frequency         TEXT,
    exercises                 BOOLEAN,
    exercise_minutes_per_week SMALLINT,
    diet_type                 TEXT,
    uses_drugs                BOOLEAN,
    CONSTRAINT uq_habits_current_patient
        UNIQUE (patient_id),
    CONSTRAINT chk_habits_cigarettes_non_negative
        CHECK (cigarettes_per_day IS NULL OR cigarettes_per_day >= 0),
    CONSTRAINT chk_habits_cigarettes_requires_smoker
        CHECK (cigarettes_per_day IS NULL OR is_smoker = true),
    CONSTRAINT chk_habits_exercise_minutes_non_negative
        CHECK (exercise_minutes_per_week IS NULL OR exercise_minutes_per_week >= 0),
    CONSTRAINT chk_habits_exercise_minutes_requires_exercises
        CHECK (exercise_minutes_per_week IS NULL OR exercises = true)
);

CREATE TABLE clinical.vital_signs_history (
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id          BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    consultation_id     BIGINT REFERENCES clinical.consultation(id) DEFERRABLE INITIALLY DEFERRED,
    recorded_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    weight_kg           DECIMAL(5,2),
    height_cm           DECIMAL(5,2),
    bmi                 DECIMAL(5,2),
    systolic_bp         SMALLINT,
    diastolic_bp        SMALLINT,
    heart_rate          SMALLINT,
    respiratory_rate    SMALLINT,
    temperature_celsius DECIMAL(4,2),
    oxygen_saturation   SMALLINT,
    CONSTRAINT chk_vsh_weight_range
        CHECK (weight_kg IS NULL OR weight_kg BETWEEN 0.5 AND 700),
    CONSTRAINT chk_vsh_height_range
        CHECK (height_cm IS NULL OR height_cm BETWEEN 20 AND 280),
    CONSTRAINT chk_vsh_bmi_range
        CHECK (bmi IS NULL OR bmi BETWEEN 5 AND 100),
    CONSTRAINT chk_vsh_systolic_bp_range
        CHECK (systolic_bp IS NULL OR systolic_bp BETWEEN 50 AND 300),
    CONSTRAINT chk_vsh_diastolic_bp_range
        CHECK (diastolic_bp IS NULL OR diastolic_bp BETWEEN 20 AND 200),
    CONSTRAINT chk_vsh_bp_systolic_greater_than_diastolic
        CHECK (systolic_bp IS NULL OR diastolic_bp IS NULL OR systolic_bp > diastolic_bp),
    CONSTRAINT chk_vsh_heart_rate_range
        CHECK (heart_rate IS NULL OR heart_rate BETWEEN 20 AND 300),
    CONSTRAINT chk_vsh_respiratory_rate_range
        CHECK (respiratory_rate IS NULL OR respiratory_rate BETWEEN 1 AND 100),
    CONSTRAINT chk_vsh_temperature_range
        CHECK (temperature_celsius IS NULL OR temperature_celsius BETWEEN 25.0 AND 45.0),
    CONSTRAINT chk_vsh_oxygen_saturation_range
        CHECK (oxygen_saturation IS NULL OR oxygen_saturation BETWEEN 0 AND 100)
);

CREATE TABLE clinical.glucose_history (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id      BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    consultation_id BIGINT REFERENCES clinical.consultation(id) DEFERRABLE INITIALLY DEFERRED,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    level_mg_dl     DECIMAL(6,2),
    risk            glucose_risk_level,
    is_fasting      BOOLEAN,
    CONSTRAINT chk_gh_glucose_level_range
        CHECK (level_mg_dl IS NULL OR level_mg_dl BETWEEN 10 AND 2000)
);

CREATE TABLE clinical.habits_history (
    id                        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id                BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    consultation_id           BIGINT REFERENCES clinical.consultation(id) DEFERRABLE INITIALLY DEFERRED,
    recorded_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_smoker                 BOOLEAN,
    cigarettes_per_day        SMALLINT,
    consumes_alcohol          BOOLEAN,
    alcohol_frequency         TEXT,
    exercises                 BOOLEAN,
    exercise_minutes_per_week SMALLINT,
    diet_type                 TEXT,
    uses_drugs                BOOLEAN,
    doctor_notes              TEXT,
    CONSTRAINT chk_hh_cigarettes_non_negative
        CHECK (cigarettes_per_day IS NULL OR cigarettes_per_day >= 0),
    CONSTRAINT chk_hh_exercise_minutes_non_negative
        CHECK (exercise_minutes_per_week IS NULL OR exercise_minutes_per_week >= 0)
);

CREATE TABLE clinical.vaccine_record (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id      BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    vaccine_id      BIGINT NOT NULL REFERENCES catalog.vaccine(id) DEFERRABLE INITIALLY DEFERRED,
    applied_date    DATE NOT NULL,
    scheme_complete BOOLEAN NOT NULL DEFAULT true,
    observations    TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_vaccine_applied_not_future
        CHECK (applied_date <= CURRENT_DATE),
    CONSTRAINT chk_vaccine_applied_realistic
        CHECK (applied_date > '1900-01-01')
);

CREATE TABLE clinical.allergy_record (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id     BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    allergy_id     BIGINT NOT NULL REFERENCES catalog.allergy(id) DEFERRABLE INITIALLY DEFERRED,
    diagnosed_date DATE,
    severity       allergy_severity,
    main_reaction  TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ,
    CONSTRAINT chk_allergy_diagnosed_not_future
        CHECK (diagnosed_date IS NULL OR diagnosed_date <= CURRENT_DATE),
    CONSTRAINT chk_allergy_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at > created_at)
);

CREATE TABLE clinical.surgery_record (
    id                       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id               BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    surgery_date             DATE,
    procedure_description    TEXT NOT NULL,
    institution_performed_at TEXT,
    surgeon_name             TEXT,
    findings                 TEXT,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_surgery_date_not_future
        CHECK (surgery_date IS NULL OR surgery_date <= CURRENT_DATE),
    CONSTRAINT chk_surgery_date_realistic
        CHECK (surgery_date IS NULL OR surgery_date > '1900-01-01'),
    CONSTRAINT chk_surgery_procedure_not_empty
        CHECK (char_length(trim(procedure_description)) > 0)
);

CREATE TABLE clinical.persistent_disease_record (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id     BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    disease_id     BIGINT NOT NULL REFERENCES catalog.disease(id) DEFERRABLE INITIALLY DEFERRED,
    diagnosed_date DATE,
    status         persistent_disease_status,
    is_chronic     BOOLEAN NOT NULL DEFAULT true,
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at     TIMESTAMPTZ,
    CONSTRAINT chk_pdr_diagnosed_not_future
        CHECK (diagnosed_date IS NULL OR diagnosed_date <= CURRENT_DATE),
    CONSTRAINT chk_pdr_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at > created_at)
);

CREATE TABLE clinical.general_background (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id       BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    family_history   TEXT,
    pathological     TEXT,
    non_pathological TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_general_background_patient
        UNIQUE (patient_id)
);

CREATE TABLE clinical.prescription (
    id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    consultation_id      BIGINT NOT NULL REFERENCES clinical.consultation(id) DEFERRABLE INITIALLY DEFERRED,
    patient_id           BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    doctor_id            BIGINT NOT NULL REFERENCES doctor(id) DEFERRABLE INITIALLY DEFERRED,
    issued_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    general_instructions TEXT,
    signature_hash       TEXT,
    signed_at            TIMESTAMPTZ,
    CONSTRAINT chk_prescription_signature_consistency
        CHECK (
            (signature_hash IS NULL AND signed_at IS NULL)
            OR (signature_hash IS NOT NULL AND signed_at IS NOT NULL)
        ),
    CONSTRAINT chk_prescription_signed_at_not_future
        CHECK (signed_at IS NULL OR signed_at <= now() + INTERVAL '1 minute')
);

CREATE TABLE clinical.treatment_detail (
    id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    prescription_id      BIGINT NOT NULL REFERENCES clinical.prescription(id) DEFERRABLE INITIALLY DEFERRED,
    medication_id        BIGINT REFERENCES catalog.medication(id) DEFERRABLE INITIALLY DEFERRED,
    free_text_medication TEXT,
    dosage               TEXT NOT NULL,
    frequency            TEXT NOT NULL,
    duration_days        SMALLINT NOT NULL,
    start_date           DATE NOT NULL,
    calculated_end_date  DATE,
    status               treatment_status NOT NULL DEFAULT 'active',
    additional_notes     TEXT,
    CONSTRAINT chk_td_medication_source_provided
        CHECK (
            medication_id IS NOT NULL
            OR (free_text_medication IS NOT NULL AND char_length(trim(free_text_medication)) > 0)
        ),
    CONSTRAINT chk_td_duration_positive
        CHECK (duration_days > 0),
    CONSTRAINT chk_td_start_date_realistic
        CHECK (start_date > '1900-01-01'),
    CONSTRAINT chk_td_end_date_after_start
        CHECK (calculated_end_date IS NULL OR calculated_end_date >= start_date),
    CONSTRAINT chk_td_dosage_not_empty
        CHECK (char_length(trim(dosage)) > 0),
    CONSTRAINT chk_td_frequency_not_empty
        CHECK (char_length(trim(frequency)) > 0)
);



CREATE TABLE clinical.vital_sign (
    id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id         BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    recorded_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source             TEXT NOT NULL DEFAULT 'manual',
    weight             NUMERIC(5, 2),
    height             NUMERIC(3, 2),
    heart_rate         SMALLINT, 
    systolic_bp        SMALLINT,
    diastolic_bp       SMALLINT,
    oxygen_saturation  NUMERIC(5, 2),
    body_temperature   NUMERIC(4, 2),
    
    CONSTRAINT chk_vs_weight_realistic 
        CHECK (weight IS NULL OR (weight > 0 AND weight < 600)),
    CONSTRAINT chk_vs_height_realistic 
        CHECK (height IS NULL OR (height > 0 AND height < 3.00)),
    CONSTRAINT chk_vs_hr_realistic 
        CHECK (heart_rate IS NULL OR (heart_rate > 0 AND heart_rate < 300)),
    CONSTRAINT chk_vs_blood_pressure 
        CHECK (
            (systolic_bp IS NULL AND diastolic_bp IS NULL) OR 
            (systolic_bp IS NOT NULL AND diastolic_bp IS NOT NULL AND systolic_bp > diastolic_bp)
        )
);

CREATE TABLE clinical.menstrual_cycle (
    id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id         BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    period_start_date  DATE NOT NULL,
    period_end_date    DATE,
    flow               VARCHAR(16),
    symptoms           JSONB NOT NULL DEFAULT '{}',
    notes              TEXT,
    source             VARCHAR(32) NOT NULL DEFAULT 'manual',
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at         TIMESTAMPTZ,

    CONSTRAINT chk_mc_start_realistic
        CHECK (period_start_date > DATE '1900-01-01'),
    CONSTRAINT chk_mc_start_not_future
        CHECK (period_start_date <= CURRENT_DATE),
    CONSTRAINT chk_mc_end_after_start
        CHECK (period_end_date IS NULL OR period_end_date >= period_start_date),
    CONSTRAINT chk_mc_duration_realistic
        CHECK (period_end_date IS NULL OR period_end_date <= period_start_date + INTERVAL '14 days'),
    CONSTRAINT chk_mc_end_not_future
        CHECK (period_end_date IS NULL OR period_end_date <= CURRENT_DATE),
    CONSTRAINT chk_mc_flow_valid
        CHECK (flow IS NULL OR flow IN ('spotting', 'light', 'medium', 'heavy')),
    CONSTRAINT chk_mc_symptoms_is_object
        CHECK (jsonb_typeof(symptoms) = 'object'),
    CONSTRAINT chk_mc_source_not_empty
        CHECK (char_length(trim(source)) BETWEEN 1 AND 32),
    CONSTRAINT chk_mc_deleted_after_created
        CHECK (deleted_at IS NULL OR deleted_at > created_at)
);
