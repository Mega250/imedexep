import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "imedexp.doctor.selectedAppointmentId";

let cached: number | null = null;

export async function setSelectedAppointmentId(id: number): Promise<void> {
  cached = id;
  await AsyncStorage.setItem(KEY, String(id));
}

export async function getSelectedAppointmentId(): Promise<number | null> {
  if (cached !== null) {
    return cached;
  }
  const raw = await AsyncStorage.getItem(KEY);
  const parsed = raw === null ? NaN : Number(raw);
  cached = Number.isFinite(parsed) ? parsed : null;
  return cached;
}

export async function clearSelectedAppointmentId(): Promise<void> {
  cached = null;
  await AsyncStorage.removeItem(KEY);
}
