import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Button } from "@/atomic/atoms/Button";
import { QrScannerProps } from "@/atomic/molecules/QrScanner.types";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

/**
 * Escáner de QR para NATIVO (Expo Go / app instalada) vía expo-camera.
 * En web se usa QrScanner.web.tsx (html5-qrcode) automáticamente.
 */
export function QrScanner({ onResult, active = true, size = 224 }: QrScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const handledRef = useRef(false);

  useEffect(() => {
    handledRef.current = false;
  }, [active]);

  if (!permission) {
    return <View style={[styles.frame, { width: size, height: size }]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.fallback, { width: size, height: size }]}>
        <Text style={styles.fallbackText}>Necesitamos permiso de cámara para escanear el QR.</Text>
        <Button label="Permitir cámara" size="sm" height={36} block={false} onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <CameraView
        style={styles.reader}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={
          active
            ? (result: { data: string }) => {
                if (handledRef.current) return;
                handledRef.current = true;
                onResult(result.data);
              }
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: "#0B1240",
    alignItems: "center",
    justifyContent: "center"
  },
  reader: {
    width: "100%",
    height: "100%"
  },
  fallback: {
    borderRadius: radii.lg,
    backgroundColor: colors.alertSoft,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    gap: 12
  },
  fallbackText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    textAlign: "center"
  }
});
