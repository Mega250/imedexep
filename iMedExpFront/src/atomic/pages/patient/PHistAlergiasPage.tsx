import { ClinicalHistoryScreen } from "@/atomic/organisms/ClinicalHistoryScreen";
import { Allergy, addAllergy, deleteAllergy, listAllergies } from "@/services/api/clinicalHistoryApi";

export function PHistAlergiasPage() {
  return (
    <ClinicalHistoryScreen<Allergy>
      chipsActive={1}
      title="Alergias"
      icon="alert"
      addLabel="Agregar alergia"
      emptyTitle="Sin alergias registradas."
      emptyNote="Registra tus alergias para alertar a cualquier médico que te atienda."
      fields={[
        { key: "substance", label: "Sustancia", placeholder: "Ej. Penicilina", required: true },
        { key: "reaction", label: "Reacción", placeholder: "Ej. Anafilaxia" },
        {
          key: "severity",
          label: "Severidad",
          placeholder: "Selecciona…",
          type: "select",
          options: ["Leve", "Moderada", "Severa"]
        },
        { key: "notes", label: "Notas", placeholder: "Opcional" }
      ]}
      fetchItems={listAllergies}
      addItem={(v) => addAllergy(v)}
      removeItem={deleteAllergy}
      idOf={(i) => i.id}
      titleOf={(i) => i.substance}
      metaOf={(i) => [i.severity, i.reaction].filter(Boolean).join(" · ") || "—"}
    />
  );
}
