\-- Allow doctor, secretary, and institution_admin to INSERT patients
-- and SELECT the newly created row (required for INSERT ... RETURNING)
-- Needed for the "unregistered patient" appointment flow

DROP POLICY IF EXISTS rls_patient_staff_insert ON patient;
CREATE POLICY rls_patient_staff_insert
    ON patient FOR INSERT TO app_api
    WITH CHECK (
        get_session_user_role() IN ('doctor', 'secretary', 'institution_admin')
    );

-- Staff must be able to SELECT patients without a user account.
-- New patients created by staff have user_id = NULL (no self-registration).
-- Without this, INSERT ... RETURNING fails because existing SELECT policies
-- require a patient_institution join that doesn't exist yet.
DROP POLICY IF EXISTS rls_patient_staff_select_unlinked ON patient;
CREATE POLICY rls_patient_staff_select_unlinked
    ON patient FOR SELECT TO app_api
    USING (
        get_session_user_role() IN ('doctor', 'secretary', 'institution_admin')
        AND deleted_at IS NULL
        AND user_id IS NULL
    );
