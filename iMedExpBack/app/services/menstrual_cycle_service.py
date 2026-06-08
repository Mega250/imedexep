from datetime import date

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, UnprocessableError
from app.repositories.menstrual_cycle_repo import MenstrualCycleRepository
from app.repositories.patient_repo import PatientRepository
from app.schemas.auth import TokenPayload
from app.schemas.menstrual_cycle import (
    MenstrualCycleCreate,
    MenstrualCycleListResponse,
    MenstrualCyclePredictionResponse,
    MenstrualCycleResponse,
    MenstrualCycleUpdate,
    MenstrualFlow,
    MenstrualPredictionModelInfo,
)
from app.utils.ownership import ensure_patient_ownership
from app.services.menstrual_cycle_predictor import (
    MODEL_NAME,
    MODEL_VERSION,
    CycleObservation,
    MenstrualCyclePredictor,
)


class MenstrualCycleService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repo = MenstrualCycleRepository(session)
        self.patient_repo = PatientRepository(session)
        self.predictor = MenstrualCyclePredictor()

    async def create_cycle(self, data: MenstrualCycleCreate) -> MenstrualCycleResponse:
        await self._ensure_patient_access(data.patient_id)
        duplicate = await self.repo.get_duplicate(data.patient_id, data.period_start_date)
        if duplicate:
            raise ConflictError("Ya existe un registro menstrual para esa fecha de inicio")

        cycle = await self.repo.create(**data.model_dump())
        return MenstrualCycleResponse.model_validate(cycle)

    async def list_patient_cycles(
        self,
        patient_id: int,
        limit: int = 24,
        caller: TokenPayload | None = None,
    ) -> MenstrualCycleListResponse:
        if caller is not None:
            await ensure_patient_ownership(self.session, caller, patient_id)
        await self._ensure_patient_access(patient_id)
        cycles = await self.repo.get_by_patient(patient_id, limit=limit)
        return MenstrualCycleListResponse(
            patient_id=patient_id,
            total=len(cycles),
            items=[MenstrualCycleResponse.model_validate(cycle) for cycle in cycles],
        )

    async def predict_next_cycle(
        self,
        patient_id: int,
        *,
        as_of: date | None = None,
        history_limit: int = 24,
        caller: TokenPayload | None = None,
    ) -> MenstrualCyclePredictionResponse:
        if caller is not None:
            await ensure_patient_ownership(self.session, caller, patient_id)
        await self._ensure_patient_access(patient_id)
        cycles = await self.repo.get_by_patient(patient_id, limit=history_limit)
        if not cycles:
            raise UnprocessableError("Se requiere al menos un ciclo registrado para predecir")

        observations = [
            CycleObservation(
                period_start_date=cycle.period_start_date,
                period_end_date=cycle.period_end_date,
            )
            for cycle in cycles
        ]
        prediction = self.predictor.predict(observations, as_of=as_of)
        return MenstrualCyclePredictionResponse(
            patient_id=patient_id,
            as_of=prediction.as_of,
            regularity=prediction.regularity,
            average_cycle_length_days=prediction.average_cycle_length_days,
            cycle_length_stddev_days=prediction.cycle_length_stddev_days,
            predicted_cycle_length_days=prediction.predicted_cycle_length_days,
            predicted_period_duration_days=prediction.predicted_period_duration_days,
            predicted_next_period_start=prediction.predicted_next_period_start,
            predicted_next_period_end=prediction.predicted_next_period_end,
            prediction_window_start=prediction.prediction_window_start,
            prediction_window_end=prediction.prediction_window_end,
            confidence=prediction.confidence,
            recent_cycle_lengths_days=prediction.recent_cycle_lengths_days,
            warnings=prediction.warnings,
            model=MenstrualPredictionModelInfo(
                name=MODEL_NAME,
                version=MODEL_VERSION,
                training_sample_size=prediction.training_sample_size,
                features=[
                    "recent_cycle_lengths",
                    "weighted_moving_average",
                    "robust_median",
                    "cycle_length_variability",
                    "period_duration_history",
                ],
            ),
        )

    async def update_cycle(
        self,
        cycle_id: int,
        data: MenstrualCycleUpdate,
        caller: TokenPayload | None = None,
    ) -> MenstrualCycleResponse:
        cycle = await self.repo.get_active_by_id(cycle_id)
        if not cycle:
            raise NotFoundError("Registro menstrual no encontrado")

        if caller is not None:
            await ensure_patient_ownership(self.session, caller, cycle.patient_id)

        provided = data.model_fields_set
        start = data.period_start_date if "period_start_date" in provided else cycle.period_start_date
        end = data.period_end_date if "period_end_date" in provided else cycle.period_end_date
        flow = data.flow if "flow" in provided else cycle.flow
        flow_value = flow.value if isinstance(flow, MenstrualFlow) else flow

        if start is None:
            raise UnprocessableError("La fecha de inicio es obligatoria")
        if end is not None and end < start:
            raise UnprocessableError("La fecha de fin debe ser posterior o igual al inicio")
        if end is not None and (end - start).days + 1 > 14:
            raise UnprocessableError("La duración del sangrado excede el límite permitido")

        if caller is not None and caller.role == "patient":
            result = await self.session.execute(
                text("SELECT fn_patient_update_cycle(:cid, :start, :end, :flow)"),
                {"cid": cycle_id, "start": start, "end": end, "flow": flow_value},
            )
            if result.scalar() is None:
                raise NotFoundError("Registro menstrual no encontrado")
            await self.session.refresh(cycle)
            return MenstrualCycleResponse.model_validate(cycle)

        updated = await self.repo.update(cycle_id, start, end, flow_value)
        if not updated:
            raise NotFoundError("Registro menstrual no encontrado")
        return MenstrualCycleResponse.model_validate(updated)

    async def delete_cycle(self, cycle_id: int, caller: TokenPayload | None = None) -> None:
        cycle = await self.repo.get_active_by_id(cycle_id)
        if not cycle:
            raise NotFoundError("Registro menstrual no encontrado")

        if caller is not None:
            await ensure_patient_ownership(self.session, caller, cycle.patient_id)

        if caller is not None and caller.role == "patient":
            result = await self.session.execute(
                text("SELECT fn_patient_soft_delete_cycle(:cid)"),
                {"cid": cycle_id},
            )
            if result.scalar() is None:
                raise NotFoundError("Registro menstrual no encontrado")
            return

        deleted = await self.repo.soft_delete(cycle_id)
        if not deleted:
            raise NotFoundError("Registro menstrual no encontrado")

    async def _ensure_patient_access(self, patient_id: int) -> None:
        patient = await self.patient_repo.get_by_id(patient_id)
        if not patient or patient.deleted_at is not None:
            raise NotFoundError("Paciente no encontrado o sin acceso")
