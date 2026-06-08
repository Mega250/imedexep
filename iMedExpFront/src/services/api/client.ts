import { Platform } from "react-native";
import Constants from "expo-constants";

export type ApiRequestOptions = RequestInit & {
  token?: string;
};

export const isWebClient = Platform.OS === "web";

const API_PORT = 8000;
const fallbackBaseUrl = `http://localhost:${API_PORT}`;
const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

function isLocalhostBaseUrl(value: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(value);
}

/**
 * En Expo Go la app corre en el teléfono, así que "localhost" apunta al teléfono.
 * Derivamos la IP de la PC desde el host de Expo (el mismo de Metro en :8081) y
 * apuntamos el API a :8000. Así funciona sin configurar la IP a mano.
 */
function expoHostIp(): string | null {
  const c = Constants as unknown as {
    expoConfig?: { hostUri?: string };
    expoGoConfig?: { debuggerHost?: string };
    manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } };
    manifest?: { debuggerHost?: string; hostUri?: string };
  };
  const hostUri =
    c.expoConfig?.hostUri ||
    c.expoGoConfig?.debuggerHost ||
    c.manifest2?.extra?.expoGo?.debuggerHost ||
    c.manifest?.debuggerHost ||
    c.manifest?.hostUri ||
    "";
  const host = String(hostUri).split("://").pop()?.split(":")[0]?.trim();
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return host;
  }
  return null;
}

function resolveApiBaseUrl(): string {
  const useLanFallback = !configuredBaseUrl || isLocalhostBaseUrl(configuredBaseUrl);

  if (isWebClient && typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isLanHost = hostname && hostname !== "localhost" && hostname !== "127.0.0.1";
    if (isLanHost && useLanFallback) {
      return `${window.location.protocol}//${hostname}:${API_PORT}`;
    }
  }

  if (!isWebClient && useLanFallback) {
    const host = expoHostIp();
    if (host) {
      return `http://${host}:${API_PORT}`;
    }
  }

  return configuredBaseUrl || fallbackBaseUrl;
}

export const apiBaseUrl = resolveApiBaseUrl();

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

const PYDANTIC_FIELD_LABELS: Record<string, string> = {
  email: "correo",
  password: "contraseña",
  first_name: "nombre",
  last_name: "apellidos",
  curp: "CURP",
  general_license: "cédula profesional",
  specialty_license: "cédula de especialidad",
  specialty_id: "especialidad",
  date_of_birth: "fecha de nacimiento",
  contact_phone: "teléfono",
  phone: "teléfono",
  postal_code: "código postal",
  blood_type: "tipo de sangre",
  gender: "género",
  city: "ciudad",
  state: "estado",
  code: "código de verificación",
  refresh_token: "sesión",
  registrado: "registro",
  admin_name: "nombre del administrador",
  institution_id: "institución",
  doctor_email: "correo del doctor",
  height_m: "estatura",
  weight_kg: "peso",
  value_mg_dl: "glucosa",
  systolic_bp: "presión sistólica",
  diastolic_bp: "presión diastólica",
  heart_rate: "pulso",
  oxygen_saturation: "saturación de oxígeno",
  body_temperature: "temperatura",
  measured_on: "fecha",
  applied_on: "fecha",
  performed_on: "fecha",
  period_start_date: "fecha de inicio",
  period_end_date: "fecha de fin",
  start_time: "hora de inicio",
  end_time: "hora de fin",
  full_name: "nombre",
  relationship: "parentesco",
  substance: "sustancia",
  reaction: "reacción",
  severity: "severidad",
  kind: "tipo",
  description: "descripción",
  dose: "dosis",
  hospital: "hospital",
  notes: "notas",
  message: "mensaje",
  title: "título",
  body: "contenido",
  name: "nombre",
  address: "dirección",
  rfc: "RFC",
  website: "sitio web"
};

function humanizePydanticDetail(detail: unknown): string | null {
  if (!Array.isArray(detail)) return null;
  const messages: string[] = [];
  for (const item of detail) {
    if (!item || typeof item !== "object") continue;
    const raw = item as { msg?: unknown; loc?: unknown; type?: unknown };
    const msg = typeof raw.msg === "string" ? raw.msg : "";
    const loc = Array.isArray(raw.loc) ? raw.loc : [];
    const fieldKey = loc.length > 1 ? String(loc[loc.length - 1]) : "";
    const label = PYDANTIC_FIELD_LABELS[fieldKey] ?? fieldKey;
    const friendly = translatePydanticMessage(String(raw.type ?? ""), msg, label);
    if (friendly) messages.push(friendly);
  }
  if (!messages.length) return null;
  return messages.join(" · ");
}

function translatePydanticMessage(type: string, msg: string, label: string): string {
  const pretty = label ? label.charAt(0).toUpperCase() + label.slice(1) : "Campo";
  if (type === "missing") return `${pretty} es obligatorio.`;
  if (type === "string_too_short") return `${pretty} es demasiado corto.`;
  if (type === "string_too_long") return `${pretty} es demasiado largo.`;
  if (type === "string_pattern_mismatch") return `${pretty} tiene un formato no válido.`;
  if (type === "email" || /email address/i.test(msg)) return `${pretty} no es válido.`;
  if (type.startsWith("enum")) return `${pretty} tiene un valor no permitido.`;
  if (type === "int_parsing" || type === "int_type" || type === "float_parsing") {
    return `${pretty} debe ser un número.`;
  }
  if (type === "greater_than" || type === "greater_than_equal") return `${pretty} es demasiado bajo.`;
  if (type === "less_than" || type === "less_than_equal") return `${pretty} es demasiado alto.`;
  if (type === "value_error") {
    const clean = msg.replace(/^Value error,\s*/i, "").trim();
    if (/email address/i.test(clean)) return `${pretty} no es válido.`;
    if (clean) return clean.charAt(0).toUpperCase() + clean.slice(1);
    return `${pretty} no es válido.`;
  }
  if (label && msg && !/[A-Za-z]+_[A-Za-z]/.test(msg)) return `${pretty}: ${msg}`;
  return msg ? msg.charAt(0).toUpperCase() + msg.slice(1) : "Datos inválidos.";
}

const DEFAULT_TIMEOUT_MS = 15000;
const inFlightGets = new Map<string, Promise<unknown>>();

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const dedupeKey = method === "GET" ? `${options.token ?? ""}::${path}` : "";
  if (dedupeKey && inFlightGets.has(dedupeKey)) {
    return inFlightGets.get(dedupeKey) as Promise<T>;
  }

  const run = async (): Promise<T> => {
    const headers = new Headers(options.headers);
    const hasBody = options.body !== undefined;

    if (hasBody && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (options.token) {
      headers.set("Authorization", `Bearer ${options.token}`);
    }

    if (isWebClient) {
      headers.set("X-Client-Platform", "web");
    }

    const credentials: RequestCredentials | undefined = isWebClient
      ? "include"
      : options.credentials;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(`${apiBaseUrl}${path}`, {
        ...options,
        credentials,
        headers,
        signal: options.signal ?? controller.signal
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === "AbortError") {
        throw new ApiError(0, "La solicitud tardó demasiado. Revisa tu conexión.");
      }
      throw err;
    }
    clearTimeout(timeoutId);

    return finishResponse<T>(response, path);
  };

  const promise = run();
  if (dedupeKey) {
    inFlightGets.set(dedupeKey, promise);
    promise.then(
      () => inFlightGets.delete(dedupeKey),
      () => inFlightGets.delete(dedupeKey)
    );
  }
  return promise;
}

async function finishResponse<T>(response: Response, path: string): Promise<T> {

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail =
      typeof body === "object" && body !== null && "detail" in body ? body.detail : null;

    let rawDetail: string;
    if (typeof detail === "string") {
      rawDetail = detail;
    } else if (Array.isArray(detail)) {
      rawDetail = humanizePydanticDetail(detail) ?? "Datos inválidos.";
    } else if (detail) {
      rawDetail = JSON.stringify(detail);
    } else {
      rawDetail = `HTTP ${response.status}`;
    }

    const safeDetail =
      response.status >= 500
        ? "Algo salió mal en el servidor. Intenta de nuevo en unos momentos."
        : rawDetail;
    if (response.status >= 500) {
      console.warn(`[apiRequest] ${response.status} on ${path}: ${rawDetail}`);
    }
    throw new ApiError(response.status, safeDetail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
