import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { RecordFormModal } from "@/atomic/molecules/RecordFormModal";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNav } from "@/navigation/desktopNavConfigs";
import { issueCertificate, openCertificatePdf } from "@/services/api/clinicalExtrasApi";
import { getSelectedPatientId } from "@/services/api/selectedPatient";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

export function DskValidacionesDesktopPage() {
  const [patientId, setPatientId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [issued, setIssued] = useState<{ id: number; title: string } | null>(null);

  useEffect(() => {
    getSelectedPatientId().then(setPatientId).catch(() => setPatientId(null));
  }, []);

  async function handleIssue(values: Record<string, string>) {
    if (!patientId) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const cert = await issueCertificate({
        patient_id: patientId,
        title: values.title,
        body: values.body
      });
      setIssued({ id: cert.id, title: cert.title });
      setOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No pudimos emitir el certificado.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DesktopShell
      nav={doctorNav}
      activeScreen="dsk-validaciones"
      role="médico"
      roleBadge="Médico"
      title="Validaciones"
      eyebrow="Documentos para tu firma"
      topBarRight={null}
    >
      <FadeIn>
        <View style={styles.heroGrid}>
          <View style={styles.heroDarkCell}>
            <View style={styles.heroDark}>
              <RadialBlob
                size={300}
                color={colors.accentBright}
                opacity={0.32}
                edge={70}
                style={{ top: -100, right: -80 }}
              />
              <View style={styles.heroDarkInner}>
                <Text style={styles.heroEyebrow}>Emitir certificado</Text>
                <View style={styles.heroBigRow}>
                  <Text style={styles.heroBig}>0</Text>
                  <Text style={styles.heroBigMeta}>
                    {patientId
                      ? `para el paciente #${patientId} (último canjeado por QR)`
                      : "escanea el QR de un paciente para emitir su certificado"}
                  </Text>
                </View>
                <View style={styles.heroBtnRow}>
                  <Tappable
                    onPress={() => setOpen(true)}
                    disabled={!patientId}
                    style={styles.heroBtn}
                  >
                    <Text style={styles.heroBtnText}>Emitir certificado</Text>
                    <Icon kind="pen" size={13} color={colors.ink} />
                  </Tappable>
                  {issued ? (
                    <Tappable
                      onPress={() => openCertificatePdf(issued.id).catch(() => {})}
                      style={styles.heroBtnGhost}
                    >
                      <Text style={styles.heroBtnGhostText}>Ver PDF</Text>
                    </Tappable>
                  ) : null}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.heroStatCell}>
            <View style={styles.heroStat}>
              <Text style={styles.eyebrow}>Último emitido</Text>
              <Text style={styles.heroStatValue}>{issued ? `#${issued.id}` : "—"}</Text>
              <Text style={styles.heroStatSub}>
                {issued ? issued.title : "sin certificados en esta sesión"}
              </Text>
            </View>
          </View>

          <View style={styles.heroStatCell}>
            <View style={styles.heroStat}>
              <Text style={styles.eyebrow}>Tu firma electrónica</Text>
              <Text style={styles.heroFirmaTitle}>NOM-024</Text>
              <Text style={styles.heroFirmaSub}>firma activa al emitir el certificado</Text>
            </View>
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={100}>
        <View style={styles.emptyPanel}>
          <Icon kind="doc" size={28} color={colors.ink3} />
          <Text style={styles.emptyTitle}>Sin documentos para validar</Text>
          <Text style={styles.emptySub}>
            Cuando recibas estudios externos o documentos para firma, los verás aquí.
          </Text>
        </View>
      </FadeIn>

      <RecordFormModal
        visible={open}
        title="Emitir certificado"
        submitting={submitting}
        error={formError}
        fields={[
          { key: "title", label: "Título", placeholder: "Ej. Constancia médica", required: true },
          { key: "body", label: "Contenido", placeholder: "Texto del certificado", required: true }
        ]}
        onClose={() => {
          setOpen(false);
          setFormError(null);
        }}
        onSubmit={handleIssue}
      />
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  heroGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  heroDarkCell: {
    flexBasis: "42%",
    flexGrow: 1.4,
    minWidth: 320
  },
  heroDark: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 24,
    paddingVertical: 22,
    overflow: "hidden",
    ...shadow.card
  },
  heroDarkInner: {
    position: "relative"
  },
  heroEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.6)"
  },
  heroBigRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
    marginTop: 6
  },
  heroBig: {
    fontFamily: family.serifItalic,
    fontSize: 64,
    lineHeight: 64,
    letterSpacing: -1.3,
    color: colors.paper
  },
  heroBigMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)"
  },
  heroBtnRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16
  },
  heroBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 38,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    backgroundColor: colors.accentBright
  },
  heroBtnText: {
    fontFamily: family.semibold,
    fontSize: 13,
    color: colors.ink
  },
  heroBtnGhost: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 38,
    paddingHorizontal: 16,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)"
  },
  heroBtnGhostText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.paper
  },
  heroStatCell: {
    flexBasis: "26%",
    flexGrow: 1,
    minWidth: 200
  },
  heroStat: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 18,
    paddingVertical: 16,
    height: "100%"
  },
  heroStatValue: {
    fontFamily: family.medium,
    fontSize: 32,
    letterSpacing: -1,
    color: colors.ink,
    marginTop: 6,
    lineHeight: 32
  },
  heroStatSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 6
  },
  heroFirmaTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink,
    marginTop: 6
  },
  heroFirmaSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 4
  },
  emptyPanel: {
    marginTop: 18,
    padding: 36,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    alignItems: "center",
    gap: 10
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 17,
    color: colors.ink
  },
  emptySub: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink3,
    textAlign: "center",
    maxWidth: 480
  }
});
