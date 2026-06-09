import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Section } from "@/atomic/molecules/Section";
import { QrScanner } from "@/atomic/molecules/QrScanner";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack, goToScreen } from "@/navigation/screenRouter";
import { redeemQrAccessCode } from "@/services/api/qrRedeemApi";
import { QrRedeemResponse } from "@/services/api/qrApi";
import { setSelectedPatientId } from "@/services/api/selectedPatient";
import { ApiError } from "@/services/api/client";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

function normalizeCode(input: string): string {
  // El QR del paciente codifica el verification_code; si llegara un URL,
  // extraemos el código (último segmento alfanumérico con guiones).
  const raw = input.includes("/") || input.includes("=") ? input.split(/[/=]/).pop() ?? input : input;
  return raw.toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

export function DocQRMobilePage() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<QrRedeemResponse | null>(null);
  const [scanning, setScanning] = useState(false);

  async function handleRedeem(explicit?: string) {
    if (busy) {
      return;
    }
    setError(null);
    setSuccess(null);
    const normalized = normalizeCode(explicit ?? code);
    if (normalized.length < 4) {
      setError("Ingresa un código válido.");
      return;
    }
    setBusy(true);
    try {
      const response = await redeemQrAccessCode(normalized);
      setSuccess(response);
      if (response.patient?.id) {
        await setSelectedPatientId(response.patient.id);
      }
    } catch (err) {
      const detail =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : "No pudimos canjear el código.";
      setError(detail);
    } finally {
      setBusy(false);
    }
  }

  function handleScan(text: string) {
    const normalized = normalizeCode(text);
    setScanning(false);
    setCode(normalized);
    handleRedeem(normalized);
  }

  return (
    <MobileScreen
      header={
        <ScreenTopBar
          back="Más opciones"
          onBack={() => goBack("mob-profile")}
          sub="Escaneo QR · vigencia 5 minutos"
          title="Escanear QR"
        />
      }
      contentStyle={styles.content}
    >
      <FadeIn>
        {scanning ? (
          <View style={styles.scannerWrap}>
            <QrScanner active onResult={handleScan} size={260} />
            <Button
              label="Cancelar cámara"
              variant="ghost"
              size="sm"
              height={36}
              style={styles.cancelScan}
              onPress={() => setScanning(false)}
            />
          </View>
        ) : (
          <View style={styles.camera}>
            <Icon kind="qr" size={40} color={colors.white} />
            <Text style={styles.cameraHint}>Escanea el código QR del paciente</Text>
            <Button
              label="Iniciar cámara"
              size="sm"
              height={40}
              block={false}
              iconLeft="qr"
              style={styles.startScan}
              onPress={() => {
                setError(null);
                setScanning(true);
              }}
            />
          </View>
        )}
      </FadeIn>

      <FadeIn delay={80}>
        <SectionLabel label="O pega el código manualmente" style={styles.manualLabel} />
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="XXXX-XXXX"
          placeholderTextColor={colors.ink3}
          autoCapitalize="characters"
          autoCorrect={false}
          style={styles.input}
        />
        <Button
          label={busy ? "Canjeando…" : "Canjear acceso  →"}
          height={44}
          style={styles.redeemBtn}
          onPress={() => handleRedeem()}
          disabled={busy}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? (
          <View style={styles.successCard}>
            <Icon kind="check" size={14} color={colors.ok} />
            <View style={styles.flex}>
              <Text style={styles.successName}>
                {success.patient.first_name} {success.patient.last_name}
              </Text>
              <Text style={styles.successMeta}>{success.message}</Text>
            </View>
            <Button
              label="Abrir"
              size="sm"
              block={false}
              height={32}
              onPress={() => goToScreen("doc-full-mob")}
            />
          </View>
        ) : null}
        <Text style={styles.note}>expira a los 5 min de generado</Text>
      </FadeIn>

      <FadeIn delay={140}>
        <Section title="Accesos recientes">
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>
              Aquí aparecerá el último paciente canjeado durante la sesión.
            </Text>
          </View>
        </Section>
      </FadeIn>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28
  },
  flex: {
    flex: 1
  },
  camera: {
    aspectRatio: 1,
    borderRadius: radii.lg,
    backgroundColor: "#0B1240",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 20
  },
  cameraHint: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.white,
    textAlign: "center",
    letterSpacing: 0.5
  },
  startScan: {
    marginTop: 4
  },
  scannerWrap: {
    alignItems: "center",
    gap: 12
  },
  cancelScan: {
    alignSelf: "center"
  },
  manualLabel: {
    marginTop: 18
  },
  input: {
    marginTop: 8,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    fontFamily: family.monoMedium,
    fontSize: 16,
    letterSpacing: 4,
    color: colors.ink,
    textAlign: "center"
  },
  redeemBtn: {
    marginTop: 14
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 10,
    textAlign: "center"
  },
  successCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.okSoft,
    borderWidth: 1,
    borderColor: colors.okRule,
    borderRadius: radii.md
  },
  successName: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  successMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 2
  },
  note: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    textAlign: "center",
    marginTop: 8
  },
  emptyRow: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule2,
    borderRadius: radii.md
  },
  emptyText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    textAlign: "center"
  }
});
