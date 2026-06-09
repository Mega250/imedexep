import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { directorNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import {
  Doctor,
  fetchDoctor,
  setDoctorActive,
  unlinkDoctorFromInstitution
} from "@/services/api/doctorsApi";
import { fetchInstitutionDoctors } from "@/services/api/secretaryApi";
import { ApiError } from "@/services/api/client";
import { confirmAction } from "@/utils/confirm";
import { colors, radii, shadow } from "@/theme/tokens";
import { family } from "@/theme/typography";

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function CardHead({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.cardHead}>
      <Text style={styles.cardTitle}>{title}</Text>
      {action ? <Text style={styles.cardAction}>{action}</Text> : null}
    </View>
  );
}

export function DirDoctorDetailDesktopPage(): ReactNode {
  const params = useLocalSearchParams<{ doctorId?: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const id = params.doctorId ? Number(params.doctorId) : null;
        if (id && !Number.isNaN(id)) {
          const d = await fetchDoctor(id);
          if (alive) {
            setDoctor(d);
            setActive(d.is_active ?? true);
          }
        } else {
          const list = await fetchInstitutionDoctors();
          const first = list[0] ?? null;
          if (alive) {
            setDoctor(first);
            setActive(first?.is_active ?? true);
          }
        }
      } catch {
        if (alive) setError("No pudimos cargar la información del médico.");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [params.doctorId]);

  async function handleToggleActive() {
    if (!doctor || busy) return;
    setBusy(true);
    setActionError(null);
    try {
      const res = await setDoctorActive(doctor.id, !active);
      setActive(res.is_active);
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError("No pudimos actualizar el estado del médico.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleUnlink() {
    if (!doctor || busy) return;
    const ok = await confirmAction(
      "Desvincular médico",
      "El médico dejará de pertenecer a tu clínica. ¿Continuar?",
      { confirmLabel: "Desvincular", destructive: true }
    );
    if (!ok) return;
    setBusy(true);
    setActionError(null);
    try {
      await unlinkDoctorFromInstitution(doctor.id);
      goToScreen("dir-doctors");
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else {
        setActionError("No pudimos desvincular al médico.");
      }
      setBusy(false);
    }
  }

  const titleName = doctor ? `${doctor.first_name} ${doctor.last_name}` : "Médico";

  return (
    <DesktopShell
      nav={directorNav}
      activeScreen="dir-doctors"
      role="director"
      roleBadge="Director"
      title={titleName}
      eyebrow="← Médicos · detalle"
      topBarRight={
        <View style={styles.topActions}>
          <Button
            label="Volver"
            variant="ghost"
            size="sm"
            block={false}
            height={42}
            radius={radii.md}
            onPress={() => goToScreen("dir-doctors")}
          />
          {doctor ? (
            <>
              <Button
                label={active ? "Suspender" : "Reactivar"}
                variant={active ? "ghost" : "accent"}
                size="sm"
                block={false}
                height={42}
                radius={radii.md}
                onPress={handleToggleActive}
                disabled={busy}
              />
              <Button
                label="Desvincular de la clínica"
                variant="ghost"
                size="sm"
                block={false}
                height={42}
                radius={radii.md}
                iconLeft="trash"
                onPress={handleUnlink}
                disabled={busy}
              />
            </>
          ) : null}
        </View>
      }
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : !doctor ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Sin información disponible</Text>
          <Text style={styles.emptyText}>El médico no existe o no tienes acceso.</Text>
        </View>
      ) : (
        <>
          <FadeIn>
            <View style={styles.hero}>
              <RadialBlob
                size={360}
                color={colors.accentBright}
                opacity={0.28}
                edge={70}
                style={styles.heroBlob}
              />
              <View style={styles.heroInner}>
                <View style={styles.heroAvatar}>
                  <Text style={styles.heroAvatarText}>{initials(doctor.first_name, doctor.last_name)}</Text>
                </View>
                <View style={styles.heroBody}>
                  <Text style={styles.heroEyebrow}>Médico · institution</Text>
                  <Text style={styles.heroTitle}>{titleName}</Text>
                  <View style={styles.heroMetaRow}>
                    <Text style={styles.heroMetaMono}>céd. {doctor.general_license}</Text>
                    {doctor.specialty_license ? (
                      <>
                        <View style={styles.heroDivider} />
                        <Text style={styles.heroMetaMono}>esp. {doctor.specialty_license}</Text>
                      </>
                    ) : null}
                  </View>
                </View>
                <View style={styles.heroStatus}>
                  <View style={[styles.heroBadge, !active && styles.heroBadgeOff]}>
                    <Text style={[styles.heroBadgeText, !active && styles.heroBadgeTextOff]}>
                      {active ? "ACTIVO" : "SUSPENDIDO"}
                    </Text>
                  </View>
                  <Text style={styles.heroLogin}>creado {new Date(doctor.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
            </View>
          </FadeIn>

          {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}

          <View style={styles.statRow}>
            <View style={styles.statCard}>
              <Text style={styles.eyebrow}>Cédula general</Text>
              <Text style={styles.statValue}>{doctor.general_license}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.eyebrow}>Cédula especialidad</Text>
              <Text style={styles.statValue}>{doctor.specialty_license ?? "—"}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.eyebrow}>Nivel</Text>
              <Text style={styles.statValue}>{doctor.clearance_level}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.eyebrow}>Teléfono</Text>
              <Text style={styles.statValue}>{doctor.contact_phone ?? "—"}</Text>
            </View>
          </View>

          <View style={styles.twoCols}>
            <View style={styles.card}>
              <CardHead title="Consultorio" />
              <View style={styles.cardPad}>
                <Text style={styles.fieldKey}>Ubicación</Text>
                <Text style={styles.fieldValue}>{doctor.office_location ?? "Sin asignar"}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <CardHead title="Secretarias asignadas" />
              <View style={styles.cardPad}>
                <Text style={styles.fieldKey}>Asignaciones</Text>
                <Text style={styles.fieldValue}>Gestiónalas desde "Asignaciones".</Text>
                <Tappable onPress={() => goToScreen("dir-assigns")} style={styles.assignAction}>
                  <Text style={styles.assignActionText}>Ir a asignaciones →</Text>
                </Tappable>
              </View>
            </View>
          </View>
        </>
      )}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  topActions: {
    flexDirection: "row",
    gap: 6
  },
  hero: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
    paddingHorizontal: 32,
    paddingVertical: 28,
    overflow: "hidden",
    ...shadow.hero
  },
  heroBlob: {
    top: -120,
    right: -90
  },
  heroInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24
  },
  heroAvatar: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: colors.accentBright,
    alignItems: "center",
    justifyContent: "center"
  },
  heroAvatarText: {
    fontFamily: family.serif,
    fontSize: 44,
    color: colors.ink
  },
  heroBody: {
    flex: 1,
    minWidth: 0
  },
  heroEyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.6)"
  },
  heroTitle: {
    fontFamily: family.serif,
    fontSize: 44,
    lineHeight: 44,
    letterSpacing: -0.88,
    color: colors.paper,
    marginTop: 8
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 10,
    flexWrap: "wrap"
  },
  heroMetaMono: {
    fontFamily: family.mono,
    fontSize: 13.5,
    color: "rgba(255,255,255,0.7)"
  },
  heroDivider: {
    width: 1,
    height: 12,
    backgroundColor: "rgba(255,255,255,0.2)"
  },
  heroStatus: {
    alignItems: "flex-end",
    gap: 6
  },
  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.accentBright
  },
  heroBadgeText: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.ink
  },
  heroBadgeOff: {
    backgroundColor: colors.alert
  },
  heroBadgeTextOff: {
    color: colors.paper
  },
  actionError: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 12
  },
  heroLogin: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: "rgba(255,255,255,0.6)"
  },
  eyebrow: {
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: "uppercase",
    color: colors.ink3
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 18
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 150,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  statValue: {
    fontFamily: family.medium,
    fontSize: 22,
    letterSpacing: -0.5,
    color: colors.ink,
    marginTop: 6,
    lineHeight: 26
  },
  twoCols: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 18
  },
  card: {
    flexGrow: 1,
    flexBasis: 340,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden",
    alignSelf: "flex-start"
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  cardPad: {
    padding: 18
  },
  fieldKey: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  fieldValue: {
    fontFamily: family.mono,
    fontSize: 13.5,
    color: colors.ink,
    marginTop: 6
  },
  assignAction: {
    marginTop: 12,
    alignSelf: "flex-start"
  },
  assignActionText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.accentDeep
  },
  center: {
    paddingVertical: 60,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    paddingVertical: 24,
    textAlign: "center"
  },
  emptyCard: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    alignItems: "center",
    gap: 6
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 15,
    color: colors.ink
  },
  emptyText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    textAlign: "center"
  }
});
