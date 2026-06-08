import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Button } from "@/atomic/atoms/Button";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { QrScanModal } from "@/atomic/molecules/QrScanModal";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { secretaryTabs } from "@/navigation/tabConfigs";
import { Patient, fetchPatientByCurp } from "@/services/api/patientsApi";
import { postPatientInstitution } from "@/services/api/patientInstitutionApi";
import { postEmergencyContact } from "@/services/api/emergencyContactsApi";
import { redeemQrAccessCode } from "@/services/api/qrRedeemApi";
import { loadSession } from "@/state/sessionStore";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type Step = 1 | 2 | 3 | 4;

function ageFrom(dob: string): number {
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  return Math.max(0, Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)));
}

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase() || "··";
}

export function SecLinkMobilePage() {
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

  const stepLabel = `Paso ${step} de 4 · ${
    step === 1 ? "identificar" : step === 2 ? "verificar" : step === 3 ? "vincular" : "contacto emerg."
  }`;

  const FOUND_FIELDS: [IconKind, string][] = found
    ? [
        ["build", found.city ? `${found.city}${found.state ? ` · ${found.state}` : ""}` : "Sin ciudad registrada"],
        ["mail", `expediente #${found.id}`],
        ["phone", found.gender ? `género ${found.gender}` : "género —"]
      ]
    : [];

  return (
    <MobileScreen
      tabBar={<IconTabBar tabs={secretaryTabs} active={3} />}
      header={<ScreenTopBar sub="Asociar paciente a la institución" title="Vincular paciente" />}
      contentStyle={styles.content}
    >
      <FadeIn>
        <View style={styles.steps}>
          {[1, 2, 3, 4].map((n) => (
            <View
              key={n}
              style={[
                styles.stepBar,
                { backgroundColor: n <= step ? colors.ink : colors.rule }
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepLabel}>{stepLabel}</Text>
      </FadeIn>

      <FadeIn delay={70}>
        <Card radius={radii.lg} style={styles.searchCard}>
          <Text style={styles.searchTitle}>Identifica por CURP</Text>
          <View style={styles.searchRow}>
            <View style={styles.searchInput}>
              <Icon kind="search" size={14} color={colors.accentDeep} />
              <TextInput
                style={styles.searchValue}
                placeholder="CURP del paciente"
                placeholderTextColor={colors.ink3}
                value={curp}
                onChangeText={setCurp}
                autoCapitalize="characters"
              />
            </View>
            <Button
              label={searching ? "…" : "Buscar"}
              size="sm"
              block={false}
              height={42}
              onPress={handleSearch}
              disabled={searching}
            />
            <Button
              label="QR"
              variant="ghost"
              size="sm"
              block={false}
              height={42}
              iconLeft="scan"
              onPress={() => setScanOpen(true)}
              disabled={searching}
            />
          </View>
          {searchError ? <Text style={styles.errorText}>{searchError}</Text> : null}
          {found ? (
            <Text style={styles.searchResult}>● Paciente encontrado</Text>
          ) : null}
        </Card>
      </FadeIn>

      {found ? (
        <FadeIn delay={120}>
          <Card radius={radii.lg} style={styles.foundCard}>
            <View style={styles.foundHead}>
              <SectionLabel label="Encontrado" />
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedText}>VERIFICADO</Text>
              </View>
            </View>
            <View style={styles.foundBody}>
              <View style={styles.foundPerson}>
                <Avatar
                  initials={initials(found.first_name, found.last_name)}
                  size={52}
                  radius={14}
                  bg={colors.accentBright}
                  fg={colors.ink}
                  serif
                  fontSize={22}
                />
                <View style={styles.flex}>
                  <Text style={styles.foundName}>
                    {found.first_name} {found.last_name}
                  </Text>
                  <Text style={styles.foundMeta}>
                    {found.gender ?? "—"} · {ageFrom(found.date_of_birth)} a
                  </Text>
                </View>
              </View>
              <View style={styles.foundFields}>
                {FOUND_FIELDS.map(([icon, v]) => (
                  <View key={v} style={styles.foundField}>
                    <Icon kind={icon} size={12} color={colors.ink3} />
                    <Text style={styles.foundFieldText}>{v}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </FadeIn>
      ) : null}

      {found && !linked ? (
        <FadeIn delay={170}>
          {linkError ? <Text style={styles.errorText}>{linkError}</Text> : null}
          <Button
            label={linking ? "Vinculando…" : "Vincular paciente"}
            iconLeft="link"
            height={48}
            style={styles.linkBtn}
            onPress={() => {
              if (step < 3) setStep(3);
              handleLink();
            }}
            disabled={linking}
          />
        </FadeIn>
      ) : null}

      {linked && found ? (
        <FadeIn delay={170}>
          <Card radius={radii.lg} style={styles.contactCard}>
            <SectionLabel label="Paso 4 · contacto emergencia" />
            <View style={styles.contactInputs}>
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor={colors.ink3}
                value={contactName}
                onChangeText={setContactName}
              />
              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                placeholderTextColor={colors.ink3}
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Parentesco (madre, hijo, etc.)"
                placeholderTextColor={colors.ink3}
                value={contactRel}
                onChangeText={setContactRel}
              />
            </View>
            {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
            {saved ? <Text style={styles.successText}>Contacto guardado correctamente.</Text> : null}
            <Button
              label={saving ? "Guardando…" : saved ? "Guardado" : "Guardar contacto"}
              iconLeft="plus"
              height={44}
              style={styles.linkBtn}
              onPress={handleSaveContact}
              disabled={saving || saved}
            />
          </Card>
        </FadeIn>
      ) : null}

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
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120
  },
  flex: {
    flex: 1
  },
  loading: {
    paddingVertical: 12,
    alignItems: "center"
  },
  steps: {
    flexDirection: "row",
    gap: 6
  },
  stepBar: {
    flex: 1,
    height: 6,
    borderRadius: 99
  },
  stepLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 6
  },
  searchCard: {
    padding: 14,
    marginTop: 14
  },
  searchTitle: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 42,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: radii.md
  },
  searchValue: {
    flex: 1,
    fontFamily: family.mono,
    fontSize: 12,
    color: colors.ink,
    padding: 0
  },
  searchResult: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ok,
    marginTop: 8
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
  foundCard: {
    marginTop: 14
  },
  foundHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  verifiedTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.okSoft
  },
  verifiedText: {
    fontFamily: family.mono,
    fontSize: 9,
    color: colors.ok,
    letterSpacing: 0.5
  },
  foundBody: {
    padding: 16
  },
  foundPerson: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  foundName: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    color: colors.ink
  },
  foundMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 4
  },
  foundFields: {
    marginTop: 14,
    gap: 6
  },
  foundField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.paper,
    borderRadius: 8
  },
  foundFieldText: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink2
  },
  linkBtn: {
    marginTop: 16
  },
  contactCard: {
    padding: 14,
    marginTop: 14
  },
  contactInputs: {
    gap: 10,
    marginTop: 12
  },
  input: {
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink
  }
});
