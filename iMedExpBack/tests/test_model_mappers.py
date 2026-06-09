from sqlalchemy.orm import configure_mappers


def test_sqlalchemy_mappers_are_configurable():
    import app.models.appointment  # noqa: F401
    import app.models.catalog  # noqa: F401
    import app.models.consultation  # noqa: F401
    import app.models.diagnosis  # noqa: F401
    import app.models.doctor  # noqa: F401
    import app.models.email_verification  # noqa: F401
    import app.models.emergency_contact  # noqa: F401
    import app.models.institution  # noqa: F401
    import app.models.invitation  # noqa: F401
    import app.models.medication  # noqa: F401
    import app.models.menstrual_cycle  # noqa: F401
    import app.models.patient  # noqa: F401
    import app.models.patient_institution  # noqa: F401
    import app.models.prescription  # noqa: F401
    import app.models.qr_record_access  # noqa: F401
    import app.models.secretary  # noqa: F401
    import app.models.treatment_detail  # noqa: F401
    import app.models.user  # noqa: F401
    import app.models.vital_sign  # noqa: F401

    configure_mappers()
