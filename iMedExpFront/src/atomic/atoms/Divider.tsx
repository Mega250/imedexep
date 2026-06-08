import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";

type DividerProps = {
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function Divider({ color = colors.rule, style }: DividerProps) {
  return <View style={[{ height: 1, backgroundColor: color }, style]} />;
}

type OrDividerProps = {
  label?: string;
  color?: string;
  textColor?: string;
};

export function OrDivider({ label = "O", color = colors.rule, textColor = colors.ink3 }: OrDividerProps) {
  return (
    <View style={styles.orWrap}>
      <View style={[styles.orLine, { backgroundColor: color }]} />
      <Text style={[styles.orText, { color: textColor }]}>{label}</Text>
      <View style={[styles.orLine, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  orWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  orLine: {
    flex: 1,
    height: 1
  },
  orText: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 1.6
  }
});
