import { PropsWithChildren, useCallback, useEffect } from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";
import { useFonts } from "expo-font";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ScreenFallback } from "@/atomic/molecules/ScreenFallback";
import { DESKTOP_BREAKPOINT } from "@/navigation/desktopVariants";
import { AccessibilityProvider } from "@/state/accessibility";
import { PatientProvider } from "@/state/patientContext";
import { hydrateSession, useSessionWatcher } from "@/state/sessionStore";
import { appFonts } from "@/theme/fonts";
import { colors } from "@/theme/tokens";

const WEB_INPUT_RESET_ID = "imedexp-web-input-reset";
const WEB_INPUT_RESET_CSS = `
  input, textarea, select, button {
    outline: none !important;
    -webkit-tap-highlight-color: transparent;
  }
  input:focus, textarea:focus, select:focus, button:focus,
  input:focus-visible, textarea:focus-visible, select:focus-visible, button:focus-visible {
    outline: none !important;
    box-shadow: none !important;
  }
  html[data-imedexp-contrast="high"] body {
    filter: contrast(1.18) saturate(1.05);
  }
  html[data-imedexp-links="underline"] a,
  html[data-imedexp-links="underline"] [role="link"] {
    text-decoration: underline !important;
  }
  html[data-imedexp-theme="dark"] body {
    background: #111;
    filter: invert(1) hue-rotate(180deg);
  }
  html[data-imedexp-theme="dark"] img,
  html[data-imedexp-theme="dark"] video,
  html[data-imedexp-theme="dark"] [data-no-invert] {
    filter: invert(1) hue-rotate(180deg);
  }
  @media (prefers-color-scheme: dark) {
    html[data-imedexp-theme="auto"] body {
      background: #111;
      filter: invert(1) hue-rotate(180deg);
    }
    html[data-imedexp-theme="auto"] img,
    html[data-imedexp-theme="auto"] video,
    html[data-imedexp-theme="auto"] [data-no-invert] {
      filter: invert(1) hue-rotate(180deg);
    }
  }
`;

function useWebInputReset() {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    if (document.getElementById(WEB_INPUT_RESET_ID)) return;
    const style = document.createElement("style");
    style.id = WEB_INPUT_RESET_ID;
    style.appendChild(document.createTextNode(WEB_INPUT_RESET_CSS));
    document.head.appendChild(style);
  }, []);
}

function WebFrame({ children }: PropsWithChildren) {
  const { width } = useWindowDimensions();
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }
  const wide = width >= DESKTOP_BREAKPOINT;
  return (
    <View style={[styles.backdrop, { backgroundColor: wide ? colors.paper : colors.ink }]}>
      <View style={[styles.column, { maxWidth: wide ? undefined : 440 }]}>{children}</View>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(appFonts);
  useWebInputReset();

  useEffect(() => {
    hydrateSession().catch(() => {});
  }, []);

  const handleSessionInvalid = useCallback(() => {
    const compact =
      Platform.OS !== "web" ||
      typeof window === "undefined" ||
      window.innerWidth < DESKTOP_BREAKPOINT;
    try {
      router.replace({
        pathname: "/screen/[id]",
        params: { id: compact ? "login-mob" : "login" },
      });
    } catch {
      // navigator no listo aún
    }
  }, []);

  useSessionWatcher(handleSessionInvalid);

  return (
    <SafeAreaProvider>
      <AccessibilityProvider>
        <PatientProvider>
          <StatusBar style="dark" />
          <WebFrame>
            {fontsLoaded ? (
              <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
            ) : (
              <ScreenFallback label="Cargando iMedExp…" />
            )}
          </WebFrame>
        </PatientProvider>
      </AccessibilityProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center"
  },
  column: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.paper,
    overflow: "hidden"
  }
});
