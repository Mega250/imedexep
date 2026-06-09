import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { Logo } from "@/atomic/atoms/Logo";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

type Testimonial = { quote: string; name: string; role: string };

type AuthSplitLayoutProps = {
  eyebrow?: string;
  headline: string;
  headlineAccent: string;
  sub?: string;
  bullets?: string[];
  testimonial?: Testimonial;
  backLabel?: string;
  onBack?: () => void;
  children: ReactNode;
};

export function AuthSplitLayout({
  eyebrow,
  headline,
  headlineAccent,
  sub,
  bullets,
  testimonial,
  backLabel = "← Volver",
  onBack,
  children
}: AuthSplitLayoutProps) {
  const { width } = useWindowDimensions();
  const scale = width < 1100 ? 0.6 : width < 1280 ? 0.78 : 1;
  const h1FontSize = 80 * scale;
  const h1SerifFontSize = 82 * scale;
  const h1LineHeight = Math.max(h1FontSize * 1.1, 60);
  const h1LetterSpacing = -3.2 * scale;
  return (
    <View style={styles.root}>
      <View style={styles.left}>
        <RadialBlob size={480} color={colors.paper3} opacity={0.7} style={{ top: -80, right: -120 }} />
        <RadialBlob size={360} color={colors.accentRule} opacity={0.5} style={{ bottom: -120, left: -80 }} />

        <View style={styles.leftHeader}>
          <Logo height={22} />
          <Tappable onPress={onBack} hitSlop={8} scaleTo={0.96}>
            <Text style={styles.backLink}>{backLabel}</Text>
          </Tappable>
        </View>

        <View style={styles.leftBody}>
          {eyebrow ? (
            <FadeIn>
              <View style={styles.badge}>
                <View style={styles.badgeDot} />
                <Text style={styles.badgeText}>{eyebrow}</Text>
              </View>
            </FadeIn>
          ) : null}
          <FadeIn delay={120}>
            <Text
              style={[
                styles.h1,
                { fontSize: h1FontSize, lineHeight: h1LineHeight, letterSpacing: h1LetterSpacing }
              ]}
            >
              {headline}
              {"\n"}
              <Text style={[styles.h1Serif, { fontSize: h1SerifFontSize, lineHeight: h1LineHeight }]}>
                {headlineAccent}
              </Text>
            </Text>
          </FadeIn>
          {sub ? (
            <FadeIn delay={220}>
              <Text style={styles.lead}>{sub}</Text>
            </FadeIn>
          ) : null}
          {bullets ? (
            <FadeIn delay={300}>
              <View style={styles.bullets}>
                {bullets.map((b) => (
                  <View key={b} style={styles.bulletRow}>
                    <View style={styles.bulletDot}>
                      <Icon kind="check" size={13} color={colors.accentDeep} />
                    </View>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            </FadeIn>
          ) : null}
          {testimonial ? (
            <FadeIn delay={380}>
              <View style={styles.testimonial}>
                <Text style={styles.quote}>&quot;{testimonial.quote}&quot;</Text>
                <View style={styles.author}>
                  <View style={styles.authorAvatar} />
                  <View style={styles.authorTextWrap}>
                    <Text style={styles.authorName} numberOfLines={1}>{testimonial.name}</Text>
                    <Text style={styles.authorMeta} numberOfLines={1}>{testimonial.role}</Text>
                  </View>
                </View>
              </View>
            </FadeIn>
          ) : null}
        </View>

        <View style={styles.leftFooter}>
          <Text style={styles.compliance}>HIPAA · NOM-024-SSA3 · CIFRADO DE GRADO MÉDICO</Text>
          <Text style={styles.version}>v1.0 · 26.05</Text>
        </View>
      </View>

      <View style={styles.right}>
        <ScrollView contentContainerStyle={styles.rightScroll} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.paper
  },
  left: {
    flex: 1.15,
    paddingHorizontal: 56,
    paddingVertical: 40,
    overflow: "hidden"
  },
  leftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  backLink: {
    fontFamily: family.regular,
    fontSize: 13,
    color: colors.ink2
  },
  leftBody: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 580
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    alignSelf: "flex-start",
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.accentRule
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: colors.accentBright
  },
  badgeText: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.accentDeep
  },
  h1: {
    fontFamily: family.extralight,
    fontSize: 80,
    lineHeight: 77,
    letterSpacing: -3.2,
    color: colors.ink,
    marginTop: 28
  },
  h1Serif: {
    fontFamily: family.serifItalic,
    fontSize: 82,
    color: colors.accentDeep
  },
  lead: {
    fontFamily: family.light,
    fontSize: 17,
    lineHeight: 25,
    color: colors.ink2,
    marginTop: 22,
    maxWidth: 460
  },
  bullets: {
    marginTop: 32,
    gap: 14
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  bulletDot: {
    width: 22,
    height: 22,
    borderRadius: 99,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  bulletText: {
    fontFamily: family.regular,
    fontSize: 14.5,
    color: colors.ink
  },
  testimonial: {
    marginTop: 44,
    maxWidth: 480,
    paddingHorizontal: 22,
    paddingVertical: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg
  },
  quote: {
    fontFamily: family.serifItalic,
    fontSize: 19,
    lineHeight: 24,
    color: colors.ink
  },
  authorTextWrap: {
    flex: 1,
    minWidth: 0
  },
  author: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14
  },
  authorAvatar: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: colors.accent
  },
  authorName: {
    fontFamily: family.medium,
    fontSize: 13,
    color: colors.ink
  },
  authorMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3
  },
  leftFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  compliance: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    letterSpacing: 0.9
  },
  version: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3
  },
  right: {
    flex: 1,
    backgroundColor: colors.white,
    borderLeftWidth: 1,
    borderLeftColor: colors.rule
  },
  rightScroll: {
    flexGrow: 1,
    paddingHorizontal: 80,
    paddingVertical: 40
  }
});
