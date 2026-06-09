import { StyleSheet, Text, View } from "react-native";
import { Badge } from "@/atomic/atoms/Badge";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon, IconKind } from "@/atomic/atoms/Icon";
import { Tappable } from "@/atomic/atoms/Tappable";
import { AuthHeader } from "@/atomic/molecules/AuthHeader";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goBack, goToScreen } from "@/navigation/screenRouter";
import { colors, radii } from "@/theme/tokens";
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
    <Tappable onPress={onPress} scaleTo={0.98} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardIcon}>
          <Icon kind={icon} size={22} color={colors.accentDeep} />
        </View>
        <Badge label={`~ ${time}`} bg={colors.paper2} fg={colors.ink3} border={colors.paper2} />
      </View>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
      <View style={styles.cardFoot}>
        <Text style={styles.cardCta}>Continuar</Text>
        <Icon kind="arrow" size={15} color={colors.ink} />
      </View>
    </Tappable>
  );
}

export function RegRoleMobilePage() {
  return (
    <MobileScreen contentStyle={styles.content}>
      <AuthHeader back="← Volver" onBack={() => goBack("login-mob")} />
      <View style={styles.body}>
        <FadeIn>
          <Text style={styles.eyebrow}>Crear cuenta · paso 1 de 2</Text>
          <Text style={styles.title}>¿Cómo vas a{"\n"}usar imedexp?</Text>
          <Text style={styles.lead}>Elige tu rol para personalizar tu experiencia.</Text>
        </FadeIn>

        <View style={styles.cards}>
          <FadeIn delay={80}>
            <RoleCard
              icon="heart"
              title="Soy paciente"
              body="Lleva tu historial contigo. Comparte un vínculo con cualquier médico nuevo."
              time="2 min"
              onPress={() => goToScreen("reg-patient-mob")}
            />
          </FadeIn>
          <FadeIn delay={150}>
            <RoleCard
              icon="stetho"
              title="Soy médico"
              body="Recibe a tus pacientes con su expediente ya leído. Verificamos tu cédula."
              time="4 min"
              onPress={() => goToScreen("reg-doctor-mob")}
            />
          </FadeIn>
        </View>

        <FadeIn delay={210}>
          <Text style={styles.footer}>
            ¿Ya tienes cuenta?{" "}
            <Text style={styles.footerLink} onPress={() => goToScreen("login-mob")}>
              Iniciar sesión
            </Text>
          </Text>
        </FadeIn>
      </View>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 22
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 4
  },
  eyebrow: {
    ...text.eyebrow,
    color: colors.ink3
  },
  title: {
    fontFamily: family.medium,
    fontSize: 30,
    letterSpacing: -0.9,
    lineHeight: 32,
    color: colors.ink,
    marginTop: 6
  },
  lead: {
    fontFamily: family.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.ink3,
    marginTop: 10
  },
  cards: {
    gap: 12,
    marginTop: 20
  },
  card: {
    padding: 20,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    backgroundColor: colors.white
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.paper3,
    alignItems: "center",
    justifyContent: "center"
  },
  cardTitle: {
    fontFamily: family.serifItalic,
    fontSize: 27,
    letterSpacing: -0.5,
    color: colors.ink,
    marginTop: 14
  },
  cardBody: {
    fontFamily: family.regular,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.ink2,
    marginTop: 8
  },
  cardFoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.rule2
  },
  cardCta: {
    fontFamily: family.medium,
    fontSize: 12.5,
    color: colors.ink
  },
  footer: {
    fontFamily: family.regular,
    fontSize: 11,
    color: colors.ink3,
    textAlign: "center",
    marginTop: 22
  },
  footerLink: {
    fontFamily: family.medium,
    color: colors.ink
  }
});
