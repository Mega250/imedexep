import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { directorNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { fetchPatientsList } from "@/services/api/patientsApi";
import {
  fetchInstitutionDoctors,
  fetchSecretaries,
  fetchSecretaryAssignments
} from "@/services/api/secretaryApi";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

type DashStats = {
  doctors: number;
  secretaries: number;
  assignments: number;
  patients: number;
};

function StatCard({ k, n, sub, tone }: { k: string; n: string; sub: string; tone?: "alert" }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.eyebrow}>{k}</Text>
      <Text style={[styles.statValue, tone === "alert" && { color: colors.alert }]}>{n}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </View>
  );
}

export function DirDashDesktopPage() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [docs, secs, assigns, patList] = await Promise.all([
          fetchInstitutionDoctors(),
          fetchSecretaries(),
          fetchSecretaryAssignments(),
          fetchPatientsList({ limit: 1 })
        ]);
        if (!alive) return;
        setStats({
          doctors: docs.length,
          secretaries: secs.length,
          assignments: assigns.length,
          patients: patList.total
        });
      } catch {
        if (alive) setError("No pudimos cargar los datos de la clínica.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <DesktopShell
      nav={directorNav}
      activeScreen="dir-dash"
      role="director"
      roleBadge="Director"
      title="Tu clínica"
      eyebrow="Resumen operativo · institution_admin"
      searchPlaceholder="Buscar médico, secretaria…"
      topBarRight={
        <Button
          label="Invitar médico"
          variant="accent"
          size="sm"
          block={false}
          height={42}
          radius={radii.md}
          iconLeft="send"
          onPress={() => goToScreen("dir-invites")}
        />
      }
    >
      <FadeIn>
        <View style={styles.heroRow}>
          <View style={styles.heroCard}>
            <RadialBlob size={360} color="rgba(0,180,216,0.32)" style={styles.heroBlob} />
            <View style={styles.heroInner}>
              <Text style={styles.heroEyebrow}>Resumen operativo</Text>
              <Text
                style={styles.heroTitle}
                numberOfLines={3}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {stats
                  ? `${stats.doctors} médicos\n${stats.secretaries} secretarias\n${stats.patients} pacientes`
                  : "Cargando…"}
              </Text>
              <View style={styles.heroActions}>
                <Tappable onPress={() => goToScreen("dir-invites")}>
                  <View style={styles.heroPrimaryBtn}>
                    <Text style={styles.heroPrimaryText}>Invitar médico</Text>
                  </View>
                </Tappable>
                <Tappable onPress={() => goToScreen("dir-secs")}>
                  <View style={styles.heroGhostBtn}>
                    <Text style={styles.heroGhostText}>Crear secretaria</Text>
                  </View>
                </Tappable>
              </View>
            </View>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.eyebrow}>Médicos</Text>
            <Text style={styles.statValue}>{stats?.doctors ?? "—"}</Text>
            <Text style={styles.statSub}>registrados</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.eyebrow}>Asignaciones</Text>
            <Text style={styles.statValue}>{stats?.assignments ?? "—"}</Text>
            <Text style={styles.statSub}>pares activos</Text>
          </View>
        </View>
      </FadeIn>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : stats ? (
        <View style={styles.statRow}>
          <StatCard k="Secretarias" n={String(stats.secretaries)} sub="cuentas activas" />
          <StatCard k="Asignaciones" n={String(stats.assignments)} sub="médico ↔ sec." />
          <StatCard k="Médicos" n={String(stats.doctors)} sub="institución" />
          <StatCard k="Pacientes" n={String(stats.patients)} sub="vinculados" />
        </View>
      ) : null}

      <View style={styles.mainCols}>
        <View style={styles.activityCard}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Actividad reciente</Text>
          </View>
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyText}>Aún no hay actividad reciente.</Text>
          </View>
        </View>

        <View style={styles.invitesCard}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Invitaciones</Text>
            <Text style={styles.cardAction} onPress={() => goToScreen("dir-invites")}>Ir →</Text>
          </View>
          <View style={styles.emptyBlock}>
            <Text style={styles.emptyText}>Envía tu primera invitación desde "Invitaciones".</Text>
          </View>
          <View style={styles.inviteFooter}>
            <Button
              label="Nueva invitación"
              variant="ghost"
              size="sm"
              iconLeft="plus"
              onPress={() => goToScreen("dir-invites")}
            />
          </View>
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
  heroRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  heroCard: {
    flexGrow: 1.4,
    flexBasis: 360,
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 26,
    paddingVertical: 24,
    overflow: "hidden",
    ...Platform.select({
      web: { boxShadow: "0px 20px 20px rgba(3,4,94,0.45)" },
      default: {
        shadowColor: "#03045E",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
        elevation: 10
      }
    })
  },
  heroBlob: {
    top: -120,
    right: -80
  },
  heroInner: {
    position: "relative"
  },
  heroEyebrow: {
    ...text.eyebrow,
    color: "rgba(255,255,255,0.6)"
  },
  heroTitle: {
    fontFamily: family.serif,
    fontSize: 44,
    lineHeight: 51,
    letterSpacing: -0.88,
    color: colors.paper,
    marginTop: 8
  },
  heroActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18
  },
  heroPrimaryBtn: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: radii.md,
    backgroundColor: colors.accentBright,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  heroPrimaryText: {
    fontFamily: family.semibold,
    fontSize: 13,
    color: colors.ink
  },
  heroGhostBtn: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  heroGhostText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.paper
  },
  heroStat: {
    flexGrow: 1,
    flexBasis: 180,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 180,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  statValue: {
    fontFamily: family.medium,
    fontSize: 28,
    letterSpacing: -0.84,
    color: colors.ink,
    marginTop: 6,
    lineHeight: 28
  },
  statSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 6
  },
  mainCols: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 18
  },
  activityCard: {
    flexGrow: 1.3,
    flexBasis: 380,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden"
  },
  invitesCard: {
    flexGrow: 1,
    flexBasis: 300,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden",
    alignSelf: "flex-start"
  },
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  cardTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  cardAction: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.accentDeep
  },
  inviteFooter: {
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  emptyBlock: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: "center"
  },
  emptyText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    textAlign: "center"
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
