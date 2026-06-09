import { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { DesktopSidebar } from "@/atomic/organisms/DesktopSidebar";
import { DesktopTopBar } from "@/atomic/organisms/DesktopTopBar";
import { DesktopNavItem } from "@/navigation/desktopNavConfigs";
import { colors } from "@/theme/tokens";

type DesktopShellProps = {
  nav: DesktopNavItem[];
  activeScreen: string;
  role: string;
  roleBadge?: string;
  title: string;
  eyebrow?: string;
  /** @deprecated decorative search bar removed; prop kept for compatibility */
  searchPlaceholder?: string;
  /** @deprecated decorative search bar removed; prop kept for compatibility */
  searchValue?: string;
  /** @deprecated decorative search bar removed; prop kept for compatibility */
  onSearchChange?: (value: string) => void;
  /** @deprecated decorative search bar removed; prop kept for compatibility */
  hideSearch?: boolean;
  hasAlert?: boolean;
  topBarRight?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
  subBar?: ReactNode;
  hideTopBar?: boolean;
};

export function DesktopShell({
  nav,
  activeScreen,
  role,
  roleBadge,
  title,
  eyebrow,
  hasAlert = false,
  topBarRight,
  children,
  scroll = true,
  subBar,
  hideTopBar = false
}: DesktopShellProps) {
  const notifNav =
    nav.find((item) => item.icon === "bell" || item.icon === "inbox") ??
    nav.find((item) => item.screen.includes("invites") || item.screen.includes("notifs"));
  const notificationsScreen = notifNav?.screen;

  return (
    <View style={styles.root}>
      <DesktopSidebar nav={nav} activeScreen={activeScreen} role={role} roleBadge={roleBadge} />
      <View style={styles.main}>
        {hideTopBar ? null : (
          <DesktopTopBar
            title={title}
            eyebrow={eyebrow}
            hasAlert={hasAlert}
            right={topBarRight}
            notificationsScreen={notificationsScreen}
          />
        )}
        {subBar}
        {scroll ? (
          <ScrollView
            style={styles.fill}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inner}>{children}</View>
          </ScrollView>
        ) : (
          <View style={[styles.fill, styles.scrollContent]}>
            <View style={styles.inner}>{children}</View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.paper
  },
  main: {
    flex: 1,
    overflow: "hidden"
  },
  fill: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center"
  },
  inner: {
    width: "100%",
    maxWidth: 1160,
    minWidth: 0,
    flexShrink: 1,
    paddingHorizontal: 28,
    paddingVertical: 24,
    paddingBottom: 48
  }
});
