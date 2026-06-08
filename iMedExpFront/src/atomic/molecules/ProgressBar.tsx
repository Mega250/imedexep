import { StyleSheet, Text, View } from "react-native";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type ProgressBarProps = {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
  height?: number;
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = false,
  color = colors.accentBright,
  height = 6
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <View style={styles.wrap}>
      {(label || showPercent) && (
        <View style={styles.labelRow}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercent && <Text style={styles.pct}>{Math.round(pct)}%</Text>}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View style={[styles.fill, { width: `${pct}%` as any, backgroundColor: color, height }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline"
  },
  label: {
    fontFamily: family.regular,
    fontSize: 12.5,
    color: colors.ink2
  },
  pct: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  track: {
    backgroundColor: colors.rule2,
    borderRadius: radii.pill,
    overflow: "hidden"
  },
  fill: {
    borderRadius: radii.pill
  }
});
