import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";

type PillTone = "default" | "alert" | "ok";

type PillProps = {
  label: string;
  on?: boolean;
  count?: number;
  tone?: PillTone;
  color?: string;
  textColor?: string;
};

export function Pill({ label, on = false, count, tone = "default", color, textColor }: PillProps) {
  const toneBg =
    tone === "alert" ? colors.alertSoft : tone === "ok" ? colors.okSoft : colors.white;
  const toneFg = tone === "alert" ? colors.alert : tone === "ok" ? colors.ok : colors.ink2;
  const toneBorder =
    tone === "alert" ? colors.alertRule : tone === "ok" ? colors.okRule : colors.rule;
  const bg = on ? colors.ink : color ?? toneBg;
  const fg = on ? colors.paper : textColor ?? toneFg;
  const border = on ? colors.ink : color ?? toneBorder;
  return (
    <View style={[styles.wrap, { borderColor: border, backgroundColor: bg }]}>
      <Text style={[styles.label, { color: fg }]} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </Text>
      {count != null ? (
        <Text
          numberOfLines={1}
          style={[
            styles.count,
            { color: on ? "rgba(255,255,255,0.65)" : colors.ink3 }
          ]}
        >
          {count}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    maxWidth: 180,
    flexShrink: 1
  },
  label: {
    flexShrink: 1,
    fontFamily: family.medium,
    fontSize: 11.5
  },
  count: {
    flexShrink: 0,
    fontFamily: family.mono,
    fontSize: 9.5
  }
});
