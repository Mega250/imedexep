import { isPublicScreen, isScreenAllowedForRole } from "@/navigation/screenAccess";

export function routeForRole(role: string, compact: boolean): string {
  const normalized = role.toLowerCase();
  if (normalized === "patient") {
    return compact ? "pat-inicio" : "pd-inicio";
  }
  if (normalized === "doctor") {
    return compact ? "dash-mob" : "doctor-dash";
  }
  if (normalized === "secretary") {
    return compact ? "sec-reception-mob" : "sec-reception";
  }
  if (normalized === "institution_admin") {
    return compact ? "dir-dash-mob" : "dir-dash";
  }
  if (normalized === "superadmin") {
    return compact ? "sa-dash-mob" : "sa-dash";
  }
  return compact ? "login-mob" : "login";
}

export function routeAfterLogin(
  role: string,
  compact: boolean,
  requestedScreen?: string
): string {
  if (
    requestedScreen &&
    !isPublicScreen(requestedScreen) &&
    isScreenAllowedForRole(requestedScreen, role)
  ) {
    return requestedScreen;
  }
  return routeForRole(role, compact);
}
