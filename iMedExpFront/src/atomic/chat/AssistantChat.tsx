import { useCallback, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

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
  text: "Hola, soy tu asistente clinico. Puedo ayudarte a entender tu historial, tus recetas y resultados, revisar la foto de un estudio y agendar citas. Es orientacion: tu medico revisa y decide.",
};

export function AssistantChat() {
  const session = useSession();
  const token = session.tokens?.access_token ?? null;
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [busy, setBusy] = useState(false);
  const conversationId = useRef<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const handleSend = useCallback(
    async (text: string, image: string | null) => {
      setMessages((m) => [...m, { id: nextId(), role: "user", text, image }]);
      setBusy(true);
      const reply = await sendToAssistant({ message: text, imageBase64: image, token, conversationId: conversationId.current });
      if (reply.conversation_id) {
        conversationId.current = reply.conversation_id;
      }
      setMessages((m) => {
        const next = [
          ...m,
          { id: nextId(), role: reply.blocked ? "system" : "assistant", text: reply.answer, blocks: reply.blocks } as ChatMessage,
        ];
        return next;
      });
      setBusy(false);
    },
    [token],
  );

  const handleAction = useCallback(
    async (send: string, display: string) => {
      setMessages((m) => [...m, { id: nextId(), role: "user", text: display }]);
      setBusy(true);
      const reply = await sendToAssistant({ message: send, token, conversationId: conversationId.current });
      if (reply.conversation_id) {
        conversationId.current = reply.conversation_id;
      }
      setMessages((m) => [
        ...m,
        { id: nextId(), role: reply.blocked ? "system" : "assistant", text: reply.answer, blocks: reply.blocks } as ChatMessage,
      ]);
      setBusy(false);
    },
    [token],
  );

  return (
    <View style={styles.flex}>
      <FlatList
        ref={listRef}
        style={styles.flex}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MessageBubble msg={item} onAction={handleAction} />}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />
      {busy && <Text style={styles.typing}>El asistente esta consultando...</Text>}
      <ChatComposer onSend={handleSend} disabled={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: spacing.md, gap: spacing.xs },
  typing: { paddingHorizontal: spacing.page, paddingBottom: spacing.xs, color: colors.ink3, fontSize: 12, fontStyle: "italic" },
});
