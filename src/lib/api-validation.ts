import { NextResponse } from 'next/server';
import { verifyCsrfToken, getSessionUser } from '@/lib/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface MahasiswaInput {
  nim: string;
  nama: string;
  email: string;
  jenis_kelamin: 'L' | 'P';
  angkatan: number;
  prodi_id: number;
}

export interface ProdiInput {
  kode_prodi: string;
  nama_prodi: string;
  jenjang: 'D3' | 'D4' | 'S1' | 'S2';
}

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

type Body = Record<string, unknown>;

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

export function parseId(body: Body): number | null {
  const id = Number(body.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function parseIds(body: Body, maxItems = 500): number[] | null {
  if (!Array.isArray(body.ids) || body.ids.length === 0 || body.ids.length > maxItems) {
    return null;
  }

  const parsed: number[] = [];
  for (const item of body.ids) {
    const id = Number(item);
    if (!Number.isInteger(id) || id <= 0) return null;
    parsed.push(id);
  }

  return Array.from(new Set(parsed));
}

export function validateMahasiswa(body: Body): Result<MahasiswaInput> {
  const nim = str(body.nim);
  const nama = str(body.nama).replace(/\s+/g, ' ');
  const email = str(body.email).toLowerCase();
  const jenis_kelamin = str(body.jenis_kelamin).toUpperCase();
  const angkatan = Number(body.angkatan);
  const prodi_id = Number(body.prodi_id);

  if (!/^\d{5,15}$/.test(nim)) return { ok: false, error: 'NIM harus berupa angka 5-15 digit.' };
  if (nama.length < 2 || nama.length > 100) {
    return { ok: false, error: 'Nama harus 2-100 karakter dan tidak boleh kosong.' };
  }
  if (email.length > 100 || !EMAIL_REGEX.test(email)) return { ok: false, error: 'Format email tidak valid.' };
  if (jenis_kelamin !== 'L' && jenis_kelamin !== 'P') {
    return { ok: false, error: 'Jenis kelamin harus L atau P.' };
  }
  if (!Number.isInteger(angkatan) || angkatan < 2000 || angkatan > 2100) {
    return { ok: false, error: 'Angkatan harus berupa tahun yang valid (2000-2100).' };
  }
  if (!Number.isInteger(prodi_id) || prodi_id <= 0) return { ok: false, error: 'Program studi wajib dipilih.' };

  return { ok: true, data: { nim, nama, email, jenis_kelamin, angkatan, prodi_id } };
}

export function validateProdi(body: Body): Result<ProdiInput> {
  const kode_prodi = str(body.kode_prodi).toUpperCase();
  const nama_prodi = str(body.nama_prodi).replace(/\s+/g, ' ');
  const jenjang = str(body.jenjang).toUpperCase() || 'S1';

  if (!/^[A-Z0-9]{2,10}$/.test(kode_prodi)) {
    return { ok: false, error: 'Kode prodi harus 2-10 karakter huruf/angka tanpa spasi.' };
  }
  if (nama_prodi.length < 3 || nama_prodi.length > 100) {
    return { ok: false, error: 'Nama program studi harus 3-100 karakter.' };
  }
  if (!['D3', 'D4', 'S1', 'S2'].includes(jenjang)) {
    return { ok: false, error: 'Jenjang harus D3, D4, S1, atau S2.' };
  }

  return { ok: true, data: { kode_prodi, nama_prodi, jenjang: jenjang as ProdiInput['jenjang'] } };
}

// Cek CSRF + sesi. Mengembalikan response error jika gagal, atau null jika lolos.
export async function guardRequest(request: Request): Promise<NextResponse | null> {
  if (!(await verifyCsrfToken(request))) {
    return NextResponse.json({ error: 'Token CSRF tidak valid!' }, { status: 403 });
  }
  if (!(await getSessionUser())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

// Baca body JSON dengan aman (body kosong/rusak menghasilkan 400, bukan 500)
export async function readBody(request: Request): Promise<Body | null> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' && !Array.isArray(body) ? (body as Body) : null;
  } catch {
    return null;
  }
}

export const badRequest = (error: string, status = 400) =>
  NextResponse.json({ error }, { status });

export const dbErrorCode = (e: unknown) => (e as { code?: string })?.code;
