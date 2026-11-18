export const OFFLINE_ERROR_MSG = 'Could not reach encryption server — is the API running?';

export const ATTACK_LAB_EXHIBITS = new Set([
  'caesar',
  'affine',
  'vigenere',
  'enigma',
  'lorenz',
  'aes',
  'rsa',
]);

export function hasAttackLab(exhibitId: string): boolean {
  return ATTACK_LAB_EXHIBITS.has(exhibitId);
}

/**
 * Sends a POST request to a cryptanalysis endpoint and normalizes network
 * failures into the standardized offline fallback message.
 */
export async function postCryptanalysis<T>(
  endpoint: string,
  payload: Record<string, unknown>
): Promise<T> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: OFFLINE_ERROR_MSG }));
      throw new Error(errData.detail || OFFLINE_ERROR_MSG);
    }
    return (await res.json()) as T;
  } catch (err: unknown) {
    if (err instanceof TypeError || !(err instanceof Error) || !err.message) {
      throw new Error(OFFLINE_ERROR_MSG);
    }
    throw err;
  }
}
