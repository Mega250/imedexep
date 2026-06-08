import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { Divider } from "@/atomic/atoms/Divider";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { doctorNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";
import {
  DiagnosisView,
  FieldText,
  StatusPills,
  TreatmentView,
  formatDateTime,
  useConsultaDetalle
} from "@/atomic/pages/doctor/consultaDetalle";

function initials(first: string, last: string): string {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "··";
}

export function DskConsultaDetalleDesktopPage() {
  const { loading, error, consultation, patient, diagnoses, prescription } = useConsultaDetalle();

  const fullName = patient
    ? `${patient.first_name} ${patient.last_name}`
    : consultation
    ? `Consulta #${consultation.id}`
    : "Consulta";

  return (
    <DesktopShell
      nav={doctorNav}
      activeScreen="dsk-consultas"
      role="médico"
      roleBadge="Médico"
      title="Consulta registrada"
      eyebrow={consultation ? formatDateTime(consultation.consulted_at) : "Expediente"}
      topBarRight={
        <Button label="Consultas" variant="ghost" block={false} iconLeft="arrow-l" onPress={() => goToScreen("dsk-consultas")} />
      }
    >
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.accentDeep} />
          <Text style={styles.loadingText}>Cargando consulta…</Text>
        </View>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : consultation ? (
        <View style={styles.wrap}>
          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {patient ? initials(patient.first_name, patient.last_name) : "··"}
              </Text>
            </View>
            <View style={styles.heroMain}>
              <Text style={styles.eyebrow}>Consulta #{consultation.id}</Text>
              <Text style={styles.heroName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
                {fullName}
              </Text>
              <Text style={styles.heroDate}>{formatDateTime(consultation.consulted_at)}</Text>
            </View>
            <StatusPills consultation={consultation} prescription={prescription} />
          </View>

          <View style={styles.columns}>
            <View style={styles.colMain}>
              <View style={styles.card}>
                <SectionLabel label="Nota clínica" style={styles.cardTitle} />
                <View style={styles.noteFields}>
                  <FieldText label="Motivo de consulta" value={consultation.chief_complaint} />
                  <Divider color={colors.rule2} />
                  <FieldText label="Síntomas" value={consultation.symptoms} />
                  <Divider color={colors.rule2} />
                  <FieldText label="Exploración y notas" value={consultation.medical_notes} />
                </View>
              </View>
            </View>

            <View style={styles.colSide}>
              <View style={styles.card}>
                <SectionLabel label={`Diagnósticos · ${diagnoses.length}`} style={styles.cardTitle} />
                {diagnoses.length === 0 ? (
                  <Text style={styles.empty}>Sin diagnósticos registrados.</Text>
                ) : (
                  diagnoses.map((d) => <DiagnosisView key={d.id} d={d} />)
                )}
              </View>

              <View style={styles.card}>
                <SectionLabel label="Receta" style={styles.cardTitle} />
                {!prescription ? (
                  <Text style={styles.empty}>No se emitió receta en esta consulta.</Text>
                ) : (
                  <>
                    {prescription.general_instructions ? (
                      <View style={styles.instructions}>
                        <Text style={styles.instructionsLabel}>Indicaciones generales</Text>
                        <Text style={styles.instructionsText}>{prescription.general_instructions}</Text>
                      </View>
                    ) : null}
                    {prescription.treatments.length === 0 ? (
                      <Text style={styles.empty}>Receta sin medicamentos.</Text>
                    ) : (
                      prescription.treatments.map((t) => <TreatmentView key={t.id} t={t} />)
                    )}
                    <Text style={styles.signature}>
                      {prescription.signed_at
                        ? `Firmada · ${formatDateTime(prescription.signed_at)}`
                        : "Pendiente de firma"}
                      {prescription.doctor_name ? ` · ${prescription.doctor_name}` : ""}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>
      ) : null}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 20
  },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    paddingHorizontal: 28,
    paddingVertical: 24,
    flexWrap: "wrap"
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: {
    fontFamily: family.serifItalic,
    fontSize: 30,
    color: colors.accentDeep
  },
  heroMain: {
    flex: 1,
    minWidth: 200
  },
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  heroName: {
    fontFamily: family.serifItalic,
    fontSize: 40,
    letterSpacing: -1,
    lineHeight: 44,
    color: colors.ink,
    marginTop: 4
  },
  heroDate: {
    fontFamily: family.mono,
    fontSize: 12,
    color: colors.ink3,
    marginTop: 6
  },
  columns: {
    flexDirection: "row",
    gap: 20,
    alignItems: "flex-start",
    flexWrap: "wrap"
  },
  colMain: {
    flexGrow: 1,
    flexBasis: 420,
    minWidth: 320,
    gap: 20
  },
  colSide: {
    flexGrow: 1,
    flexBasis: 340,
    minWidth: 300,
    gap: 20
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    padding: 24
  },
  cardTitle: {
    marginBottom: 16
  },
  noteFields: {
    gap: 16
  },
  empty: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink3
  },
  instructions: {
    gap: 4,
    paddingBottom: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  instructionsLabel: {
    fontFamily: family.mono,
    fontSize: 10.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.ink3
  },
  instructionsText: {
    fontFamily: family.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink
  },
  signature: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 14
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg
  },
  loadingText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink2
  },
  errorBox: {
    padding: 22,
    borderRadius: radii.lg,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule
  },
  errorText: {
    fontFamily: family.regular,
    fontSize: 14,
    color: colors.alert,
    lineHeight: 20
  }
});
