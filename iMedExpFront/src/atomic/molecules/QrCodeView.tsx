import { StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { colors, radii } from "@/theme/tokens";

type QrCodeViewProps = {
  /** Texto que codifica el QR (aquí, el verification_code del acceso). */
  value: string;
  size?: number;
};

/**
 * QR real y escaneable (vía react-native-qrcode-svg / react-native-svg).
 * Funciona en web (navegador del celular vía túnel) y en nativo (Expo Go).
 */
export function QrCodeView({ value, size = 208 }: QrCodeViewProps) {
  return (
    <View style={styles.box}>
      <QRCode
        value={value || "—"}
        size={size}
        color={colors.ink}
        backgroundColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.rule
  }
});
