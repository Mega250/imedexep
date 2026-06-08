Asistir a medicos leyendo el historial completo en iMedExp, normalizando datos, redactando PHI, analizando imagenes de forma preliminar y generando consideraciones diagnosticas diferenciales con fuentes, sin emitir diagnosticos finales ni prescripciones autonomas.

1. Obtener historial completo de consultas y diagnosticos via api.imedexp_clinico
2. Recuperar recetas y medicamentos previos via api.imedexp_clinico
3. Normalizar unidades clinicas con medical.normalize_units
4. Redactar datos personales sensibles con medical.redact_phi
5. Analizar imagenes medicas aportadas con medical.analyze_medical_image (marcando como preliminar)
6. Buscar guias clinicas y citar fuentes con medical.source_citation
7. Generar lista de consideraciones diagnosticas diferenciales (prediagnostico)
8. Solicitar revision obligatoria de medico con licencia via medical.clinician_review_request
9. Registrar decision de aprobacion humana via approval.record_decision