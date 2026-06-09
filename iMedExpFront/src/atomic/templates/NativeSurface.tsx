import { PropsWithChildren } from "react";
import { View } from "react-native";
import { colors } from "@/theme/tokens";

export function NativeSurface({ children }: PropsWithChildren) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      {children}
    </View>
  );
}
