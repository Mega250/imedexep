import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "imedexp.doctor.selectedPatientId";

let cached: number | null = null;

export async function setSelectedPatientId(id: number): Promise<void> {
  cached = id;
  await AsyncStorage.setItem(KEY, String(id));
}

export async function getSelectedPatientId(): Promise<number | null> {
  if (cached !== null) {
    return cached;
  }
  const value = await AsyncStorage.getItem(KEY);
  if (!value) {
    return null;
  }
  const n = Number(value);
  if (Number.isFinite(n)) {
    cached = n;
    return n;
  }
  return null;
}

export async function clearSelectedPatient(): Promise<void> {
  cached = null;
  await AsyncStorage.removeItem(KEY);
}
