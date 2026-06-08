import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Html5Qrcode } from "html5-qrcode";
import { QrScannerProps } from "@/atomic/molecules/QrScanner.types";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

let counter = 0;

/**
 * Escáner de QR para WEB (navegador del celular vía túnel HTTPS).
 * Usa html5-qrcode sobre getUserMedia: requiere contexto seguro (https),
 * que el túnel de Cloudflare ya provee.
 */
export function QrScanner({ onResult, onError, active = true, size = 224 }: QrScannerProps) {
  const [elementId] = useState(() => `qr-reader-${++counter}`);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handledRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;
    if (typeof document === "undefined") return;
    const node = document.getElementById(elementId);
    if (!node) return;

    handledRef.current = false;
    setError(null);
    const scanner = new Html5Qrcode(elementId, { verbose: false });
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: Math.min(size - 32, 220), height: Math.min(size - 32, 220) } },
        (decodedText: string) => {
          if (handledRef.current) return;
          handledRef.current = true;
          onResult(decodedText);
          scanner.stop().catch(() => {});
        },
        () => {
          /* fallo por frame sin QR: ignorar */
        }
      )
      .catch((err: unknown) => {
        const name = (err as { name?: string } | null)?.name;
        const msg =
          name === "NotAllowedError"
            ? "Permiso de cámara denegado. Habilítalo o usa el código manual."
            : "No pudimos abrir la cámara. Usa el código manual.";
        setError(msg);
        onError?.(msg);
      });

    return () => {
      const s = scannerRef.current;
      scannerRef.current = null;
      if (s) {
        s.stop()
          .then(() => s.clear())
          .catch(() => {});
      }
    };
  }, [active, elementId, onError, onResult, size]);

  if (error) {
    return (
      <View style={[styles.fallback, { width: size, height: size }]}>
        <Text style={styles.fallbackText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      <View nativeID={elementId} style={styles.reader} />
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
    paddingHorizontal: 18
  },
  fallbackText: {
    fontFamily: family.mono,
    fontSize: 11,
    color: colors.alert,
    textAlign: "center"
  }
});
