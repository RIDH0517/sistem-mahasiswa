import crypto from 'crypto';
import { cookies } from 'next/headers';
import type { RowDataPacket } from 'mysql2';
import { db } from '@/lib/db';
import {
  AUTH_SECRET as SECRET_KEY,
  SESSION_COOKIE_NAME,
  verifySessionValue,
} from '@/lib/session';

export { SESSION_COOKIE_NAME };
export const CSRF_COOKIE_NAME = 'siakademik_csrf_token';

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

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

// Verifikasi tanda tangan cookie CSRF; kembalikan raw token jika valid
export function verifySignedCsrfCookie(cookieValue: string | undefined | null): string | null {
  if (!cookieValue) return null;
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;

  const [rawCookieToken, cookieSignature] = parts;
  if (!rawCookieToken || !cookieSignature) return null;

  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(rawCookieToken)
    .digest('hex');

  return safeEqual(cookieSignature, expectedSignature) ? rawCookieToken : null;
}

// Verifikasi token CSRF dari Header terhadap HttpOnly Cookie
export async function verifyCsrfToken(request: Request): Promise<boolean> {
  const headerToken = request.headers.get('x-csrf-token');
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const validRawToken = verifySignedCsrfCookie(cookieValue);

  return Boolean(headerToken && validRawToken && safeEqual(headerToken, validRawToken));
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

  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT id, username, nama_lengkap, email FROM users WHERE id = ? LIMIT 1',
    [session.userId]
  );
  return rows.length > 0 ? (rows[0] as unknown as CurrentUser) : null;
}
