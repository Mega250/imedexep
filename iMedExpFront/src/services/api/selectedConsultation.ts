import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "imedexp.doctor.selectedConsultationId";

let cached: number | null = null;

export async function setSelectedConsultationId(id: number): Promise<void> {
  cached = id;
  await AsyncStorage.setItem(KEY, String(id));
}

export async function getSelectedConsultationId(): Promise<number | null> {
  if (cached !== null) {
    return cached;
  }
  const raw = await AsyncStorage.getItem(KEY);
  const parsed = raw === null ? NaN : Number(raw);
  cached = Number.isFinite(parsed) ? parsed : null;
  return cached;
}

export async function clearSelectedConsultationId(): Promise<void> {
  cached = null;
  await AsyncStorage.removeItem(KEY);
}
