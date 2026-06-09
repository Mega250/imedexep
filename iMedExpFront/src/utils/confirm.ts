import { Alert, Platform } from "react-native";

export type ConfirmOptions = {
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
};

export function confirmAction(
  title: string,
  message = "",
  opts: ConfirmOptions = {}
): Promise<boolean> {
  const { confirmLabel = "Aceptar", cancelLabel = "Cancelar", destructive = false } = opts;

  if (Platform.OS === "web") {
    if (typeof window === "undefined" || typeof window.confirm !== "function") {
      return Promise.resolve(true);
    }
    const text = message ? `${title}\n\n${message}` : title;
    return Promise.resolve(window.confirm(text));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: "cancel", onPress: () => resolve(false) },
      {
        text: confirmLabel,
        style: destructive ? "destructive" : "default",
        onPress: () => resolve(true)
      }
    ]);
  });
}
