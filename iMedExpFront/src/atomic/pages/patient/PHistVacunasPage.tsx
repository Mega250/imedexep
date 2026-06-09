import { ClinicalHistoryScreen } from "@/atomic/organisms/ClinicalHistoryScreen";
import { Vaccine, addVaccine, deleteVaccine, listVaccines } from "@/services/api/clinicalHistoryApi";
import { formatDateLocal, isFutureDateLocal } from "@/utils/dates";

export function PHistVacunasPage() {
  return (
    <ClinicalHistoryScreen<Vaccine>
      chipsActive={5}
      title="Vacunas"
      icon="vax"
      addLabel="Agregar vacuna"
      emptyTitle="Sin vacunas registradas."
      emptyNote="Agrega tus vacunas; también aparecerán al recibirlas en una institución conectada."
      fields={[
        { key: "name", label: "Vacuna", placeholder: "Ej. Influenza", required: true },
        { key: "dose", label: "Dosis", placeholder: "Ej. Refuerzo 2026" },
        { key: "applied_on", label: "Fecha (aaaa-mm-dd)", placeholder: "2026-01-15" },
        { key: "notes", label: "Notas", placeholder: "Opcional" }
      ]}
      fetchItems={listVaccines}
      addItem={(v) => {
        if (isFutureDateLocal(v.applied_on)) {
          throw new Error("La fecha de la vacuna no puede ser futura.");
        }
        return addVaccine(v);
      }}
      removeItem={deleteVaccine}
      idOf={(i) => i.id}
      titleOf={(i) => i.name}
      metaOf={(i) =>
        [i.dose, i.applied_on ? formatDateLocal(i.applied_on) : null]
          .filter(Boolean)
          .join(" · ") || "—"
      }
    />
  );
}
