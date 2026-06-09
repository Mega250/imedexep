import { useSyncExternalStore } from "react";
import { fetchMyBlockedScreens } from "@/services/api/screenAccessApi";
import { toDesktopScreenId, toMobileScreenId } from "@/navigation/desktopVariants";

let blocked = new Set<string>();
let loaded = false;
const listeners = new Set<() => void>();

function notify(): void {
  for (const l of listeners) l();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Set<string> {
  return blocked;
}

const AGENDAR_CASCADE: Record<string, string> = {
  "pat-agendar": "pat-citas",
  "pd-agendar": "pd-citas"
};

function isRawBlocked(screenId: string): boolean {
  return (
    blocked.has(screenId) ||
    blocked.has(toDesktopScreenId(screenId)) ||
    blocked.has(toMobileScreenId(screenId))
  );
}

export function isScreenBlocked(screenId: string | undefined): boolean {
  if (!screenId) return false;
  if (isRawBlocked(screenId)) return true;
  const cascadeFrom = AGENDAR_CASCADE[screenId];
  return !!cascadeFrom && isRawBlocked(cascadeFrom);
}

export async function loadBlockedScreens(): Promise<void> {
  try {
    const res = await fetchMyBlockedScreens();
    blocked = new Set(res.blocked ?? []);
    loaded = true;
    notify();
  } catch {
    blocked = new Set();
    notify();
  }
}

export function ensureBlockedLoaded(): void {
  if (loaded) return;
  loaded = true;
  loadBlockedScreens();
}

export function clearBlockedScreens(): void {
  if (!loaded && blocked.size === 0) return;
  blocked = new Set();
  loaded = false;
  notify();
}

export function useBlockedScreens(): Set<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
