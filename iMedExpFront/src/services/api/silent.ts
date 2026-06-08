export async function silentOrNull<T>(
  promise: Promise<T>,
  context: string
): Promise<T | null> {
  try {
    return await promise;
  } catch (err) {
    console.warn(`[silentOrNull] ${context}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function silentOrEmpty<T>(
  promise: Promise<T[]>,
  context: string
): Promise<T[]> {
  try {
    return await promise;
  } catch (err) {
    console.warn(`[silentOrEmpty] ${context}:`, err instanceof Error ? err.message : err);
    return [];
  }
}
