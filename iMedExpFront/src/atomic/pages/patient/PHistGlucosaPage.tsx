import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RoundIconButton } from "@/atomic/atoms/RoundIconButton";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { RecordFormModal } from "@/atomic/molecules/RecordFormModal";
import { HistChips } from "@/atomic/organisms/HistChips";
import { PatientTabBar } from "@/atomic/organisms/PatientTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { getCurrentPatientId } from "@/services/api/currentPatient";
import { Glucose, addGlucose, deleteGlucose, listGlucose } from "@/services/api/clinicalReadingsApi";
import { PatientFull, fetchPatientFull } from "@/services/api/patientsApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { confirmAction } from "@/utils/confirm";
import { formatDateLocal, isFutureDateLocal } from "@/utils/dates";

function Header({ onAdd }: { onAdd: () => void }): ReactNode {
  return (
    <>
      <ScreenTopBar
        sub="Mi historial"
        title="Glucosa"
        right={<RoundIconButton icon="plus" onPress={onAdd} />}
      />
      <HistChips active={9} />
    </>
  );
}

export function PHistGlucosaPage() {
  const [patient, setPatient] = useState<PatientFull | null>(null);
  const [readings, setReadings] = useState<Glucose[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function reloadReadings() {
    const r = await listGlucose();
    setReadings(r);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const patientId = await getCurrentPatientId();
        const [data, list] = await Promise.all([
          fetchPatientFull(patientId),
          listGlucose().catch(() => [] as Glucose[])
        ]);
        if (!cancelled) {
          setPatient(data);
          setReadings(list);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar tu glucosa.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAdd(values: Record<string, string>) {
    const value = Number(values.value_mg_dl);
    if (!value || Number.isNaN(value)) {
      setFormError("Ingresa un valor de glucosa válido.");
      return;
    }
    if (value < 20 || value > 600) {
      setFormError("La glucosa debe estar entre 20 y 600 mg/dL.");
      return;
    }
    const measured = values.measured_on?.trim();
    if (measured && isFutureDateLocal(measured)) {
      setFormError("La fecha no puede ser futura.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await addGlucose({
        value_mg_dl: value,
        context: values.context?.trim() || undefined,
        measured_on: values.measured_on?.trim() || undefined,
        notes: values.notes?.trim() || undefined
      });
      setOpen(false);
      await reloadReadings();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No pudimos guardar la lectura.");
    } finally {
      setSubmitting(false);
    }
  }

  async function performDelete(id: number) {
    setError(null);
    try {
      await deleteGlucose(id);
      await reloadReadings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos eliminar la lectura.");
    }
  }

  async function handleDelete(id: number) {
    const ok = await confirmAction("Eliminar", "¿Seguro que quieres eliminarlo?", {
      confirmLabel: "Eliminar",
      destructive: true
    });
    if (ok) {
      performDelete(id);
    }
  }

  const latest = readings[0]?.value_mg_dl ?? patient?.glucose_mg_dl ?? null;
  const latestTag = readings[0]
    ? (readings[0].context ?? "REGISTRO").toUpperCase()
    : patient?.glucose_risk
      ? patient.glucose_risk.toUpperCase()
      : "SIN DATOS";

  return (
    <MobileScreen
      tabBar={<PatientTabBar active={1} />}
      header={<Header onAdd={() => setOpen(true)} />}
      contentStyle={styles.content}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      <FadeIn>
        <View style={styles.statRow}>
          <DarkPanel
            radius={radii.md}
            padding={14}
            blobSize={140}
            blobTop={-50}
            blobRight={-40}
            elevated={false}
            style={styles.statDark}
          >
            <Text style={styles.darkEyebrow}>Último</Text>
            <View style={styles.darkValueRow}>
              <Text style={styles.darkValue}>{latest ?? "—"}</Text>
              <Text style={styles.darkUnit}>mg/dL</Text>
            </View>
            <Text style={styles.darkTag}>{latestTag}</Text>
          </DarkPanel>
          <Card radius={radii.md} style={styles.statCard}>
            <SectionLabel label="Rango" />
            <Text style={styles.statValue}>70-140</Text>
            <Text style={styles.statSub}>mg/dL ideal</Text>
          </Card>
        </View>
      </FadeIn>

      <SectionLabel label="Lecturas registradas" style={styles.section} />

      {readings.length === 0 && !loading ? (
        <FadeIn delay={120}>
          <View style={styles.emptyCard}>
            <Icon kind="drop" size={20} color={colors.accentDeep} />
            <Text style={styles.emptyTitle}>Sin lecturas de glucosa.</Text>
            <Text style={styles.emptyNote}>Toca + para registrar tu primera medición.</Text>
          </View>
        </FadeIn>
      ) : (
        <View style={styles.list}>
          {readings.map((r, i) => (
            <FadeIn key={r.id} delay={i * 40}>
              <View style={styles.readingRow}>
                <View style={styles.flex}>
                  <View style={styles.valueRow}>
                    <Text style={styles.value}>{r.value_mg_dl}</Text>
                    <Text style={styles.unit}>mg/dL</Text>
                  </View>
                  <Text style={styles.readingMeta}>
                    {[r.context, formatDateLocal(r.measured_on ?? r.created_at)].filter(Boolean).join(" · ")}
                  </Text>
                </View>
                <Tappable
                  onPress={() => handleDelete(r.id)}
                  style={styles.delBtn}
                  accessibilityLabel="Eliminar"
                >
                  <Icon kind="trash" size={14} color={colors.alert} />
                </Tappable>
              </View>
            </FadeIn>
          ))}
        </View>
      )}

      <RecordFormModal
        visible={open}
        title="Registrar glucosa"
        submitting={submitting}
        error={formError}
        fields={[
          { key: "value_mg_dl", label: "Glucosa (mg/dL)", placeholder: "Ej. 95", keyboardType: "numeric", required: true },
          { key: "context", label: "Contexto", placeholder: "Ayunas / Postprandial" },
          { key: "measured_on", label: "Fecha (aaaa-mm-dd)", placeholder: "2026-06-06" },
          { key: "notes", label: "Notas", placeholder: "Opcional" }
        ]}
        onClose={() => {
          setOpen(false);
          setFormError(null);
        }}
        onSubmit={handleAdd}
      />
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 120
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  loading: {
    paddingVertical: 14,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 8
  },
  statRow: {
    flexDirection: "row",
    gap: 12
  },
  statDark: {
    flex: 1.2
  },
  darkEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.55)"
  },
  darkValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 4
  },
  darkValue: {
    fontFamily: family.medium,
    fontSize: 26,
    letterSpacing: -0.5,
    color: colors.paper
  },
  darkUnit: {
    fontFamily: family.mono,
    fontSize: 10,
    color: "rgba(255,255,255,0.55)"
  },
  darkTag: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.accentBright,
    marginTop: 6,
    letterSpacing: 0.5
  },
  statCard: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  statValue: {
    fontFamily: family.medium,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.ink,
    marginTop: 4
  },
  statSub: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3,
    marginTop: 6
  },
  section: {
    marginTop: 18,
    marginBottom: 8
  },
  list: {
    gap: 6
  },
  readingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6
  },
  value: {
    fontFamily: family.medium,
    fontSize: 20,
    letterSpacing: -0.5,
    color: colors.ink
  },
  unit: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  readingMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 3
  },
  delBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyCard: {
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.xl,
    padding: 18,
    gap: 8
  },
  emptyTitle: {
    fontFamily: family.serifItalic,
    fontSize: 20,
    color: colors.ink,
    marginTop: 6
  },
  emptyNote: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  }
});
