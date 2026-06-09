import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ClinicalHistoryScreen } from "@/atomic/organisms/ClinicalHistoryScreen";
import {
  Antecedent,
  addAntecedent,
  deleteAntecedent,
  listAntecedents
} from "@/services/api/clinicalHistoryApi";
import { getCurrentPatientFull } from "@/services/api/currentPatient";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type RegistrationProfile = {
  conditions?: unknown;
  health_questionnaire?: {
    hereditary_family?: { conditions?: unknown };
    pathological?: { diseases?: unknown };
  } | null;
};

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      .map((v) => v.trim());
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

export function PHistAntecedentesPage() {
  const [registered, setRegistered] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const profile = (await getCurrentPatientFull()) as RegistrationProfile;
        const questionnaire = profile.health_questionnaire ?? null;
        const merged = [
          ...toStringList(profile.conditions),
          ...toStringList(questionnaire?.hereditary_family?.conditions),
          ...toStringList(questionnaire?.pathological?.diseases)
        ];
        const unique = Array.from(new Set(merged));
        if (!cancelled) {
          setRegistered(unique);
        }
      } catch {
        if (!cancelled) {
          setRegistered([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const extra =
    registered.length > 0 ? (
      <View style={styles.regCard}>
        <Text style={styles.regLabel}>De tu registro</Text>
        <View style={styles.regChips}>
          {registered.map((item) => (
            <View key={item} style={styles.regChip}>
              <Text style={styles.regChipText}>{item}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.regNote}>Capturados al crear tu cuenta.</Text>
      </View>
    ) : null;

  return (
    <ClinicalHistoryScreen<Antecedent>
      chipsActive={4}
      title="Familia"
      icon="tree"
      addLabel="Agregar antecedente"
      emptyTitle="Sin antecedentes registrados."
      emptyNote="Registra antecedentes heredofamiliares o personales relevantes para tu salud."
      fields={[
        { key: "kind", label: "Tipo", placeholder: "Heredofamiliar / Personal", required: true },
        { key: "description", label: "Antecedente", placeholder: "Ej. Diabetes (madre)", required: true },
        { key: "notes", label: "Notas", placeholder: "Opcional" }
      ]}
      fetchItems={listAntecedents}
      addItem={(v) => addAntecedent(v)}
      removeItem={deleteAntecedent}
      idOf={(i) => i.id}
      titleOf={(i) => i.description}
      metaOf={(i) => i.kind}
      extra={extra}
    />
  );
}

const styles = StyleSheet.create({
  regCard: {
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 12
  },
  regLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.ink3
  },
  regChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10
  },
  regChip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  regChipText: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  regNote: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 10
  }
});
