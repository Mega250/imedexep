import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type BadgeProps = {
  label: string;
  bg?: string;
  fg?: string;
  border?: string;
  dot?: string;
  mono?: boolean;
  uppercase?: boolean;
  radius?: number;
  fontSize?: number;
  letterSpacing?: number;
  maxWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function Badge({
  label,
  bg = colors.white,
  fg = colors.ink2,
  border = colors.rule,
  dot,
  mono = true,
  uppercase = false,
  radius = radii.pill,
  fontSize = 11,
  letterSpacing,
  maxWidth = 180,
  style
}: BadgeProps) {
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: bg,
          borderColor: border,
          borderRadius: radius,
          maxWidth
        },
        style
      ]}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: dot }]} /> : null}
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{
          color: fg,
          fontSize,
          fontFamily: mono ? family.mono : family.medium,
          letterSpacing: letterSpacing ?? (mono ? 0.4 : 0),
          textTransform: uppercase ? "uppercase" : "none",
          flexShrink: 1
        }}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    alignSelf: "flex-start",
    flexShrink: 0
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 99
  }
});
