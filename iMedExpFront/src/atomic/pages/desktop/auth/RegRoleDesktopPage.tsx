import { StyleSheet, Text, View } from "react-native";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { AuthSplitLayout } from "@/atomic/templates/AuthSplitLayout";
import { goBack, goToScreen } from "@/navigation/screenRouter";
import { colors, radii, shadow } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

type RoleCardProps = {
  icon: IconKind;
  title: string;
  body: string;
  time: string;
  onPress: () => void;
};

function RoleCard({ icon, title, body, time, onPress }: RoleCardProps) {
  return (
    <Tappable onPress={onPress} scaleTo={0.99} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardIcon}>
          <Icon kind={icon} size={26} color={colors.accentDeep} />
        </View>
        <View style={styles.timeBadge}>
          <Text style={styles.timeText}>~ {time}</Text>
        </View>
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
      <View style={styles.cardFoot}>
        <Text style={styles.cardCta}>Continuar</Text>
        <Text style={styles.cardArrow}>→</Text>
      </View>
    </Tappable>
  );
}

export function RegRoleDesktopPage() {
  return (
    <AuthSplitLayout
      eyebrow="Crear cuenta · paso 1 de 2"
      headline="Empieza tu"
      headlineAccent="expediente."
      sub="Dos caminos. Una sola plataforma. Tu información clínica viaja contigo desde el primer día — sin formularios duplicados, sin información perdida."
      bullets={[
        "Cifrado de extremo a extremo",
        "Cumple NOM-024-SSA3 y HIPAA",
        "Cuenta gratuita para pacientes",
        "Cancela cuando quieras"
      ]}
      onBack={() => goBack("home")}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.topText}>
            ¿Ya tienes cuenta?{" "}
            <Text style={styles.topLink} onPress={() => goToScreen("login")}>
              Iniciar sesión
            </Text>
          </Text>
        </View>

        <FadeIn style={styles.form}>
          <Text style={styles.eyebrow}>Crear cuenta</Text>
          <Text style={styles.h2}>¿Cómo vas a usar imedexp?</Text>
          <Text style={styles.lead}>
            Elige tu rol para personalizar tu experiencia. Podrás cambiar algunos datos
            después.
          </Text>
          <View style={styles.cards}>
            <RoleCard
              icon="heart"
              title="Soy paciente"
              body="Lleva tu historial clínico contigo. Comparte un vínculo con cualquier médico nuevo en segundos."
              time="2 min"
              onPress={() => goToScreen("reg-patient")}
            />
            <RoleCard
              icon="stetho"
              title="Soy médico"
              body="Recibe a tus pacientes con su expediente ya leído. Verificamos tu cédula profesional."
              time="4 min"
              onPress={() => goToScreen("reg-doctor")}
            />
          </View>
        </FadeIn>

        <Text style={styles.terms}>
          Al crear cuenta aceptas los <Text style={styles.termsLink}>términos</Text> y la{" "}
          <Text style={styles.termsLink}>política de privacidad</Text>.
        </Text>
      </View>
    </AuthSplitLayout>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
  topRow: { flexDirection: "row", justifyContent: "flex-end" },
  topText: { fontFamily: family.regular, fontSize: 13, color: colors.ink3 },
  topLink: { fontFamily: family.medium, color: colors.ink },
  form: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 460,
    width: "100%",
    alignSelf: "center",
    paddingVertical: 28
  },
  eyebrow: { ...text.eyebrow, color: colors.ink3 },
  h2: {
    fontFamily: family.medium,
    fontSize: 40,
    letterSpacing: -1.2,
    lineHeight: 42,
    color: colors.ink,
    marginTop: 10
  },
  lead: {
    fontFamily: family.regular,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.ink3,
    marginTop: 10
  },
  cards: { gap: 14, marginTop: 32 },
  card: {
    paddingHorizontal: 28,
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    backgroundColor: colors.white,
    ...shadow.soft
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  timeBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.paper2
  },
  timeText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.ink3,
    letterSpacing: 0.5
  },
  cardTitle: {
    fontFamily: family.serifItalic,
    fontSize: 36,
    letterSpacing: -0.9,
    color: colors.ink,
    marginTop: 22
  },
  cardBody: {
    fontFamily: family.regular,
    fontSize: 13.5,
    lineHeight: 21,
    color: colors.ink2,
    marginTop: 12
  },
  cardFoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 22,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.rule2
  },
  cardCta: { fontFamily: family.medium, fontSize: 13.5, color: colors.ink },
  cardArrow: { fontFamily: family.regular, fontSize: 14, color: colors.ink },
  terms: {
    fontFamily: family.regular,
    fontSize: 11.5,
    lineHeight: 18,
    color: colors.ink3,
    textAlign: "center"
  },
  termsLink: { color: colors.ink }
});
