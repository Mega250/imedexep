import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Icon } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { colors } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

type ScreenTopBarProps = {
  sub?: string;
  title: string;
  accent?: boolean;
  right?: ReactNode;
  back?: string;
  onBack?: () => void;
};

export function ScreenTopBar({ sub, title, accent, right, back, onBack }: ScreenTopBarProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        {back ? (
          <Tappable onPress={onBack} hitSlop={10} scaleTo={0.95} style={styles.backRow}>
            <Icon kind="chev-l" size={14} color={colors.ink3} />
            <Text style={styles.back} numberOfLines={1}>{back}</Text>
          </Tappable>
        ) : null}
        {sub ? (
          <Text style={styles.sub} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
        <Text
          style={[styles.title, { color: accent ? colors.accentDeep : colors.ink }]}
          numberOfLines={1}
          ellipsizeMode="tail"
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {title}
        </Text>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
    backgroundColor: colors.paper
  },
  left: {
    flex: 1,
    minWidth: 0
  },
  right: {
    flexShrink: 0,
    marginLeft: 12
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6
  },
  back: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    letterSpacing: 0.4
  },
  sub: {
    ...text.eyebrow,
    color: colors.ink3
  },
  title: {
    fontFamily: family.serifItalic,
    fontSize: 32,
    lineHeight: 38,
    letterSpacing: -0.6,
    marginTop: 4
  }
});
