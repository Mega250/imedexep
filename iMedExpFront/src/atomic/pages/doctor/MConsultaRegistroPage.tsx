import { ReactNode, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { TextField } from "@/atomic/atoms/TextField";
import { Tappable } from "@/atomic/atoms/Tappable";
import { SelectField } from "@/atomic/molecules/SelectField";
import { SegmentedField } from "@/atomic/molecules/SegmentedField";
import { ToggleRow } from "@/atomic/molecules/ToggleRow";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack, replaceScreen } from "@/navigation/screenRouter";
import { SocioeconomicData } from "@/services/api/patientsApi";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";
import {
  AddRowButton,
  CommitResult,
  DiagnosisEditorRow,
  TreatmentEditorRow,
  VitalsEditor,
  useConsultaRegistro
} from "./consultaRegistro";

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

function sexSymbol(gender: string | null): string {
  if (!gender) {
    return "·";
  }
  const g = gender.toLowerCase();
  if (g.startsWith("f") || g.startsWith("muj")) {
    return "♀";
  }
  if (g.startsWith("m") || g.startsWith("h")) {
    return "♂";
  }
  return "·";
}

function initialsFromName(first: string, last: string): string {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "··";
}

function Header(): ReactNode {
  return (
    <View style={styles.nav}>
      <Tappable onPress={() => goBack("mob-agenda")} scaleTo={0.95}>
        <View style={styles.backBtn}>
          <Icon kind="arrow-l" size={13} color={colors.ink2} />
          <Text style={styles.backText}>Agenda</Text>
        </View>
      </Tappable>
      <Text style={styles.navTitle}>REGISTRAR CONSULTA</Text>
      <View style={styles.liveTag}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>EN VIVO</Text>
      </View>
    </View>
  );
}

function Block({
  title,
  hint,
  delay,
  children
}: {
  title: string;
  hint?: string;
  delay?: number;
  children: ReactNode;
}): ReactNode {
  return (
    <FadeIn delay={delay} style={styles.block}>
      <View style={styles.blockHead}>
        <SectionLabel label={title} />
        {hint ? <Text style={styles.blockHint}>{hint}</Text> : null}
      </View>
      {children}
    </FadeIn>
  );
}

const YES_NO = ["Sí", "No"];
const COOKING_MATERIALS = ["Gas", "Leña", "Carbón", "Eléctrica", "Otro"];
const COOKING_METHODS = ["Estufa", "Fogón", "Horno", "Microondas", "Parrilla", "Otro"];

function SocioeconomicBlock({
  data,
  onChange,
  onSave,
  saving,
  alreadyFilled
}: {
  data: SocioeconomicData;
  onChange: (patch: Partial<SocioeconomicData>) => void;
  onSave: () => void;
  saving: boolean;
  alreadyFilled: boolean;
}) {
  const [open, setOpen] = useState(!alreadyFilled);

  return (
    <FadeIn delay={190} style={socStyles.wrap}>
      <Tappable onPress={() => setOpen((v) => !v)} scaleTo={0.99}>
        <View style={socStyles.header}>
          <SectionLabel label="Condiciones del hogar" />
          <View style={socStyles.headerRight}>
            {alreadyFilled ? (
              <View style={socStyles.filledBadge}>
                <Icon kind="check" size={11} color={colors.ok} strokeWidth={2.4} />
                <Text style={socStyles.filledText}>Completado</Text>
              </View>
            ) : (
              <Text style={socStyles.pendingText}>sin datos</Text>
            )}
            <Icon
              kind={open ? "chev-u" : "chev-d"}
              size={13}
              color={colors.ink3}
            />
          </View>
        </View>
      </Tappable>

      {open ? (
        <View style={socStyles.body}>
          <Text style={socStyles.caption}>
            Esta información se guarda en el perfil global del paciente y no se repetirá en futuras consultas.
          </Text>
          <SelectField
            label="¿Cuenta con drenaje y alcantarillado?"
            options={YES_NO}
            value={data.drainage ?? ""}
            onValueChange={(v) => onChange({ drainage: v || null })}
          />
          <SelectField
            label="¿Cuenta con agua potable?"
            options={YES_NO}
            value={data.water ?? ""}
            onValueChange={(v) => onChange({ water: v || null })}
          />
          <SelectField
            label="¿Cuenta con electricidad?"
            options={YES_NO}
            value={data.electricity ?? ""}
            onValueChange={(v) => onChange({ electricity: v || null })}
          />
          <TextField
            label="Personas en el hogar"
            placeholder="Número de personas"
            keyboardType="number-pad"
            value={data.household_members ?? ""}
            onChangeText={(v) => onChange({ household_members: v.replace(/\D/g, "").slice(0, 3) || null })}
          />
          <SelectField
            label="Material para cocinar"
            options={COOKING_MATERIALS}
            value={data.cooking_material ?? ""}
            onValueChange={(v) => onChange({ cooking_material: v || null })}
          />
          <SelectField
            label="Método para cocinar"
            options={COOKING_METHODS}
            value={data.cooking_method ?? ""}
            onValueChange={(v) => onChange({ cooking_method: v || null })}
          />
          <Button
            label={saving ? "Guardando…" : "Guardar condiciones del hogar"}
            variant="ghost"
            size="md"
            height={40}
            disabled={saving}
            onPress={onSave}
          />
        </View>
      ) : null}
    </FadeIn>
  );
}

export function MConsultaRegistroPage() {
  const insets = useSafeAreaInsets();
  const cr = useConsultaRegistro();
  const [phase, setPhase] = useState<"idle" | "confirm" | "result">("idle");
  const [result, setResult] = useState<CommitResult | null>(null);

  const patient = cr.patient;
  const fullName = patient ? `${patient.first_name} ${patient.last_name}` : "—";
  const ini = patient ? initialsFromName(patient.first_name, patient.last_name) : "··";
  const age = patient ? ageFrom(patient.date_of_birth) : null;
  const meta = patient
    ? `${sexSymbol(patient.gender)} ${age !== null ? `${age} años` : "—"}${patient.blood_type ? ` · ${patient.blood_type}` : ""}${patient.city ? ` · ${patient.city}` : ""}`
    : "";

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

  const overlay =
    phase === "idle" ? null : (
      <View style={styles.overlay}>
        <View style={styles.backdrop} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 4 }]}>
          {phase === "confirm" ? (
            <>
              <Text style={styles.sheetTitle}>Confirmar y firmar</Text>
              <Text style={styles.sheetLead}>
                La consulta queda registrada de forma permanente. Revisa antes de firmar.
              </Text>
              <View style={styles.summary}>
                <SummaryLine label="Motivo" value={cr.chiefComplaint.trim() ? "Capturado" : "—"} ok={!!cr.chiefComplaint.trim()} />
                <SummaryLine label="Signos vitales" value={cr.summary.vitals ? "Capturados" : "Sin captura"} ok={cr.summary.vitals} />
                <SummaryLine label="Diagnósticos" value={`${cr.summary.diagnoses}`} ok={cr.summary.diagnoses > 0} />
                <SummaryLine label="Medicamentos" value={`${cr.summary.treatments}`} ok={cr.summary.treatments > 0} />
                {cr.summary.treatments > 0 ? (
                  <SummaryLine
                    label="Receta"
                    value={`${cr.signRx ? "Firmar" : "Sin firmar"}${cr.sendRx ? " · enviar" : ""}`}
                    ok={cr.signRx}
                  />
                ) : null}
              </View>
              {result?.fatal ? <Text style={styles.sheetError}>{result.fatal}</Text> : null}
              <View style={styles.sheetActions}>
                <View style={styles.flex}>
                  <Button
                    label="Revisar"
                    variant="ghost"
                    height={48}
                    onPress={() => setPhase("idle")}
                    disabled={cr.committing}
                  />
                </View>
                <View style={styles.flex2}>
                  <Button
                    label={cr.committing ? "Firmando…" : "Confirmar y firmar"}
                    iconRight="check"
                    height={48}
                    onPress={handleConfirm}
                    disabled={cr.committing}
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.resultHead}>
                <View style={styles.resultIcon}>
                  <Icon kind="check" size={18} color={colors.ok} strokeWidth={2.4} />
                </View>
                <Text style={styles.sheetTitle}>Consulta registrada</Text>
              </View>
              <Text style={styles.sheetLead}>
                Se guardó la consulta, pero algunos elementos no se completaron:
              </Text>
              <View style={styles.warnList}>
                {(result?.warnings ?? []).map((w, i) => (
                  <View key={i} style={styles.warnRow}>
                    <Icon kind="alert" size={13} color={colors.mid} />
                    <Text style={styles.warnText}>{w}</Text>
                  </View>
                ))}
              </View>
              <Button label="Ver consulta" iconRight="arrow" height={48} onPress={goToDetalle} />
            </>
          )}
        </View>
      </View>
    );

  const footer =
    phase !== "idle" ? null : (
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <View style={styles.flex}>
          {!cr.chiefComplaint.trim() ? (
            <Text style={styles.footerHint}>Captura el motivo para poder firmar</Text>
          ) : (
            <Text style={styles.footerReady}>
              Listo para firmar{cr.summary.treatments > 0 ? " · incluye receta" : ""}
            </Text>
          )}
        </View>
        <View style={styles.footerBtn}>
          <Button
            label="Firmar y cerrar"
            iconRight="arrow"
            height={48}
            disabled={!cr.canCommit}
            onPress={() => {
              setResult(null);
              setPhase("confirm");
            }}
          />
        </View>
      </View>
    );

  return (
    <MobileScreen
      header={<Header />}
      keyboardAware
      contentStyle={styles.content}
      floating={
        <>
          {footer}
          {overlay}
        </>
      }
    >
      {cr.loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      {cr.error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{cr.error}</Text>
          <Tappable onPress={() => goBack("mob-agenda")} scaleTo={0.97} style={styles.errorBack}>
            <Text style={styles.errorBackText}>Volver a la agenda</Text>
          </Tappable>
        </View>
      ) : null}

      {patient ? (
        <>
          <FadeIn>
            <View style={styles.patientHead}>
              <Avatar initials={ini} size={52} radius={16} bg={colors.accent} fg={colors.white} serif fontSize={22} />
              <View style={styles.flex}>
                <Text style={styles.eyebrow}>PACIENTE</Text>
                <Text style={styles.patientName} numberOfLines={1} ellipsizeMode="tail">
                  {fullName}
                </Text>
                <Text style={styles.patientMeta} numberOfLines={1} ellipsizeMode="tail">
                  {meta}
                </Text>
              </View>
            </View>
          </FadeIn>

          {!cr.socAlreadyFilled ? (
            <FadeIn delay={20}>
              <View style={styles.socAlert}>
                <Icon kind="alert" size={14} color={colors.mid} />
                <Text style={styles.socAlertText}>
                  Datos del hogar pendientes · completa la sección antes de guardar la consulta.
                </Text>
              </View>
            </FadeIn>
          ) : null}

          <Block title="Signos vitales" hint="esta toma" delay={40}>
            <VitalsEditor vitals={cr.vitals} setVital={cr.setVital} latest={cr.latestVitals} />
          </Block>

          <Block title="Motivo de consulta" delay={70}>
            <TextField
              placeholder="Motivo principal de la visita"
              value={cr.chiefComplaint}
              onChangeText={cr.setChiefComplaint}
              autoCapitalize="sentences"
            />
          </Block>

          <Block title="Síntomas" delay={90}>
            <TextField
              placeholder="Descripción de los síntomas referidos"
              value={cr.symptoms}
              onChangeText={cr.setSymptoms}
              multiline
              minHeight={80}
            />
          </Block>

          <Block title="Exploración y notas" delay={110}>
            <TextField
              placeholder="Hallazgos de la exploración, evolución, plan"
              value={cr.medicalNotes}
              onChangeText={cr.setMedicalNotes}
              multiline
              minHeight={120}
            />
          </Block>

          <SocioeconomicBlock
            data={cr.socioeconomic}
            onChange={(patch) => cr.setSocioeconomic((prev) => ({ ...prev, ...patch }))}
            onSave={cr.saveSocioeconomic}
            saving={cr.socSaving}
            alreadyFilled={cr.socAlreadyFilled}
          />

          <Block
            title="Nivel de sensibilidad"
            hint="quién puede leerlo"
            delay={130}
          >
            <SegmentedField
              options={cr.sensitivityOptions}
              value={cr.sensitivity}
              onChange={cr.setSensitivity}
              hint={`Tu nivel de acceso permite hasta ${cr.clearanceLevel}. 1 = estándar.`}
            />
          </Block>

          <Block title="Diagnósticos" delay={150}>
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
          </Block>

          <Block title="Receta" delay={170}>
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
                <>
                  <TextField
                    label="Indicaciones generales"
                    placeholder="Reposo, hidratación, signos de alarma…"
                    value={cr.generalInstructions}
                    onChangeText={cr.setGeneralInstructions}
                    multiline
                    minHeight={64}
                  />
                  <View style={styles.toggles}>
                    <ToggleRow
                      label="Firmar receta"
                      description="Queda firmada con tu credencial al cerrar"
                      value={cr.signRx}
                      onToggle={cr.setSignRx}
                    />
                    <ToggleRow
                      label="Enviar al paciente"
                      description="Se envía por correo al firmar"
                      value={cr.sendRx}
                      onToggle={cr.setSendRx}
                    />
                  </View>
                </>
              ) : null}
            </View>
          </Block>
        </>
      ) : null}
    </MobileScreen>
  );
}

const socStyles = StyleSheet.create({
  wrap: {
    marginTop: 20
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  filledBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.okSoft,
    borderWidth: 1,
    borderColor: colors.okRule,
    borderRadius: radii.pill,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  filledText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ok
  },
  pendingText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3
  },
  body: {
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.white
  },
  caption: {
    fontFamily: family.regular,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.ink3
  }
});

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
  content: {
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 132
  },
  flex: {
    flex: 1,
    minWidth: 0
  },
  flex2: {
    flex: 1.6,
    minWidth: 0
  },
  loading: {
    paddingVertical: 28,
    alignItems: "center"
  },
  errorBox: {
    marginTop: 18,
    padding: 18,
    borderRadius: radii.md,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule,
    gap: 12
  },
  errorText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.alert
  },
  errorBack: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.alertRule
  },
  errorBackText: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.alert
  },
  socAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: radii.md,
    backgroundColor: "#FFF8E6",
    borderWidth: 1,
    borderColor: "#F0D080"
  },
  socAlertText: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.mid,
    lineHeight: 18
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 10,
    backgroundColor: colors.paper
  },
  backBtn: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  backText: {
    fontFamily: family.regular,
    fontSize: 11.5,
    color: colors.ink2
  },
  navTitle: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.ink3
  },
  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.accentSoft
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.accentDeep
  },
  liveText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.accentDeep,
    letterSpacing: 0.5
  },
  patientHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  eyebrow: {
    ...text.eyebrow,
    fontSize: 9.5,
    color: colors.ink3
  },
  patientName: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.4,
    color: colors.ink,
    marginTop: 4
  },
  patientMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 3
  },
  block: {
    marginTop: 20
  },
  blockHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10
  },
  blockHint: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.3
  },
  editorList: {
    gap: 10
  },
  toggles: {
    marginTop: 2,
    paddingHorizontal: 2
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: "rgba(241,250,254,0.97)",
    borderTopWidth: 1,
    borderTopColor: colors.rule2
  },
  footerHint: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    lineHeight: 14
  },
  footerReady: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ok,
    lineHeight: 14
  },
  footerBtn: {
    width: 168
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "flex-end"
  },
  backdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(2,2,47,0.42)"
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 14,
    borderTopWidth: 1,
    borderColor: colors.rule
  },
  sheetTitle: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.ink
  },
  sheetLead: {
    fontFamily: family.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink2,
    marginTop: -6
  },
  summary: {
    gap: 2,
    borderWidth: 1,
    borderColor: colors.rule2,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 6
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.rule2
  },
  summaryLabel: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink2
  },
  summaryValue: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 99
  },
  summaryText: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  sheetError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    lineHeight: 15
  },
  sheetActions: {
    flexDirection: "row",
    gap: 10
  },
  resultHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 99,
    backgroundColor: colors.okSoft,
    alignItems: "center",
    justifyContent: "center"
  },
  warnList: {
    gap: 8,
    marginTop: -4
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
  }
});
