export function parseDateLocal(value: string | null | undefined): Date | null {
  if (!value) return null;
  const head = value.slice(0, 10);
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(head);
  if (dateOnly && value.length <= 10) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const DEFAULT_OPTS: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };

export function formatDateLocal(
  value: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = DEFAULT_OPTS,
  fallback = "—"
): string {
  const d = parseDateLocal(value);
  if (!d) return fallback;
  try {
    return d.toLocaleDateString("es-MX", opts);
  } catch {
    return fallback;
  }
}

export function isFutureDateLocal(value: string | null | undefined): boolean {
  const d = parseDateLocal(value);
  if (!d) return false;
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  return d.getTime() > todayEnd.getTime();
}

export function apptWallDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes()
  );
}

export function formatApptTime(value: string | null | undefined, fallback = "—"): string {
  const d = apptWallDate(value);
  if (!d) return fallback;
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
}

const APPT_DT_OPTS: Intl.DateTimeFormatOptions = {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
};

export function formatApptDateTime(
  value: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = APPT_DT_OPTS,
  fallback = "—"
): string {
  const d = apptWallDate(value);
  if (!d) return fallback;
  return d.toLocaleString("es-MX", opts);
}
