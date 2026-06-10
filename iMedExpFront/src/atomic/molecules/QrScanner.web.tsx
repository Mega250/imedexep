import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { QrScannerProps } from "@/atomic/molecules/QrScanner.types";
import { colors, radii } from "@/theme/tokens";
import { family } from "@/theme/typography";

let counter = 0;

/**
 * Detiene y limpia el escáner SIN lanzar nunca, sea cual sea su estado.
 * `Html5Qrcode.stop()` lanza/rechaza si el escáner no está SCANNING/PAUSED
 * (p. ej. al cancelar antes de que la cámara arranque o tras denegar permiso).
 * Si ese error escapaba del cleanup de React, desmontaba el árbol y dejaba la
 * pantalla en blanco. Aquí lo contenemos por completo.
 */
async function safeTeardown(scanner: Html5Qrcode | null): Promise<void> {
  if (!scanner) return;
  try {
    const state = scanner.getState();
    if (
      state === Html5QrcodeScannerState.SCANNING ||
      state === Html5QrcodeScannerState.PAUSED
    ) {
      await scanner.stop();
    }
    scanner.clear();
  } catch {
    /* ya estaba detenido o nunca arrancó: lo ignoramos a propósito */
  }
}

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
    let cancelled = false; // true si se desmonta (cierre del modal / cancelación)
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
          void safeTeardown(scanner); // detener tras leer, sin riesgo de throw
        },
        () => {
          /* fallo por frame sin QR: ignorar */
        }
      )
      .then(() => {
        // Si se canceló mientras la cámara aún arrancaba, apagarla ahora
        // (evita que la cámara quede encendida tras cerrar el modal).
        if (cancelled) void safeTeardown(scanner);
      })
      .catch((err: unknown) => {
        if (cancelled) return; // ya desmontado: no tocar estado de React
        const name = (err as { name?: string } | null)?.name;
        const msg =
          name === "NotAllowedError"
            ? "Permiso de cámara denegado. Habilítalo o usa el código manual."
            : "No pudimos abrir la cámara. Usa el código manual.";
        setError(msg);
        onError?.(msg);
      });

    return () => {
      cancelled = true;
      scannerRef.current = null;
      void safeTeardown(scanner); // teardown seguro: nunca lanza al cerrar
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
