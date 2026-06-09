import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/atomic/atoms/Button";
import { QrScanner } from "@/atomic/molecules/QrScanner";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

function normalizeCode(input: string): string {
  // El QR del paciente codifica el verification_code; si llegara un URL,
  // tomamos el último segmento alfanumérico con guiones.
  const raw =
    input.includes("/") || input.includes("=") ? input.split(/[/=]/).pop() ?? input : input;
  return raw.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12);
}

type QrScanModalProps = {
  visible: boolean;
  onClose: () => void;
  onCode: (code: string) => void;
  title?: string;
};

/**
 * Modal de escaneo de QR reutilizable (médico, secretaría, etc.).
 * Usa la cámara (QrScanner: html5-qrcode en web, expo-camera en nativo) y
 * siempre deja un campo de código manual como respaldo.
 */
export function QrScanModal({
  visible,
  onClose,
  onCode,
  title = "Escanear QR del paciente"
}: QrScanModalProps) {
  const [manual, setManual] = useState("");

  function submitManual() {
    const code = normalizeCode(manual);
    if (code.length < 4) return;
    setManual("");
    onCode(code);
  }

  function handleScan(text: string) {
    const code = normalizeCode(text);
    if (code.length < 4) return;
    onCode(code);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>Apunta la cámara al QR del paciente o escribe el código.</Text>

          {visible ? (
            <View style={styles.scannerWrap}>
              <QrScanner active onResult={handleScan} size={236} />
            </View>
          ) : null}

          <Text style={styles.manualLabel}>O escribe el código</Text>
          <TextInput
            value={manual}
            onChangeText={(v) => setManual(v.toUpperCase())}
            placeholder="XXXX-XXXX"
            placeholderTextColor={colors.ink3}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.input}
          />

          <View style={styles.actions}>
            <Button label="Cancelar" variant="ghost" size="sm" block={false} onPress={onClose} />
            <Button
              label="Usar código"
              size="sm"
              block={false}
              onPress={submitManual}
              disabled={normalizeCode(manual).length < 4}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(3,4,94,0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.rule,
    padding: 20
  },
  title: {
    fontFamily: family.medium,
    fontSize: 16,
    color: colors.ink
  },
  sub: {
    fontFamily: family.mono,
    fontSize: 10.5,
    color: colors.ink3,
    marginTop: 4
  },
  scannerWrap: {
    alignItems: "center",
    marginTop: 16
  },
  manualLabel: {
    fontFamily: family.mono,
    fontSize: 10,
    color: colors.ink3,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginTop: 18
  },
  input: {
    marginTop: 8,
    height: 46,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.rule,
    backgroundColor: colors.white,
    fontFamily: family.monoMedium,
    fontSize: 16,
    letterSpacing: 4,
    color: colors.ink,
    textAlign: "center"
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16
  }
});
