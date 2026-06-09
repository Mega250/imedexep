import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { QrScanner } from "@/atomic/molecules/QrScanner";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { QrPatientSummary } from "@/services/api/qrApi";
import { redeemQrAccessCode } from "@/services/api/qrRedeemApi";
import { setSelectedPatientId } from "@/services/api/selectedPatient";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

function normalizeScanned(input: string): string {
  const raw = input.includes("/") || input.includes("=") ? input.split(/[/=]/).pop() ?? input : input;
  return raw.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 8);
}

function computeAge(dob: string): number {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) {
    age -= 1;
  }
  return age;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DocQRDesktopPage() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<QrPatientSummary | null>(null);
  const [scanning, setScanning] = useState(false);

  async function handleRedeem(explicit?: string) {
    const value = (explicit ?? code).trim();
    if (!value || busy) {
      return;
    }
    setBusy(true);
    setError(null);
    setPatient(null);
    try {
      const res = await redeemQrAccessCode(value);
      await setSelectedPatientId(res.patient.id);
      setPatient(res.patient);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido o expirado.");
    } finally {
      setBusy(false);
    }
  }

  function handleScan(text: string) {
    const normalized = normalizeScanned(text);
    setScanning(false);
    setCode(normalized);
    handleRedeem(normalized);
  }

  const codeChars: string[] = Array.from({ length: 8 }).map((_, i) => code[i] ?? "");

  return (
    <DesktopShell
      nav={doctorNav}
      activeScreen="doc-qr"
      role="médico"
      roleBadge="Médico"
      title="Acceso por QR del paciente"
      eyebrow="Escaneo de QR de paciente"
      searchPlaceholder="Pega código…"
    >
      <View style={styles.mainCols}>
        <FadeIn style={styles.scanCol}>
          <View style={styles.scanCard}>
            <View style={styles.scanHead}>
              <Text style={styles.scanTitle}>Escanea el código del paciente</Text>
              <Text style={styles.scanHint}>
                Pídele que abra su app y comparta el código de acceso
              </Text>
            </View>

            <View style={styles.scanBody}>
              {scanning ? (
                <View style={styles.scannerWrap}>
                  <QrScanner active onResult={handleScan} size={280} />
                  <Button
                    label="Cancelar cámara"
                    variant="ghost"
                    size="sm"
                    block={false}
                    onPress={() => setScanning(false)}
                  />
                </View>
              ) : (
                <View style={styles.camera}>
                  <Icon kind="qr" size={48} color={colors.white} />
                  <Text style={styles.cameraHint}>
                    Escanea el código QR del paciente con la cámara
                  </Text>
                  <Button
                    label="Iniciar cámara"
                    size="sm"
                    block={false}
                    iconLeft="qr"
                    onPress={() => {
                      setError(null);
                      setScanning(true);
                    }}
                  />
                </View>
              )}

              <Text style={[styles.eyebrow, styles.manualLabel]}>
                O pega el código manualmente
              </Text>
              <View style={styles.codeInputWrap}>
                <TextInput
                  value={code}
                  onChangeText={(v) => setCode(v.toUpperCase().replace(/\s+/g, "").slice(0, 8))}
                  placeholder="XXXXXXXX"
                  placeholderTextColor={colors.ink4}
                  autoCapitalize="characters"
                  maxLength={8}
                  style={styles.hiddenInput}
                />
                <View style={styles.codeRow} pointerEvents="none">
                  {codeChars.map((c, i) => (
                    <View
                      key={i}
                      style={[
                        styles.codeBox,
                        { borderColor: c ? colors.ink : colors.rule }
                      ]}
                    >
                      <Text style={styles.codeChar}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View style={styles.scanFoot}>
                <Text style={styles.scanFootText}>
                  El código expira a los pocos minutos de generado
                </Text>
                <Button
                  label={busy ? "Canjeando…" : "Canjear acceso"}
                  variant="accent"
                  size="sm"
                  block={false}
                  iconRight="arrow"
                  onPress={() => handleRedeem()}
                  disabled={busy || code.length < 4}
                />
              </View>
            </View>
          </View>
        </FadeIn>

        <View style={styles.asideCol}>
          <View style={styles.howCard}>
            <Text style={styles.eyebrow}>Cómo funciona</Text>
            <Text style={styles.howTitle}>
              Acceso temporal al expediente del paciente
            </Text>
            <Text style={styles.howBody}>
              Útil cuando atiendes a un paciente que no es tuyo (urgencias, interconsulta). El
              paciente decide qué compartir. El acceso dura la consulta y queda en su bitácora.
            </Text>
          </View>

          {busy ? (
            <View style={styles.statusCard}>
              <ActivityIndicator color={colors.accentDeep} />
              <Text style={styles.statusText}>Validando código…</Text>
            </View>
          ) : null}

          {patient ? (
            <View style={styles.patientCard}>
              <View style={styles.patientHead}>
                <View style={styles.patientAvatar}>
                  <Text style={styles.patientAvatarText}>{initials(`${patient.first_name} ${patient.last_name}`)}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.patientName}>
                    {patient.first_name} {patient.last_name}
                  </Text>
                  <Text style={styles.patientMeta}>
                    {computeAge(patient.date_of_birth)}a
                    {patient.gender ? ` · ${patient.gender}` : ""}
                    {patient.blood_type ? ` · ${patient.blood_type}` : ""}
                  </Text>
                  {patient.city ? (
                    <Text style={styles.patientMeta}>
                      {patient.city}
                      {patient.state ? `, ${patient.state}` : ""}
                    </Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.successBadge}>
                <Icon kind="check" size={12} color={colors.ok} />
                <Text style={styles.successText}>ACCESO OTORGADO</Text>
              </View>
              <Button
                label="Abrir expediente"
                variant="accent"
                size="sm"
                iconRight="arrow"
                onPress={() => goToScreen("doc-full")}
              />
            </View>
          ) : null}
        </View>
      </View>
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  flex: {
    flex: 1
  },
  mainCols: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14
  },
  scanCol: {
    flexGrow: 1.2,
    flexBasis: 460,
    minWidth: 0
  },
  scanCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  scanHead: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  scanTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  scanHint: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  scanBody: {
    padding: 24
  },
  camera: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: radii.lg,
    backgroundColor: "#0B1240",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 24
  },
  cameraHint: {
    fontFamily: family.mono,
    fontSize: 12,
    letterSpacing: 0.5,
    color: colors.white,
    textAlign: "center"
  },
  scannerWrap: {
    alignItems: "center",
    gap: 12
  },
  manualLabel: {
    marginTop: 18
  },
  codeInputWrap: {
    marginTop: 10,
    position: "relative"
  },
  hiddenInput: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.001,
    color: colors.ink,
    fontSize: 22,
    zIndex: 2
  },
  codeRow: {
    flexDirection: "row",
    gap: 8
  },
  codeBox: {
    flex: 1,
    height: 56,
    borderRadius: radii.md,
    borderWidth: 1.5,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  codeChar: {
    fontFamily: family.monoMedium,
    fontSize: 22,
    color: colors.ink
  },
  errorText: {
    marginTop: 12,
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.alert,
    padding: 10,
    backgroundColor: colors.alertSoft,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.alertRule
  },
  scanFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    gap: 10,
    flexWrap: "wrap"
  },
  scanFootText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  asideCol: {
    flexGrow: 1,
    flexBasis: 360,
    gap: 14
  },
  howCard: {
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.xl,
    padding: 20
  },
  howTitle: {
    fontFamily: family.medium,
    fontSize: 17,
    color: colors.ink,
    marginTop: 6,
    lineHeight: 22.1
  },
  howBody: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 8,
    lineHeight: 17.05
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg
  },
  statusText: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink2
  },
  patientCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.xl,
    padding: 18,
    gap: 14
  },
  patientHead: {
    flexDirection: "row",
    gap: 14
  },
  patientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.accentBright,
    alignItems: "center",
    justifyContent: "center"
  },
  patientAvatarText: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    color: colors.ink
  },
  patientName: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    color: colors.ink,
    letterSpacing: -0.4
  },
  patientMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 4
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(28,140,90,0.12)"
  },
  successText: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ok,
    letterSpacing: 0.8
  }
});
