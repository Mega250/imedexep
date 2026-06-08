import { ReactNode, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { Icon } from "@/atomic/atoms/Icon";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { TextField } from "@/atomic/atoms/TextField";
import { SegmentedField } from "@/atomic/molecules/SegmentedField";
import { ToggleRow } from "@/atomic/molecules/ToggleRow";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNavActive } from "@/navigation/desktopNavConfigs";
import { goToScreen, replaceScreen } from "@/navigation/screenRouter";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";
import {
  AddRowButton,
  CommitResult,
  DiagnosisEditorRow,
  TreatmentEditorRow,
  VitalsEditor,
  useConsultaRegistro
} from "@/atomic/pages/doctor/consultaRegistro";

function ageFrom(dob: string): number | null {
  if (!dob) {
    return null;
  }
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) {
    age -= 1;
  }
  return age;
}

function sexLabel(gender: string | null): string {
  if (!gender) {
    return "";
  }
  const g = gender.toLowerCase();
  if (g.startsWith("f") || g.startsWith("muj")) {
    return "Femenino";
  }
  if (g.startsWith("m") || g.startsWith("h")) {
    return "Masculino";
  }
  return gender;
}

function initials(first: string, last: string): string {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "··";
}

function Field({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHead}>
        <SectionLabel label={title} />
        {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export function DskConsultaRegistroDesktopPage() {
  const cr = useConsultaRegistro();
  const [phase, setPhase] = useState<"idle" | "confirm" | "result">("idle");
  const [result, setResult] = useState<CommitResult | null>(null);

  const patient = cr.patient;
  const fullName = patient ? `${patient.first_name} ${patient.last_name}` : "—";
  const age = patient ? ageFrom(patient.date_of_birth) : null;

  function goToDetalle() {
    replaceScreen("consulta-detalle");
  }

  async function handleConfirm() {
    const res = await cr.commit();
    setResult(res);
    if (res.ok && res.warnings.length === 0) {
      goToDetalle();
      return;
    }
    if (res.ok) {
      setPhase("result");
    }
  }

  return (
    <DesktopShell
      nav={doctorNavActive}
      activeScreen="doctor-active"
      role="médico"
      roleBadge="Médico"
      title="Registrar consulta"
      eyebrow="Consulta en vivo"
      topBarRight={
        <View style={styles.liveTag}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>EN VIVO</Text>
        </View>
      }
    >
      {cr.loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.accentDeep} />
          <Text style={styles.loadingText}>Cargando paciente…</Text>
        </View>
      ) : cr.error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{cr.error}</Text>
          <Button label="Volver a la agenda" variant="ghost" block={false} onPress={() => goToScreen("dsk-agenda")} />
        </View>
      ) : patient ? (
        <View style={styles.layout}>
          {/* Main: the clinical note */}
          <View style={styles.main}>
            <View style={styles.card}>
              <Field title="Signos vitales" hint="esta toma">
                <VitalsEditor vitals={cr.vitals} setVital={cr.setVital} latest={cr.latestVitals} />
              </Field>
            </View>

            <View style={styles.card}>
              <Field title="Motivo de consulta">
                <TextField
                  placeholder="Motivo principal de la visita"
                  value={cr.chiefComplaint}
                  onChangeText={cr.setChiefComplaint}
                />
              </Field>
              <View style={styles.twoCol}>
                <Field title="Síntomas">
                  <TextField
                    placeholder="Síntomas referidos"
                    value={cr.symptoms}
                    onChangeText={cr.setSymptoms}
                    multiline
                    minHeight={120}
                  />
                </Field>
                <Field title="Exploración y notas">
                  <TextField
                    placeholder="Hallazgos, evolución, plan"
                    value={cr.medicalNotes}
                    onChangeText={cr.setMedicalNotes}
                    multiline
                    minHeight={120}
                  />
                </Field>
              </View>
              <Field title="Nivel de sensibilidad" hint={`Máximo según tu acceso: ${cr.clearanceLevel}`}>
                <SegmentedField options={cr.sensitivityOptions} value={cr.sensitivity} onChange={cr.setSensitivity} />
              </Field>
            </View>

            <View style={styles.card}>
              <Field title="Diagnósticos">
                <View style={styles.editorList}>
                  {cr.diagnoses.map((dx, i) => (
                    <DiagnosisEditorRow
                      key={dx.key}
                      index={i}
                      value={dx}
                      onChange={(patch) => cr.updateDx(dx.key, patch)}
                      onRemove={() => cr.removeDx(dx.key)}
                    />
                  ))}
                  <AddRowButton label="Agregar diagnóstico" onPress={cr.addDx} />
                </View>
              </Field>
            </View>

            <View style={styles.card}>
              <Field title="Receta">
                <View style={styles.editorList}>
                  {cr.treatments.map((rx, i) => (
                    <TreatmentEditorRow
                      key={rx.key}
                      index={i}
                      value={rx}
                      onChange={(patch) => cr.updateRx(rx.key, patch)}
                      onRemove={() => cr.removeRx(rx.key)}
                    />
                  ))}
                  <AddRowButton label="Agregar medicamento" onPress={cr.addRx} />
                  {cr.treatments.length > 0 ? (
                    <TextField
                      label="Indicaciones generales"
                      placeholder="Reposo, hidratación, signos de alarma…"
                      value={cr.generalInstructions}
                      onChangeText={cr.setGeneralInstructions}
                      multiline
                      minHeight={70}
                    />
                  ) : null}
                </View>
              </Field>
            </View>
          </View>

          {/* Aside: patient + commit */}
          <View style={styles.aside}>
            <View style={styles.patientCard}>
              <View style={styles.patientTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(patient.first_name, patient.last_name)}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.eyebrow}>Paciente</Text>
                  <Text style={styles.patientName} numberOfLines={2}>
                    {fullName}
                  </Text>
                </View>
              </View>
              <View style={styles.patientMetaGrid}>
                <MetaItem label="Edad" value={age !== null ? `${age} años` : "—"} />
                <MetaItem label="Sexo" value={sexLabel(patient.gender) || "—"} />
                <MetaItem label="Sangre" value={patient.blood_type ?? "—"} />
                <MetaItem label="Ciudad" value={patient.city ?? "—"} />
              </View>
            </View>

            <View style={[styles.commitCard, phase === "result" && styles.commitCardDone]}>
              {phase === "result" ? (
                <>
                  <View style={styles.resultHead}>
                    <View style={styles.resultIcon}>
                      <Icon kind="check" size={16} color={colors.ok} strokeWidth={2.4} />
                    </View>
                    <Text style={styles.commitTitle}>Consulta registrada</Text>
                  </View>
                  <Text style={styles.commitLead}>Algunos elementos no se completaron:</Text>
                  <View style={styles.warnList}>
                    {(result?.warnings ?? []).map((w, i) => (
                      <View key={i} style={styles.warnRow}>
                        <Icon kind="alert" size={12} color={colors.mid} />
                        <Text style={styles.warnText}>{w}</Text>
                      </View>
                    ))}
                  </View>
                  <Button label="Ver consulta" iconRight="arrow" onPress={goToDetalle} />
                </>
              ) : (
                <>
                  <Text style={styles.commitTitle}>Cierre de consulta</Text>
                  <View style={styles.summary}>
                    <SummaryLine label="Motivo" ok={!!cr.chiefComplaint.trim()} value={cr.chiefComplaint.trim() ? "Capturado" : "Pendiente"} />
                    <SummaryLine label="Signos vitales" ok={cr.summary.vitals} value={cr.summary.vitals ? "Capturados" : "—"} />
                    <SummaryLine label="Diagnósticos" ok={cr.summary.diagnoses > 0} value={`${cr.summary.diagnoses}`} />
                    <SummaryLine label="Medicamentos" ok={cr.summary.treatments > 0} value={`${cr.summary.treatments}`} />
                  </View>

                  {cr.treatments.length > 0 ? (
                    <View style={styles.toggles}>
                      <ToggleRow
                        label="Firmar receta"
                        value={cr.signRx}
                        onToggle={cr.setSignRx}
                      />
                      <ToggleRow
                        label="Enviar al paciente"
                        value={cr.sendRx}
                        onToggle={cr.setSendRx}
                      />
                    </View>
                  ) : null}

                  {result?.fatal ? <Text style={styles.commitError}>{result.fatal}</Text> : null}

                  {phase === "confirm" ? (
                    <View style={styles.confirmBox}>
                      <Text style={styles.confirmText}>
                        La consulta queda registrada de forma permanente.
                      </Text>
                      <View style={styles.confirmActions}>
                        <View style={styles.flex}>
                          <Button label="Revisar" variant="ghost" onPress={() => setPhase("idle")} disabled={cr.committing} />
                        </View>
                        <View style={styles.flex}>
                          <Button
                            label={cr.committing ? "Firmando…" : "Confirmar"}
                            iconRight="check"
                            onPress={handleConfirm}
                            disabled={cr.committing}
                          />
                        </View>
                      </View>
                    </View>
                  ) : (
                    <>
                      {!cr.chiefComplaint.trim() ? (
                        <Text style={styles.commitHint}>Captura el motivo para poder firmar.</Text>
                      ) : null}
                      <Button
                        label="Firmar y cerrar consulta"
                        iconRight="arrow"
                        disabled={!cr.canCommit}
                        onPress={() => {
                          setResult(null);
                          setPhase("confirm");
                        }}
                      />
                    </>
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      ) : null}
    </DesktopShell>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function SummaryLine({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <View style={styles.summaryValue}>
        <View style={[styles.summaryDot, { backgroundColor: ok ? colors.ok : colors.ink5 }]} />
        <Text style={styles.summaryText}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layout: {
    flexDirection: "row",
    gap: 20,
    alignItems: "flex-start"
  },
  main: {
    flex: 1,
    minWidth: 0,
    gap: 16
  },
  aside: {
    width: 340,
    flexShrink: 0,
    gap: 16
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    padding: 22,
    gap: 18
  },
  field: {
    gap: 10
  },
  fieldHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between"
  },
  fieldHint: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  twoCol: {
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap"
  },
  editorList: {
    gap: 12
  },
  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.accentSoft
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: colors.accentDeep
  },
  liveText: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.accentDeep,
    letterSpacing: 0.6
  },
  patientCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    padding: 20,
    gap: 18
  },
  patientTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    fontFamily: family.serifItalic,
    fontSize: 24,
    color: colors.white
  },
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  patientName: {
    fontFamily: family.serifItalic,
    fontSize: 24,
    lineHeight: 27,
    letterSpacing: -0.5,
    color: colors.ink,
    marginTop: 3
  },
  patientMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14
  },
  metaItem: {
    flexBasis: "42%",
    flexGrow: 1,
    gap: 3
  },
  metaLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colors.ink3
  },
  metaValue: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  commitCard: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    padding: 20,
    gap: 16,
    ...shadow.hero
  },
  commitCardDone: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule
  },
  commitTitle: {
    fontFamily: family.serifItalic,
    fontSize: 21,
    letterSpacing: -0.4,
    color: colors.paper
  },
  commitLead: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink2,
    marginTop: -8
  },
  summary: {
    gap: 2
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)"
  },
  summaryLabel: {
    fontFamily: family.regular,
    fontSize: 13,
    color: "rgba(255,255,255,0.7)"
  },
  summaryValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 99
  },
  summaryText: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.paper
  },
  toggles: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: radii.md,
    paddingHorizontal: 14
  },
  commitHint: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: "rgba(255,255,255,0.6)"
  },
  commitError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.accentBright
  },
  confirmBox: {
    gap: 12
  },
  confirmText: {
    fontFamily: family.regular,
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255,255,255,0.8)"
  },
  confirmActions: {
    flexDirection: "row",
    gap: 10
  },
  resultHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  resultIcon: {
    width: 34,
    height: 34,
    borderRadius: 99,
    backgroundColor: colors.okSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  warnList: {
    gap: 8
  },
  warnRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8
  },
  warnText: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.ink2
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg
  },
  loadingText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink2
  },
  errorBox: {
    padding: 22,
    borderRadius: radii.lg,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule,
    gap: 14,
    alignItems: "flex-start"
  },
  errorText: {
    fontFamily: family.regular,
    fontSize: 14,
    color: colors.alert,
    lineHeight: 20
  }
});
