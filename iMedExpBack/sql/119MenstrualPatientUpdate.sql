CREATE OR REPLACE FUNCTION fn_patient_update_cycle(
    p_cycle_id bigint,
    p_start    date,
    p_end      date,
    p_flow     text
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
    v_patient_id bigint;
    v_owner      bigint;
BEGIN
    IF get_session_user_role() <> 'patient' THEN
        RETURN NULL;
    END IF;

    v_patient_id := fn_get_patient_id_for_current_user();
    IF v_patient_id IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT mc.patient_id
    INTO   v_owner
    FROM   clinical.menstrual_cycle mc
    WHERE  mc.id = p_cycle_id
      AND  mc.deleted_at IS NULL;

    IF v_owner IS NULL OR v_owner <> v_patient_id THEN
        RETURN NULL;
    END IF;

    UPDATE clinical.menstrual_cycle
    SET    period_start_date = p_start,
           period_end_date   = p_end,
           flow              = p_flow
    WHERE  id = p_cycle_id
      AND  deleted_at IS NULL;

    RETURN p_cycle_id;
END;
$fn$;

GRANT EXECUTE ON FUNCTION fn_patient_update_cycle(bigint, date, date, text) TO app_api;
