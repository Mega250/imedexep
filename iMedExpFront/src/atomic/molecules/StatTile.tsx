import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors, radii } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

type StatTileProps = {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  labelColor?: string;
  valueColor?: string;
  subColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function StatTile({
  label,
  value,
  unit,
  sub,
  labelColor = colors.ink3,
  valueColor = colors.ink,
  subColor = colors.ink3,
  style
}: StatTileProps) {
  return (
    <View style={[styles.wrap, style]}>
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      {sub ? <Text style={[styles.sub, { color: subColor }]}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  label: {
    ...text.eyebrow,
    fontSize: 9.5
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 4
  },
  value: {
    fontFamily: family.medium,
    fontSize: 22,
    letterSpacing: -0.5
  },
  unit: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  sub: {
    fontFamily: family.mono,
    fontSize: 10,
    marginTop: 4
  }
});
