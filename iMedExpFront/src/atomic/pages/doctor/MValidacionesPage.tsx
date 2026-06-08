import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Badge } from "@/atomic/atoms/Badge";
import { Button } from "@/atomic/atoms/Button";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { RecordFormModal } from "@/atomic/molecules/RecordFormModal";
import { DoctorTabBar } from "@/atomic/organisms/DoctorTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { issueCertificate, openCertificatePdf } from "@/services/api/clinicalExtrasApi";
import { getSelectedPatientId } from "@/services/api/selectedPatient";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

export function MValidacionesPage() {
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
    <MobileScreen
      tabBar={<DoctorTabBar active={5} />}
      header={
        <ScreenTopBar
          sub="Firma electrónica · NOM-024"
          title="Validaciones"
          right={
            <Badge
              label="firma activa"
              bg={colors.paper3}
              fg={colors.accentDeep}
              border={colors.paper3}
              dot={colors.ok}
              uppercase
              fontSize={10}
            />
          }
        />
      }
      contentStyle={styles.content}
    >
      <FadeIn>
        <DarkPanel radius={radii.xl} padding={18} blobSize={220} blobTop={-70} blobRight={-50}>
          <Text style={styles.heroEyebrow}>Pendiente de tu firma</Text>
          <Text style={styles.heroTitle}>Sin documentos{"\n"}para validar.</Text>
          <Text style={styles.heroMeta}>tu bandeja de validación está vacía</Text>
        </DarkPanel>
      </FadeIn>

      <FadeIn delay={80}>
        <SectionLabel label="Cola de validación" style={styles.section} />
        <Card radius={radii.lg}>
          <View style={styles.emptyRow}>
            <View style={styles.queueIcon}>
              <Icon kind="check" size={16} color={colors.accentDeep} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.emptyTitle}>Sin documentos pendientes</Text>
              <Text style={styles.emptyMeta}>
                Cuando recibas resultados de laboratorio o estudios, aparecerán aquí.
              </Text>
            </View>
          </View>
        </Card>
      </FadeIn>

      <FadeIn delay={140}>
        <View style={styles.emitHead}>
          <SectionLabel label="Emitir certificado" />
        </View>
        <Card radius={radii.lg} style={styles.disabledCard}>
          <View style={styles.disabledBody}>
            <Icon kind="pen" size={18} color={colors.accentDeep} />
            <View style={styles.flex}>
              <Text style={styles.disabledTitle}>Emitir certificado</Text>
              <Text style={styles.disabledMeta}>
                {patientId
                  ? `Para el paciente #${patientId} (último canjeado por QR)`
                  : "Escanea el QR de un paciente para emitir su certificado"}
              </Text>
            </View>
          </View>
          {issued ? (
            <View style={styles.issuedRow}>
              <Text style={styles.issuedText}>Emitido: {issued.title}</Text>
              <Button
                label="Ver PDF"
                size="sm"
                block={false}
                height={32}
                iconLeft="doc"
                onPress={() => openCertificatePdf(issued.id).catch(() => {})}
              />
            </View>
          ) : null}
          <Button
            label="Emitir certificado"
            variant="ghost"
            height={36}
            disabled={!patientId}
            onPress={() => setOpen(true)}
          />
        </Card>
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
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 130
  },
  flex: {
    flex: 1
  },
  issuedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10
  },
  issuedText: {
    flex: 1,
    minWidth: 0,
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ok
  },
  heroEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)"
  },
  heroTitle: {
    fontFamily: family.serifItalic,
    fontSize: 32,
    lineHeight: 33,
    letterSpacing: -0.6,
    color: colors.paper,
    marginTop: 8
  },
  heroMeta: {
    fontFamily: family.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 8,
    letterSpacing: 0.3
  },
  section: {
    marginTop: 18,
    marginBottom: 8
  },
  emptyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 16
  },
  queueIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  emptyMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 4
  },
  emitHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: 18,
    marginBottom: 8
  },
  emitCount: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  disabledCard: {
    padding: 14,
    gap: 12
  },
  disabledBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  disabledTitle: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink2
  },
  disabledMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 2
  }
});
