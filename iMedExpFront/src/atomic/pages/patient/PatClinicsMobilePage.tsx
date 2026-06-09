import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FAB } from "@/atomic/molecules/FAB";
import { PatientExtrasTabBar } from "@/atomic/organisms/PatientExtrasTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { getCurrentPatientId } from "@/services/api/currentPatient";
import {
  PatientInstitution,
  fetchPatientInstitutions,
  setMyInstitutionAccess
} from "@/services/api/patientInstitutionApi";
import { goToScreen } from "@/navigation/screenRouter";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { confirmAction } from "@/utils/confirm";

function shortInitials(value: string): string {
  const parts = value.trim().split(/\s+/).slice(0, 2);
  if (parts.length === 0) {
    return "?";
  }
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function formatDate(value: string): string {
  try {
    const d = new Date(value);
    return d.toLocaleDateString("es-MX", { month: "short", year: "numeric" });
  } catch {
    return value;
  }
}

export function PatClinicsMobilePage() {
  const [items, setItems] = useState<PatientInstitution[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    const patientId = await getCurrentPatientId();
    const data = await fetchPatientInstitutions(patientId);
    setItems(data);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await reload();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "No pudimos cargar tus clínicas.");
          setItems([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function changeAccess(institutionId: number, active: boolean) {
    setError(null);
    try {
      await setMyInstitutionAccess(institutionId, active);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos actualizar el acceso.");
    }
  }

  async function handleUnlink(institutionId: number) {
    const ok = await confirmAction(
      "Desvincular clínica",
      "Perderás el acceso compartido con esta clínica. ¿Continuar?",
      { confirmLabel: "Desvincular", destructive: true }
    );
    if (ok) {
      await changeAccess(institutionId, false);
    }
  }

  const totalActive = items ? items.filter((c) => !c.unlinked_at).length : 0;

  return (
    <MobileScreen
      tabBar={<PatientExtrasTabBar activeScreen="pat-clinics-mob" />}
      header={
        <ScreenTopBar
          sub={items ? `${totalActive} ${totalActive === 1 ? "institución" : "instituciones"} · tú decides qué` : "Cargando…"}
          title="Mis clínicas"
        />
      }
      floating={<FAB icon="qr" label="Mostrar mi QR" onPress={() => goToScreen("pat-qr")} />}
      contentStyle={styles.content}
    >
      <FadeIn>
        <View style={styles.heroCard}>
          <SectionLabel label="Tu expediente es tuyo" />
          <Text style={styles.heroTitle}>Cada clínica que tiene acceso, está aquí.</Text>
          <Text style={styles.heroSub}>Puedes revocar permisos cuando quieras.</Text>
        </View>
      </FadeIn>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {items === null ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : items.length === 0 ? (
        <FadeIn>
          <View style={styles.empty}>
            <Icon kind="shield-2" size={20} color={colors.accentDeep} />
            <Text style={styles.emptyText}>
              Aún no hay clínicas vinculadas a tu expediente.
            </Text>
          </View>
        </FadeIn>
      ) : (
        <View style={styles.list}>
          {items.map((c, index) => {
            const paused = !!c.unlinked_at;
            const principal = !paused && index === 0;
            const name = c.institution_name ?? `Institución #${c.institution_id}`;
            const since = formatDate(c.linked_at);
            return (
              <FadeIn key={c.id} delay={index * 70}>
                <View
                  style={[
                    styles.card,
                    {
                      borderColor: principal ? colors.accent : colors.rule,
                      opacity: paused ? 0.7 : 1
                    }
                  ]}
                >
                  <View style={styles.cardBody}>
                    <View style={styles.cardHead}>
                      <Avatar
                        initials={shortInitials(name)}
                        size={50}
                        radius={14}
                        bg={principal ? colors.accentBright : colors.paper4}
                        fg={colors.ink}
                        serif
                        fontSize={20}
                      />
                      <View style={styles.flex}>
                        <View style={styles.nameRow}>
                          <Text style={styles.name}>{name}</Text>
                          {principal ? (
                            <View style={styles.princTag}>
                              <Text style={styles.princText}>PRINC</Text>
                            </View>
                          ) : null}
                          {paused ? (
                            <View style={styles.archTag}>
                              <Text style={styles.archText}>ARCH</Text>
                            </View>
                          ) : null}
                        </View>
                        <Text style={styles.city}>
                          {c.record_number ? `exp. ${c.record_number} · ` : ""}desde {since}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.permsBox}>
                      <Icon kind="shield-2" size={12} color={colors.accentDeep} />
                      <Text style={styles.permsText}>
                        {paused ? "archivada · sólo lectura" : "expediente completo"}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardFoot}>
                    <Tappable
                      style={[styles.footBtn, styles.footBorder]}
                      onPress={() => goToScreen("pat-qr")}
                    >
                      <Icon kind="qr" size={11} color={colors.ink2} />
                      <Text style={styles.footText}>Mostrar mi QR</Text>
                    </Tappable>
                    {paused ? (
                      <Tappable
                        style={styles.footBtn}
                        onPress={() => changeAccess(c.institution_id, true)}
                      >
                        <Text style={styles.footText}>Reactivar</Text>
                      </Tappable>
                    ) : (
                      <Tappable
                        style={styles.footBtn}
                        onPress={() => handleUnlink(c.institution_id)}
                      >
                        <Icon kind="x" size={11} color={colors.alert} />
                        <Text style={[styles.footText, { color: colors.alert }]}>
                          Desvincular
                        </Text>
                      </Tappable>
                    )}
                  </View>
                </View>
              </FadeIn>
            );
          })}
        </View>
      )}
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
  heroCard: {
    backgroundColor: colors.paper3,
    borderWidth: 1,
    borderColor: colors.accentRule,
    borderRadius: radii.lg,
    padding: 16
  },
  heroTitle: {
    fontFamily: family.serifItalic,
    fontSize: 22,
    lineHeight: 24,
    color: colors.ink,
    marginTop: 4
  },
  heroSub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    lineHeight: 16,
    color: colors.ink3,
    marginTop: 8
  },
  loading: {
    paddingVertical: 30,
    alignItems: "center"
  },
  error: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    marginTop: 12
  },
  empty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg
  },
  emptyText: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink2
  },
  list: {
    gap: 10,
    marginTop: 14
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: "hidden"
  },
  cardBody: {
    padding: 14
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap"
  },
  name: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  princTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.accentBright
  },
  princText: {
    fontFamily: family.mono,
    fontSize: 8.5,
    color: colors.ink,
    letterSpacing: 0.5
  },
  archTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.paper
  },
  archText: {
    fontFamily: family.mono,
    fontSize: 8.5,
    color: colors.ink3,
    letterSpacing: 0.5
  },
  city: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 4
  },
  permsBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: colors.paper,
    borderRadius: 8
  },
  permsText: {
    fontFamily: family.regular,
    fontSize: 11.5,
    color: colors.ink2
  },
  cardFoot: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.rule3
  },
  footBtn: {
    flex: 1,
    height: 38,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5
  },
  footBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.rule3
  },
  footText: {
    fontFamily: family.regular,
    fontSize: 11.5,
    color: colors.ink2
  }
});
