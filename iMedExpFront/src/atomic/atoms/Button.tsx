import { StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { Icon, IconKind } from "./Icon";
import { Tappable } from "./Tappable";

type ButtonVariant = "primary" | "accent" | "bright" | "ghost" | "darkGhost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  iconLeft?: IconKind;
  iconRight?: IconKind;
  height?: number;
  radius?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const palette: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
  primary: { bg: colors.ink, fg: colors.paper, border: colors.ink },
  accent: { bg: colors.accent, fg: colors.paper, border: colors.accent },
  bright: { bg: colors.accentBright, fg: colors.ink, border: colors.accentBright },
  ghost: { bg: colors.white, fg: colors.ink, border: colors.rule },
  darkGhost: { bg: "transparent", fg: colors.paper, border: "rgba(255,255,255,0.25)" }
};

const sizing: Record<ButtonSize, { height: number; font: number; pad: number; radius: number }> = {
  sm: { height: 32, font: 12, pad: 12, radius: 9 },
  md: { height: 44, font: 14, pad: 20, radius: radii.md },
  lg: { height: 50, font: 14.5, pad: 22, radius: radii.md }
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  block = true,
  iconLeft,
  iconRight,
  height,
  radius,
  disabled = false,
  style
}: ButtonProps) {
  const tone = palette[variant];
  const dims = sizing[size];
  const iconSize = size === "sm" ? 13 : 15;

  return (
    <Tappable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={[
        styles.base,
        {
          height: height ?? dims.height,
          borderRadius: radius ?? dims.radius,
          paddingHorizontal: dims.pad,
          backgroundColor: tone.bg,
          borderColor: tone.border,
          alignSelf: block ? "stretch" : "flex-start"
        },
        style
      ]}
    >
      {iconLeft ? <Icon kind={iconLeft} size={iconSize} color={tone.fg} /> : null}
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[styles.label, { color: tone.fg, fontSize: dims.font }]}
      >
        {label}
      </Text>
      {iconRight ? <Icon kind={iconRight} size={iconSize} color={tone.fg} /> : null}
    </Tappable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    gap: 8
  },
  label: {
    flexShrink: 1,
    minWidth: 0,
    fontFamily: family.medium,
    letterSpacing: -0.1
  }
});
