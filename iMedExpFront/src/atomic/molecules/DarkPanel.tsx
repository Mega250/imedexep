import { PropsWithChildren } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { colors, radii, shadow } from "@/theme/tokens";

type DarkPanelProps = PropsWithChildren<{
  radius?: number;
  padding?: number;
  blobSize?: number;
  blobTop?: number;
  blobRight?: number;
  blobColor?: string;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function DarkPanel({
  children,
  radius = radii.xl,
  padding = 18,
  blobSize = 220,
  blobTop = -70,
  blobRight = -50,
  blobColor = "rgba(0,180,216,0.3)",
  elevated = true,
  style
}: DarkPanelProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.ink,
          borderRadius: radius,
          padding,
          overflow: "hidden"
        },
        elevated ? shadow.hero : null,
        style
      ]}
    >
      <RadialBlob
        size={blobSize}
        color={blobColor}
        style={{ top: blobTop, right: blobRight }}
      />
      <View>{children}</View>
    </View>
  );
}
