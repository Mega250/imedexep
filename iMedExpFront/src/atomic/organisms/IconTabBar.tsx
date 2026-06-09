import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { replaceScreen } from "@/navigation/screenRouter";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";

export type TabItem = {
  icon: IconKind;
  label: string;
  screen: string;
};

type IconTabBarProps = {
  tabs: TabItem[];
  active?: number;
  activeScreen?: string;
};

export function IconTabBar({ tabs, active = -1, activeScreen }: IconTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {tabs.map((tab, index) => {
        const on = activeScreen ? tab.screen === activeScreen : index === active;
        return (
          <Tappable
            key={tab.label}
            scaleTo={0.88}
            onPress={() => {
              if (!on) {
                replaceScreen(tab.screen);
              }
            }}
            style={styles.tab}
          >
            <View
              style={[styles.iconBox, { backgroundColor: on ? colors.ink : "transparent" }]}
            >
              <Icon kind={tab.icon} size={16} color={on ? colors.paper : colors.ink3} />
            </View>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
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
    paddingTop: 8,
    paddingHorizontal: 6,
    backgroundColor: "rgba(241,250,254,0.97)",
    borderTopWidth: 1,
    borderTopColor: colors.rule2
  },
  tab: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 2
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    fontSize: 9,
    letterSpacing: 0.3
  }
});
