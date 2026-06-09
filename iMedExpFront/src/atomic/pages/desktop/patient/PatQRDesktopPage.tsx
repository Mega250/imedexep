import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { QrCodeView } from "@/atomic/molecules/QrCodeView";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { patientDesktopNavForGender } from "@/navigation/patientNavVisibility";
import { getCurrentPatient } from "@/services/api/currentPatient";
import { QRAccess, generateMyQrAccess } from "@/services/api/qrApi";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

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

export function PatQRDesktopPage() {
  const [patientGender, setPatientGender] = useState<string | null>(null);
  const [patientBloodType, setPatientBloodType] = useState<string | null>(null);
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
    let cancelled = false;
    (async () => {
      try {
        const patient = await getCurrentPatient();
        if (!cancelled) {
          setPatientGender(patient.gender ?? null);
          setPatientBloodType(patient.blood_type ?? null);
        }
      } catch {
        if (!cancelled) {
          setPatientGender(null);
          setPatientBloodType(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = qr ? new Date(qr.expires_at).getTime() - now : 0;
  const remainingLabel = formatRemaining(remainingMs);
  const expired = qr ? remainingMs <= 0 : false;
  const nav = useMemo(() => patientDesktopNavForGender(patientGender), [patientGender]);
  const roleLabel = patientBloodType ? `paciente · ${patientBloodType}` : "paciente";

  const eyebrow = qr
    ? expired
      ? "Código expirado · genera uno nuevo"
      : `Vigencia ${remainingLabel}`
    : "Genera tu QR de acceso temporal";

  const validBg = expired || !qr ? colors.alertSoft : colors.okSoft;
  const validFg = expired || !qr ? colors.alert : colors.ok;
  const validLabel = qr
    ? expired
      ? "EXPIRADO"
      : `VÁLIDO · ${remainingLabel}`
    : "SIN CÓDIGO";
  const generateLabel = busy ? "Generando…" : qr ? "Generar nuevo" : "Generar código";

  return (
    <DesktopShell
      nav={nav}
      activeScreen="pat-qr"
      role={roleLabel}
      roleBadge="Paciente"
      title="Mi código QR"
      eyebrow={eyebrow}
      searchPlaceholder="Buscar acceso…"
      topBarRight={
        <Button
          label={generateLabel}
          variant="accent"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft="qr"
          onPress={generate}
          disabled={busy}
        />
      }
    >
      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      <FadeIn>
        <View style={styles.topRow}>
          <View style={styles.qrCard}>
            <View style={styles.cardHead}>
              <View style={styles.cardHeadInfo}>
                <Text style={styles.panelTitle}>Código activo</Text>
                <Text style={styles.cardHeadSub}>Muéstralo al médico o secretaria</Text>
              </View>
              <View style={[styles.validBadge, { backgroundColor: validBg }]}>
                <Text style={[styles.validBadgeText, { color: validFg }]}>{validLabel}</Text>
              </View>
            </View>
            <View style={styles.qrBody}>
              <View style={styles.qrFrame}>
                {busy && !qr ? (
                  <ActivityIndicator color={colors.ink} />
                ) : (
                  <QrCodeView value={qr?.verification_code ?? ""} size={236} />
                )}
              </View>
              <Text style={styles.qrCode}>{qr ? formatCode(qr.verification_code) : "—"}</Text>
              <Text style={styles.qrCodeSub}>
                {qr
                  ? expired
                    ? "expirado · genera uno nuevo"
                    : `código · expira en ${remainingLabel}`
                  : "presiona Generar código"}
              </Text>
              <View style={styles.qrActions}>
                <Button
                  label={copied ? "Copiado ✓" : "Copiar código"}
                  variant="ghost"
                  size="sm"
                  block={false}
                  iconLeft="copy"
                  onPress={copyCode}
                  disabled={!qr}
                />
                <Button
                  label={generateLabel}
                  variant="accent"
                  size="sm"
                  block={false}
                  iconLeft="qr"
                  onPress={generate}
                  disabled={busy}
                />
              </View>
            </View>
          </View>

          <View style={styles.asideCol}>
            <View style={styles.panel}>
              <View style={styles.panelHead}>
                <Text style={styles.panelTitle}>Cómo funciona</Text>
                <Text style={styles.panelHeadSub}>El código caduca solo</Text>
              </View>
              <View style={styles.bullets}>
                <Text style={styles.bulletText}>
                  · Cada código es de un solo uso por institución.
                </Text>
                <Text style={styles.bulletText}>
                  · El médico que lo escanea ve sólo lo necesario para tu consulta.
                </Text>
                <Text style={styles.bulletText}>
                  · Si caduca, presiona "Generar nuevo" para obtener uno fresco.
                </Text>
                <Text style={styles.bulletText}>
                  · Tu bitácora de accesos vive en tu expediente.
                </Text>
              </View>
            </View>

            {qr ? (
              <View style={styles.metaCard}>
                <Text style={styles.eyebrow}>Detalle del código</Text>
                <Text style={styles.metaRow}>ID interno · {qr.id}</Text>
                <Text style={styles.metaRow}>
                  Emitido · {new Date(qr.created_at).toLocaleString("es-MX")}
                </Text>
                <Text style={styles.metaRow}>
                  Expira · {new Date(qr.expires_at).toLocaleString("es-MX")}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </FadeIn>
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  errorBanner: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 12
  },
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  topRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14
  },
  qrCard: {
    flexGrow: 1,
    flexBasis: 360,
    minWidth: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  asideCol: {
    flexGrow: 1,
    flexBasis: 320,
    minWidth: 0,
    gap: 14
  },
  cardHead: {
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  cardHeadInfo: {
    flexShrink: 1,
    minWidth: 0
  },
  panelTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  cardHeadSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  validBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999
  },
  validBadgeText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.76
  },
  qrBody: {
    padding: 28,
    alignItems: "center"
  },
  qrFrame: {
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center"
  },
  qrCode: {
    fontFamily: family.mono,
    fontSize: 28,
    letterSpacing: 5.04,
    color: colors.ink,
    marginTop: 18
  },
  qrCodeSub: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 6
  },
  qrActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 22
  },
  panel: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  panelHead: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  panelHeadSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  },
  bullets: {
    padding: 18,
    gap: 8
  },
  bulletText: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink2,
    lineHeight: 18
  },
  metaCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    padding: 18,
    gap: 6
  },
  metaRow: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink2
  }
});
