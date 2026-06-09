import { authedRequest } from "@/services/api/authedRequest";
import { Patient, PatientFull } from "@/services/api/patientsApi";
import { ApiError } from "@/services/api/client";
import { loadSession } from "@/state/sessionStore";

export class NotAPatientRoleError extends Error {
  constructor() {
    super("La sesión actual no es de un paciente.");
    this.name = "NotAPatientRoleError";
  }
}

let cachedPatientId: number | null = null;
let cachedPatientUserId: number | null = null;
let inFlightId: Promise<number> | null = null;
let inFlightIdUserId: number | null = null;
let cachedPatient: Patient | null = null;
let cachedPatientUserIdForProfile: number | null = null;
let inFlightPatient: Promise<Patient> | null = null;
let inFlightPatientUserId: number | null = null;
let cachedFull: PatientFull | null = null;
let cachedFullUserId: number | null = null;
let inFlightFull: Promise<PatientFull> | null = null;
let inFlightFullUserId: number | null = null;

async function fetchMe(): Promise<Patient> {
  return authedRequest<Patient>("/api/v1/patients/me");
}

async function fetchMeFull(): Promise<PatientFull> {
  return authedRequest<PatientFull>("/api/v1/patients/me/full");
}

async function ensurePatientRole(): Promise<number> {
  const session = await loadSession();
  if (session.user?.role !== "patient") {
    throw new NotAPatientRoleError();
  }
  return session.user.id;
}

export async function getCurrentPatientId(): Promise<number> {
  const sessionUserId = await ensurePatientRole();
  if (cachedPatientId !== null && cachedPatientUserId === sessionUserId) {
    return cachedPatientId;
  }
  if (inFlightId && inFlightIdUserId === sessionUserId) {
    return inFlightId;
  }
  inFlightIdUserId = sessionUserId;
  inFlightId = (async () => {
    try {
      const me = await fetchMe();
      cachedPatientId = me.id;
      cachedPatientUserId = sessionUserId;
      cachedPatient = me;
      cachedPatientUserIdForProfile = sessionUserId;
      return me.id;
    } finally {
      inFlightId = null;
      inFlightIdUserId = null;
    }
  })();
  return inFlightId;
}

export async function getCurrentPatient(): Promise<Patient> {
  const sessionUserId = await ensurePatientRole();
  if (cachedPatient && cachedPatientUserIdForProfile === sessionUserId) {
    return cachedPatient;
  }
  if (inFlightPatient && inFlightPatientUserId === sessionUserId) {
    return inFlightPatient;
  }
  inFlightPatientUserId = sessionUserId;
  inFlightPatient = (async () => {
    try {
      const me = await fetchMe();
      cachedPatient = me;
      cachedPatientUserIdForProfile = sessionUserId;
      cachedPatientId = me.id;
      cachedPatientUserId = sessionUserId;
      return me;
    } finally {
      inFlightPatient = null;
      inFlightPatientUserId = null;
    }
  })();
  return inFlightPatient;
}

export async function getCurrentPatientFull(): Promise<PatientFull> {
  const sessionUserId = await ensurePatientRole();
  if (cachedFull && cachedFullUserId === sessionUserId) {
    return cachedFull;
  }
  if (inFlightFull && inFlightFullUserId === sessionUserId) {
    return inFlightFull;
  }
  inFlightFullUserId = sessionUserId;
  inFlightFull = (async () => {
    try {
      const full = await fetchMeFull();
      cachedFull = full;
      cachedFullUserId = sessionUserId;
      cachedPatientId = full.id;
      cachedPatientUserId = sessionUserId;
      cachedPatient = full;
      cachedPatientUserIdForProfile = sessionUserId;
      return full;
    } finally {
      inFlightFull = null;
      inFlightFullUserId = null;
    }
  })();
  return inFlightFull;
}

export function clearCurrentPatientCache(): void {
  cachedPatientId = null;
  cachedPatientUserId = null;
  cachedPatient = null;
  cachedPatientUserIdForProfile = null;
  cachedFull = null;
  cachedFullUserId = null;
  inFlightId = null;
  inFlightIdUserId = null;
  inFlightPatient = null;
  inFlightPatientUserId = null;
  inFlightFull = null;
  inFlightFullUserId = null;
}

export function isNotPatientRoleError(err: unknown): boolean {
  if (err instanceof NotAPatientRoleError) return true;
  if (err instanceof ApiError && err.status === 403) return true;
  return false;
}
