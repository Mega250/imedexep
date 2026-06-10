import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Avatar } from "@/atomic/atoms/Avatar";
import { Badge } from "@/atomic/atoms/Badge";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { Logo } from "@/atomic/atoms/Logo";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DesktopNavItem } from "@/navigation/desktopNavConfigs";
import { goToScreen, replaceScreen } from "@/navigation/screenRouter";
import { useBlockedScreens } from "@/state/blockedScreens";
import { useTourTarget } from "@/state/onboarding";
import { loadSession } from "@/state/sessionStore";
import { fetchAppointments } from "@/services/api/appointmentsApi";
import { logout as performLogout } from "@/services/api/authedRequest";
import { getCurrentDoctorId } from "@/services/api/currentDoctor";
import { fetchPatientsList } from "@/services/api/patientsApi";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

type DesktopSidebarProps = {
  nav: DesktopNavItem[];
  activeScreen: string;
  role: string;
  roleBadge?: string;
};

function deriveInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "··";
}

function deriveDisplayName(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local
    .split(/[._-]/)
    .map((p) => p.replace(/\d+$/, ""))
    .filter(Boolean)
    .filter((p) => !/^\d+$/.test(p));
  const source = parts.length ? parts : [local];
  return source
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ") || email;
}

type MenuItem = {
  key: string;
  label: string;
  icon: IconKind;
  onPress: () => void;
  destructive?: boolean;
};

export function DesktopSidebar({ nav, activeScreen, role, roleBadge = "Médico" }: DesktopSidebarProps) {
  const [email, setEmail] = useState<string>("");
  const [profileName, setProfileName] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dynamicCounts, setDynamicCounts] = useState<Record<string, number>>({});
  const blockedScreens = useBlockedScreens();
  const visibleNav = nav.filter((item) => !blockedScreens.has(item.screen));
  const navTourRef = useTourTarget("nav-desktop"); // ancla del tour en escritorio

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await loadSession();
      if (cancelled || !session.user) {
        return;
      }
      if (session.user.email) {
        setEmail(session.user.email);
      }
      const name = session.user.display_name?.trim();
      if (name) {
        setProfileName(name);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const session = await loadSession();
      if (cancelled) {
        return;
      }
      if (session.user?.role !== "doctor") {
        setDynamicCounts({});
        return;
      }

      const patientsTotalPromise = fetchPatientsList({ page: 1, limit: 1 })
        .then((data) => data.total)
        .catch(() => null);
      const doctorId = await getCurrentDoctorId().catch(() => null);
      const agendaTotalPromise = doctorId
        ? fetchAppointments({ doctor_id: doctorId, page: 1, limit: 1 })
            .then((data) => data.total)
            .catch(() => null)
        : Promise.resolve(null);
      const [patientsTotal, agendaTotal] = await Promise.all([
        patientsTotalPromise,
        agendaTotalPromise
      ]);

      if (!cancelled) {
        const next: Record<string, number> = {};
        if (patientsTotal !== null) {
          next["dsk-patients"] = patientsTotal;
        }
        if (agendaTotal !== null) {
          next["dsk-agenda"] = agendaTotal;
        }
        setDynamicCounts(next);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolvedName = profileName || (email ? deriveDisplayName(email) : "");
  const initials = resolvedName ? deriveInitials(resolvedName) : "··";
  const displayName = resolvedName || "Sin sesión";

  const closeMenu = () => setMenuOpen(false);

  const menuItems: MenuItem[] = [
    {
      key: "accessibility",
      label: "Accesibilidad",
      icon: "eye",
      onPress: () => {
        closeMenu();
        goToScreen("settings");
      }
    },
    {
      key: "logout",
      label: "Cerrar sesión",
      icon: "logout",
      destructive: true,
      onPress: async () => {
        closeMenu();
        await performLogout();
      }
    }
  ];

  return (
    <View ref={navTourRef} style={styles.sidebar}>
      <View style={styles.logoRow}>
        <Logo height={26} width={72} />
        <Badge
          label={roleBadge}
          bg={colors.paper3}
          fg={colors.accentDeep}
          border={colors.paper3}
          fontSize={9}
          mono
          uppercase
        />
      </View>
      <View style={styles.nav}>
        {visibleNav.map((item) => {
          const active = item.screen === activeScreen;
          const count = dynamicCounts[item.screen] ?? item.count;
          return (
            <Tappable
              key={item.screen}
              onPress={() => replaceScreen(item.screen)}
              scaleTo={0.97}
              style={[styles.navRow, active && styles.navRowActive]}
            >
              <Icon
                kind={item.icon}
                size={16}
                color={active ? colors.paper : colors.ink3}
                strokeWidth={active ? 2 : 1.5}
              />
              <Text
                style={[styles.navLabel, active && styles.navLabelActive]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.label}
              </Text>
              {count != null && (
                <View style={[styles.count, active && styles.countActive]}>
                  <Text
                    style={[styles.countText, active && styles.countTextActive]}
                    numberOfLines={1}
                  >
                    {typeof count === "number" && count > 99 ? "99+" : count}
                  </Text>
                </View>
              )}
            </Tappable>
          );
        })}
      </View>
      <View style={styles.userZone}>
        {menuOpen && (
          <View style={styles.menuCard}>
            {menuItems.map((item) => (
              <Tappable
                key={item.key}
                onPress={item.onPress}
                scaleTo={0.98}
                style={styles.menuItem}
              >
                <Icon
                  kind={item.icon}
                  size={14}
                  color={item.destructive ? colors.alert : colors.ink3}
                  strokeWidth={1.6}
                />
                <Text style={[styles.menuLabel, item.destructive && styles.menuLabelDanger]}>
                  {item.label}
                </Text>
              </Tappable>
            ))}
          </View>
        )}
        <Tappable
          onPress={() => setMenuOpen((v) => !v)}
          scaleTo={0.98}
          style={[styles.userCard, menuOpen && styles.userCardOpen]}
        >
          <Avatar size={34} initials={initials} />
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.userRole} numberOfLines={1}>{role}</Text>
          </View>
          <Icon
            kind={menuOpen ? "chev-u" : "chev-d"}
            size={14}
            color={colors.ink3}
            strokeWidth={1.6}
          />
        </Tappable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    flexShrink: 0,
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: colors.rule2,
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 14
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 40,
    marginBottom: 20,
    paddingHorizontal: 4
  },
  nav: {
    flex: 1,
    gap: 2
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 42,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: radii.md,
    overflow: "hidden"
  },
  navRowActive: {
    backgroundColor: colors.ink
  },
  navLabel: {
    flex: 1,
    minWidth: 0,
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink2
  },
  navLabelActive: {
    fontFamily: family.medium,
    color: colors.paper
  },
  count: {
    minWidth: 20,
    maxWidth: 36,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 99,
    backgroundColor: colors.paper2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  countActive: {
    backgroundColor: "rgba(255,255,255,0.15)"
  },
  countText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3
  },
  countTextActive: {
    color: colors.paper
  },
  userZone: {
    marginTop: 8
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.rule2,
    borderRadius: radii.md
  },
  userCardOpen: {
    backgroundColor: colors.paper
  },
  userInfo: {
    flex: 1,
    minWidth: 0
  },
  userName: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  userRole: {
    ...text.eyebrow,
    fontSize: 9,
    color: colors.ink3,
    marginTop: 1
  },
  menuCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule2,
    borderRadius: radii.md,
    paddingVertical: 6,
    marginBottom: 6,
    ...shadow.card
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  menuLabel: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink2
  },
  menuLabelDanger: {
    color: colors.alert,
    fontFamily: family.medium
  }
});
