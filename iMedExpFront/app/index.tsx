import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { Redirect } from "expo-router";
import { ScreenFallback } from "@/atomic/molecules/ScreenFallback";
import { DESKTOP_BREAKPOINT } from "@/navigation/desktopVariants";
import { routeForRole } from "@/navigation/roleRoutes";
import { loadSession } from "@/state/sessionStore";

export default function IndexRoute() {
  const { width } = useWindowDimensions();
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await loadSession();
        if (cancelled) return;
        if (session.tokens && session.user) {
          setTarget(routeForRole(session.user.role, width < DESKTOP_BREAKPOINT));
        } else {
          setTarget("home-mob");
        }
      } catch {
        if (!cancelled) {
          setTarget("home-mob");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [width]);

  if (target === null) {
    return <ScreenFallback label="Cargando iMedExp…" />;
  }

  return <Redirect href={{ pathname: "/screen/[id]", params: { id: target } }} />;
}
