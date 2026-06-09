CREATE TABLE IF NOT EXISTS screen_block (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role           TEXT NOT NULL,
    screen_id      TEXT NOT NULL,
    institution_id BIGINT REFERENCES institution(id) DEFERRABLE INITIALLY DEFERRED,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_sb_role CHECK (role IN ('patient', 'doctor', 'secretary', 'institution_admin')),
    CONSTRAINT chk_sb_screen_not_empty CHECK (char_length(trim(screen_id)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_screen_block
    ON screen_block (role, screen_id, COALESCE(institution_id, 0));

ALTER TABLE screen_block ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_block FORCE ROW LEVEL SECURITY;
GRANT ALL PRIVILEGES ON TABLE screen_block TO app_api;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_api;

CREATE POLICY screen_block_read ON screen_block FOR SELECT TO app_api USING (true);

CREATE POLICY screen_block_super ON screen_block FOR ALL TO app_api
    USING (get_session_user_role() = 'superadmin')
    WITH CHECK (get_session_user_role() = 'superadmin' AND institution_id IS NULL);

CREATE POLICY screen_block_dir ON screen_block FOR ALL TO app_api
    USING (
        get_session_user_role() = 'institution_admin'
        AND institution_id = get_session_institution_id()
    )
    WITH CHECK (
        get_session_user_role() = 'institution_admin'
        AND institution_id = get_session_institution_id()
        AND role IN ('doctor', 'secretary')
    );
