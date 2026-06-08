import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopShell } from "@/atomic/templates/DesktopShell";
import { directorNav } from "@/navigation/desktopNavConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { Doctor } from "@/services/api/doctorsApi";
import { fetchInstitutionDoctors } from "@/services/api/secretaryApi";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

export function DirDoctorsDesktopPage() {
  const [doctors, setDoctors] = useState<Doctor[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetchInstitutionDoctors()
      .then((list) => {
        if (alive) setDoctors(list);
      })
      .catch(() => {
        if (alive) setError("No pudimos cargar los médicos.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const total = doctors?.length ?? 0;

  return (
    <DesktopShell
      nav={directorNav}
      activeScreen="dir-doctors"
      role="director"
      roleBadge="Director"
      title="Médicos de la clínica"
      eyebrow={`${total} médico${total === 1 ? "" : "s"} en la institución`}
      searchPlaceholder="Buscar médico, cédula, especialidad…"
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
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Total</Text>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statSub}>en la clínica</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Con teléfono</Text>
            <Text style={styles.statValue}>{(doctors ?? []).filter((d) => d.contact_phone).length}</Text>
            <Text style={styles.statSub}>contacto disponible</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Cédula esp.</Text>
            <Text style={styles.statValue}>{(doctors ?? []).filter((d) => d.specialty_license).length}</Text>
            <Text style={styles.statSub}>especialistas</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>Consultorio</Text>
            <Text style={styles.statValue}>{(doctors ?? []).filter((d) => d.office_location).length}</Text>
            <Text style={styles.statSub}>con ubicación</Text>
          </View>
        </View>
      </FadeIn>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : !doctors || doctors.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Sin médicos registrados</Text>
          <Text style={styles.emptyText}>Envía una invitación desde el botón superior.</Text>
        </View>
      ) : (
        <View style={styles.tableCard}>
          <View style={styles.tableHead}>
            <Text style={[styles.headCell, styles.colDoc]}>Médico</Text>
            <Text style={[styles.headCell, styles.colSpec]}>Cédula esp.</Text>
            <Text style={[styles.headCell, styles.colCed]}>Cédula gen.</Text>
            <Text style={[styles.headCell, styles.colPhone]}>Teléfono</Text>
            <Text style={[styles.headCell, styles.colState]}>Estado</Text>
            <View style={styles.colMore} />
          </View>
          {doctors.map((d, i) => (
            <Tappable key={d.id} onPress={() => goToScreen("dir-doctor-detail", { doctorId: d.id })} scaleTo={0.995}>
              <View
                style={[
                  styles.tableRow,
                  { borderBottomWidth: i < doctors.length - 1 ? 1 : 0 }
                ]}
              >
                <View style={[styles.colDoc, styles.docCell]}>
                  <View style={styles.rowAvatar}>
                    <Text style={styles.rowAvatarText}>{initials(d.first_name, d.last_name)}</Text>
                  </View>
                  <View style={styles.flexShrink}>
                    <Text style={styles.docName} numberOfLines={1} ellipsizeMode="tail">{`${d.first_name} ${d.last_name}`}</Text>
                    <Text style={styles.docSince} numberOfLines={1} ellipsizeMode="tail">
                      desde {new Date(d.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.colSpec, styles.specText]} numberOfLines={1} ellipsizeMode="tail">{d.specialty_license ?? "—"}</Text>
                <Text style={[styles.colCed, styles.cedText]} numberOfLines={1} ellipsizeMode="tail">{d.general_license}</Text>
                <Text style={[styles.colPhone, styles.cedText]} numberOfLines={1} ellipsizeMode="tail">{d.contact_phone ?? "—"}</Text>
                <View style={styles.colState}>
                  <View
                    style={[
                      styles.stateBadge,
                      { backgroundColor: d.is_active === false ? colors.alertSoft : colors.okSoft }
                    ]}
                  >
                    <Text
                      style={[
                        styles.stateText,
                        { color: d.is_active === false ? colors.alert : colors.ok }
                      ]}
                    >
                      {d.is_active === false ? "INACTIVO" : "ACTIVO"}
                    </Text>
                  </View>
                </View>
                <View style={styles.colMore}>
                  <Icon kind="chev" size={14} color={colors.ink3} />
                </View>
              </View>
            </Tappable>
          ))}
        </View>
      )}
    </DesktopShell>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  statRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
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
  tableCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    overflow: "hidden",
    marginTop: 18
  },
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2
  },
  headCell: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    letterSpacing: 1.05,
    textTransform: "uppercase"
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomColor: colors.rule3
  },
  colDoc: {
    flexGrow: 1.8,
    flexBasis: 0,
    minWidth: 0
  },
  colSpec: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0
  },
  colCed: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0
  },
  colPhone: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0
  },
  colState: {
    flexGrow: 0.9,
    flexBasis: 0,
    minWidth: 0
  },
  colMore: {
    width: 40,
    alignItems: "flex-end"
  },
  docCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  flexShrink: {
    flexShrink: 1,
    minWidth: 0
  },
  rowAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.paper4,
    alignItems: "center",
    justifyContent: "center"
  },
  rowAvatarText: {
    fontFamily: family.serif,
    fontSize: 14,
    color: colors.ink
  },
  docName: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  docSince: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  specText: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink2
  },
  cedText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  stateBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999
  },
  stateText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.57
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
