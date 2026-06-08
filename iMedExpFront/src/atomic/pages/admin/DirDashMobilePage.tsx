import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { FAB } from "@/atomic/molecules/FAB";
import { Section } from "@/atomic/molecules/Section";
import { StatTile } from "@/atomic/molecules/StatTile";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { directorTabs } from "@/navigation/tabConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { fetchPatientsList } from "@/services/api/patientsApi";
import {
  fetchInstitutionDoctors,
  fetchSecretaries,
  fetchSecretaryAssignments
} from "@/services/api/secretaryApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type DashStats = {
  doctors: number;
  secretaries: number;
  patients: number;
  assignments: number;
};

export function DirDashMobilePage() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [docs, secs, patList, assigns] = await Promise.all([
          fetchInstitutionDoctors(),
          fetchSecretaries(),
          fetchPatientsList({ limit: 1 }),
          fetchSecretaryAssignments()
        ]);
        if (!alive) return;
        setStats({
          doctors: docs.length,
          secretaries: secs.length,
          patients: patList.total,
          assignments: assigns.length
        });
      } catch {
        if (!alive) return;
        setError("No pudimos cargar los datos de la clínica.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  const tiles: [string, string, string, boolean][] = stats
    ? [
        ["Médicos activos", String(stats.doctors), "registrados en la clínica", false],
        ["Pacientes", String(stats.patients), "vinculados a la institución", false],
        ["Secretarias", String(stats.secretaries), `${stats.assignments} asignaciones`, false],
        ["Asignaciones", String(stats.assignments), "pares médico ↔ sec.", false]
      ]
    : [];

  return (
    <MobileScreen
      tabBar={<IconTabBar tabs={directorTabs} active={0} />}
      header={<ScreenTopBar sub="Resumen de tu clínica" title="Tu clínica" />}
      floating={<FAB icon="send" label="Invitar médico" onPress={() => goToScreen("dir-invites-mob")} />}
      contentStyle={styles.content}
    >
      <FadeIn>
        <DarkPanel radius={radii.lg} padding={18} blobSize={220} blobTop={-80} blobRight={-60}>
          <Text style={styles.heroEyebrow}>Director · institution_admin</Text>
          <Text style={styles.heroTitle}>
            {stats ? `${stats.doctors} médicos\n${stats.secretaries} secretarias\n${stats.patients} pacientes` : "Cargando…"}
          </Text>
          <View style={styles.heroButtons}>
            <View style={styles.flex}>
              <Button label="Invitar médico" variant="bright" height={36} onPress={() => goToScreen("dir-invites-mob")} />
            </View>
            <View style={styles.flex}>
              <Button label="+ Secretaria" variant="darkGhost" height={36} onPress={() => goToScreen("dir-secs-mob")} />
            </View>
          </View>
        </DarkPanel>
      </FadeIn>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <FadeIn delay={70}>
            <View style={styles.statGrid}>
              {tiles.map(([k, n, s, alert]) => (
                <StatTile
                  key={k}
                  label={k}
                  value={n}
                  sub={s}
                  valueColor={alert ? colors.alert : colors.ink}
                  style={styles.statCell}
                />
              ))}
            </View>
          </FadeIn>

          <FadeIn delay={120}>
            <Section title="Actividad reciente">
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Sin actividad registrada aún.</Text>
              </View>
            </Section>
          </FadeIn>

          <FadeIn delay={170}>
            <Section title="Invitaciones pendientes" action="Ir →">
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Aún no enviaste invitaciones.</Text>
              </View>
            </Section>
          </FadeIn>
        </>
      )}
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 130
  },
  flex: {
    flex: 1
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
    lineHeight: 34,
    color: colors.paper,
    marginTop: 6
  },
  heroButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14
  },
  statCell: {
    width: "48%",
    maxWidth: "48%",
    flexBasis: "48%",
    flexGrow: 0,
    flexShrink: 0
  },
  emptyBox: {
    paddingHorizontal: 14,
    paddingVertical: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    alignItems: "center"
  },
  emptyText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  center: {
    paddingVertical: 40,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    paddingVertical: 18,
    textAlign: "center"
  }
});
