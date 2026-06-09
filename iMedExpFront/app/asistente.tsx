import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AssistantChat } from "@/atomic/chat/AssistantChat";
import { colors, spacing } from "@/theme/tokens";

export default function AsistenteScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Asistente clinico</Text>
        <Text style={styles.subtitle}>Apoyo informativo. No sustituye a tu medico.</Text>
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={8}>
        <AssistantChat />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.page, paddingVertical: spacing.md, backgroundColor: colors.ink, gap: 2 },
  title: { color: colors.white, fontSize: 18, fontWeight: "700" },
  subtitle: { color: colors.ink5, fontSize: 12 },
});
