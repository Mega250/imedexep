CREATE TABLE IF NOT EXISTS patient_vaccine (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id  BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    name        TEXT NOT NULL,
    dose        TEXT,
    applied_on  DATE,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ,
    CONSTRAINT chk_pv_name_not_empty CHECK (char_length(trim(name)) > 0),
    CONSTRAINT chk_pv_deleted_after_created CHECK (deleted_at IS NULL OR deleted_at > created_at)
);

CREATE TABLE IF NOT EXISTS patient_surgery (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id    BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    name          TEXT NOT NULL,
    performed_on  DATE,
    hospital      TEXT,
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ,
    CONSTRAINT chk_ps_name_not_empty CHECK (char_length(trim(name)) > 0),
    CONSTRAINT chk_ps_deleted_after_created CHECK (deleted_at IS NULL OR deleted_at > created_at)
);

CREATE TABLE IF NOT EXISTS patient_allergy (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id  BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    substance   TEXT NOT NULL,
    reaction    TEXT,
    severity    TEXT,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ,
    CONSTRAINT chk_pa_substance_not_empty CHECK (char_length(trim(substance)) > 0),
    CONSTRAINT chk_pa_deleted_after_created CHECK (deleted_at IS NULL OR deleted_at > created_at)
);

CREATE TABLE IF NOT EXISTS patient_antecedent (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id  BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    kind        TEXT NOT NULL,
    description TEXT NOT NULL,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ,
    CONSTRAINT chk_pan_kind_not_empty CHECK (char_length(trim(kind)) > 0),
    CONSTRAINT chk_pan_desc_not_empty CHECK (char_length(trim(description)) > 0),
    CONSTRAINT chk_pan_deleted_after_created CHECK (deleted_at IS NULL OR deleted_at > created_at)
);

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['patient_vaccine','patient_surgery','patient_allergy','patient_antecedent'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT ALL PRIVILEGES ON TABLE %I TO app_api', t);
    EXECUTE format($f$
      CREATE POLICY rls_%1$s_patient_all ON %1$s FOR ALL TO app_api
      USING (get_session_user_role() = 'patient' AND patient_id = fn_get_patient_id_for_current_user())
      WITH CHECK (get_session_user_role() = 'patient' AND patient_id = fn_get_patient_id_for_current_user())
    $f$, t);
    EXECUTE format($f$
      CREATE POLICY rls_%1$s_staff_read ON %1$s FOR SELECT TO app_api
      USING (
        get_session_user_role() IN ('doctor','secretary','institution_admin','superadmin')
        AND patient_id IN (
          SELECT pi.patient_id FROM patient_institution pi
          WHERE pi.institution_id = get_session_institution_id() AND pi.unlinked_at IS NULL
        )
      )
    $f$, t);
  END LOOP;
END $$;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_api;
