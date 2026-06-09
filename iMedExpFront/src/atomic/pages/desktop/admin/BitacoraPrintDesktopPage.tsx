import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Logo } from "@/atomic/atoms/Logo";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

export function BitacoraPrintDesktopPage() {
  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Logo height={22} color={colors.ink} />
        <Text style={styles.title}>Vista no disponible</Text>
        <Text style={styles.body}>
          La impresión de la bitácora aún no está conectada al registro real de
          atenciones. Esta vista estará disponible cuando la bitácora se integre con el
          expediente.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.paper
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 20
  },
  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.xl,
    paddingHorizontal: 32,
    paddingVertical: 36,
    alignItems: "center",
    gap: 14
  },
  title: {
    fontFamily: family.serif,
    fontSize: 28,
    letterSpacing: -0.56,
    color: colors.ink,
    marginTop: 8
  },
  body: {
    fontFamily: family.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.ink3,
    textAlign: "center"
  }
});
