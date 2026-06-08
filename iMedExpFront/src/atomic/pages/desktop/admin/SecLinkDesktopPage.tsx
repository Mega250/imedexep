import { Fragment, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { QrScanModal } from "@/atomic/molecules/QrScanModal";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { secretaryNav } from "@/navigation/desktopNavConfigs";
import { goToScreen, replaceScreen } from "@/navigation/screenRouter";
import { Patient, fetchPatientByCurp } from "@/services/api/patientsApi";
import { postPatientInstitution } from "@/services/api/patientInstitutionApi";
import { postEmergencyContact } from "@/services/api/emergencyContactsApi";
import { redeemQrAccessCode } from "@/services/api/qrRedeemApi";
import { loadSession } from "@/state/sessionStore";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

type Step = 1 | 2 | 3 | 4;

function ageFrom(dob: string): number {
  const d = new Date(dob);
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
}

function initialsFromName(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "··";
}

export function SecLinkDesktopPage() {
  const [step, setStep] = useState<Step>(1);
  const [curp, setCurp] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [found, setFound] = useState<Patient | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [linked, setLinked] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactRel, setContactRel] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSearch() {
    if (searching || !curp.trim()) return;
    setSearchError(null);
    setFound(null);
    setSearching(true);
    try {
      const hit = await fetchPatientByCurp(curp.trim().toUpperCase());
      setFound(hit);
      setStep(2);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Error al buscar paciente.");
    } finally {
      setSearching(false);
    }
  }

  async function handleScannedCode(code: string) {
    setScanOpen(false);
    if (searching || !code.trim()) return;
    setSearchError(null);
    setFound(null);
    setSearching(true);
    try {
      const redeemed = await redeemQrAccessCode(code.trim());
      setFound({
        id: redeemed.patient.id,
        first_name: redeemed.patient.first_name,
        last_name: redeemed.patient.last_name,
        date_of_birth: redeemed.patient.date_of_birth,
        gender: redeemed.patient.gender,
        blood_type: redeemed.patient.blood_type,
        phone: null,
        postal_code: null,
        city: redeemed.patient.city,
        state: redeemed.patient.state,
        sensitivity_level: 1,
        created_at: new Date().toISOString(),
        archived_at: null
      });
      setStep(2);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "No pudimos redimir el código QR.");
    } finally {
      setSearching(false);
    }
  }

  async function handleLink() {
    if (linking || !found) return;
    setLinkError(null);
    setLinking(true);
    try {
      const session = await loadSession();
      const institutionId = session.user?.institution_id;
      if (!institutionId) {
        throw new Error("Tu cuenta no tiene una clínica asignada.");
      }
      await postPatientInstitution({ patient_id: found.id, institution_id: institutionId });
      setLinked(true);
      setStep(4);
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : "No pudimos vincular al paciente.");
    } finally {
      setLinking(false);
    }
  }

  async function handleSaveContact() {
    if (saving || !found) return;
    const digits = contactPhone.replace(/\D/g, "");
    const normalizedPhone = digits.length === 12 && digits.startsWith("52") ? digits.slice(2) : digits;
    if (!contactName.trim() || !normalizedPhone || !contactRel.trim()) {
      setSaveError("Completa nombre, teléfono y parentesco.");
      return;
    }
    if (normalizedPhone.length !== 10) {
      setSaveError("El teléfono debe tener 10 dígitos.");
      return;
    }
    setSaveError(null);
    setSaving(true);
    try {
      await postEmergencyContact(found.id, {
        full_name: contactName.trim(),
        phone: normalizedPhone,
        relationship: contactRel.trim(),
        is_primary: true
      });
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "No pudimos guardar el contacto.");
    } finally {
      setSaving(false);
    }
  }

  const STEPS: [string, string, boolean][] = [
    ["1", "Identifica al paciente", step >= 1],
    ["2", "Verifica datos", step >= 2],
    ["3", "Vincula a la clínica", step >= 3 || linked],
    ["4", "Contacto de emergencia", step >= 4 || saved]
  ];

  const FOUND_FIELDS: [string, string, IconKind][] = found
    ? [
        ["Expediente", `#${found.id}`, "doc"],
        ["Ciudad", found.city ?? "—", "build"],
        ["Tipo de sangre", found.blood_type ?? "—", "drop"],
        ["Sensibilidad", `nivel ${found.sensitivity_level}`, "shield-2"]
      ]
    : [];

  return (
    <DesktopShell
      nav={secretaryNav}
      activeScreen="sec-link"
      role="secretaria · clínica"
      roleBadge="Secretaria"
      title="Vincular paciente a la clínica"
      eyebrow="Vincular paciente"
      searchPlaceholder="Buscar por CURP o correo…"
      topBarRight={
        <Button
          label="Escanear QR"
          variant="ghost"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft="scan"
          onPress={() => setScanOpen(true)}
        />
      }
    >
      <FadeIn>
        <View style={styles.steps}>
          {STEPS.map(([n, t, on], i) => (
            <Fragment key={n}>
              <View style={styles.step}>
                <View
                  style={[
                    styles.stepNum,
                    {
                      backgroundColor: on ? colors.ink : colors.white,
                      borderColor: on ? colors.ink : colors.rule
                    }
                  ]}
                >
                  <Text style={[styles.stepNumText, { color: on ? colors.paper : colors.ink3 }]}>
                    {n}
                  </Text>
                </View>
                <Text style={[styles.stepLabel, { color: on ? colors.ink : colors.ink3 }]}>{t}</Text>
              </View>
              {i < 3 ? <View style={styles.stepLine} /> : null}
            </Fragment>
          ))}
        </View>
      </FadeIn>

      <View style={styles.cols}>
        <View style={styles.mainCol}>
          <View style={styles.searchCard}>
            <Text style={styles.eyebrow}>Paso 1 · identifica</Text>
            <Text style={styles.cardTitle}>Busca por CURP</Text>
            <View style={styles.searchRow}>
              <View style={styles.searchField}>
                <Icon kind="search" size={15} color={colors.accentDeep} />
                <TextInput
                  style={styles.searchValue}
                  placeholder="CURP del paciente"
                  placeholderTextColor={colors.ink3}
                  value={curp}
                  onChangeText={setCurp}
                  autoCapitalize="characters"
                />
                {found ? <Text style={styles.searchResult}>● 1 resultado</Text> : null}
              </View>
              <Button
                label={searching ? "Buscando…" : "Buscar"}
                variant="accent"
                size="md"
                block={false}
                height={48}
                radius={radii.md}
                onPress={handleSearch}
                disabled={searching}
              />
            </View>
            {searchError ? <Text style={styles.errorText}>{searchError}</Text> : null}
            <Text style={styles.searchHelp}>
              ¿No lo encuentras? Pide al paciente crear su cuenta o vincúlalo con el QR de su app.
            </Text>
          </View>

          {found ? (
            <View style={styles.foundCard}>
              <View style={styles.foundHead}>
                <View style={styles.flexShrink}>
                  <Text style={styles.eyebrow}>Paso 2 · verifica</Text>
                  <Text style={styles.cardTitleTight}>Paciente encontrado</Text>
                </View>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedBadgeText}>VERIFICADO</Text>
                </View>
              </View>
              <View style={styles.foundBody}>
                <View style={styles.foundIdentity}>
                  <View style={styles.foundAvatar}>
                    <Text style={styles.foundAvatarText}>
                      {initialsFromName(found.first_name, found.last_name)}
                    </Text>
                  </View>
                  <View style={styles.flexShrink}>
                    <Text
                      style={styles.foundName}
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      minimumFontScale={0.7}
                    >
                      {found.first_name} {found.last_name}
                    </Text>
                    <Text style={styles.foundMeta}>
                      {found.gender ?? "—"} · {ageFrom(found.date_of_birth)} años · expediente #{found.id}
                    </Text>
                  </View>
                </View>
                <View style={styles.foundGrid}>
                  {FOUND_FIELDS.map(([k, v, ic]) => (
                    <View key={k} style={styles.foundCell}>
                      <View style={styles.fieldLabelRow}>
                        <Icon kind={ic} size={12} color={colors.ink3} />
                        <Text style={styles.fieldLabel}>{k}</Text>
                      </View>
                      <Text style={styles.fieldValue}>{v}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ) : null}

          {found ? (
            <View style={styles.linkCard}>
              <Text style={styles.eyebrow}>Paso 3 · vincular</Text>
              <Text style={styles.cardTitleTight}>Configura la vinculación</Text>
              <Text style={styles.searchHelp}>
                {linked
                  ? "El paciente está vinculado a la clínica."
                  : "Al confirmar, el paciente quedará vinculado a tu clínica."}
              </Text>
              {linkError ? <Text style={styles.errorText}>{linkError}</Text> : null}
              <View style={styles.linkFooter}>
                <Text style={styles.linkFooterNote}>
                  El vínculo quedará registrado de inmediato en la clínica
                </Text>
                <View style={styles.linkFooterActions}>
                  <Button
                    label="Cancelar"
                    variant="ghost"
                    size="sm"
                    block={false}
                    onPress={() => replaceScreen("sec-reception")}
                  />
                  <Button
                    label={linking ? "Vinculando…" : linked ? "Vinculado" : "Vincular paciente"}
                    variant="accent"
                    size="sm"
                    block={false}
                    iconLeft="link"
                    onPress={() => {
                      if (step < 3) setStep(3);
                      handleLink();
                    }}
                    disabled={linking || linked}
                  />
                </View>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.asideCol}>
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyHead}>
              <Text style={styles.eyebrow}>Paso 4 · contacto</Text>
              <Text style={styles.cardTitleTight15}>Contacto de emergencia</Text>
            </View>
            <View style={styles.emergencyBody}>
              <View style={styles.emergencyList}>
                <View style={styles.emergencyCell}>
                  <Text style={styles.fieldLabel}>Nombre</Text>
                  <TextInput
                    style={styles.emergencyInput}
                    placeholder="Nombre completo"
                    placeholderTextColor={colors.ink3}
                    value={contactName}
                    onChangeText={setContactName}
                  />
                </View>
                <View style={styles.emergencyCell}>
                  <Text style={styles.fieldLabel}>Parentesco</Text>
                  <TextInput
                    style={styles.emergencyInput}
                    placeholder="Madre, hijo, etc."
                    placeholderTextColor={colors.ink3}
                    value={contactRel}
                    onChangeText={setContactRel}
                  />
                </View>
                <View style={styles.emergencyCell}>
                  <Text style={styles.fieldLabel}>Teléfono</Text>
                  <TextInput
                    style={styles.emergencyInput}
                    placeholder="+52 ..."
                    placeholderTextColor={colors.ink3}
                    value={contactPhone}
                    onChangeText={setContactPhone}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.emergencyCell}>
                  <Text style={styles.fieldLabel}>Correo (opcional)</Text>
                  <TextInput
                    style={styles.emergencyInput}
                    placeholder="—"
                    placeholderTextColor={colors.ink3}
                    value={contactEmail}
                    onChangeText={setContactEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>
              {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
              {saved ? <Text style={styles.successText}>Contacto guardado correctamente.</Text> : null}
              <Button
                label={saving ? "Guardando…" : saved ? "Guardado" : "Guardar contacto"}
                variant="ghost"
                size="sm"
                iconLeft="plus"
                style={styles.emergencyBtn}
                onPress={handleSaveContact}
                disabled={saving || saved || !linked}
              />
              {!linked ? (
                <Text style={styles.searchHelp}>Primero vincula al paciente para guardar contacto.</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.warningCard}>
            <RadialBlob size={200} color="rgba(0,180,216,0.28)" style={styles.warningBlob} />
            <View style={styles.warningInner}>
              <Text style={styles.warningEyebrow}>Recuerda</Text>
              <Text style={styles.warningTitle}>
                El paciente sigue siendo dueño{"\n"}de su expediente
              </Text>
              <Text style={styles.warningBody}>
                Vincular sólo da acceso a esta clínica. El paciente puede revocarlo en su app cuando
                quiera.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {searching || linking || saving ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      <QrScanModal
        visible={scanOpen}
        onClose={() => setScanOpen(false)}
        onCode={handleScannedCode}
      />
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  loading: {
    paddingVertical: 14,
    alignItems: "center"
  },
  errorText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 8
  },
  successText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ok,
    marginTop: 8
  },
  steps: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 99,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  stepNumText: {
    fontFamily: family.medium,
    fontSize: 12
  },
  stepLabel: {
    fontFamily: family.medium,
    fontSize: 13
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.rule
  },
  cols: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 18
  },
  mainCol: {
    flexGrow: 1.3,
    flexBasis: 440,
    gap: 14
  },
  asideCol: {
    flexGrow: 1,
    flexBasis: 300,
    gap: 14
  },
  searchCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    paddingHorizontal: 24,
    paddingVertical: 20
  },
  cardTitle: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink,
    marginTop: 6
  },
  cardTitleTight: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink,
    marginTop: 4
  },
  cardTitleTight15: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink,
    marginTop: 4
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  searchField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: colors.white,
    borderRadius: radii.md
  },
  searchValue: {
    flex: 1,
    fontFamily: family.mono,
    fontSize: 14,
    color: colors.ink,
    padding: 0
  },
  searchResult: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ok
  },
  searchHelp: {
    fontFamily: family.regular,
    fontSize: 11.5,
    color: colors.ink3,
    marginTop: 12
  },
  foundCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  foundHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  flexShrink: {
    flexShrink: 1,
    minWidth: 0
  },
  verifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.okSoft
  },
  verifiedBadgeText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.76,
    color: colors.ok
  },
  foundBody: {
    padding: 22
  },
  foundIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  foundAvatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.accentBright,
    alignItems: "center",
    justifyContent: "center"
  },
  foundAvatarText: {
    fontFamily: family.serifItalic,
    fontSize: 28,
    color: colors.ink
  },
  foundName: {
    fontFamily: family.serifItalic,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.56,
    color: colors.ink
  },
  foundMeta: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink3,
    marginTop: 6
  },
  foundGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18
  },
  foundCell: {
    flexGrow: 1,
    flexBasis: "45%",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  fieldLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  fieldValue: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink,
    marginTop: 6
  },
  linkCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    paddingHorizontal: 24,
    paddingVertical: 20
  },
  linkFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18
  },
  linkFooterNote: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    flexShrink: 1
  },
  linkFooterActions: {
    flexDirection: "row",
    gap: 6
  },
  emergencyCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  emergencyHead: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  emergencyBody: {
    padding: 18
  },
  emergencyList: {
    gap: 10
  },
  emergencyCell: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.paper,
    borderRadius: radii.md
  },
  emergencyInput: {
    fontFamily: family.mono,
    fontSize: 12.5,
    color: colors.ink,
    marginTop: 4,
    padding: 0
  },
  emergencyBtn: {
    width: "100%",
    marginTop: 12
  },
  warningCard: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    padding: 20,
    overflow: "hidden"
  },
  warningBlob: {
    top: -80,
    right: -60
  },
  warningInner: {
    position: "relative"
  },
  warningEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.6)"
  },
  warningTitle: {
    fontFamily: family.serifItalic,
    fontSize: 20,
    lineHeight: 23,
    color: colors.paper,
    marginTop: 6
  },
  warningBody: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: 10,
    lineHeight: 17
  }
});
