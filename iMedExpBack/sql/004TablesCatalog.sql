CREATE TABLE catalog.specialty (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    CONSTRAINT uq_specialty_name
        UNIQUE (name),
    CONSTRAINT chk_specialty_name_length
        CHECK (char_length(trim(name)) BETWEEN 2 AND 255)
);

CREATE TABLE catalog.disease (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name       TEXT NOT NULL,
    cie10_code VARCHAR(10),
    CONSTRAINT uq_disease_cie10
        UNIQUE (cie10_code),
    CONSTRAINT chk_disease_name_length
        CHECK (char_length(trim(name)) > 0)
);

CREATE TABLE catalog.vaccine (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT,
    CONSTRAINT chk_vaccine_name_length
        CHECK (char_length(trim(name)) > 0)
);

CREATE TABLE catalog.allergy (
    id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    CONSTRAINT chk_allergy_name_length
        CHECK (char_length(trim(name)) > 0)
);

CREATE TABLE catalog.medication (
    id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    generic_name         TEXT NOT NULL,
    commercial_name      TEXT,
    presentation         TEXT,
    administration_route TEXT,
    CONSTRAINT chk_medication_generic_name_length
        CHECK (char_length(trim(generic_name)) > 0)
);

CREATE TABLE catalog.institution_invitation (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    institution_id BIGINT NOT NULL, 
    doctor_id      BIGINT NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'pending',
    expires_at     TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uq_pending_invitation 
ON catalog.institution_invitation (institution_id, doctor_id) 
WHERE (status = 'pending');