import { ActivityIndicator, Text, View } from "react-native";
import { colors } from "@/theme/tokens";

type ScreenFallbackProps = {
  label: string;
};

export function ScreenFallback({ label }: ScreenFallbackProps) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper }}>
      <ActivityIndicator color={colors.accent} />
      <Text style={{ color: colors.ink, marginTop: 12 }}>{label}</Text>
    </View>
  );
}
