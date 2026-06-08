import { useCallback, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatComposer } from "@/atomic/chat/ChatComposer";
import { ChatMessage, MessageBubble } from "@/atomic/chat/MessageBubble";
import { sendToAssistant } from "@/services/api/asistenteApi";
import { useSession } from "@/state/sessionStore";
import { colors, spacing } from "@/theme/tokens";

let counter = 0;
const nextId = () => String((counter += 1));

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hola, soy tu asistente clinico. Puedo ayudarte a entender tu historial, tus recetas y resultados, y revisar la foto de un estudio. Es orientacion: tu medico revisa y decide.",
};

export default function AsistenteScreen() {
  const session = useSession();
  const token = session.tokens?.access_token ?? null;
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [busy, setBusy] = useState(false);
  const sessionId = useRef("pac-" + Math.random().toString(36).slice(2, 8)).current;
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const handleSend = useCallback(
    async (text: string, image: string | null) => {
      setMessages((m) => [...m, { id: nextId(), role: "user", text, image }]);
      setBusy(true);
      const reply = await sendToAssistant({ message: text, imageBase64: image, token, sessionId });
      setMessages((m) => {
        const next = [...m, { id: nextId(), role: reply.blocked ? "system" : "assistant", text: reply.answer } as ChatMessage];
        if (reply.requires_clinician_review) {
          next.push({ id: nextId(), role: "system", text: "Esta orientacion sera revisada por un medico con licencia." });
        }
        return next;
      });
      setBusy(false);
    },
    [token, sessionId],
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Asistente clinico</Text>
        <Text style={styles.subtitle}>Apoyo informativo. No sustituye a tu medico.</Text>
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={8}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <MessageBubble msg={item} />}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
        {busy && <Text style={styles.typing}>El asistente esta escribiendo...</Text>}
        <ChatComposer onSend={handleSend} disabled={busy} />
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
  list: { padding: spacing.md, gap: spacing.xs },
  typing: { paddingHorizontal: spacing.page, paddingBottom: spacing.xs, color: colors.ink3, fontSize: 12, fontStyle: "italic" },
});
