import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Button } from "@/atomic/atoms/Button";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { QrCodeView } from "@/atomic/molecules/QrCodeView";
import { PatientExtrasTabBar } from "@/atomic/organisms/PatientExtrasTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { QRAccess, generateMyQrAccess } from "@/services/api/qrApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

function formatCode(code: string): string {
  const clean = code.replace(/\s+/g, "").toUpperCase();
  if (clean.length <= 4) {
    return clean;
  }
  return `${clean.slice(0, 4)} · ${clean.slice(4, 8) || ""}`.trim();
}

function formatRemaining(ms: number): string {
  if (ms <= 0) {
    return "00:00";
  }
  const total = Math.floor(ms / 1000);
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function PatQRMobilePage() {
  const [qr, setQr] = useState<QRAccess | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState(false);

  async function generate() {
    setBusy(true);
    setError(null);
    setCopied(false);
    try {
      const data = await generateMyQrAccess();
      setQr(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos generar el código.");
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    if (!qr) return;
    try {
      await Clipboard.setStringAsync(qr.verification_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sin portapapeles: el código sigue visible para teclear */
    }
  }

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = qr ? new Date(qr.expires_at).getTime() - now : 0;
  const remainingLabel = formatRemaining(remainingMs);
  const expired = qr ? remainingMs <= 0 : false;

  return (
    <MobileScreen
      tabBar={<PatientExtrasTabBar activeScreen="pat-qr-mob" />}
      header={
        <ScreenTopBar
          sub={qr ? `expira en ${remainingLabel}` : "Genera tu código de acceso"}
          title="Mi código QR"
        />
      }
      contentStyle={styles.content}
    >
      <FadeIn>
        <Card radius={radii.lg} style={styles.qrCard}>
          <View style={styles.qrHead}>
            <SectionLabel label="Código activo" />
            <View
              style={[
                styles.validTag,
                {
                  backgroundColor: expired || !qr ? colors.alertSoft : colors.okSoft
                }
              ]}
            >
              <Text
                style={[
                  styles.validText,
                  { color: expired || !qr ? colors.alert : colors.ok }
                ]}
              >
                {qr ? (expired ? "EXPIRADO" : `VÁLIDO · ${remainingLabel}`) : "SIN CÓDIGO"}
              </Text>
            </View>
          </View>

          {busy && !qr ? (
            <View style={styles.qrLoading}>
              <ActivityIndicator color={colors.ink} />
            </View>
          ) : (
            <View style={styles.qrBoxWrap}>
              <QrCodeView value={qr?.verification_code ?? ""} size={208} />
            </View>
          )}

          <Text style={styles.code}>{qr ? formatCode(qr.verification_code) : "—"}</Text>
          <Text style={styles.codeSub}>
            {qr ? `código · expira en ${remainingLabel}` : "presiona Generar código"}
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.qrButtons}>
            {qr ? (
              <>
                <View style={styles.flex}>
                  <Button
                    label={copied ? "Copiado ✓" : "Copiar"}
                    size="sm"
                    iconLeft="copy"
                    height={32}
                    onPress={copyCode}
                    disabled={!qr}
                  />
                </View>
                <View style={styles.flex}>
                  <Button
                    label={busy ? "…" : "Generar nuevo"}
                    size="sm"
                    variant="ghost"
                    height={32}
                    onPress={generate}
                    disabled={busy}
                  />
                </View>
              </>
            ) : (
              <View style={styles.flex}>
                <Button
                  label={busy ? "Generando…" : "Generar código"}
                  size="sm"
                  iconLeft="qr"
                  height={32}
                  onPress={generate}
                  disabled={busy}
                />
              </View>
            )}
          </View>
        </Card>
      </FadeIn>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 120
  },
  flex: {
    flex: 1
  },
  qrCard: {
    padding: 18,
    alignItems: "center"
  },
  qrHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 12
  },
  validTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999
  },
  validText: {
    fontFamily: family.mono,
    fontSize: 9,
    letterSpacing: 0.5
  },
  qrBoxWrap: {
    width: "100%",
    alignItems: "center"
  },
  qrLoading: {
    width: "100%",
    aspectRatio: 1,
    maxWidth: 240,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    alignItems: "center",
    justifyContent: "center"
  },
  code: {
    fontFamily: family.mono,
    fontSize: 22,
    letterSpacing: 4,
    color: colors.ink,
    marginTop: 14
  },
  codeSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 4
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 8,
    textAlign: "center"
  },
  qrButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    width: "100%"
  }
});
