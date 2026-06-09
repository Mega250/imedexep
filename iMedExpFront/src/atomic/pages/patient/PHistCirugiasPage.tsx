import { ClinicalHistoryScreen } from "@/atomic/organisms/ClinicalHistoryScreen";
import { Surgery, addSurgery, deleteSurgery, listSurgeries } from "@/services/api/clinicalHistoryApi";
import { formatDateLocal, isFutureDateLocal } from "@/utils/dates";

export function PHistCirugiasPage() {
  return (
    <ClinicalHistoryScreen<Surgery>
      chipsActive={3}
      title="Cirugías"
      icon="cut"
      addLabel="Registrar una cirugía"
      emptyTitle="Sin cirugías registradas."
      emptyNote="Registra tus cirugías para tener tu historial completo en cualquier consulta."
      fields={[
        { key: "name", label: "Cirugía", placeholder: "Ej. Apendicectomía", required: true },
        { key: "performed_on", label: "Fecha (aaaa-mm-dd)", placeholder: "2022-08-03" },
        { key: "hospital", label: "Hospital", placeholder: "Dónde se realizó" },
        { key: "notes", label: "Notas", placeholder: "Opcional" }
      ]}
      fetchItems={listSurgeries}
      addItem={(v) => {
        if (isFutureDateLocal(v.performed_on)) {
          throw new Error("La fecha de la cirugía no puede ser futura.");
        }
        return addSurgery(v);
      }}
      removeItem={deleteSurgery}
      idOf={(i) => i.id}
      titleOf={(i) => i.name}
      metaOf={(i) =>
        [i.hospital, i.performed_on ? formatDateLocal(i.performed_on) : null]
          .filter(Boolean)
          .join(" · ") || "—"
      }
    />
  );
}
