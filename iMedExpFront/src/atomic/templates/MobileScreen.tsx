import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import { Edge, SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/theme/tokens";

type MobileScreenProps = {
  children: ReactNode;
  background?: string;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  header?: ReactNode;
  tabBar?: ReactNode;
  floating?: ReactNode;
  keyboardAware?: boolean;
};

export function MobileScreen({
  children,
  background = colors.paper,
  scroll = true,
  contentStyle,
  header,
  tabBar,
  floating,
  keyboardAware = false
}: MobileScreenProps) {
  const edges: Edge[] = tabBar ? ["top"] : ["top", "bottom"];

  const body = scroll ? (
    <ScrollView
      style={styles.fill}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.fill, contentStyle]}>{children}</View>
  );

  const inner = (
    <View style={styles.fill}>
      {header}
      {body}
    </View>
  );

  return (
    <SafeAreaView style={[styles.fill, { backgroundColor: background }]} edges={edges}>
      {keyboardAware ? (
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {inner}
        </KeyboardAvoidingView>
      ) : (
        inner
      )}
      {floating}
      {tabBar}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1
  }
});
