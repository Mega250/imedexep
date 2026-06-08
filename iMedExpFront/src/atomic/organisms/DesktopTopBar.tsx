import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { RoundIconButton } from "@/atomic/atoms/RoundIconButton";
import { goToScreen } from "@/navigation/screenRouter";
import { colors } from "@/theme/tokens";
import { family, text } from "@/theme/typography";

type DesktopTopBarProps = {
  title: string;
  eyebrow?: string;
  hasAlert?: boolean;
  right?: ReactNode;
  notificationsScreen?: string;
};

export function DesktopTopBar({
  title,
  eyebrow,
  hasAlert = false,
  right,
  notificationsScreen
}: DesktopTopBarProps) {
  const showBell = !!notificationsScreen && notificationsScreen !== "settings";
  const pointsToInvites = !!notificationsScreen && notificationsScreen.includes("invite");
  return (
    <View style={styles.bar}>
      <View style={styles.titleBlock}>
        {eyebrow ? (
          <Text style={styles.eyebrow} numberOfLines={1} ellipsizeMode="tail">
            {eyebrow}
          </Text>
        ) : null}
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </View>
      <View style={styles.actions}>
        {right}
        {showBell ? (
          <View>
            <RoundIconButton
              icon={pointsToInvites ? "inbox" : "bell"}
              variant="ghost"
              accessibilityLabel={pointsToInvites ? "Invitaciones" : "Notificaciones"}
              onPress={() => goToScreen(notificationsScreen!)}
            />
            {hasAlert && <View style={styles.alertDot} />}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule2,
    backgroundColor: colors.white
  },
  titleBlock: {
    flex: 1,
    minWidth: 0
  },
  eyebrow: {
    ...text.eyebrow,
    fontSize: 9.5,
    color: colors.ink3
  },
  title: {
    fontFamily: family.medium,
    fontSize: 17,
    letterSpacing: -0.4,
    color: colors.ink
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0
  },
  alertDot: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.alert
  }
});
