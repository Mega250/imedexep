INSERT INTO catalog.specialty (name, description) VALUES

('Medicina General', 'Atención primaria y manejo integral del paciente adulto'),

('Pediatría', 'Atención médica de lactantes, niños y adolescentes'),

('Cardiología', 'Diagnóstico y tratamiento de enfermedades del corazón y sistema cardiovascular'),

('Ginecología y Obstetricia', 'Salud reproductiva femenina, embarazo y parto'),

('Traumatología y Ortopedia', 'Lesiones y enfermedades del sistema musculoesquelético'),

('Neurología', 'Diagnóstico y tratamiento de enfermedades del sistema nervioso'),

('Oftalmología', 'Atención médica y quirúrgica de los ojos y la visión'),

('Dermatología', 'Diagnóstico y tratamiento de enfermedades de la piel, cabello y uñas'),

('Psiquiatría', 'Diagnóstico y tratamiento de trastornos mentales y del comportamiento'),

('Medicina Interna', 'Manejo de enfermedades crónicas y complejas en el adulto'),

('Cirugía General', 'Procedimientos quirúrgicos del aparato digestivo y tejidos blandos'),

('Urología', 'Enfermedades del sistema urinario y reproductor masculino'),

('Endocrinología', 'Trastornos hormonales y del metabolismo, incluyendo diabetes y tiroides'),

('Gastroenterología', 'Enfermedades del sistema digestivo, hígado y páncreas'),

('Neumología', 'Diagnóstico y tratamiento de enfermedades respiratorias y pulmonares'),

('Reumatología', 'Enfermedades autoinmunes y del tejido conectivo, articulaciones y huesos'),

('Oncología', 'Diagnóstico y tratamiento del cáncer y tumores malignos'),

('Hematología', 'Enfermedades de la sangre, médula ósea y sistema linfático'),

('Radiología e Imagen', 'Diagnóstico por imagen: rayos X, ultrasonido, tomografía y resonancia'),

('Anestesiología', 'Manejo del dolor y sedación durante procedimientos quirúrgicos')

ON CONFLICT (name) DO NOTHING;
