import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Tappable } from "@/atomic/atoms/Tappable";
import { replaceScreen } from "@/navigation/screenRouter";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";

export type SubTab = {
  label: string;
  screen: string;
};

type DesktopSubTabsProps = {
  tabs: SubTab[];
  activeScreen: string;
};

export function DesktopSubTabs({ tabs, activeScreen }: DesktopSubTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.bar}
      style={styles.scroll}
    >
      {tabs.map((tab) => {
        const active = tab.screen === activeScreen;
        return (
          <Tappable
            key={tab.screen}
            onPress={() => replaceScreen(tab.screen)}
            scaleTo={0.97}
            style={styles.tab}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.label, active && styles.labelActive]}
            >
              {tab.label}
            </Text>
            {active && <View style={styles.underline} />}
          </Tappable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
    backgroundColor: colors.white,
    flexGrow: 0
  },
  bar: {
    flexDirection: "row",
    paddingHorizontal: 24
  },
  tab: {
    paddingHorizontal: 2,
    paddingVertical: 12,
    marginRight: 24,
    alignItems: "center"
  },
  label: {
    fontFamily: family.regular,
    fontSize: 13.5,
    color: colors.ink3
  },
  labelActive: {
    fontFamily: family.medium,
    color: colors.ink
  },
  underline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 99,
    backgroundColor: colors.ink
  }
});
