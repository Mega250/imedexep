export type QrScannerProps = {
  /** Se llama una sola vez con el texto decodificado del QR. */
  onResult: (text: string) => void;
  /** Errores de cámara/permiso (no fatales: siempre queda el código manual). */
  onError?: (message: string) => void;
  /** Mientras sea false la cámara no se enciende (evita pedir permiso de más). */
  active?: boolean;
  /** Lado del cuadro de escaneo en px. */
  size?: number;
};
