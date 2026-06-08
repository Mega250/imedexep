import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

const STORAGE_KEY = "imedexp.accessibility.v2";

export type FontScalePreset = "sm" | "md" | "lg" | "xl";
export type ThemePreference = "auto" | "light" | "dark";

export type AccessibilityPrefs = {
  fontScale: FontScalePreset;
  highContrast: boolean;
  reduceMotion: boolean;
  underlineLinks: boolean;
  theme: ThemePreference;
};

const DEFAULTS: AccessibilityPrefs = {
  fontScale: "md",
  highContrast: false,
  reduceMotion: false,
  underlineLinks: false,
  theme: "auto"
};

export const THEME_LABEL: Record<ThemePreference, string> = {
  auto: "Automático",
  light: "Claro",
  dark: "Oscuro"
};

const SCALE_FACTOR: Record<FontScalePreset, number> = {
  sm: 0.9,
  md: 1,
  lg: 1.15,
  xl: 1.3
};

export const FONT_SCALE_LABEL: Record<FontScalePreset, string> = {
  sm: "Pequeño",
  md: "Estándar",
  lg: "Grande",
  xl: "Muy grande"
};

type AccessibilityContextValue = {
  prefs: AccessibilityPrefs;
  fontScale: number;
  setFontScale: (preset: FontScalePreset) => void;
  setHighContrast: (value: boolean) => void;
  setReduceMotion: (value: boolean) => void;
  setUnderlineLinks: (value: boolean) => void;
  setTheme: (value: ThemePreference) => void;
  reset: () => void;
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: PropsWithChildren) {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw) as Partial<AccessibilityPrefs>;
          setPrefs({ ...DEFAULTS, ...parsed });
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)).catch(() => {});
  }, [hydrated, prefs]);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const root = document.documentElement;
    if (!root) return;
    (root.style as unknown as Record<string, string>).zoom = String(SCALE_FACTOR[prefs.fontScale]);
    if (prefs.highContrast) {
      root.setAttribute("data-imedexp-contrast", "high");
    } else {
      root.removeAttribute("data-imedexp-contrast");
    }
    if (prefs.underlineLinks) {
      root.setAttribute("data-imedexp-links", "underline");
    } else {
      root.removeAttribute("data-imedexp-links");
    }
    root.setAttribute("data-imedexp-theme", prefs.theme);
  }, [prefs.fontScale, prefs.highContrast, prefs.underlineLinks, prefs.theme]);

  const update = useCallback(<K extends keyof AccessibilityPrefs>(key: K, value: AccessibilityPrefs[K]) => {
    setPrefs((current) => ({ ...current, [key]: value }));
  }, []);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      prefs,
      fontScale: SCALE_FACTOR[prefs.fontScale],
      setFontScale: (preset) => update("fontScale", preset),
      setHighContrast: (v) => update("highContrast", v),
      setReduceMotion: (v) => update("reduceMotion", v),
      setUnderlineLinks: (v) => update("underlineLinks", v),
      setTheme: (v) => update("theme", v),
      reset: () => setPrefs(DEFAULTS)
    }),
    [prefs, update]
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility(): AccessibilityContextValue {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    return {
      prefs: DEFAULTS,
      fontScale: 1,
      setFontScale: () => {},
      setHighContrast: () => {},
      setReduceMotion: () => {},
      setUnderlineLinks: () => {},
      setTheme: () => {},
      reset: () => {}
    };
  }
  return ctx;
}
