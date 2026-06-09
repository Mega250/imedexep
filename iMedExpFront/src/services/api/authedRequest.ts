import { Platform } from "react-native";
import { router } from "expo-router";
import { apiRequest, ApiError, isWebClient } from "@/services/api/client";
import { logoutSession, refreshTokens } from "@/services/auth/authApi";
import { clearSession, loadSession, saveSession } from "@/state/sessionStore";
import { DESKTOP_BREAKPOINT } from "@/navigation/desktopVariants";

function compactByPlatform(): boolean {
  if (Platform.OS !== "web") return true;
  if (typeof window === "undefined") return true;
  return window.innerWidth < DESKTOP_BREAKPOINT;
}

async function bounceToLogin(): Promise<void> {
  const target = compactByPlatform() ? "login-mob" : "login";
  try {
    router.replace({ pathname: "/screen/[id]", params: { id: target } });
  } catch {
    // navigator no listo todavía
  }
}

let refreshInFlight: Promise<unknown> | null = null;
let bounced = false;

async function singleFlightRefresh(refreshBody: Record<string, unknown>): Promise<unknown> {
  if (!refreshInFlight) {
    refreshInFlight = refreshTokens(refreshBody as never).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function authedRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const session = await loadSession();
  if (!session.tokens || !session.user) {
    if (!bounced) {
      bounced = true;
      await bounceToLogin();
    }
    throw new ApiError(401, "Sin sesión activa");
  }

  try {
    return await apiRequest<T>(path, { ...options, token: session.tokens.access_token });
  } catch (err) {
    if (!(err instanceof ApiError)) {
      throw err;
    }
    if (err.status === 403) {
      throw err;
    }
    if (err.status !== 401) {
      throw err;
    }
    try {
      const refreshBody = isWebClient
        ? {}
        : { refresh_token: session.tokens.refresh_token };
      const newTokens = (await singleFlightRefresh(refreshBody)) as Awaited<
        ReturnType<typeof refreshTokens>
      >;
      const mergedTokens = isWebClient
        ? {
            ...newTokens,
            refresh_token: newTokens.refresh_token || session.tokens.refresh_token
          }
        : newTokens;
      await saveSession(mergedTokens, session.user);
      bounced = false;
      return await apiRequest<T>(path, { ...options, token: mergedTokens.access_token });
    } catch {
      await clearSession();
      if (!bounced) {
        bounced = true;
        await bounceToLogin();
      }
      throw new ApiError(401, "Sesión expirada. Inicia sesión nuevamente.");
    }
  }
}

export async function logout(): Promise<void> {
  const [
    { clearCurrentDoctorCache },
    { clearCurrentPatientCache },
    { clearSelectedPatient },
    { clearSelectedInstitutionId }
  ] = await Promise.all([
    import("@/services/api/currentDoctor"),
    import("@/services/api/currentPatient"),
    import("@/services/api/selectedPatient"),
    import("@/state/selectedInstitution")
  ]);
  clearCurrentDoctorCache();
  clearCurrentPatientCache();
  clearSelectedInstitutionId();
  await clearSelectedPatient();
  await clearSession();
  await bounceToLogin();
  Promise.race([
    logoutSession(),
    new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error("logout timeout")), 1500)
    )
  ]).catch(() => {
    // best-effort: el server limpia su side por TTL si falla
  });
}
