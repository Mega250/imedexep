BEGIN;

INSERT INTO institution (type, name)
SELECT 'hospital', 'Hospital General Demo'
WHERE NOT EXISTS (SELECT 1 FROM institution WHERE name = 'Hospital General Demo');

UPDATE "user"
SET institution_id = (SELECT id FROM institution WHERE name = 'Hospital General Demo')
WHERE id = 1 AND institution_id IS NULL;

INSERT INTO patient_institution (patient_id, institution_id)
SELECT 1, (SELECT id FROM institution WHERE name = 'Hospital General Demo')
WHERE NOT EXISTS (
    SELECT 1 FROM patient_institution
    WHERE patient_id = 1 AND institution_id = (SELECT id FROM institution WHERE name = 'Hospital General Demo')
);

INSERT INTO "user" (email, password_hash, role, institution_id, is_active, email_verified, access_attributes)
SELECT v.email, (SELECT password_hash FROM "user" WHERE id = 1), 'doctor',
       (SELECT id FROM institution WHERE name = 'Hospital General Demo'), true, true,
       '{"clearance_level": "3"}'::jsonb
FROM (VALUES
    ('dra.lopez@hospitaldemo.mx'),
    ('dr.ramirez@hospitaldemo.mx'),
    ('dra.torres@hospitaldemo.mx'),
    ('dr.mendez@hospitaldemo.mx')
) AS v(email)
WHERE NOT EXISTS (SELECT 1 FROM "user" u WHERE u.email = v.email);

INSERT INTO doctor (user_id, general_license, first_name, last_name, specialty_id)
SELECT u.id, d.lic, d.fn, d.ln, (SELECT id FROM catalog.specialty WHERE name = d.spec)
FROM (VALUES
    ('dra.lopez@hospitaldemo.mx',  'CED-100001', 'María',  'López',  'Cardiología'),
    ('dr.ramirez@hospitaldemo.mx', 'CED-100002', 'Juan',   'Ramírez','Medicina General'),
    ('dra.torres@hospitaldemo.mx', 'CED-100003', 'Ana',    'Torres', 'Medicina Interna'),
    ('dr.mendez@hospitaldemo.mx',  'CED-100004', 'Carlos', 'Méndez', 'Endocrinología')
) AS d(email, lic, fn, ln, spec)
JOIN "user" u ON u.email = d.email
WHERE NOT EXISTS (SELECT 1 FROM doctor dd WHERE dd.user_id = u.id);

INSERT INTO doctor_shift (doctor_id, institution_id, weekday, start_time, end_time, shift_type)
SELECT doc.id, doc.institution_id, wd.weekday, TIME '09:00', TIME '14:00', 'Consulta'
FROM (
    SELECT d.id, u.institution_id
    FROM doctor d JOIN "user" u ON u.id = d.user_id
    WHERE u.email IN ('dra.lopez@hospitaldemo.mx','dr.ramirez@hospitaldemo.mx','dra.torres@hospitaldemo.mx','dr.mendez@hospitaldemo.mx')
) doc
CROSS JOIN (VALUES (1),(2),(3),(4),(5)) AS wd(weekday)
WHERE NOT EXISTS (
    SELECT 1 FROM doctor_shift s
    WHERE s.doctor_id = doc.id AND s.weekday = wd.weekday AND s.start_time = TIME '09:00'
);

DELETE FROM clinical.vital_sign WHERE patient_id = 1 AND source = 'demo';
INSERT INTO clinical.vital_sign
    (patient_id, recorded_at, weight, height, heart_rate, systolic_bp, diastolic_bp, oxygen_saturation, body_temperature, source)
VALUES
    (1, now() - interval '30 days', 82.0, 1.72, 88, 145, 92, 96.0, 36.7, 'demo'),
    (1, now() - interval '21 days', 81.4, 1.72, 84, 138, 88, 97.0, 36.6, 'demo'),
    (1, now() - interval '14 days', 80.8, 1.72, 80, 135, 86, 97.0, 36.5, 'demo'),
    (1, now() - interval '7 days',  80.1, 1.72, 76, 131, 83, 98.0, 36.6, 'demo'),
    (1, now() - interval '1 days',  79.6, 1.72, 72, 127, 80, 99.0, 36.5, 'demo');

DELETE FROM appointment WHERE patient_id = 1 AND reason LIKE 'DEMO:%';
INSERT INTO appointment (institution_id, patient_id, doctor_id, created_by_user_id, scheduled_at, reason, status)
SELECT (SELECT id FROM institution WHERE name = 'Hospital General Demo'),
       1,
       (SELECT d.id FROM doctor d JOIN "user" u ON u.id = d.user_id WHERE u.email = 'dra.lopez@hospitaldemo.mx'),
       1,
       date_trunc('hour', now()) + interval '3 days' + interval '10 hours',
       'DEMO: control de presión arterial',
       'scheduled';

COMMIT;
