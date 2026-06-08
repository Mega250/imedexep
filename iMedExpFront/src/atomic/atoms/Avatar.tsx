import { Text, View } from "react-native";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";

type AvatarProps = {
  initials: string;
  size?: number;
  radius?: number;
  bg?: string;
  fg?: string;
  serif?: boolean;
  fontSize?: number;
};

export function Avatar({
  initials,
  size = 40,
  radius,
  bg = colors.ink,
  fg = colors.paper,
  serif = false,
  fontSize
}: AvatarProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius ?? size / 2,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <Text
        style={{
          color: fg,
          fontFamily: serif ? family.serifItalic : family.monoMedium,
          fontSize: fontSize ?? size * 0.38
        }}
      >
        {initials}
      </Text>
    </View>
  );
}
