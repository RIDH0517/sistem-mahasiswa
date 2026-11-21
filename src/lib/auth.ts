import crypto from 'crypto';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import {
  AUTH_SECRET as SECRET_KEY,
  SESSION_COOKIE_NAME,
  verifySessionValue,
} from '@/lib/session';

export { SESSION_COOKIE_NAME };
export const CSRF_COOKIE_NAME = 'siakademik_csrf_token';

// Hash password dengan SHA-256 (sesuai fungsi SHA2(..., 256) di MySQL)
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Buat pasangan token CSRF (raw token & signed token)
export function generateCsrfToken(): { rawToken: string; signedToken: string } {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(rawToken)
    .digest('hex');
  return { rawToken, signedToken: `${rawToken}.${signature}` };
}

// Verifikasi token CSRF dari Header terhadap HttpOnly Cookie
export async function verifyCsrfToken(request: Request): Promise<boolean> {
  const headerToken = request.headers.get('x-csrf-token');
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!headerToken || !cookieValue) return false;

  const [rawCookieToken, cookieSignature] = cookieValue.split('.');
  if (!rawCookieToken || !cookieSignature) return false;

  // Pastikan token di header sama dengan raw token di cookie
  if (headerToken !== rawCookieToken) return false;

  // Validasi tanda tangan HMAC agar cookie tidak bisa dipalsukan
  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(rawCookieToken)
    .digest('hex');

  return cookieSignature === expectedSignature;
}

// Buat dan verifikasi Session Cookie
export function createSessionValue(userId: number, username: string): string {
  const payload = JSON.stringify({ userId, username, exp: Date.now() + 86400000 });
  const base64Payload = Buffer.from(payload).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(base64Payload)
    .digest('base64url');
  return `${base64Payload}.${sig}`;
}

export async function getSessionUser(): Promise<{ userId: number; username: string } | null> {
  const cookieStore = await cookies();
  return verifySessionValue(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export interface CurrentUser {
  id: number;
  username: string;
  nama_lengkap: string;
  email: string;
}

// Ambil data lengkap user yang sedang login dari tabel users
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSessionUser();
  if (!session) return null;

  const [rows] = await db.query<any[]>(
    'SELECT id, username, nama_lengkap, email FROM users WHERE id = ? LIMIT 1',
    [session.userId]
  );
  return rows.length > 0 ? (rows[0] as CurrentUser) : null;
}