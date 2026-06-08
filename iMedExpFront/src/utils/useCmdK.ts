import { useEffect } from "react";
import { Platform } from "react-native";

export function useCmdKFocus(ref: React.MutableRefObject<unknown>): void {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const handler = (event: KeyboardEvent) => {
      const isK = event.key === "k" || event.key === "K";
      const meta = event.metaKey || event.ctrlKey;
      if (isK && meta) {
        event.preventDefault();
        const node = ref.current as { focus?: () => void } | null;
        node?.focus?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [ref]);
}
