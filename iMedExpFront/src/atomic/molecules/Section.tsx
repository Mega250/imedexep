import { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { SectionLabel } from "@/atomic/atoms/SectionLabel";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";

type SectionProps = PropsWithChildren<{
  title: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}>;

export function Section({ title, action, onAction, children, style }: SectionProps) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.head}>
        <SectionLabel label={title} />
        {action ? (
          <Text style={styles.action} onPress={onAction}>
            {action}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 18
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10
  },
  action: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.accentDeep
  }
});
