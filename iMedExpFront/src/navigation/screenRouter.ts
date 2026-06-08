import { router } from "expo-router";

export function goToScreen(id: string, extra?: Record<string, string | number>): void {
  router.push({ pathname: "/screen/[id]", params: { id, ...stringifyParams(extra) } });
}

export function replaceScreen(id: string, extra?: Record<string, string | number>): void {
  router.replace({ pathname: "/screen/[id]", params: { id, ...stringifyParams(extra) } });
}

export function goBack(fallbackId = "home-mob"): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace({ pathname: "/screen/[id]", params: { id: fallbackId } });
}

function stringifyParams(extra: Record<string, string | number> | undefined): Record<string, string> {
  if (!extra) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(extra)) {
    out[k] = String(v);
  }
  return out;
}
