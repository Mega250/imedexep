CREATE OR REPLACE FUNCTION fn_director_set_doctor_active(
    p_doctor_id bigint,
    p_is_active boolean
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
    v_director_inst bigint;
    v_user_id       bigint;
BEGIN
    IF get_session_user_role() <> 'institution_admin' THEN
        RETURN NULL;
    END IF;

    v_director_inst := get_session_institution_id();
    IF v_director_inst IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT u.id
    INTO   v_user_id
    FROM   doctor d
    JOIN   "user" u ON u.id = d.user_id
    WHERE  d.id = p_doctor_id
      AND  d.deleted_at IS NULL
      AND  u.deleted_at IS NULL
      AND  u.institution_id = v_director_inst;

    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    UPDATE "user"
    SET    is_active = p_is_active
    WHERE  id = v_user_id;

    RETURN v_user_id;
END;
$fn$;

GRANT EXECUTE ON FUNCTION fn_director_set_doctor_active(bigint, boolean) TO app_api;


CREATE OR REPLACE FUNCTION fn_director_unlink_doctor(
    p_doctor_id bigint
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $fn$
DECLARE
    v_director_inst bigint;
    v_user_id       bigint;
BEGIN
    IF get_session_user_role() <> 'institution_admin' THEN
        RETURN NULL;
    END IF;

    v_director_inst := get_session_institution_id();
    IF v_director_inst IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT u.id
    INTO   v_user_id
    FROM   doctor d
    JOIN   "user" u ON u.id = d.user_id
    WHERE  d.id = p_doctor_id
      AND  d.deleted_at IS NULL
      AND  u.deleted_at IS NULL
      AND  u.institution_id = v_director_inst;

    IF v_user_id IS NULL THEN
        RETURN NULL;
    END IF;

    UPDATE "user"
    SET    institution_id = NULL
    WHERE  id = v_user_id;

    RETURN v_user_id;
END;
$fn$;

GRANT EXECUTE ON FUNCTION fn_director_unlink_doctor(bigint) TO app_api;
