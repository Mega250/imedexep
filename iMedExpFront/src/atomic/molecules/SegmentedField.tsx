import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { Tappable } from "@/atomic/atoms/Tappable";

export type Segment = { value: string; label: string };

type SegmentedFieldProps = {
  label?: string;
  options: Segment[];
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  wrap?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedField({
  label,
  options,
  value,
  onChange,
  hint,
  wrap = false,
  style
}: SegmentedFieldProps) {
  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.row, wrap && styles.rowWrap]}>
        {options.map((opt) => {
          const on = opt.value === value;
          return (
            <Tappable
              key={opt.value}
              scaleTo={0.97}
              onPress={() => onChange(opt.value)}
              accessibilityLabel={opt.label}
              style={[
                styles.segment,
                wrap && styles.segmentWrap,
                {
                  backgroundColor: on ? colors.ink : colors.white,
                  borderColor: on ? colors.ink : colors.rule
                }
              ]}
            >
              <Text
                numberOfLines={1}
                style={[styles.segmentText, { color: on ? colors.paper : colors.ink2 }]}
              >
                {opt.label}
              </Text>
            </Tappable>
          );
        })}
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6
  },
  label: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.ink2
  },
  row: {
    flexDirection: "row",
    gap: 6
  },
  rowWrap: {
    flexWrap: "wrap"
  },
  segment: {
    flex: 1,
    minHeight: 38,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: radii.sm,
    alignItems: "center",
    justifyContent: "center"
  },
  segmentWrap: {
    flexGrow: 1,
    flexBasis: "auto",
    minWidth: 92
  },
  segmentText: {
    fontFamily: family.medium,
    fontSize: 12.5,
    letterSpacing: -0.1
  },
  hint: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  }
});
