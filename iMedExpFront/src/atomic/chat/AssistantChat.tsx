import { useCallback, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { ChatComposer } from "@/atomic/chat/ChatComposer";
import { ChatMessage, MessageBubble } from "@/atomic/chat/MessageBubble";
import { sendToAssistant } from "@/services/api/asistenteApi";
import { useSession } from "@/state/sessionStore";
import { colors, spacing } from "@/theme/tokens";
import { family } from "@/theme/typography";

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
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const handleSend = useCallback(
    async (text: string, image: string | null) => {
      setMessages((m) => [...m, { id: nextId(), role: "user", text, image }]);
      setBusy(true);
      // Stateless: mandamos conversationId null SIEMPRE para que el backend no
      // replaye el historial. Cada mensaje es independiente (menos tokens/costo).
      const reply = await sendToAssistant({ message: text, imageBase64: image, token, conversationId: null });
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
      // Stateless: sin conversationId, el agente no recuerda el hilo.
      const reply = await sendToAssistant({ message: send, token, conversationId: null });
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
      <View style={styles.privacyBanner}>
        <Text style={styles.privacyText}>
          🔒 Por tu privacidad y optimización del servicio, este chat no almacena
          historial. Cada mensaje es independiente; el agente no recordará consultas
          anteriores al enviar una nueva.
        </Text>
      </View>
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
  privacyBanner: {
    backgroundColor: colors.paper3,
    borderBottomWidth: 1,
    borderBottomColor: colors.rule,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  privacyText: {
    fontFamily: family.mono,
    fontSize: 11,
    lineHeight: 16,
    color: colors.ink3,
  },
});
