from datetime import datetime, timedelta, timezone

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.auth import TokenPayload
from app.utils import email as email_util
from app.utils.ownership import resolve_patient_id_for_token

_MX_TZ = timezone(timedelta(hours=-6))


class ReminderService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def _fetch(self, patient_id: int) -> dict:
        row = await self.session.execute(
            text("SELECT * FROM reminder_preference WHERE patient_id = :pid"), {"pid": patient_id}
        )
        return dict(row.mappings().first() or {})

    async def _get_or_create(self, patient_id: int) -> dict:
        pref = await self._fetch(patient_id)
        if not pref:
            await self.session.execute(
                text("INSERT INTO reminder_preference (patient_id) VALUES (:pid) ON CONFLICT (patient_id) DO NOTHING"),
                {"pid": patient_id},
            )
            await self.session.flush()
            pref = await self._fetch(patient_id)
        return pref

    async def get_preferences(self, token: TokenPayload) -> dict:
        patient_id = await resolve_patient_id_for_token(self.session, token)
        return await self._get_or_create(patient_id)

    async def set_preferences(self, token: TokenPayload, body) -> dict:
        patient_id = await resolve_patient_id_for_token(self.session, token)
        await self._get_or_create(patient_id)
        fields = body.model_dump(exclude_none=True)
        if fields:
            assignments = ", ".join(f"{key} = :{key}" for key in fields)
            params = {**fields, "pid": patient_id}
            await self.session.execute(
                text(f"UPDATE reminder_preference SET {assignments}, updated_at = now() WHERE patient_id = :pid"), params
            )
            await self.session.flush()
        return await self._fetch(patient_id)

    async def run_for_patient(self, token: TokenPayload) -> dict:
        patient_id = await resolve_patient_id_for_token(self.session, token)
        pref = await self._get_or_create(patient_id)
        institution_id = getattr(token, "institution_id", None)
        email = await self.session.scalar(
            text('SELECT u.email FROM patient p JOIN "user" u ON u.id = p.user_id WHERE p.id = :pid'), {"pid": patient_id}
        )
        return await self.generate(patient_id, pref, email, institution_id)

    async def generate(self, patient_id: int, pref: dict, email: str | None, institution_id: int | None) -> dict:
        now = datetime.now(timezone.utc)
        pending: list[tuple[str, str]] = []
        created_med = 0
        created_appt = 0

        if pref.get("medication_enabled"):
            last = pref.get("last_medication_reminder_at")
            due = last is None or (now - last) >= timedelta(hours=int(pref.get("medication_every_hours") or 8))
            if due:
                meds = (
                    await self.session.execute(
                        text(
                            "SELECT COALESCE(NULLIF(free_text_medication, ''), 'tu medicamento') AS nombre, "
                            "COALESCE(dosage, '') AS dosage, COALESCE(frequency, '') AS frequency "
                            "FROM v_doctor_prescription WHERE patient_id = :pid "
                            "AND (calculated_end_date IS NULL OR calculated_end_date >= now()::date) "
                            "ORDER BY issued_at DESC LIMIT 8"
                        ),
                        {"pid": patient_id},
                    )
                ).mappings().all()
                if meds:
                    detalle = "; ".join(f"{m['nombre']} {m['dosage']} {m['frequency']}".strip() for m in meds)
                    message = f"Es momento de tomar tu medicacion: {detalle}."
                else:
                    message = "Recordatorio de medicacion: toma tu tratamiento segun la indicacion de tu medico."
                pending.append(("medication_reminder", message))
                await self.session.execute(
                    text("UPDATE reminder_preference SET last_medication_reminder_at = :now WHERE patient_id = :pid"),
                    {"now": now, "pid": patient_id},
                )
                created_med += 1

        if pref.get("appointment_enabled"):
            horizon = now + timedelta(hours=int(pref.get("appointment_hours_before") or 24))
            citas = (
                await self.session.execute(
                    text(
                        "SELECT a.id, a.scheduled_at, "
                        "COALESCE(d.first_name || ' ' || d.last_name, 'tu medico') AS doctor "
                        "FROM appointment a LEFT JOIN doctor d ON d.id = a.doctor_id "
                        "WHERE a.patient_id = :pid AND a.deleted_at IS NULL "
                        "AND a.status IN ('scheduled', 'confirmed') AND a.scheduled_at BETWEEN :now AND :horizon "
                        "ORDER BY a.scheduled_at ASC"
                    ),
                    {"pid": patient_id, "now": now, "horizon": horizon},
                )
            ).mappings().all()
            for cita in citas:
                marca = f"[cita:{cita['id']}]"
                already = await self.session.scalar(
                    text(
                        "SELECT 1 FROM patient_notification WHERE patient_id = :pid AND kind = 'appointment_reminder' "
                        "AND message LIKE :marca AND deleted_at IS NULL LIMIT 1"
                    ),
                    {"pid": patient_id, "marca": f"%{marca}%"},
                )
                if already:
                    continue
                fecha = cita["scheduled_at"].astimezone(_MX_TZ).strftime("%d/%m/%Y a las %H:%M h")
                message = f"Tienes una cita con {cita['doctor']} el {fecha}. {marca}"
                pending.append(("appointment_reminder", message))
                created_appt += 1

        for kind, message in pending:
            await self.session.execute(
                text(
                    "INSERT INTO patient_notification (patient_id, institution_id, kind, message) "
                    "VALUES (:pid, :inst, :kind, :msg)"
                ),
                {"pid": patient_id, "inst": institution_id, "kind": kind, "msg": message},
            )
            if pref.get("email_enabled") and email:
                titulo = "Recordatorio de medicacion" if kind == "medication_reminder" else "Recordatorio de cita"
                try:
                    await email_util.send_reminder(email, f"{titulo} · imedexp", message.split(" [cita:")[0])
                except Exception:
                    pass
        await self.session.flush()
        return {"created": created_med + created_appt, "medication": created_med, "appointments": created_appt}


async def run_scheduler_cycle() -> int:
    from app.core.database import AsyncSessionLocal
    from app.utils.session_context import apply_rls_context

    async with AsyncSessionLocal() as plain:
        targets = (await plain.execute(text("SELECT * FROM fn_reminder_targets()"))).mappings().all()

    total = 0
    for target in targets:
        try:
            async with AsyncSessionLocal() as session:
                async with session.begin():
                    await apply_rls_context(
                        session,
                        user_id=int(target["user_id"]),
                        role="patient",
                        institution_id=target["institution_id"],
                        ip_address="reminder-scheduler",
                    )
                    service = ReminderService(session)
                    result = await service.generate(
                        int(target["patient_id"]), dict(target), target["email"], target["institution_id"]
                    )
                    total += int(result["created"])
        except Exception:
            continue
    return total
