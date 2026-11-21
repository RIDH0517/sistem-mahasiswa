import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'siakademik_session';
export const AUTH_SECRET = process.env.AUTH_SECRET || 'siakademik-secret-key-2026-unnes';

export interface SessionPayload {
  userId: number;
  username: string;
}

// Verifikasi nilai cookie sesi (tanda tangan HMAC + masa berlaku).
// Dipakai bersama oleh proxy.ts dan getSessionUser().
export function verifySessionValue(value: string | undefined | null): SessionPayload | null {
  if (!value) return null;

  const [base64Payload, sig] = value.split('.');
  if (!base64Payload || !sig) return null;

  const expectedSig = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(base64Payload)
    .digest('base64url');

  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf-8'));
    if (typeof data.exp !== 'number' || Date.now() > data.exp) return null;
    return { userId: data.userId, username: data.username };
  } catch {
    return null;
  }
}
