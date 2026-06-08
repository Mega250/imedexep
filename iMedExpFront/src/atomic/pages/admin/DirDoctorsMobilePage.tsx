import { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Tappable } from "@/atomic/atoms/Tappable";
import { FAB } from "@/atomic/molecules/FAB";
import { IconTabBar } from "@/atomic/organisms/IconTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { directorTabs } from "@/navigation/tabConfigs";
import { goToScreen } from "@/navigation/screenRouter";
import { Doctor } from "@/services/api/doctorsApi";
import { fetchInstitutionDoctors } from "@/services/api/secretaryApi";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

function initials(first: string, last: string): string {
  return `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();
}

function Header({ count }: { count: number }): ReactNode {
  return <ScreenTopBar sub={`${count} médico${count === 1 ? "" : "s"} en la clínica`} title="Mis médicos" />;
}

export function DirDoctorsMobilePage() {
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

  const count = doctors?.length ?? 0;

  return (
    <MobileScreen
      tabBar={<IconTabBar tabs={directorTabs} active={1} />}
      header={<Header count={count} />}
      floating={<FAB icon="send" label="Invitar" onPress={() => goToScreen("dir-invites-mob")} />}
      contentStyle={styles.content}
    >
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accentDeep} />
        </View>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : !doctors || doctors.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Sin médicos registrados</Text>
          <Text style={styles.emptyText}>Envía una invitación para sumar al primero.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {doctors.map((d, index) => (
            <FadeIn key={d.id} delay={index * 40}>
              <Tappable
                style={styles.row}
                onPress={() => goToScreen("dir-doc-det-mob", { doctorId: d.id })}
              >
                <Avatar
                  initials={initials(d.first_name, d.last_name)}
                  size={36}
                  radius={10}
                  bg={colors.paper4}
                  fg={colors.ink}
                  serif
                  fontSize={13}
                />
                <View style={styles.flex}>
                  <Text style={styles.name}>{`${d.first_name} ${d.last_name}`}</Text>
                  <Text style={styles.sub}>
                    {d.contact_phone ?? "sin teléfono"} · céd. {d.general_license}
                  </Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: colors.okSoft }]}>
                  <Text style={[styles.statusText, { color: colors.ok }]}>activo</Text>
                </View>
              </Tappable>
            </FadeIn>
          ))}
        </View>
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
  list: {
    gap: 6
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md
  },
  name: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  sub: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    marginTop: 2
  },
  statusTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999
  },
  statusText: {
    fontFamily: family.mono,
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: "uppercase"
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
  },
  emptyBox: {
    paddingHorizontal: 14,
    paddingVertical: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    alignItems: "center",
    gap: 4
  },
  emptyTitle: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  emptyText: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    textAlign: "center"
  }
});
