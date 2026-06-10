import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DatePickerField } from "@/atomic/molecules/DatePickerField";
import { postAppointment } from "@/services/api/appointmentsApi";
import { Patient, fetchPatientByCurp, createPatientAuthed } from "@/services/api/patientsApi";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";
import { validateCurp } from "@/utils/validators";

type QuickAppointmentModalProps = {
  visible: boolean;
  doctorId: number;
  institutionId: number | null;
  role: "doctor" | "secretary";
  onClose: () => void;
  onCreated: () => void;
  onStartConsultation?: () => void;
  onViewAgenda?: () => void;
};

type Step = "curp" | "new" | "confirm" | "done";

function nowIso(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30);
  return d.toISOString().slice(0, 19);
}

function parseDob(value: string): string | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (dt.getFullYear() !== Number(yyyy) || dt.getMonth() !== Number(mm) - 1 || dt.getDate() !== Number(dd)) return null;
  if (dt >= new Date()) return null;
  return `${yyyy}-${mm}-${dd}`;
}

export function QuickAppointmentModal({
  visible,
  doctorId,
  institutionId,
  role,
  onClose,
  onCreated,
  onStartConsultation,
  onViewAgenda
}: QuickAppointmentModalProps) {
  const [step, setStep] = useState<Step>("curp");
  const [curp, setCurp] = useState("");
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<Patient | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState("");

  function reset() {
    setStep("curp");
    setCurp("");
    setSearching(false);
    setFound(null);
    setFirstName("");
    setLastName("");
    setDob("");
    setSubmitting(false);
    setError(null);
    setCreatedName("");
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleDone() {
    reset();
    onCreated();
  }

  async function handleSearch() {
    const trimmed = curp.trim().toUpperCase();
    const curpErr = validateCurp(trimmed);
    if (curpErr) {
      setError(curpErr);
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const patient = await fetchPatientByCurp(trimmed);
      setFound(patient);
      setStep("confirm");
    } catch {
      setFound(null);
      setStep("new");
    } finally {
      setSearching(false);
    }
  }

  async function handleConfirmExisting() {
    if (!found) return;
    setSubmitting(true);
    setError(null);
    try {
      await postAppointment({
        patient_id: found.id,
        doctor_id: doctorId,
        institution_id: institutionId,
        scheduled_at: nowIso(),
        reason: "Urgencia · Cita rápida de emergencia"
      });
      const name = `${found.first_name} ${found.last_name}`.trim();
      setCreatedName(name);
      if (role === "secretary") {
        reset();
        onCreated();
      } else {
        setStep("done");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear la cita.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateAndBook() {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Ingresa nombre y apellido.");
      return;
    }
    const dobIso = parseDob(dob);
    if (!dobIso) {
      setError("Fecha de nacimiento inválida. Usa dd/mm/aaaa.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const patient = await createPatientAuthed({
        curp: curp.trim().toUpperCase(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        date_of_birth: dobIso
      });
      await postAppointment({
        patient_id: patient.id,
        doctor_id: doctorId,
        institution_id: institutionId,
        scheduled_at: nowIso(),
        reason: "Urgencia · Cita rápida de emergencia"
      });
      const name = `${firstName.trim()} ${lastName.trim()}`;
      setCreatedName(name);
      if (role === "secretary") {
        reset();
        onCreated();
      } else {
        setStep("done");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos crear la cita.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.urgBadge}>
                <Icon kind="alert" size={14} color={colors.alert} />
                <Text style={styles.urgText}>URGENCIA</Text>
              </View>
              <Text style={styles.title}>Cita rápida</Text>
            </View>
            <Tappable onPress={handleClose} scaleTo={0.9} style={styles.closeBtn}>
              <Icon kind="x" size={14} color={colors.ink2} />
            </Tappable>
          </View>

          {/* Step: CURP */}
          {step === "curp" ? (
            <View style={styles.body}>
              <Text style={styles.instruction}>
                Ingresa la CURP del paciente para detectar si ya tiene cuenta.
              </Text>
              <Text style={styles.fieldLabel}>CURP del paciente</Text>
              <View style={styles.curpRow}>
                <TextInput
                  value={curp}
                  onChangeText={(v) => setCurp(v.toUpperCase())}
                  placeholder="18 caracteres"
                  placeholderTextColor={colors.ink3}
                  maxLength={18}
                  autoCapitalize="characters"
                  autoFocus
                  style={[
                    styles.curpInput,
                    curp.trim().length > 0 && validateCurp(curp)
                      ? { borderColor: colors.alert }
                      : curp.trim().length === 18 && !validateCurp(curp)
                        ? { borderColor: colors.ok }
                        : null
                  ]}
                />
                <Button
                  label={searching ? "…" : "Buscar"}
                  variant="accent"
                  size="sm"
                  block={false}
                  height={40}
                  onPress={handleSearch}
                  disabled={searching || !!validateCurp(curp)}
                />
              </View>
              {curp.trim().length > 0 && validateCurp(curp) ? (
                <Text style={styles.curpValidation}>{validateCurp(curp)}</Text>
              ) : null}
              {searching ? (
                <View style={styles.searchingRow}>
                  <ActivityIndicator size="small" color={colors.accentDeep} />
                  <Text style={styles.searchingText}>Buscando paciente…</Text>
                </View>
              ) : null}
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Text style={styles.hint}>
                Si no tiene CURP a la mano, escribe una temporal y completa después.
              </Text>
            </View>
          ) : null}

          {/* Step: Patient found → confirm */}
          {step === "confirm" && found ? (
            <View style={styles.body}>
              <View style={styles.foundCard}>
                <View style={styles.foundAvatar}>
                  <Text style={styles.foundAvatarText}>
                    {(found.first_name?.[0] ?? "") + (found.last_name?.[0] ?? "")}
                  </Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.foundName}>
                    {found.first_name} {found.last_name}
                  </Text>
                  <Text style={styles.foundMeta}>
                    {found.gender ?? "—"} · {found.date_of_birth ?? "—"}
                  </Text>
                </View>
                <View style={styles.okBadge}>
                  <Icon kind="check" size={14} color={colors.ok} strokeWidth={2.4} />
                </View>
              </View>
              <Text style={styles.confirmHint}>
                Se agendará como urgencia para ahora mismo.
              </Text>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                label={submitting ? "Agendando…" : "Confirmar cita de emergencia"}
                variant="primary"
                height={46}
                iconRight="check"
                onPress={handleConfirmExisting}
                disabled={submitting}
                style={styles.confirmBtn}
              />
            </View>
          ) : null}

          {/* Step: New patient */}
          {step === "new" ? (
            <View style={styles.body}>
              <View style={styles.newBanner}>
                <Icon kind="user" size={14} color={colors.accentDeep} />
                <Text style={styles.newBannerText}>
                  Paciente no encontrado. Ingresa datos básicos.
                </Text>
              </View>
              <View style={styles.fieldRow}>
                <View style={styles.fieldHalf}>
                  <Text style={styles.fieldLabel}>Nombre *</Text>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Nombre(s)"
                    placeholderTextColor={colors.ink3}
                    autoFocus
                    style={styles.input}
                  />
                </View>
                <View style={styles.fieldHalf}>
                  <Text style={styles.fieldLabel}>Apellido *</Text>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Apellido(s)"
                    placeholderTextColor={colors.ink3}
                    style={styles.input}
                  />
                </View>
              </View>
              <DatePickerField
                label="Nacimiento *"
                placeholder="dd/mm/aaaa"
                value={dob}
                onChange={setDob}
                valid={!!dob.trim() && !!parseDob(dob)}
                errorText={dob.trim() && !parseDob(dob) ? "Fecha inválida" : null}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button
                label={submitting ? "Creando paciente y cita…" : "Crear paciente y agendar"}
                variant="primary"
                height={46}
                iconRight="check"
                onPress={handleCreateAndBook}
                disabled={submitting || !firstName.trim() || !lastName.trim() || !parseDob(dob)}
                style={styles.confirmBtn}
              />
            </View>
          ) : null}

          {/* Step: Done (doctor only) */}
          {step === "done" ? (
            <View style={styles.body}>
              <View style={styles.doneIcon}>
                <Icon kind="check" size={28} color={colors.ok} strokeWidth={2.4} />
              </View>
              <Text style={styles.doneTitle}>Cita de emergencia creada</Text>
              <Text style={styles.doneName}>{createdName}</Text>
              <Text style={styles.doneMeta}>
                Urgencia · agendada para ahora · Dr. asignado
              </Text>
              <View style={styles.doneActions}>
                <Button
                  label="Iniciar consulta"
                  variant="primary"
                  height={46}
                  iconRight="arrow"
                  onPress={() => {
                    reset();
                    onClose();
                    onStartConsultation?.();
                  }}
                  style={styles.doneBtn}
                />
                <Button
                  label="Ver agenda"
                  variant="ghost"
                  height={44}
                  onPress={() => {
                    reset();
                    onClose();
                    onViewAgenda?.();
                  }}
                  style={styles.doneBtn}
                />
              </View>
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(3,4,94,0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.rule,
    ...shadow.hero
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  headerLeft: {
    gap: 6
  },
  urgBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule
  },
  urgText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.alert,
    letterSpacing: 1.1
  },
  title: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.ink
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.rule,
    alignItems: "center",
    justifyContent: "center"
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  instruction: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink2,
    lineHeight: 18,
    marginBottom: 14
  },
  fieldLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.5,
    marginBottom: 5
  },
  curpRow: {
    flexDirection: "row",
    gap: 8
  },
  curpInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    fontFamily: family.mono,
    fontSize: 13,
    color: colors.ink,
    backgroundColor: colors.paper,
    letterSpacing: 0.5
  },
  curpValidation: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.alert,
    marginTop: 6
  },
  searchingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12
  },
  searchingText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  hint: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 12,
    lineHeight: 15
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 10
  },
  foundCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.okRule,
    backgroundColor: colors.okSoft,
    borderRadius: radii.md,
    marginBottom: 12
  },
  foundAvatar: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: colors.accentBright,
    alignItems: "center",
    justifyContent: "center"
  },
  foundAvatarText: {
    fontFamily: family.monoMedium,
    fontSize: 14,
    color: colors.ink
  },
  foundName: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  foundMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 2
  },
  okBadge: {
    width: 26,
    height: 26,
    borderRadius: 99,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  confirmHint: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginBottom: 4
  },
  confirmBtn: {
    marginTop: 14
  },
  newBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.md,
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    marginBottom: 14
  },
  newBannerText: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink2
  },
  fieldRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4
  },
  fieldHalf: {
    flex: 1
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink,
    backgroundColor: colors.paper
  },
  doneIcon: {
    width: 56,
    height: 56,
    borderRadius: 99,
    backgroundColor: colors.okSoft,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 14
  },
  doneTitle: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink,
    textAlign: "center"
  },
  doneName: {
    fontFamily: family.serifItalic,
    fontSize: 20,
    color: colors.accentDeep,
    textAlign: "center",
    marginTop: 4
  },
  doneMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    textAlign: "center",
    marginTop: 6
  },
  doneActions: {
    gap: 8,
    marginTop: 18
  },
  doneBtn: {
    width: "100%"
  }
});
