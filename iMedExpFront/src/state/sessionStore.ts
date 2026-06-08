import { useEffect, useSyncExternalStore } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CurrentUser, getCurrentUser, TokenResponse } from "@/services/auth/authApi";

const tokenKey = "imedexp.tokens";
const userKey = "imedexp.user";
const appStoragePrefix = "imedexp.";
const preservedStorageKeys = new Set(["imedexp.accessibility.v2"]);

export type SessionSnapshot = {
  tokens: TokenResponse | null;
  user: CurrentUser | null;
};

const EMPTY_SNAPSHOT: SessionSnapshot = { tokens: null, user: null };

let cachedSnapshot: SessionSnapshot = EMPTY_SNAPSHOT;
let hydrated = false;
let hydrationPromise: Promise<SessionSnapshot> | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getServerSnapshot(): SessionSnapshot {
  return cachedSnapshot;
}

function getSnapshot(): SessionSnapshot {
  return cachedSnapshot;
}

export function getSessionSnapshot(): SessionSnapshot {
  return cachedSnapshot;
}

export function isSessionHydrated(): boolean {
  return hydrated;
}

async function readFromStorage(): Promise<SessionSnapshot> {
  const tokenValue = await AsyncStorage.getItem(tokenKey);
  const userValue = await AsyncStorage.getItem(userKey);
  return {
    tokens: tokenValue ? (JSON.parse(tokenValue) as TokenResponse) : null,
    user: userValue ? (JSON.parse(userValue) as CurrentUser) : null
  };
}

export async function hydrateSession(): Promise<SessionSnapshot> {
  if (hydrated) {
    return cachedSnapshot;
  }
  if (hydrationPromise) {
    return hydrationPromise;
  }
  hydrationPromise = (async () => {
    try {
      const snapshot = await readFromStorage();
      cachedSnapshot = snapshot;
      hydrated = true;
      notify();
      return snapshot;
    } catch {
      cachedSnapshot = EMPTY_SNAPSHOT;
      hydrated = true;
      notify();
      return EMPTY_SNAPSHOT;
    } finally {
      hydrationPromise = null;
    }
  })();
  return hydrationPromise;
}

export async function saveSession(tokens: TokenResponse, user: CurrentUser): Promise<void> {
  cachedSnapshot = { tokens, user };
  hydrated = true;
  notify();
  await Promise.all([
    AsyncStorage.setItem(tokenKey, JSON.stringify(tokens)),
    AsyncStorage.setItem(userKey, JSON.stringify(user))
  ]);
}

export async function loadSession(): Promise<SessionSnapshot> {
  if (hydrated) {
    return cachedSnapshot;
  }
  return hydrateSession();
}

export async function clearSession(): Promise<void> {
  cachedSnapshot = EMPTY_SNAPSHOT;
  hydrated = true;
  notify();
  try {
    const keys = await AsyncStorage.getAllKeys();
    const sessionKeys = keys.filter(
      (key) => key.startsWith(appStoragePrefix) && !preservedStorageKeys.has(key)
    );
    const toRemove = Array.from(new Set([tokenKey, userKey, ...sessionKeys]));
    if (toRemove.length) {
      await AsyncStorage.multiRemove(toRemove);
    }
  } catch {
    await Promise.all([
      AsyncStorage.removeItem(tokenKey),
      AsyncStorage.removeItem(userKey)
    ]);
  }
}

export function useSession(): SessionSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const SESSION_WATCHER_INTERVAL_MS = 2 * 60 * 1000;
const FIRST_TICK_DELAY_MS = 1500;

function isPageHidden(): boolean {
  if (Platform.OS !== "web") return false;
  if (typeof document === "undefined") return false;
  return document.visibilityState === "hidden";
}

export function useSessionWatcher(onInvalid: () => void): void {
  useEffect(() => {
    let cancelled = false;

    async function tick() {
      if (cancelled) return;
      if (isPageHidden()) return;
      const session = await loadSession();
      if (!session.tokens || !session.user) return;
      try {
        const fresh = await getCurrentUser(session.tokens.access_token);
        if (cancelled) return;
        if (
          fresh.role !== session.user.role ||
          fresh.is_active === false ||
          fresh.id !== session.user.id
        ) {
          await clearSession();
          onInvalid();
        } else {
          await saveSession(session.tokens, fresh);
        }
      } catch {
        // si el endpoint falla con 401, authedRequest ya se encarga
      }
    }

    const firstTimeout = setTimeout(() => {
      tick();
    }, FIRST_TICK_DELAY_MS);
    const interval = setInterval(tick, SESSION_WATCHER_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(firstTimeout);
      clearInterval(interval);
    };
  }, [onInvalid]);
}
