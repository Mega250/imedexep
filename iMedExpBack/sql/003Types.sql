CREATE TYPE institution_type AS ENUM (
    'hospital',
    'private_clinic',
    'school_dispensary'
);

CREATE TYPE user_role AS ENUM (
    'superadmin',
    'institution_admin',
    'doctor',
    'secretary',
    'patient'
);

CREATE TYPE appointment_status AS ENUM (
    'scheduled',
    'confirmed',
    'in_progress',
    'completed',
    'cancelled',
    'no_show'
);

CREATE TYPE gender_type AS ENUM (
    'M',
    'F',
    'O'
);

CREATE TYPE glucose_risk_level AS ENUM (
    'normal',
    'pre_diabetes',
    'diabetes',
    'hypoglycemia'
);

CREATE TYPE allergy_severity AS ENUM (
    'mild',
    'moderate',
    'severe'
);

CREATE TYPE blood_type AS ENUM (
    'A+', 'A-',
    'B+', 'B-',
    'AB+', 'AB-',
    'O+', 'O-',
    'unknown'
);

CREATE TYPE diagnosis_type AS ENUM (
    'primary',
    'secondary',
    'differential'
);

CREATE TYPE treatment_status AS ENUM (
    'active',
    'completed',
    'suspended'
);

CREATE TYPE audit_operation AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'SELECT_PHI'
);

CREATE TYPE record_amendment_reason AS ENUM (
    'correction',
    'addendum',
    'clarification'
);

CREATE TYPE persistent_disease_status AS ENUM (
    'active',
    'in_remission',
    'resolved'
);
