import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radii, spacing } from "@/theme/tokens";

type Props = {
  onSend: (text: string, imageBase64: string | null) => void;
  disabled?: boolean;
};

export function ChatComposer({ onSend, disabled }: Props) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);

  async function pickImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: false, // una sola por selección (blindaje, incluye el diálogo web)
      quality: 0.7,
      base64: true
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    if (asset.base64) {
      // Reemplaza automáticamente la imagen anterior: siempre queda una sola adjunta.
      setImage(`data:image/jpeg;base64,${asset.base64}`);
    }
  }

  function submit() {
    const value = text.trim();
    if ((!value && !image) || disabled) return;
    onSend(value, image);
    setText("");
    setImage(null);
  }

  return (
    <View style={styles.wrap}>
      {!!image && (
        <View style={styles.preview}>
          <Image source={{ uri: image }} style={styles.thumb} />
          <Pressable onPress={() => setImage(null)} hitSlop={8}>
            <Text style={styles.remove}>Quitar</Text>
          </Pressable>
        </View>
      )}
      <View style={styles.bar}>
        <Pressable
          onPress={pickImage}
          style={styles.attach}
          hitSlop={6}
          disabled={disabled}
          accessibilityLabel={image ? "Reemplazar la imagen adjunta" : "Adjuntar una imagen"}
        >
          <Text style={styles.attachIcon}>+</Text>
        </Pressable>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Escribe tu consulta..."
          placeholderTextColor={colors.ink4}
          multiline
          editable={!disabled}
          onSubmitEditing={submit}
        />
        <Pressable onPress={submit} style={[styles.send, disabled && styles.sendOff]} disabled={disabled}>
          <Text style={styles.sendText}>Enviar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderTopWidth: 1, borderTopColor: colors.rule, backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
  preview: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  thumb: { width: 44, height: 44, borderRadius: radii.sm },
  remove: { color: colors.accentDeep, fontSize: 13 },
  bar: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm },
  attach: { width: 42, height: 42, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.rule, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper },
  attachIcon: { fontSize: 22, color: colors.accent, lineHeight: 24 },
  input: { flex: 1, maxHeight: 120, minHeight: 42, borderWidth: 1, borderColor: colors.rule, borderRadius: radii.lg, paddingHorizontal: spacing.md, paddingTop: 10, paddingBottom: 10, fontSize: 15, color: colors.ink, backgroundColor: colors.paper },
  send: { paddingHorizontal: spacing.md, height: 42, borderRadius: radii.pill, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  sendOff: { opacity: 0.5 },
  sendText: { color: colors.white, fontWeight: "600", fontSize: 15 },
});
