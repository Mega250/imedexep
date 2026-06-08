import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { DESKTOP_BREAKPOINT } from "@/navigation/desktopVariants";
import { replaceScreen } from "@/navigation/screenRouter";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";

const TABS: { icon: IconKind; label: string; screen: string }[] = [
  { icon: "home", label: "Inicio", screen: "pat-inicio" },
  { icon: "folder", label: "Historial", screen: "pat-hist" },
  { icon: "cal", label: "Citas", screen: "pat-citas" },
  { icon: "pill", label: "Meds", screen: "pat-meds" },
  { icon: "user", label: "Perfil", screen: "pat-perfil" }
];

type PatientTabBarProps = {
  active: number;
};

export function PatientTabBar({ active }: PatientTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  if (Platform.OS === "web" && width >= DESKTOP_BREAKPOINT) {
    return null;
  }

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {TABS.map((tab, index) => {
        const on = index === active;
        return (
          <Tappable
            key={tab.label}
            scaleTo={0.9}
            onPress={() => {
              if (!on) {
                replaceScreen(tab.screen);
              }
            }}
            style={styles.tab}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: on ? colors.ink : "transparent" }
              ]}
            >
              <Icon kind={tab.icon} size={18} color={on ? colors.paper : colors.ink3} />
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                {
                  color: on ? colors.ink : colors.ink3,
                  fontFamily: on ? family.monoMedium : family.mono
                }
              ]}
            >
              {tab.label}
            </Text>
          </Tappable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 8,
    paddingHorizontal: 10,
    minHeight: 64,
    backgroundColor: "rgba(241,250,254,0.97)",
    borderTopWidth: 1,
    borderTopColor: colors.rule2
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 8
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    fontSize: 11,
    letterSpacing: 0.4
  }
});
