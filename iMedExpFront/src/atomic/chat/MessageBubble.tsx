import { Image, StyleSheet, Text, View } from "react-native";

import { colors, radii, spacing } from "@/theme/tokens";

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  image?: string | null;
};

export function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";
  return (
    <View style={[styles.row, isUser ? styles.rowEnd : styles.rowStart]}>
      <View style={[styles.bubble, isUser ? styles.user : isSystem ? styles.system : styles.assistant]}>
        {msg.text.length > 0 && (
          <Text style={[styles.text, isUser ? styles.textOnInk : styles.textInk]}>{msg.text}</Text>
        )}
        {!!msg.image && <Image source={{ uri: msg.image }} style={styles.image} resizeMode="cover" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { width: "100%", marginVertical: spacing.xs / 2, flexDirection: "row" },
  rowStart: { justifyContent: "flex-start" },
  rowEnd: { justifyContent: "flex-end" },
  bubble: { maxWidth: "82%", paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md, borderRadius: radii.lg },
  assistant: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.rule, borderBottomLeftRadius: radii.sm },
  user: { backgroundColor: colors.accent, borderBottomRightRadius: radii.sm },
  system: { backgroundColor: colors.okSoft, borderWidth: 1, borderColor: colors.okRule, alignSelf: "center" },
  text: { fontSize: 15, lineHeight: 21 },
  textInk: { color: colors.ink },
  textOnInk: { color: colors.white },
  image: { width: 180, height: 140, borderRadius: radii.md, marginTop: spacing.sm },
});
