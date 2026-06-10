import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { PatientExtrasTabBar } from "@/atomic/organisms/PatientExtrasTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { usePatient } from "@/state/patientContext";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

const RING_R = 24;
const RING_C = 2 * Math.PI * RING_R;

export function PMedicamentosPage() {
  const { loading, error } = usePatient();

  return (
    <MobileScreen
      tabBar={<PatientExtrasTabBar activeScreen="pat-hist" />}
      header={<ScreenTopBar sub="Asignados por tu médico" title="Medicamentos" />}
      contentStyle={styles.content}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : null}

      <FadeIn>
        <DarkPanel radius={radii.xl} padding={16} blobSize={220} blobTop={-70} blobRight={-50}>
          <View style={styles.heroRow}>
            <View style={styles.flex}>
              <Text style={styles.heroEyebrow}>Adherencia</Text>
              <Text style={styles.heroValue}>—</Text>
              <Text style={styles.heroDelta}>aún sin datos suficientes</Text>
            </View>
            <Svg width={60} height={60} viewBox="0 0 60 60">
              <Circle
                cx={30}
                cy={30}
                r={RING_R}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={6}
                fill="none"
              />
              <Circle
                cx={30}
                cy={30}
                r={RING_R}
                stroke={colors.accentBright}
                strokeWidth={6}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${0 * RING_C} ${RING_C}`}
                strokeDashoffset={RING_C * 0.25}
              />
            </Svg>
          </View>
        </DarkPanel>
      </FadeIn>

      <FadeIn delay={150}>
        <SectionLabel label="Tratamientos activos" style={styles.section} />
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <Icon kind="pill" size={18} color={colors.accentDeep} />
          </View>
          <Text style={styles.emptyTitle}>Sin tratamientos activos.</Text>
          <Text style={styles.emptyNote}>
            Cuando tu médico te asigne medicamentos en una consulta, aparecerán aquí.
          </Text>
          <Text style={styles.emptyHint}>
            ¿Ya tomas algún medicamento? Coméntalo en tu próxima consulta o contacta a tu clínica para registrarlo.
          </Text>
        </View>
      </FadeIn>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 120
  },
  flex: {
    flex: 1
  },
  loading: {
    paddingVertical: 14,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginBottom: 8
  },
  heroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  heroEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)"
  },
  heroValue: {
    fontFamily: family.serifItalic,
    fontSize: 42,
    lineHeight: 44,
    letterSpacing: -0.6,
    color: colors.paper,
    marginTop: 4
  },
  heroDelta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.accentBright,
    letterSpacing: 0.5,
    marginTop: 4
  },
  section: {
    marginTop: 18,
    marginBottom: 8
  },
  emptyCard: {
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.xl,
    padding: 18
  },
  emptyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyTitle: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: -0.4,
    color: colors.ink,
    marginTop: 12
  },
  emptyNote: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    marginTop: 8
  },
  emptyHint: {
    fontFamily: family.mono,
    fontSize: 11,
    lineHeight: 16,
    color: colors.accentDeep,
    marginTop: 10
  }
});
