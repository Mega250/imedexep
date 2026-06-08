import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_EMAIL = "imedexp.pending-recovery-email";

export async function setPendingRecoveryEmail(email: string): Promise<void> {
  await AsyncStorage.setItem(KEY_EMAIL, email);
}

export async function getPendingRecoveryEmail(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_EMAIL);
}

export async function clearPendingRecoveryEmail(): Promise<void> {
  await AsyncStorage.removeItem(KEY_EMAIL);
}
