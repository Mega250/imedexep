import { useEffect, useState } from "react";
import { Platform, useWindowDimensions, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { DesignScreenPage } from "@/atomic/pages/DesignScreenPage";
import { ScreenFallback } from "@/atomic/molecules/ScreenFallback";
import { DESKTOP_BREAKPOINT, toDesktopScreenId, toMobileScreenId } from "@/navigation/desktopVariants";
import { findNativeScreen } from "@/navigation/nativeRegistry";
import { findDesktopScreen } from "@/navigation/desktopRegistry";
import { routeForRole } from "@/navigation/roleRoutes";
import { isPublicScreen, isScreenAllowedForRole } from "@/navigation/screenAccess";
import {
  clearBlockedScreens,
  ensureBlockedLoaded,
  isScreenBlocked,
  useBlockedScreens
} from "@/state/blockedScreens";
import {
  getSessionSnapshot,
  hydrateSession,
  isSessionHydrated,
  loadSession
} from "@/state/sessionStore";

type GuardResult =
  | { status: "checking" }
  | { status: "redirecting"; targetId: string }
  | { status: "ok" };

function evaluateGuard(
  rawScreenId: string | undefined,
  compact: boolean
): GuardResult {
  if (!rawScreenId) {
    return { status: "ok" };
  }
  if (isPublicScreen(rawScreenId)) {
    return { status: "ok" };
  }
  const session = getSessionSnapshot();
  const role = session.user?.role;
  if (!session.tokens || !role) {
    return { status: "redirecting", targetId: compact ? "login-mob" : "login" };
  }
  if (!isScreenAllowedForRole(rawScreenId, role)) {
    return { status: "redirecting", targetId: routeForRole(role, compact) };
  }
  if (isScreenBlocked(rawScreenId)) {
    return { status: "redirecting", targetId: routeForRole(role, compact) };
  }
  return { status: "ok" };
}

function useScreenGuard(rawScreenId: string | undefined, compact: boolean): GuardResult {
  const blockedSet = useBlockedScreens();
  const initial: GuardResult = isSessionHydrated() || isPublicScreen(rawScreenId)
    ? evaluateGuard(rawScreenId, compact)
    : { status: "checking" };
  const [state, setState] = useState<GuardResult>(initial);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!isSessionHydrated()) {
        await loadSession();
      }
      if (cancelled) return;
      const snap = getSessionSnapshot();
      if (snap.tokens && snap.user?.role) {
        ensureBlockedLoaded();
      } else {
        clearBlockedScreens();
      }
      setState(evaluateGuard(rawScreenId, compact));
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [rawScreenId, compact, blockedSet]);

  return state;
}

const FILL = { flex: 1 } as const;
const NO_INVERT_PROPS: Record<string, unknown> =
  Platform.OS === "web" ? { dataSet: { noInvert: "true" } } : {};

export default function ScreenRoute() {
  const params = useLocalSearchParams<{ id?: string; next?: string }>();
  const { width } = useWindowDimensions();
  const compact = !(Platform.OS === "web" && width >= DESKTOP_BREAKPOINT);
  const guard = useScreenGuard(params.id, compact);
  const redirectTarget = guard.status === "redirecting" ? guard.targetId : null;

  useEffect(() => {
    if (!redirectTarget) {
      return;
    }
    const shouldResume = redirectTarget === "login" || redirectTarget === "login-mob";
    if (shouldResume && params.id) {
      router.replace(
        `/screen/${redirectTarget}?next=${encodeURIComponent(params.id)}`
      );
      return;
    }
    router.replace({
      pathname: "/screen/[id]",
      params: { id: redirectTarget },
    });
  }, [params.id, redirectTarget]);

  if (guard.status !== "ok") {
    return <ScreenFallback label="Verificando acceso…" />;
  }

  const isPublic = isPublicScreen(params.id);

  let screenContent;
  if (Platform.OS === "web" && width >= DESKTOP_BREAKPOINT) {
    const desktopId = toDesktopScreenId(params.id);
    const DesktopScreen = findDesktopScreen(desktopId);
    screenContent = DesktopScreen ? <DesktopScreen /> : <DesignScreenPage screenId={desktopId} />;
  } else {
    const mobileId = toMobileScreenId(params.id);
    const NativeScreen = findNativeScreen(mobileId);
    screenContent = NativeScreen ? <NativeScreen /> : <DesignScreenPage screenId={mobileId} />;
  }

  if (isPublic && Platform.OS === "web") {
    return (
      <View style={FILL} {...NO_INVERT_PROPS}>
        {screenContent}
      </View>
    );
  }

  return screenContent;
}
