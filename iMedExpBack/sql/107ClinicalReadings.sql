CREATE TABLE IF NOT EXISTS patient_glucose (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id  BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    value_mg_dl DOUBLE PRECISION NOT NULL,
    context     TEXT,
    measured_on DATE,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ,
    CONSTRAINT chk_pg_value_pos CHECK (value_mg_dl > 0 AND value_mg_dl <= 2000),
    CONSTRAINT chk_pg_deleted_after_created CHECK (deleted_at IS NULL OR deleted_at > created_at)
);

CREATE TABLE IF NOT EXISTS patient_weight (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id  BIGINT NOT NULL REFERENCES patient(id) DEFERRABLE INITIALLY DEFERRED,
    weight_kg   DOUBLE PRECISION NOT NULL,
    height_m    DOUBLE PRECISION,
    measured_on DATE,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ,
    CONSTRAINT chk_pw_weight_pos CHECK (weight_kg > 0 AND weight_kg <= 700),
    CONSTRAINT chk_pw_height_pos CHECK (height_m IS NULL OR (height_m > 0 AND height_m <= 3)),
    CONSTRAINT chk_pw_deleted_after_created CHECK (deleted_at IS NULL OR deleted_at > created_at)
);

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['patient_glucose','patient_weight'] LOOP
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
