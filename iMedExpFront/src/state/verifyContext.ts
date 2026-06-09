import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_EMAIL = "imedexp.pending-verify-email";
const KEY_STATUS = "imedexp.pending-verify-status";

export type VerifyStatus = {
  email: string;
  expiresAt: string;
  nextResendAt: string;
  attemptsInWindow: number;
};

export async function setPendingVerifyEmail(email: string): Promise<void> {
  await AsyncStorage.setItem(KEY_EMAIL, email);
}

export async function getPendingVerifyEmail(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_EMAIL);
}

export async function clearPendingVerifyEmail(): Promise<void> {
  await AsyncStorage.removeItem(KEY_EMAIL);
  await AsyncStorage.removeItem(KEY_STATUS);
}

export async function setPendingVerifyStatus(status: VerifyStatus): Promise<void> {
  await AsyncStorage.setItem(KEY_STATUS, JSON.stringify(status));
}

export async function getPendingVerifyStatus(): Promise<VerifyStatus | null> {
  const raw = await AsyncStorage.getItem(KEY_STATUS);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as VerifyStatus;
  } catch {
    return null;
  }
}
