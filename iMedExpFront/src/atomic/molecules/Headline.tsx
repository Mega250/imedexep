import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

type HeadlineProps = {
  eyebrow?: string;
  lines: string[];
  accent?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function Headline({ eyebrow, lines, accent = false, size = 44, style }: HeadlineProps) {
  const head = lines.slice(0, accent ? -1 : lines.length);
  const last = accent ? lines[lines.length - 1] : null;

  return (
    <View style={style}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text
        style={[
          styles.title,
          {
            fontSize: size,
            lineHeight: size * 1.05,
            letterSpacing: size * -0.035,
            marginTop: eyebrow ? 6 : 0
          }
        ]}
      >
        {head.join("\n")}
        {last !== null ? (
          <Text
            style={[styles.accent, { fontSize: size * 1.04, lineHeight: size * 1.1 }]}
          >
            {head.length ? "\n" : ""}
            {last}
          </Text>
        ) : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  title: {
    fontFamily: family.extralight,
    color: colors.ink
  },
  accent: {
    fontFamily: family.serifItalic,
    color: colors.accentDeep
  }
});
