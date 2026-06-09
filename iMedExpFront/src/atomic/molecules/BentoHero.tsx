import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { DarkPanel } from "@/atomic/molecules/DarkPanel";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type BentoHeroProps = {
  kicker?: string;
  time?: string;
  name: string;
  meta?: string;
  allergyLabel?: string;
  allergyText?: string;
  actions?: ReactNode;
  blobColor?: string;
};

export function BentoHero({
  kicker,
  time,
  name,
  meta,
  allergyLabel,
  allergyText,
  actions,
  blobColor = "rgba(0,180,216,0.22)"
}: BentoHeroProps) {
  return (
    <DarkPanel
      radius={radii.xl}
      padding={22}
      blobSize={340}
      blobTop={-120}
      blobRight={-80}
      blobColor={blobColor}
    >
      <View style={styles.top}>
        {kicker && <Text style={styles.kicker}>{kicker}</Text>}
        {time && (
          <View style={styles.timeTag}>
            <Text style={styles.timeText}>{time}</Text>
          </View>
        )}
      </View>
      <Text style={styles.name}>{name}</Text>
      {meta && <Text style={styles.meta}>{meta}</Text>}
      {allergyLabel && (
        <View style={styles.allergyRow}>
          <View style={styles.allergyTag}>
            <Text style={styles.allergyTagText}>{allergyLabel}</Text>
          </View>
          {allergyText && <Text style={styles.allergyText}>{allergyText}</Text>}
        </View>
      )}
      {actions && <View style={styles.actions}>{actions}</View>}
    </DarkPanel>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 6
  },
  kicker: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.2
  },
  timeTag: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)"
  },
  timeText: {
    fontFamily: family.mono,
    fontSize: 10,
    color: "rgba(255,255,255,0.85)"
  },
  name: {
    fontFamily: family.serifItalic,
    fontSize: 28,
    letterSpacing: -0.5,
    color: colors.paper,
    marginTop: 4
  },
  meta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4
  },
  allergyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(184,50,50,0.12)",
    borderWidth: 1,
    borderColor: "rgba(184,50,50,0.5)",
    borderRadius: 10
  },
  allergyTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.alert
  },
  allergyTagText: {
    fontFamily: family.mono,
    fontSize: 8.5,
    color: colors.white,
    letterSpacing: 1
  },
  allergyText: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.paper
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16
  }
});
