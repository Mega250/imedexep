import { StyleProp, Text, TextStyle } from "react-native";
import { colors } from "@/theme/tokens";
import { text } from "@/theme/typography";

type SectionLabelProps = {
  label: string;
  color?: string;
  style?: StyleProp<TextStyle>;
};

export function SectionLabel({ label, color = colors.ink3, style }: SectionLabelProps) {
  return <Text style={[text.eyebrow, { color }, style]}>{label}</Text>;
}
