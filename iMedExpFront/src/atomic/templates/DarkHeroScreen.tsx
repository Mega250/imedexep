import { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { colors } from "@/theme/tokens";

type DarkHeroScreenProps = {
  heroChildren: ReactNode;
  children: ReactNode;
  tabBar?: ReactNode;
  contentPaddingBottom?: number;
};

export function DarkHeroScreen({
  heroChildren,
  children,
  tabBar,
  contentPaddingBottom = 120
}: DarkHeroScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={styles.safe} edges={tabBar ? [] : ["bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <RadialBlob
            size={260}
            color="rgba(0,180,216,0.3)"
            style={{ top: -90, right: -70 }}
          />
          {heroChildren}
        </View>
        <View style={[styles.body, { paddingBottom: contentPaddingBottom }]}>{children}</View>
      </ScrollView>
      {tabBar}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper
  },
  hero: {
    backgroundColor: colors.ink,
    paddingHorizontal: 22,
    paddingBottom: 22,
    overflow: "hidden"
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 14
  }
});
