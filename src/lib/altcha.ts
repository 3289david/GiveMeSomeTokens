import { createChallenge, verifySolution } from "altcha-lib";

const HMAC_KEY = process.env.ALTCHA_HMAC_KEY!;

export async function generateChallenge() {
  return createChallenge({
    hmacKey: HMAC_KEY,
    maxNumber: 100000,
    expires: new Date(Date.now() + 10 * 60 * 1000),
  });
}

export async function verifyAltcha(payload: string): Promise<boolean> {
  try {
    const result = await verifySolution(payload, HMAC_KEY);
    return result;
  } catch {
    return false;
  }
}
