import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { Card } from "@/atomic/atoms/Card";
import { FadeIn } from "@/atomic/atoms/FadeIn";
import { Icon } from "@/atomic/atoms/Icon";
import { HistChips } from "@/atomic/organisms/HistChips";
import { PatientExtrasTabBar } from "@/atomic/organisms/PatientExtrasTabBar";
import { ScreenTopBar } from "@/atomic/organisms/ScreenTopBar";
import { MobileScreen } from "@/atomic/templates/MobileScreen";
import { goToScreen } from "@/navigation/screenRouter";
import { isScreenBlocked, useBlockedScreens } from "@/state/blockedScreens";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

function Header() {
  return (
    <>
      <ScreenTopBar sub="Mi historial" title="Síntomas" />
      <HistChips active={8} />
    </>
  );
}

export function PHistSintomasPage() {
  useBlockedScreens();
  const agendarBlocked = isScreenBlocked("pat-agendar");
  return (
    <MobileScreen
      tabBar={<PatientExtrasTabBar activeScreen="pat-hist" />}
      header={<Header />}
      contentStyle={styles.content}
    >
      <FadeIn>
        <Card radius={radii.xl} style={styles.empty}>
          <View style={styles.iconBox}>
            <Icon kind="wave" size={20} color={colors.accentDeep} />
          </View>
          <Text style={styles.title}>Sin síntomas registrados.</Text>
          <Text style={styles.sub}>
            Cuando un médico documente síntomas durante una consulta, aparecerán aquí.
          </Text>
          {agendarBlocked ? null : (
            <Button
              label="Agendar consulta"
              iconLeft="cal"
              variant="ghost"
              block={false}
              size="md"
              onPress={() => goToScreen("pat-agendar")}
              style={styles.action}
            />
          )}
        </Card>
      </FadeIn>
    </MobileScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 120
  },
  empty: {
    padding: 20,
    backgroundColor: colors.paper3,
    borderColor: colors.accentRule
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.accentBright,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontFamily: family.serifItalic,
    fontSize: 26,
    lineHeight: 30,
    color: colors.ink,
    marginTop: 18
  },
  sub: {
    fontFamily: family.mono,
    fontSize: 12,
    lineHeight: 18,
    color: colors.ink3,
    marginTop: 8
  },
  action: {
    marginTop: 18
  }
});
