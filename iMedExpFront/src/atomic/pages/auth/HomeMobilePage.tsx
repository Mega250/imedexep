import { ReactNode } from "react";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge } from "@/atomic/atoms/Badge";
import { Button } from "@/atomic/atoms/Button";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { Logo } from "@/atomic/atoms/Logo";
import { RadialBlob } from "@/atomic/atoms/RadialBlob";
import { Tappable } from "@/atomic/atoms/Tappable";
import { goToScreen } from "@/navigation/screenRouter";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

const STATS: [string, string][] = [
  ["12.4k", "expedientes"],
  ["1.7k+", "médicos"],
  ["98%", "adherencia"]
];

const PREVIEW: [string, string, string][] = [
  ["Dx activos", "Hipotiroidismo · SOP", "4"],
  ["Medicación", "Levotiroxina 75µg", "3"],
  ["Cirugías", "Apendicectomía 2017", "3"],
  ["Estudios", "TSH 4.8 mU/L", "4"]
];

const TRUST: [string, string][] = [
  ["Cifrado", "Extremo a extremo"],
  ["Datos en MX", "100% soberanía"],
  ["Auditoría", "Cada acceso"],
  ["Revocable", "En 1 toque"]
];

const FEATURES: [IconKind, string, string, boolean][] = [
  ["doc", "Historia clínica digital", "Expedientes completos, siempre actualizados.", true],
  ["cal", "Citas inteligentes", "Agenda + recordatorios automáticos.", false],
  ["shield", "Seguridad médica", "Auditoría completa · vínculos revocables.", false],
  ["pill", "Recetas digitales", "Firma del médico, al expediente al instante.", false]
];

const STEPS: [string, string, string][] = [
  ["01", "Regístrate en 2 minutos", "Crea tu cuenta como paciente o médico. Verificación instantánea."],
  [
    "02",
    "Comparte un vínculo seguro",
    "Código único, vencimiento de 22 min, uso único. Nadie más puede acceder."
  ],
  ["03", "El médico ya lo leyó", "Tu expediente jerarquizado: alergias arriba, crónicos en medio."]
];

function PreviewCell({ k, body, n }: { k: string; body: string; n: string }) {
  return (
    <View style={styles.previewCell}>
      <View style={styles.previewCellTop}>
        <Text style={styles.previewCellKey}>{k}</Text>
        <Text style={styles.previewCellNum}>{n}</Text>
      </View>
      <Text style={styles.previewCellBody}>{body}</Text>
    </View>
  );
}

function Section({ children, style }: { children: ReactNode; style?: object }) {
  return <FadeIn style={style}>{children}</FadeIn>;
}

export function HomeMobilePage() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.nav}>
        <View style={styles.navLeft}>
          <Logo height={16} />
          <View style={styles.betaTag}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </View>
        <Tappable
          style={styles.iconBtn}
          scaleTo={0.92}
          accessibilityLabel="Crear cuenta"
          onPress={() => goToScreen("reg-role-mob")}
        >
          <Icon kind="user" size={16} color={colors.ink2} />
        </Tappable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.heroWrap}>
          <RadialBlob
            size={360}
            color={colors.paper3}
            opacity={0.7}
            style={{ top: -120, right: -100 }}
          />
          <Section>
            <Badge
              label="Plataforma médica · MX"
              bg={colors.paper3}
              fg={colors.accentDeep}
              border={colors.accentRule}
              dot={colors.accentBright}
              mono={false}
            />
            <Text style={styles.heroTitle}>
              Tu expediente{"\n"}médico,{"\n"}
              <Text style={styles.heroBold}>listo</Text>{" "}
              <Text style={styles.heroSerif}>en cualquier</Text> consulta.
            </Text>
            <Text style={styles.heroLead}>
              Captura tu historial una vez. Compártelo con cualquier médico en segundos. Sin
              formularios, sin información perdida.
            </Text>
            <View style={styles.heroButtons}>
              <Button
                label="Soy paciente · iniciar sesión  →"
                variant="accent"
                onPress={() => goToScreen("login-mob")}
              />
              <Button
                label="Soy médico · iniciar sesión  →"
                variant="ghost"
                height={48}
                onPress={() => goToScreen("login-mob")}
              />
            </View>
            <View style={styles.statRow}>
              {STATS.map(([n, l]) => (
                <View key={l} style={styles.statItem}>
                  <Text style={styles.statNum}>{n}</Text>
                  <Text style={styles.statLabel}>{l}</Text>
                </View>
              ))}
            </View>
          </Section>
        </View>

        <Section style={styles.previewWrap}>
          <View style={styles.previewCard}>
            <View style={styles.browserBar}>
              <View style={styles.dots}>
                <View style={[styles.dot, { backgroundColor: "#FF6058" }]} />
                <View style={[styles.dot, { backgroundColor: "#FFBD2D" }]} />
                <View style={[styles.dot, { backgroundColor: "#27CA40" }]} />
              </View>
              <Text style={styles.browserUrl}>consola.imedexp.mx</Text>
              <View style={{ width: 30 }} />
            </View>
            <View style={styles.previewBody}>
              <Text style={styles.previewEyebrow}>próxima cita · en 12 min</Text>
              <Text style={styles.previewName}>María F. Arellano</Text>
              <Text style={styles.previewMeta}>♀ 34a · O+ · primera consulta</Text>
              <View style={styles.allergyStrip}>
                <Badge
                  label="ALERGIA"
                  bg={colors.alert}
                  fg={colors.white}
                  border={colors.alert}
                  fontSize={9}
                  letterSpacing={1.4}
                />
                <Text style={styles.allergyText} numberOfLines={2}>
                  <Text style={styles.allergyStrong}>Penicilina</Text> · anafilaxia 2019
                </Text>
              </View>
              <View style={styles.previewGrid}>
                <View style={styles.previewGridRow}>
                  <PreviewCell k={PREVIEW[0][0]} body={PREVIEW[0][1]} n={PREVIEW[0][2]} />
                  <PreviewCell k={PREVIEW[1][0]} body={PREVIEW[1][1]} n={PREVIEW[1][2]} />
                </View>
                <View style={styles.previewGridRow}>
                  <PreviewCell k={PREVIEW[2][0]} body={PREVIEW[2][1]} n={PREVIEW[2][2]} />
                  <PreviewCell k={PREVIEW[3][0]} body={PREVIEW[3][1]} n={PREVIEW[3][2]} />
                </View>
              </View>
            </View>
          </View>
        </Section>

        <Section style={styles.trustWrap}>
          <Text style={styles.trustEyebrow}>CUMPLIMIENTO · MX</Text>
          <Text style={styles.trustStandards}>HIPAA · NOM-024-SSA3 · ISO 27001</Text>
          <View style={styles.trustGrid}>
            {TRUST.map(([k, v]) => (
              <View key={k} style={styles.trustItem}>
                <Icon kind="check" size={14} color={colors.accentBright} />
                <View style={styles.trustItemBody}>
                  <Text style={styles.trustKey} numberOfLines={1}>{k}</Text>
                  <Text style={styles.trustVal} numberOfLines={1}>{v}</Text>
                </View>
              </View>
            ))}
          </View>
        </Section>

        <Section style={styles.featuresWrap}>
          <Text style={styles.eyebrow}>02 · características</Text>
          <Text style={styles.h2}>
            Todo lo que necesitas para{" "}
            <Text style={styles.h2Serif}>una práctica moderna.</Text>
          </Text>
          <View style={styles.featureList}>
            {FEATURES.map(([icon, title, body, highlight]) => (
              <View key={title} style={styles.featureRow}>
                <View
                  style={[
                    styles.featureIcon,
                    {
                      backgroundColor: highlight ? colors.accent : colors.paper3
                    }
                  ]}
                >
                  <Icon
                    kind={icon}
                    size={18}
                    color={highlight ? colors.white : colors.accentDeep}
                  />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle} numberOfLines={1}>{title}</Text>
                  <Text style={styles.featureBody} numberOfLines={2}>{body}</Text>
                </View>
                <Icon kind="chev" size={14} color={colors.ink3} />
              </View>
            ))}
          </View>
        </Section>

        <Section style={styles.howWrap}>
          <Text style={styles.eyebrow}>03 · cómo funciona</Text>
          <Text style={styles.h2Small}>
            Empieza en <Text style={styles.h2Bold}>3 pasos</Text>{" "}
            <Text style={styles.h2Serif}>simples.</Text>
          </Text>
          <View style={styles.stepList}>
            {STEPS.map(([n, t, b]) => (
              <View key={n} style={styles.stepCard}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{n}</Text>
                </View>
                <Text style={styles.stepTitle}>{t}</Text>
                <Text style={styles.stepBody}>{b}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section style={styles.testimonialWrap}>
          <View style={styles.testimonialCard}>
            <Text style={styles.quote}>
              &quot;La paciente entró y yo ya sabía lo que tenía que ajustarle. 14 segundos.&quot;
            </Text>
            <View style={styles.author}>
              <View style={styles.authorAvatar} />
              <View>
                <Text style={styles.authorName}>Dra. Patricia Galván</Text>
                <Text style={styles.authorMeta}>endocrinología · CDMX</Text>
              </View>
            </View>
          </View>
        </Section>

        <Section>
          <View style={styles.ctaWrap}>
            <RadialBlob
              size={320}
              color="rgba(0,180,216,0.5)"
              edge={70}
              style={{ top: -120, right: -80 }}
            />
            <Text style={styles.ctaEyebrow}>EMPIEZA HOY</Text>
            <Text style={styles.ctaTitle}>
              Tu salud,{"\n"}
              <Text style={styles.ctaSerif}>en tus manos.</Text>
            </Text>
            <Text style={styles.ctaLead}>
              Sin contratos, sin tarjeta de crédito, sin curva de aprendizaje. Empieza tu
              expediente en 2 minutos.
            </Text>
            <View style={styles.ctaButtons}>
              <Button
                label="Comenzar gratis  →"
                variant="bright"
                onPress={() => goToScreen("reg-role-mob")}
              />
              <Button
                label="Hablar con ventas"
                variant="darkGhost"
                height={48}
                onPress={() => Linking.openURL("mailto:imedexped@gmail.com?subject=Demo%20iMedExp")}
              />
            </View>
            <Text style={styles.storeSoon}>
              App móvil disponible próximamente en App Store y Google Play.
            </Text>
          </View>
        </Section>

        <View style={styles.footer}>
          <Logo height={14} color={colors.paper} />
          <Text style={styles.footerText}>v1.0 · 26.05 · México</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
    backgroundColor: colors.paper
  },
  navLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  betaTag: {
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  betaText: {
    fontFamily: family.mono,
    fontSize: 9,
    color: colors.ink3,
    letterSpacing: 0.6
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  scroll: {
    paddingBottom: 0
  },
  heroWrap: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 28,
    overflow: "hidden"
  },
  heroTitle: {
    fontFamily: family.light,
    fontSize: 48,
    lineHeight: 54,
    letterSpacing: -1.9,
    color: colors.ink,
    marginTop: 18
  },
  heroBold: {
    fontFamily: family.bold,
    color: colors.accentDeep
  },
  heroSerif: {
    fontFamily: family.serifItalic,
    fontSize: 50,
    lineHeight: 56
  },
  heroLead: {
    fontFamily: family.light,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.ink2,
    marginTop: 18
  },
  heroButtons: {
    gap: 10,
    marginTop: 22
  },
  statRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 28
  },
  statItem: {
    flex: 1
  },
  statNum: {
    fontFamily: family.medium,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.ink
  },
  statLabel: {
    fontFamily: family.mono,
    fontSize: 9.5,
    letterSpacing: 0.6,
    color: colors.ink3,
    marginTop: 2
  },
  previewWrap: {
    paddingHorizontal: 22
  },
  previewCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.rule,
    overflow: "hidden",
    ...shadow.soft
  },
  browserBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
    backgroundColor: colors.paper
  },
  dots: {
    flexDirection: "row",
    gap: 5,
    width: 30
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 99
  },
  browserUrl: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: colors.ink3
  },
  previewBody: {
    padding: 16
  },
  previewEyebrow: {
    ...text.eyebrow,
    fontSize: 9.5,
    color: colors.ink3
  },
  previewName: {
    fontFamily: family.serifItalic,
    fontSize: 23,
    letterSpacing: -0.4,
    color: colors.ink,
    marginTop: 4
  },
  previewMeta: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 3
  },
  allergyStrip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: colors.alertSoft,
    borderWidth: 1,
    borderColor: colors.alertRule,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10
  },
  allergyText: {
    flex: 1,
    fontFamily: family.regular,
    fontSize: 11,
    color: colors.ink
  },
  allergyStrong: {
    fontFamily: family.bold
  },
  previewGrid: {
    marginTop: 10,
    backgroundColor: colors.rule,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule,
    overflow: "hidden",
    gap: 1
  },
  previewGridRow: {
    flexDirection: "row",
    gap: 1
  },
  previewCell: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 9
  },
  previewCellTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline"
  },
  previewCellKey: {
    ...text.eyebrow,
    fontSize: 9,
    color: colors.ink3
  },
  previewCellNum: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.accentDeep
  },
  previewCellBody: {
    fontFamily: family.regular,
    fontSize: 10.5,
    lineHeight: 14,
    color: colors.ink2,
    marginTop: 3
  },
  trustWrap: {
    paddingHorizontal: 22,
    paddingVertical: 22,
    marginTop: 22,
    backgroundColor: colors.ink
  },
  trustEyebrow: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 1.6,
    color: "rgba(255,255,255,0.55)"
  },
  trustStandards: {
    fontFamily: family.mono,
    fontSize: 13,
    color: colors.paper,
    marginTop: 4
  },
  trustGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 14,
    marginTop: 16
  },
  trustItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    gap: 9
  },
  trustItemBody: {
    flex: 1,
    minWidth: 0
  },
  trustKey: {
    fontFamily: family.medium,
    fontSize: 12,
    color: colors.paper
  },
  trustVal: {
    fontFamily: family.mono,
    fontSize: 9.5,
    color: "rgba(255,255,255,0.6)",
    marginTop: 1
  },
  featuresWrap: {
    paddingHorizontal: 22,
    paddingTop: 36,
    paddingBottom: 28
  },
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  h2: {
    fontFamily: family.light,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.96,
    color: colors.ink,
    marginTop: 8
  },
  h2Serif: {
    fontFamily: family.serifItalic,
    color: colors.accentDeep,
    fontSize: 33,
    lineHeight: 37
  },
  featureList: {
    gap: 8,
    marginTop: 18
  },
  featureRow: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center"
  },
  featureText: {
    flex: 1,
    minWidth: 0
  },
  featureTitle: {
    fontFamily: family.medium,
    fontSize: 13.5,
    color: colors.ink
  },
  featureBody: {
    fontFamily: family.regular,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.ink3,
    marginTop: 2
  },
  howWrap: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 32,
    backgroundColor: colors.paper2
  },
  h2Small: {
    fontFamily: family.light,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.84,
    color: colors.ink,
    marginTop: 8
  },
  h2Bold: {
    fontFamily: family.bold,
    color: colors.accentDeep
  },
  stepList: {
    gap: 26,
    marginTop: 22
  },
  stepCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14
  },
  stepBadge: {
    position: "absolute",
    top: -12,
    left: 16,
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 3
  },
  stepBadgeText: {
    fontFamily: family.monoMedium,
    fontSize: 10,
    letterSpacing: 0.8,
    color: colors.paper
  },
  stepTitle: {
    fontFamily: family.medium,
    fontSize: 14,
    color: colors.ink
  },
  stepBody: {
    fontFamily: family.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.ink3,
    marginTop: 4
  },
  testimonialWrap: {
    paddingHorizontal: 22,
    paddingVertical: 28
  },
  testimonialCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.lg,
    paddingHorizontal: 20,
    paddingVertical: 18
  },
  quote: {
    fontFamily: family.serifItalic,
    fontSize: 19,
    lineHeight: 24,
    color: colors.ink
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
    fontSize: 12.5,
    color: colors.ink
  },
  authorMeta: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3
  },
  ctaWrap: {
    paddingHorizontal: 22,
    paddingTop: 36,
    paddingBottom: 40,
    backgroundColor: colors.ink,
    overflow: "hidden"
  },
  ctaEyebrow: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 1.6,
    color: "rgba(255,255,255,0.55)"
  },
  ctaTitle: {
    fontFamily: family.light,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -1.26,
    color: colors.paper,
    marginTop: 10
  },
  ctaSerif: {
    fontFamily: family.serifItalic,
    color: colors.accentBright,
    fontSize: 37,
    lineHeight: 41
  },
  ctaLead: {
    fontFamily: family.regular,
    fontSize: 13.5,
    lineHeight: 21,
    color: "rgba(255,255,255,0.7)",
    marginTop: 14
  },
  ctaButtons: {
    gap: 10,
    marginTop: 22
  },
  storeSoon: {
    marginTop: 22,
    fontFamily: family.mono,
    fontSize: 11,
    letterSpacing: 0.6,
    color: "rgba(255,255,255,0.6)"
  },
  footer: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    backgroundColor: colors.inkDeep
  },
  footerText: {
    fontFamily: family.mono,
    fontSize: 10,
    letterSpacing: 0.6,
    color: "rgba(255,255,255,0.6)",
    marginTop: 10
  }
});
