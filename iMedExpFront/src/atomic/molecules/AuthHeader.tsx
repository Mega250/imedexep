import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/tokens";
import { family } from "@/theme/typography";
import { Logo } from "@/atomic/atoms/Logo";
import { Tappable } from "@/atomic/atoms/Tappable";

type AuthHeaderProps = {
  back?: string;
  onBack?: () => void;
};

export function AuthHeader({ back = "← Volver", onBack }: AuthHeaderProps) {
  return (
    <View style={styles.wrap}>
      <Logo height={28} />
      <Tappable onPress={onBack} scaleTo={0.94} hitSlop={10}>
        <Text style={styles.back}>{back}</Text>
      </Tappable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16
  },
  back: {
    fontFamily: family.regular,
    fontSize: 12,
    color: colors.ink2
  }
});
