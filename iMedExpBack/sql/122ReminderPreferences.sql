CREATE TABLE IF NOT EXISTS public.reminder_preference (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL UNIQUE REFERENCES patient(id) ON DELETE CASCADE,
    medication_enabled BOOLEAN NOT NULL DEFAULT false,
    medication_every_hours INTEGER NOT NULL DEFAULT 8 CHECK (medication_every_hours BETWEEN 1 AND 168),
    appointment_enabled BOOLEAN NOT NULL DEFAULT true,
    appointment_hours_before INTEGER NOT NULL DEFAULT 24 CHECK (appointment_hours_before BETWEEN 1 AND 168),
    email_enabled BOOLEAN NOT NULL DEFAULT false,
    last_medication_reminder_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminder_preference_patient ON public.reminder_preference(patient_id);

GRANT SELECT, INSERT, UPDATE ON public.reminder_preference TO app_api;
GRANT USAGE, SELECT ON SEQUENCE reminder_preference_id_seq TO app_api;

CREATE OR REPLACE FUNCTION fn_reminder_targets()
RETURNS TABLE (
    patient_id BIGINT,
    user_id BIGINT,
    email TEXT,
    institution_id BIGINT,
    medication_enabled BOOLEAN,
    medication_every_hours INTEGER,
    appointment_enabled BOOLEAN,
    appointment_hours_before INTEGER,
    email_enabled BOOLEAN,
    last_medication_reminder_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT rp.patient_id, p.user_id, u.email, u.institution_id,
           rp.medication_enabled, rp.medication_every_hours,
           rp.appointment_enabled, rp.appointment_hours_before,
           rp.email_enabled, rp.last_medication_reminder_at
    FROM reminder_preference rp
    JOIN patient p ON p.id = rp.patient_id AND p.deleted_at IS NULL
    JOIN "user" u ON u.id = p.user_id AND u.is_active = true
    WHERE rp.medication_enabled OR rp.appointment_enabled
$$;

REVOKE ALL ON FUNCTION fn_reminder_targets() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION fn_reminder_targets() TO app_api;
