'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUi } from '@/components/ui/UiProvider';
import { fetchCsrfToken } from '@/lib/client-auth';
import {
  Users,
  Search,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  X,
  RotateCcw,
} from 'lucide-react';

export interface ProdiRow {
  id: number;
  kode_prodi: string;
  nama_prodi: string;
  jenjang: string;
  total_mahasiswa: number;
  total_laki: number;
  total_perempuan: number;
}

export default function ProdiTableClient({
  initialProdi,
}: {
  initialProdi: ProdiRow[];
}) {
  const router = useRouter();
  const { confirm: confirmDialog, toast } = useUi();
  const [csrfToken, setCsrfToken] = useState('');
  const [search, setSearch] = useState('');

  // State Modal CRUD Prodi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProdi, setEditingProdi] = useState<ProdiRow | null>(null);
  const [formData, setFormData] = useState({
    kode_prodi: '',
    nama_prodi: '',
    jenjang: 'S1',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCsrfToken()
      .then(setCsrfToken)
      .catch(() => {
        // Token akan dimuat ulang saat mutasi jika diperlukan
      });
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const openAddModal = () => {
    setEditingProdi(null);
    setFormError('');
    setFormData({ kode_prodi: '', nama_prodi: '', jenjang: 'S1' });
    setIsModalOpen(true);
  };

  const openEditModal = (prodi: ProdiRow) => {
    setEditingProdi(prodi);
    setFormError('');
    setFormData({
      kode_prodi: prodi.kode_prodi,
      nama_prodi: prodi.nama_prodi,
      jenjang: prodi.jenjang,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const token = csrfToken || (await fetchCsrfToken());
      const method = editingProdi ? 'PUT' : 'POST';
      const body = editingProdi ? { id: editingProdi.id, ...formData } : formData;

      const res = await fetch('/api/prodi', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': token,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Gagal menyimpan prodi.');
      } else {
        setIsModalOpen(false);
        toast('success', data.message || 'Data berhasil disimpan.');
        router.refresh();
      }
    } catch {
      setFormError('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (prodi: ProdiRow) => {
    const ok = await confirmDialog({
      title: 'Hapus Program Studi?',
      message: `${prodi.kode_prodi} - ${prodi.nama_prodi} akan dihapus permanen. Prodi yang masih memiliki mahasiswa tidak bisa dihapus.`,
      confirmText: 'Ya, Hapus',
    });
    if (!ok) return;

    const token = csrfToken || (await fetchCsrfToken());
    const res = await fetch('/api/prodi', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': token,
      },
      body: JSON.stringify({ id: prodi.id }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast('error', data.error || 'Gagal menghapus prodi.');
    } else {
      toast('success', data.message || 'Program studi berhasil dihapus.');
      router.refresh();
    }
  };

  const totalSeluruhMahasiswa = useMemo(
    () => initialProdi.reduce((acc, curr) => acc + Number(curr.total_mahasiswa), 0),
    [initialProdi]
  );

  const filteredProdi = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return initialProdi;
    return initialProdi.filter(
      (p) =>
        p.kode_prodi.toLowerCase().includes(q) ||
        p.nama_prodi.toLowerCase().includes(q)
    );
  }, [initialProdi, search]);

  return (
    <div className="space-y-6">
      {/* Header & Tombol Tambah Prodi */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Data Program Studi
          </h2>
          <p className="mt-1 text-sm text-slate-600 tabular-nums">
            Total {initialProdi.length} Program Studi • {totalSeluruhMahasiswa} Mahasiswa Aktif
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex min-h-[42px] items-center gap-2 self-start rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Prodi</span>
        </button>
      </div>

      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {initialProdi.map((prodi) => {
          const percentage =
            totalSeluruhMahasiswa > 0
              ? Math.round((Number(prodi.total_mahasiswa) / totalSeluruhMahasiswa) * 100)
              : 0;

          return (
            <div
              key={prodi.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-blue-50 px-2.5 py-1 font-mono text-xs font-semibold text-blue-700">
                    {prodi.kode_prodi}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    Jenjang {prodi.jenjang}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900">{prodi.nama_prodi}</h3>
              </div>

              <div className="mt-5 space-y-2 border-t border-slate-100 pt-3.5 text-xs tabular-nums">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Mahasiswa</span>
                  <span className="font-bold text-slate-900">
                    {prodi.total_mahasiswa} ({percentage}%)
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Laki-laki: {prodi.total_laki || 0}</span>
                  <span>Perempuan: {prodi.total_perempuan || 0}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kelola Program Studi */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200/80 p-4 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-700" />
            <h3 className="text-base font-bold text-slate-900">Daftar Program Studi</h3>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter kode atau nama prodi..."
              className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-white pr-3.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none"
            />
          </div>
        </div>

        {filteredProdi.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-semibold text-slate-900">
              Program studi tidak ditemukan
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {search.trim()
                ? 'Tidak ada program studi yang cocok dengan pencarian Anda.'
                : 'Belum ada program studi tersimpan.'}
            </p>
            {search.trim() && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="mt-4 inline-flex min-h-[38px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredProdi.map((prodi) => (
                <div key={prodi.id} className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-blue-50 px-2 py-0.5 font-mono text-xs font-semibold text-blue-700">
                        {prodi.kode_prodi}
                      </span>
                      <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        {prodi.jenjang}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{prodi.nama_prodi}</p>
                    <p className="flex items-center gap-1.5 text-xs text-slate-600 tabular-nums">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {prodi.total_mahasiswa} Mahasiswa
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(prodi)}
                      aria-label={`Edit ${prodi.nama_prodi}`}
                      title="Edit Prodi"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(prodi)}
                      aria-label={`Hapus ${prodi.nama_prodi}`}
                      title="Hapus Prodi"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-600 uppercase">
                  <tr>
                    <th className="w-16 px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Kode Prodi</th>
                    <th className="px-6 py-3.5">Nama Program Studi</th>
                    <th className="px-6 py-3.5 text-center">Jenjang</th>
                    <th className="px-6 py-3.5">Total Mahasiswa</th>
                    <th className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProdi.map((prodi) => (
                    <tr key={prodi.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-6 py-4 font-mono font-medium text-slate-500 tabular-nums">
                        #{prodi.id}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-blue-700">
                        {prodi.kode_prodi}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {prodi.nama_prodi}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                          {prodi.jenjang}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-semibold text-slate-900 tabular-nums">
                          <Users className="h-4 w-4 text-blue-700" />
                          <span>{prodi.total_mahasiswa} Mahasiswa</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(prodi)}
                            aria-label={`Edit ${prodi.nama_prodi}`}
                            title="Edit Prodi"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-700 transition-colors hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(prodi)}
                            aria-label={`Hapus ${prodi.nama_prodi}`}
                            title="Hapus Prodi"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-600 transition-colors hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal Tambah / Edit Prodi */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="prodi-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 px-6 py-4">
              <h3 id="prodi-modal-title" className="text-lg font-bold text-slate-900">
                {editingProdi ? 'Edit Program Studi' : 'Tambah Program Studi'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup modal"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 overflow-y-auto p-6">
              {formError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold tracking-wider text-slate-700 uppercase">
                  Kode Prodi
                </label>
                <input
                  type="text"
                  required
                  value={formData.kode_prodi}
                  onChange={(e) => setFormData({ ...formData, kode_prodi: e.target.value })}
                  className="mt-1.5 min-h-[42px] w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 uppercase placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none"
                  placeholder="Contoh: TI"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-slate-700 uppercase">
                  Nama Program Studi
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_prodi}
                  onChange={(e) => setFormData({ ...formData, nama_prodi: e.target.value })}
                  className="mt-1.5 min-h-[42px] w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none"
                  placeholder="Contoh: Teknik Informatika"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-slate-700 uppercase">
                  Jenjang
                </label>
                <select
                  value={formData.jenjang}
                  onChange={(e) => setFormData({ ...formData, jenjang: e.target.value })}
                  className="mt-1.5 min-h-[42px] w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-slate-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:outline-none"
                >
                  <option value="D3">D3</option>
                  <option value="D4">D4</option>
                  <option value="S1">S1</option>
                  <option value="S2">S2</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[42px] rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[42px] rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Prodi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
