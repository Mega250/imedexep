import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "@/atomic/atoms/Icon";
import {
  ConsultationDetail,
  DiagnosisRecord,
  fetchConsultation,
  fetchDiagnoses
} from "@/services/api/consultationsApi";
import { Disease, fetchDisease } from "@/services/api/diseasesApi";
import {
  PrescriptionDetail,
  Treatment,
  fetchPrescriptionForConsultation
} from "@/services/api/prescriptionsApi";
import { Patient, fetchPatient } from "@/services/api/patientsApi";
import { getSelectedConsultationId } from "@/services/api/selectedConsultation";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { DX_TYPE_LABEL } from "./consultaRegistro";

export type LoadedDiagnosis = DiagnosisRecord & { disease: Disease | null };

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function formatDate(iso: string | null): string {
  if (!iso) {
    return "—";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateTime(iso: string | null): string {
  if (!iso) {
    return "—";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(iso)} · ${hh}:${mm}`;
}

export function useConsultaDetalle() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consultation, setConsultation] = useState<ConsultationDetail | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [diagnoses, setDiagnoses] = useState<LoadedDiagnosis[]>([]);
  const [prescription, setPrescription] = useState<PrescriptionDetail | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cid = await getSelectedConsultationId();
        if (cid === null) {
          if (!cancelled) {
            setError("No hay una consulta seleccionada.");
            setLoading(false);
          }
          return;
        }
        const detail = await fetchConsultation(cid);
        const [patientResult, rawDx, rx] = await Promise.all([
          fetchPatient(detail.patient_id).catch(() => null),
          fetchDiagnoses(cid).catch(() => [] as DiagnosisRecord[]),
          fetchPrescriptionForConsultation(cid).catch(() => null)
        ]);
        const dx: LoadedDiagnosis[] = await Promise.all(
          rawDx.map(async (d) => ({
            ...d,
            disease: await fetchDisease(d.disease_id).catch(() => null)
          }))
        );
        if (cancelled) {
          return;
        }
        setConsultation(detail);
        setPatient(patientResult);
        setDiagnoses(dx);
        setPrescription(rx);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar la consulta.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, error, consultation, patient, diagnoses, prescription };
}

export type ConsultaDetalle = ReturnType<typeof useConsultaDetalle>;

// ── Read-only renderers ───────────────────────────────────────────────────────

export function FieldText({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.fieldText}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value && value.trim() ? value : "Sin registro"}</Text>
    </View>
  );
}

export function DiagnosisView({ d }: { d: LoadedDiagnosis }) {
  const name = d.disease?.name ?? `Enfermedad #${d.disease_id}`;
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemMain}>
        <Text style={styles.itemName}>{name}</Text>
        {d.additional_notes ? <Text style={styles.itemSub}>{d.additional_notes}</Text> : null}
      </View>
      <View style={styles.itemRight}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{DX_TYPE_LABEL[d.diagnosis_type] ?? d.diagnosis_type}</Text>
        </View>
        {d.disease?.cie10_code ? <Text style={styles.itemMeta}>{d.disease.cie10_code}</Text> : null}
      </View>
    </View>
  );
}

export function TreatmentView({ t }: { t: Treatment }) {
  const name = t.free_text_medication ?? (t.medication_id ? `Medicamento #${t.medication_id}` : "Medicamento");
  const line = [t.dosage, t.frequency, `${t.duration_days} días`].filter(Boolean).join(" · ");
  return (
    <View style={styles.itemRow}>
      <View style={styles.medIcon}>
        <Icon kind="pill" size={15} color={colors.accentDeep} />
      </View>
      <View style={styles.itemMain}>
        <Text style={styles.itemName}>{name}</Text>
        <Text style={styles.itemSub}>{line}</Text>
        {t.additional_notes ? <Text style={styles.itemNote}>{t.additional_notes}</Text> : null}
      </View>
      <Text style={styles.itemMeta}>
        {formatDate(t.start_date)}
        {t.calculated_end_date ? ` → ${formatDate(t.calculated_end_date)}` : ""}
      </Text>
    </View>
  );
}

export function StatusPills({
  consultation,
  prescription
}: {
  consultation: ConsultationDetail;
  prescription: PrescriptionDetail | null;
}) {
  const signed = !!prescription?.signed_at;
  return (
    <View style={styles.pillRow}>
      <View style={styles.pill}>
        <Icon kind="lock" size={11} color={colors.ink3} />
        <Text style={styles.pillText}>Sensibilidad {consultation.sensitivity_level}</Text>
      </View>
      {prescription ? (
        <View style={[styles.pill, signed ? styles.pillOk : styles.pillWarn]}>
          <Icon kind={signed ? "check" : "pen"} size={11} color={signed ? colors.ok : colors.mid} />
          <Text style={[styles.pillText, { color: signed ? colors.ok : colors.mid }]}>
            {signed ? "Receta firmada" : "Receta sin firmar"}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldText: {
    gap: 4
  },
  fieldLabel: {
    fontFamily: family.mono,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.ink3
  },
  fieldValue: {
    fontFamily: family.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  medIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  itemMain: {
    flex: 1,
    minWidth: 0,
    gap: 3
  },
  itemName: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  itemSub: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink2
  },
  itemNote: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink3,
    fontStyle: "italic"
  },
  itemRight: {
    alignItems: "flex-end",
    gap: 5
  },
  itemMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.paper2
  },
  typeBadgeText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.4,
    color: colors.ink2,
    textTransform: "uppercase"
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule
  },
  pillOk: {
    backgroundColor: colors.okSoft,
    borderColor: colors.okRule
  },
  pillWarn: {
    backgroundColor: colors.paper2,
    borderColor: colors.rule
  },
  pillText: {
    fontFamily: family.monoMedium,
    fontSize: 10.5,
    letterSpacing: 0.3,
    color: colors.ink2
  }
});
