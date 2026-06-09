import { StyleSheet, Text, View } from "react-native";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type KpiCardProps = {
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  trendUp?: boolean;
  style?: object;
};

export function KpiCard({ label, value, unit, trend, trendUp, style }: KpiCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </Text>
      <View style={styles.valueRow}>
        <Text
          style={styles.value}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
        >
          {value}
        </Text>
        {unit && (
          <Text style={styles.unit} numberOfLines={1}>
            {unit}
          </Text>
        )}
      </View>
      {trend && (
        <Text
          numberOfLines={1}
          style={[styles.trend, { color: trendUp ? colors.ok : colors.alert }]}
        >
          {trendUp ? "▲" : "▼"} {trend}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule2,
    borderRadius: radii.lg,
    padding: 16
  },
  label: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colors.ink3
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    marginTop: 6
  },
  value: {
    flexShrink: 1,
    minWidth: 0,
    fontFamily: family.medium,
    fontSize: 26,
    letterSpacing: -0.6,
    color: colors.ink
  },
  unit: {
    flexShrink: 0,
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  trend: {
    fontFamily: family.mono,
    fontSize: 10,
    marginTop: 6
  }
});
