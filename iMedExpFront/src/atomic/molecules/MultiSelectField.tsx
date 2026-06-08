import { StyleSheet, Text, View } from "react-native";
import { Pill } from "@/atomic/atoms/Pill";
import { Tappable } from "@/atomic/atoms/Tappable";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";

type MultiSelectFieldProps = {
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  hint?: string;
  exclusiveValues?: string[];
};

export function MultiSelectField({
  label,
  options,
  values,
  onChange,
  hint,
  exclusiveValues
}: MultiSelectFieldProps) {
  function toggle(option: string) {
    if (values.includes(option)) {
      onChange(values.filter((v) => v !== option));
      return;
    }
    if (exclusiveValues?.includes(option)) {
      onChange([option]);
      return;
    }
    const base = exclusiveValues
      ? values.filter((v) => !exclusiveValues.includes(v))
      : values;
    onChange([...base, option]);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.options}>
        {options.map((option) => (
          <Tappable key={option} onPress={() => toggle(option)} scaleTo={0.95}>
            <Pill label={option} on={values.includes(option)} />
          </Tappable>
        ))}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8
  },
  label: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink2
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  hint: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  }
});
