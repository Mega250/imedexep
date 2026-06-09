import { PropsWithChildren } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { colors, radii } from "@/theme/tokens";

type CardProps = PropsWithChildren<{
  radius?: number;
  style?: StyleProp<ViewStyle>;
  border?: string;
  background?: string;
}>;

export function Card({
  children,
  radius = radii.lg,
  style,
  border = colors.rule,
  background = colors.white
}: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: background,
          borderWidth: 1,
          borderColor: border,
          borderRadius: radius,
          overflow: "hidden"
        },
        style
      ]}
    >
      {children}
    </View>
  );
}
