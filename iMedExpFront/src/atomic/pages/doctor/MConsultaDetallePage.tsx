import { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { Divider } from "@/atomic/atoms/Divider";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { SurfaceCard } from "@/atomic/molecules/SurfaceCard";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack, replaceScreen } from "@/navigation/screenRouter";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import {
  DiagnosisView,
  FieldText,
  StatusPills,
  TreatmentView,
  formatDateTime,
  useConsultaDetalle
} from "./consultaDetalle";

function EmptyNote({ text }: { text: string }): ReactNode {
  return <Text style={styles.empty}>{text}</Text>;
}

export function MConsultaDetallePage() {
  const { loading, error, consultation, patient, diagnoses, prescription } = useConsultaDetalle();

  const title = patient
    ? `${patient.first_name} ${patient.last_name}`
    : consultation
    ? `Consulta #${consultation.id}`
    : "Consulta";

  return (
    <MobileScreen
      header={
        <ScreenTopBar
          back="Consultas"
          onBack={() => goBack("mob-consultas")}
          sub="Consulta registrada"
          title={title}
        />
      }
      contentStyle={styles.content}
    >
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {consultation ? (
        <>
          <FadeIn>
            <View style={styles.metaRow}>
              <Text style={styles.metaDate}>{formatDateTime(consultation.consulted_at)}</Text>
              <Text style={styles.metaId}>#{consultation.id}</Text>
            </View>
            <StatusPills consultation={consultation} prescription={prescription} />
          </FadeIn>

          <FadeIn delay={60} style={styles.section}>
            <SurfaceCard title="Nota clínica">
              <View style={styles.noteFields}>
                <FieldText label="Motivo de consulta" value={consultation.chief_complaint} />
                <Divider />
                <FieldText label="Síntomas" value={consultation.symptoms} />
                <Divider />
                <FieldText label="Exploración y notas" value={consultation.medical_notes} />
              </View>
            </SurfaceCard>
          </FadeIn>

          <FadeIn delay={110} style={styles.section}>
            <SurfaceCard title={`Diagnósticos · ${diagnoses.length}`}>
              {diagnoses.length === 0 ? (
                <EmptyNote text="Sin diagnósticos registrados." />
              ) : (
                <View>
                  {diagnoses.map((d) => (
                    <DiagnosisView key={d.id} d={d} />
                  ))}
                </View>
              )}
            </SurfaceCard>
          </FadeIn>

          <FadeIn delay={160} style={styles.section}>
            <SurfaceCard title="Receta">
              {!prescription ? (
                <EmptyNote text="No se emitió receta en esta consulta." />
              ) : (
                <View>
                  {prescription.general_instructions ? (
                    <View style={styles.instructions}>
                      <Text style={styles.instructionsLabel}>Indicaciones generales</Text>
                      <Text style={styles.instructionsText}>{prescription.general_instructions}</Text>
                    </View>
                  ) : null}
                  {prescription.treatments.length === 0 ? (
                    <EmptyNote text="Receta sin medicamentos." />
                  ) : (
                    prescription.treatments.map((t) => <TreatmentView key={t.id} t={t} />)
                  )}
                  <Text style={styles.signature}>
                    {prescription.signed_at
                      ? `Firmada · ${formatDateTime(prescription.signed_at)}`
                      : "Pendiente de firma"}
                    {prescription.doctor_name ? ` · ${prescription.doctor_name}` : ""}
                  </Text>
                </View>
              )}
            </SurfaceCard>
          </FadeIn>

          <View style={styles.footer}>
            <Button
              label="Volver a consultas"
              variant="ghost"
              onPress={() => replaceScreen("mob-consultas")}
            />
          </View>
        </>
      ) : null}
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 40
  },
  loading: {
    paddingVertical: 28,
    alignItems: "center"
  },
  errorBox: {
    marginTop: 16,
    padding: 18,
    borderRadius: radii.md,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule
  },
  errorText: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.alert,
    lineHeight: 19
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12
  },
  metaDate: {
    fontFamily: family.mono,
    fontSize: 11.5,
    color: colors.ink2
  },
  metaId: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  section: {
    marginTop: 14
  },
  noteFields: {
    gap: 12
  },
  empty: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink3
  },
  instructions: {
    gap: 4,
    paddingBottom: 12,
    marginBottom: 4,
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
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.ink
  },
  signature: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 12
  },
  footer: {
    marginTop: 22
  }
});
