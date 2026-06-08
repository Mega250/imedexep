import { fetchDoctors } from "@/services/api/doctorsApi";
import { loadSession } from "@/state/sessionStore";

let cachedDoctorId: number | null = null;
let cachedDoctorUserId: number | null = null;

async function ensureDoctorRole(): Promise<number> {
  const session = await loadSession();
  if (session.user?.role !== "doctor") {
    throw new Error("La sesión actual no es de un médico.");
  }
  return session.user.id;
}

export async function getCurrentDoctorId(): Promise<number> {
  const sessionUserId = await ensureDoctorRole();
  if (cachedDoctorId !== null && cachedDoctorUserId === sessionUserId) {
    return cachedDoctorId;
  }
  const data = await fetchDoctors({ page: 1, limit: 100 });
  if (!data.items || data.items.length === 0) {
    throw new Error("No se encontró el doctor vinculado a tu cuenta.");
  }
  const currentDoctor = data.items.find((doctor) => doctor.user_id === sessionUserId) ?? data.items[0];
  cachedDoctorId = currentDoctor.id;
  cachedDoctorUserId = sessionUserId;
  return cachedDoctorId;
}

export function clearCurrentDoctorCache(): void {
  cachedDoctorId = null;
  cachedDoctorUserId = null;
}
