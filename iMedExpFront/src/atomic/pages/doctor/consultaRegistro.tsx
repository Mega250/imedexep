import { useCallback, useEffect, useRef, useState } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { TextField } from "@/atomic/atoms/TextField";
import { SegmentedField, Segment } from "@/atomic/molecules/SegmentedField";
import { patchAppointment } from "@/services/api/appointmentsApi";
import {
  DiagnosisType,
  addDiagnosis,
  startConsultation
} from "@/services/api/consultationsApi";
import { ensureDisease } from "@/services/api/diseasesApi";
import { Medication, searchMedications } from "@/services/api/medicationsApi";
import {
  addTreatment,
  createPrescriptionForConsultation,
  sendPrescriptionToPatient,
  signPrescription
} from "@/services/api/prescriptionsApi";
import {
  PatientFull,
  SocioeconomicData,
  fetchPatientFull,
  fetchSocioeconomic,
  patchSocioeconomic
} from "@/services/api/patientsApi";
import {
  clearSelectedAppointmentId,
  getSelectedAppointmentId
} from "@/services/api/selectedAppointment";
import { getSelectedPatientId } from "@/services/api/selectedPatient";
import { setSelectedConsultationId } from "@/services/api/selectedConsultation";
import { loadSession } from "@/state/sessionStore";
import {
  VitalSign,
  VitalSignCreatePayload,
  fetchLatestPatientVitals,
  postVitalSign
} from "@/services/api/vitalsApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

// ── Constants ────────────────────────────────────────────────────────────────

export const DX_TYPES: Segment[] = [
  { value: "primary", label: "Primario" },
  { value: "secondary", label: "Secundario" },
  { value: "differential", label: "Diferencial" }
];

export const DX_TYPE_LABEL: Record<DiagnosisType, string> = {
  primary: "Primario",
  secondary: "Secundario",
  differential: "Diferencial"
};

export const SENSITIVITY: Segment[] = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5" }
];

/** Clamp any raw clearance value into the valid 1–5 band. */
function clampClearance(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    return 1;
  }
  return Math.max(1, Math.min(5, Math.floor(n)));
}

/** A doctor may only file a consultation at a sensitivity within their clearance. */
export function sensitivityOptionsFor(clearance: number): Segment[] {
  return SENSITIVITY.slice(0, clampClearance(clearance));
}

// ── Types ────────────────────────────────────────────────────────────────────

export type DxDraft = {
  key: string;
  name: string;
  cie10: string;
  type: DiagnosisType;
  notes: string;
};

export type RxDraft = {
  key: string;
  medication: string;
  medicationId: number | null;
  dosage: string;
  frequency: string;
  durationDays: string;
  startDate: string;
  notes: string;
};

export type VitalsDraft = {
  systolic: string;
  diastolic: string;
  heartRate: string;
  temperature: string;
  oxygen: string;
  weight: string;
  height: string;
};

export type CommitResult = {
  ok: boolean;
  consultationId: number | null;
  warnings: string[];
  fatal?: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

let keySeq = 0;
function nextKey(): string {
  keySeq += 1;
  return `cr_${keySeq}`;
}

export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function trimOrNull(value: string): string | null {
  const t = value.trim();
  return t.length ? t : null;
}

function toNumber(value: string): number | undefined {
  const t = value.trim().replace(",", ".");
  if (!t) {
    return undefined;
  }
  const n = Number(t);
  return Number.isFinite(n) ? n : undefined;
}

function buildSignatureHash(consultationId: number): string {
  return `sig_${consultationId}_${Date.now().toString(36)}`;
}

export function emptyDx(): DxDraft {
  return { key: nextKey(), name: "", cie10: "", type: "primary", notes: "" };
}

export function emptyRx(): RxDraft {
  return {
    key: nextKey(),
    medication: "",
    medicationId: null,
    dosage: "",
    frequency: "",
    durationDays: "",
    startDate: todayIso(),
    notes: ""
  };
}

const EMPTY_VITALS: VitalsDraft = {
  systolic: "",
  diastolic: "",
  heartRate: "",
  temperature: "",
  oxygen: "",
  weight: "",
  height: ""
};

function buildVitalsPayload(patientId: number, v: VitalsDraft): VitalSignCreatePayload | null {
  const payload: VitalSignCreatePayload = { patient_id: patientId, source: "consultation" };
  let has = false;
  const systolic = toNumber(v.systolic);
  const diastolic = toNumber(v.diastolic);
  const heartRate = toNumber(v.heartRate);
  const temperature = toNumber(v.temperature);
  const oxygen = toNumber(v.oxygen);
  const weight = toNumber(v.weight);
  const height = toNumber(v.height);
  if (systolic !== undefined) {
    payload.systolic_bp = systolic;
    has = true;
  }
  if (diastolic !== undefined) {
    payload.diastolic_bp = diastolic;
    has = true;
  }
  if (heartRate !== undefined) {
    payload.heart_rate = heartRate;
    has = true;
  }
  if (temperature !== undefined) {
    payload.body_temperature = temperature;
    has = true;
  }
  if (oxygen !== undefined) {
    payload.oxygen_saturation = oxygen;
    has = true;
  }
  if (weight !== undefined) {
    payload.weight = weight;
    has = true;
  }
  if (height !== undefined) {
    // backend stores height in metres
    payload.height = height > 3 ? height / 100 : height;
    has = true;
  }
  return has ? payload : null;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useConsultaRegistro() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientFull | null>(null);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  const [latestVitals, setLatestVitals] = useState<VitalSign | null>(null);
  const [clearanceLevel, setClearanceLevel] = useState(1);

  const [vitals, setVitals] = useState<VitalsDraft>(EMPTY_VITALS);
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [medicalNotes, setMedicalNotes] = useState("");
  const [sensitivity, setSensitivity] = useState("1");
  const [diagnoses, setDiagnoses] = useState<DxDraft[]>([]);
  const [treatments, setTreatments] = useState<RxDraft[]>([]);
  const [generalInstructions, setGeneralInstructions] = useState("");
  const [signRx, setSignRx] = useState(true);
  const [sendRx, setSendRx] = useState(false);
  const [committing, setCommitting] = useState(false);

  const emptySoc: SocioeconomicData = {
    drainage: null,
    water: null,
    electricity: null,
    household_members: null,
    cooking_material: null,
    cooking_method: null
  };
  const [socioeconomic, setSocioeconomic] = useState<SocioeconomicData>(emptySoc);
  const [socAlreadyFilled, setSocAlreadyFilled] = useState(false);
  const [socSaving, setSocSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pid = await getSelectedPatientId();
        const apptId = await getSelectedAppointmentId();
        const session = await loadSession();
        const clearance = clampClearance(session.user?.access_attributes?.clearance_level);
        if (pid === null) {
          if (!cancelled) {
            setError("Selecciona un paciente desde tu Agenda o Pacientes para iniciar la consulta.");
            setLoading(false);
          }
          return;
        }
        const full = await fetchPatientFull(pid);
        let latest: VitalSign | null = null;
        try {
          latest = await fetchLatestPatientVitals(pid);
        } catch {
          latest = null;
        }
        let socData: SocioeconomicData | null = null;
        try {
          socData = await fetchSocioeconomic(pid);
        } catch {
          socData = null;
        }
        if (cancelled) {
          return;
        }
        setPatient(full);
        if (socData) {
          const hasSoc = Object.values(socData).some((v) => v !== null && v !== "");
          setSocAlreadyFilled(hasSoc);
          if (hasSoc) setSocioeconomic(socData);
        }
        setPatientId(pid);
        setAppointmentId(apptId);
        setLatestVitals(latest);
        setClearanceLevel(clearance);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar al paciente.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setVital = useCallback((field: keyof VitalsDraft, value: string) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addDx = useCallback(() => setDiagnoses((prev) => [...prev, emptyDx()]), []);
  const updateDx = useCallback((key: string, patch: Partial<DxDraft>) => {
    setDiagnoses((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }, []);
  const removeDx = useCallback((key: string) => {
    setDiagnoses((prev) => prev.filter((d) => d.key !== key));
  }, []);

  const addRx = useCallback(() => setTreatments((prev) => [...prev, emptyRx()]), []);
  const updateRx = useCallback((key: string, patch: Partial<RxDraft>) => {
    setTreatments((prev) => prev.map((t) => (t.key === key ? { ...t, ...patch } : t)));
  }, []);
  const removeRx = useCallback((key: string) => {
    setTreatments((prev) => prev.filter((t) => t.key !== key));
  }, []);

  const saveSocioeconomic = useCallback(async (): Promise<boolean> => {
    if (!patientId) return false;
    setSocSaving(true);
    try {
      const saved = await patchSocioeconomic(patientId, socioeconomic);
      setSocioeconomic(saved);
      setSocAlreadyFilled(true);
      return true;
    } catch {
      return false;
    } finally {
      setSocSaving(false);
    }
  }, [patientId, socioeconomic]);

  const validDx = diagnoses.filter((d) => d.name.trim().length > 0);
  const validRx = treatments.filter(
    (t) => t.medication.trim() && t.dosage.trim() && t.frequency.trim()
  );
  const hasVitals = buildVitalsPayload(patientId ?? 0, vitals) !== null;
  const canCommit = Boolean(patientId) && chiefComplaint.trim().length > 0 && !committing;

  const commit = useCallback(async (): Promise<CommitResult> => {
    if (!patientId) {
      return { ok: false, consultationId: null, warnings: [], fatal: "Sin paciente seleccionado." };
    }
    setCommitting(true);
    const warnings: string[] = [];
    try {
      const consultation = await startConsultation({
        patient_id: patientId,
        chief_complaint: trimOrNull(chiefComplaint),
        symptoms: trimOrNull(symptoms),
        medical_notes: trimOrNull(medicalNotes),
        sensitivity_level: Math.min(Number(sensitivity) || 1, clampClearance(clearanceLevel))
      });
      const consultationId = consultation.id;

      const vitalsPayload = buildVitalsPayload(patientId, vitals);
      if (vitalsPayload) {
        try {
          await postVitalSign(vitalsPayload);
        } catch {
          warnings.push("No se guardaron los signos vitales.");
        }
      }

      for (const dx of diagnoses) {
        const name = dx.name.trim();
        if (!name) {
          continue;
        }
        try {
          const disease = await ensureDisease(name, dx.cie10.trim() || null);
          await addDiagnosis(consultationId, {
            disease_id: disease.id,
            diagnosis_type: dx.type,
            additional_notes: dx.notes.trim() || null
          });
        } catch {
          warnings.push(`No se guardó el diagnóstico “${name}”.`);
        }
      }

      const rxToSave = treatments.filter(
        (t) => t.medication.trim() && t.dosage.trim() && t.frequency.trim()
      );
      if (rxToSave.length > 0) {
        try {
          const prescription = await createPrescriptionForConsultation(consultationId, {
            general_instructions: trimOrNull(generalInstructions)
          });
          for (const t of rxToSave) {
            try {
              await addTreatment(prescription.id, {
                medication_id: t.medicationId ?? null,
                free_text_medication: t.medicationId ? null : t.medication.trim(),
                dosage: t.dosage.trim(),
                frequency: t.frequency.trim(),
                duration_days: Math.max(1, Math.round(toNumber(t.durationDays) ?? 1)),
                start_date: t.startDate || todayIso(),
                additional_notes: t.notes.trim() || null
              });
            } catch {
              warnings.push(`No se guardó el medicamento “${t.medication.trim()}”.`);
            }
          }
          if (signRx) {
            try {
              await signPrescription(prescription.id, buildSignatureHash(consultationId));
            } catch {
              warnings.push("No se pudo firmar la receta.");
            }
          }
          if (sendRx) {
            try {
              await sendPrescriptionToPatient(prescription.id);
            } catch {
              warnings.push("No se pudo enviar la receta al paciente.");
            }
          }
        } catch {
          warnings.push("No se pudo crear la receta.");
        }
      }

      if (appointmentId !== null) {
        try {
          await patchAppointment(appointmentId, { status: "completed" });
          await clearSelectedAppointmentId();
        } catch {
          warnings.push("No se pudo marcar la cita como completada.");
        }
      }

      await setSelectedConsultationId(consultationId);
      setCommitting(false);
      return { ok: true, consultationId, warnings };
    } catch (err) {
      setCommitting(false);
      return {
        ok: false,
        consultationId: null,
        warnings,
        fatal: err instanceof Error ? err.message : "No se pudo registrar la consulta."
      };
    }
  }, [
    patientId,
    chiefComplaint,
    symptoms,
    medicalNotes,
    sensitivity,
    vitals,
    diagnoses,
    treatments,
    generalInstructions,
    signRx,
    sendRx,
    appointmentId,
    clearanceLevel
  ]);

  return {
    loading,
    error,
    patient,
    patientId,
    appointmentId,
    latestVitals,
    vitals,
    setVital,
    chiefComplaint,
    setChiefComplaint,
    symptoms,
    setSymptoms,
    medicalNotes,
    setMedicalNotes,
    sensitivity,
    setSensitivity,
    clearanceLevel,
    sensitivityOptions: sensitivityOptionsFor(clearanceLevel),
    diagnoses,
    addDx,
    updateDx,
    removeDx,
    treatments,
    addRx,
    updateRx,
    removeRx,
    generalInstructions,
    setGeneralInstructions,
    signRx,
    setSignRx,
    sendRx,
    setSendRx,
    committing,
    commit,
    canCommit,
    socioeconomic,
    setSocioeconomic,
    socAlreadyFilled,
    socSaving,
    saveSocioeconomic,
    summary: {
      vitals: hasVitals,
      diagnoses: validDx.length,
      treatments: validRx.length
    }
  };
}

export type ConsultaRegistro = ReturnType<typeof useConsultaRegistro>;

// ── Shared presentational pieces ──────────────────────────────────────────────

const VITAL_FIELDS: { key: keyof VitalsDraft; label: string; unit: string; kbd: "number-pad" | "decimal-pad" }[] = [
  { key: "systolic", label: "Sistólica", unit: "mmHg", kbd: "number-pad" },
  { key: "diastolic", label: "Diastólica", unit: "mmHg", kbd: "number-pad" },
  { key: "heartRate", label: "FC", unit: "lpm", kbd: "number-pad" },
  { key: "temperature", label: "Temp.", unit: "°C", kbd: "decimal-pad" },
  { key: "oxygen", label: "SpO₂", unit: "%", kbd: "number-pad" },
  { key: "weight", label: "Peso", unit: "kg", kbd: "decimal-pad" },
  { key: "height", label: "Talla", unit: "cm", kbd: "number-pad" }
];

export function VitalsEditor({
  vitals,
  setVital,
  latest
}: {
  vitals: VitalsDraft;
  setVital: (field: keyof VitalsDraft, value: string) => void;
  latest: VitalSign | null;
}) {
  return (
    <View style={styles.vitalsWrap}>
      {latest ? (
        <View style={styles.refRow}>
          <Icon kind="clock" size={12} color={colors.ink3} />
          <Text style={styles.refText} numberOfLines={1}>
            Última toma: {referenceLine(latest)}
          </Text>
        </View>
      ) : null}
      <View style={styles.vitalsGrid}>
        {VITAL_FIELDS.map((f) => (
          <View key={f.key} style={styles.vitalCell}>
            <TextField
              label={f.label}
              placeholder="—"
              value={vitals[f.key]}
              onChangeText={(v) => setVital(f.key, v)}
              keyboardType={f.kbd}
              rightSlot={<Text style={styles.unit}>{f.unit}</Text>}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

function referenceLine(v: VitalSign): string {
  const parts: string[] = [];
  if (v.systolic_bp && v.diastolic_bp) {
    parts.push(`${v.systolic_bp}/${v.diastolic_bp}`);
  }
  if (v.heart_rate) {
    parts.push(`${v.heart_rate} lpm`);
  }
  if (v.body_temperature) {
    parts.push(`${v.body_temperature}°C`);
  }
  if (v.oxygen_saturation) {
    parts.push(`${v.oxygen_saturation}%`);
  }
  return parts.length ? parts.join(" · ") : "sin datos";
}

function RowHeader({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <View style={styles.rowHeader}>
      <Text style={styles.rowHeaderLabel}>{label}</Text>
      <Tappable onPress={onRemove} hitSlop={8} scaleTo={0.9} accessibilityLabel="Quitar">
        <View style={styles.removeBtn}>
          <Icon kind="trash" size={14} color={colors.alert} />
        </View>
      </Tappable>
    </View>
  );
}

export function DiagnosisEditorRow({
  index,
  value,
  onChange,
  onRemove
}: {
  index: number;
  value: DxDraft;
  onChange: (patch: Partial<DxDraft>) => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.editorCard}>
      <RowHeader label={`Diagnóstico ${index + 1}`} onRemove={onRemove} />
      <TextField
        label="Enfermedad o padecimiento"
        placeholder="p. ej. Faringitis aguda"
        value={value.name}
        onChangeText={(v) => onChange({ name: v })}
        autoCapitalize="sentences"
      />
      <View style={styles.pairRow}>
        <TextField
          label="CIE-10 (opcional)"
          placeholder="J02.9"
          value={value.cie10}
          onChangeText={(v) => onChange({ cie10: v })}
          autoCapitalize="characters"
          style={styles.pairItem}
        />
        <View style={styles.pairItem} />
      </View>
      <SegmentedField
        label="Tipo"
        options={DX_TYPES}
        value={value.type}
        onChange={(v) => onChange({ type: v as DiagnosisType })}
      />
      <TextField
        label="Notas (opcional)"
        placeholder="Observaciones del diagnóstico"
        value={value.notes}
        onChangeText={(v) => onChange({ notes: v })}
        multiline
        minHeight={64}
      />
    </View>
  );
}

export function TreatmentEditorRow({
  index,
  value,
  onChange,
  onRemove
}: {
  index: number;
  value: RxDraft;
  onChange: (patch: Partial<RxDraft>) => void;
  onRemove: () => void;
}) {
  const [suggestions, setSuggestions] = useState<Medication[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queryRef = useRef("");

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  function onMedicationText(text: string) {
    onChange({ medication: text, medicationId: null });
    queryRef.current = text;
    if (timer.current) {
      clearTimeout(timer.current);
    }
    const q = text.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      try {
        const results = await searchMedications(q);
        if (queryRef.current.trim() === q) {
          setSuggestions(results.slice(0, 6));
          setOpen(results.length > 0);
        }
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 300);
  }

  function pick(m: Medication) {
    onChange({ medication: m.display_name, medicationId: m.id });
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <View style={styles.editorCard}>
      <RowHeader label={`Medicamento ${index + 1}`} onRemove={onRemove} />
      <View>
        <TextField
          label="Medicamento"
          placeholder="Nombre genérico o comercial"
          value={value.medication}
          onChangeText={onMedicationText}
          autoCapitalize="sentences"
          icon="pill"
          rightSlot={
            value.medicationId ? (
              <View style={styles.linkedBadge}>
                <Icon kind="check" size={12} color={colors.ok} strokeWidth={2.4} />
              </View>
            ) : undefined
          }
        />
        {open && suggestions.length > 0 ? (
          <View style={styles.suggestList}>
            {suggestions.map((m) => (
              <Tappable key={m.id} scaleTo={0.99} onPress={() => pick(m)}>
                <View style={styles.suggestItem}>
                  <Text style={styles.suggestName} numberOfLines={1}>
                    {m.display_name}
                  </Text>
                  {m.presentation ? (
                    <Text style={styles.suggestMeta} numberOfLines={1}>
                      {m.presentation}
                    </Text>
                  ) : null}
                </View>
              </Tappable>
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.pairRow}>
        <TextField
          label="Dosis"
          placeholder="500 mg"
          value={value.dosage}
          onChangeText={(v) => onChange({ dosage: v })}
          style={styles.pairItem}
        />
        <TextField
          label="Frecuencia"
          placeholder="c/8 h"
          value={value.frequency}
          onChangeText={(v) => onChange({ frequency: v })}
          style={styles.pairItem}
        />
      </View>
      <View style={styles.pairRow}>
        <TextField
          label="Duración (días)"
          placeholder="7"
          value={value.durationDays}
          onChangeText={(v) => onChange({ durationDays: v })}
          keyboardType="number-pad"
          style={styles.pairItem}
        />
        <TextField
          label="Inicio"
          placeholder={todayIso()}
          value={value.startDate}
          onChangeText={(v) => onChange({ startDate: v })}
          autoCapitalize="none"
          style={styles.pairItem}
        />
      </View>
      <TextField
        label="Indicaciones (opcional)"
        placeholder="Tomar con alimentos"
        value={value.notes}
        onChangeText={(v) => onChange({ notes: v })}
        multiline
        minHeight={64}
      />
    </View>
  );
}

export function AddRowButton({
  label,
  onPress,
  style
}: {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Tappable onPress={onPress} scaleTo={0.98} accessibilityLabel={label} style={style}>
      <View style={styles.addBtn}>
        <Icon kind="plus" size={15} color={colors.accentDeep} />
        <Text style={styles.addBtnText}>{label}</Text>
      </View>
    </Tappable>
  );
}

const styles = StyleSheet.create({
  vitalsWrap: {
    gap: 10
  },
  refRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  refText: {
    flex: 1,
    minWidth: 0,
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  vitalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  vitalCell: {
    flexGrow: 1,
    flexBasis: 104,
    minWidth: 96
  },
  unit: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  editorCard: {
    gap: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.paper
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  rowHeaderLabel: {
    fontFamily: family.monoMedium,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.ink3
  },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.alertSoft
  },
  pairRow: {
    flexDirection: "row",
    gap: 8
  },
  pairItem: {
    flex: 1,
    minWidth: 0
  },
  linkedBadge: {
    width: 22,
    height: 22,
    borderRadius: 99,
    backgroundColor: colors.okSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  suggestList: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    overflow: "hidden"
  },
  suggestItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule3
  },
  suggestName: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  suggestMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderStyle: "dashed",
    backgroundColor: colors.white
  },
  addBtnText: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.accentDeep
  }
});
