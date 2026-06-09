import { StyleSheet, Text, View } from "react-native";
import { Icon } from "@/atomic/atoms/Icon";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type Rule = {
  label: string;
  test: (value: string) => boolean;
};

const RULES: Rule[] = [
  { label: "8 caracteres o más", test: (v) => v.length >= 8 },
  { label: "Una mayúscula", test: (v) => /[A-ZÁÉÍÓÚÜÑ]/.test(v) },
  { label: "Un número", test: (v) => /\d/.test(v) },
  { label: "Un símbolo", test: (v) => /[^A-Za-z0-9]/.test(v) }
];

type PasswordChecklistProps = {
  value: string;
};

export function PasswordChecklist({ value }: PasswordChecklistProps) {
  return (
    <View style={styles.wrap}>
      {RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <View key={rule.label} style={styles.row}>
            <View style={[styles.dot, ok ? styles.dotOk : styles.dotIdle]}>
              {ok ? <Icon kind="check" size={10} color={colors.ok} strokeWidth={2.4} /> : null}
            </View>
            <Text style={[styles.label, ok ? styles.labelOk : styles.labelIdle]}>
              {rule.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    rowGap: 6,
    paddingVertical: 2
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.paper
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center"
  },
  dotIdle: {
    backgroundColor: colors.rule2
  },
  dotOk: {
    backgroundColor: colors.okSoft
  },
  label: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 0.2
  },
  labelIdle: {
    color: colors.ink3
  },
  labelOk: {
    color: colors.ok
  }
});
