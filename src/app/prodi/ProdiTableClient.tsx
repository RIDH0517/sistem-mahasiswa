'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  X,
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
    fetch('/api/auth/csrf')
      .then((r) => r.json())
      .then((d) => setCsrfToken(d.csrfToken || ''));
  }, []);

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
      const method = editingProdi ? 'PUT' : 'POST';
      const body = editingProdi ? { id: editingProdi.id, ...formData } : formData;

      const res = await fetch('/api/prodi', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Gagal menyimpan prodi.');
      } else {
        setIsModalOpen(false);
        router.refresh();
      }
    } catch {
      setFormError('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (prodi: ProdiRow) => {
    if (!confirm(`Hapus Program Studi ${prodi.kode_prodi} - ${prodi.nama_prodi}?`)) return;

    const res = await fetch('/api/prodi', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      body: JSON.stringify({ id: prodi.id }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Gagal menghapus prodi.');
    } else {
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
          <p className="mt-1 text-sm text-slate-600">
            Total {initialProdi.length} Program Studi • {totalSeluruhMahasiswa} Mahasiswa Aktif
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex min-h-[44px] items-center gap-2 self-start rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 sm:self-auto"
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
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                    {prodi.kode_prodi}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    Jenjang {prodi.jenjang}
                  </span>
                </div>
                <h3 className="mt-3.5 text-base font-bold text-slate-900">
                  {prodi.nama_prodi}
                </h3>
              </div>

              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs">
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

      {/* Tabel Rincian & Aksi CRUD */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Tabel Kelola Program Studi</h3>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter kode atau nama prodi..."
              className="min-h-[40px] w-full rounded-lg border border-slate-300 bg-slate-50 pr-3 pl-9 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-600 uppercase">
              <tr>
                <th className="w-16 px-6 py-4">ID</th>
                <th className="px-6 py-4">Kode Prodi</th>
                <th className="px-6 py-4">Nama Program Studi</th>
                <th className="px-6 py-4 text-center">Jenjang</th>
                <th className="px-6 py-4">Total Mahasiswa</th>
                <th className="px-6 py-4 text-right">Aksi CRUD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProdi.map((prodi) => (
                <tr key={prodi.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-500">#{prodi.id}</td>
                  <td className="px-6 py-4 font-mono font-bold text-blue-600">
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
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>{prodi.total_mahasiswa} Mahasiswa</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(prodi)}
                        title="Edit Prodi"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(prodi)}
                        title="Hapus Prodi"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-rose-50"
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
      </div>

      {/* Modal Tambah / Edit Prodi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProdi ? 'Edit Program Studi' : 'Tambah Program Studi'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 p-6">
              {formError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Kode Prodi
                </label>
                <input
                  type="text"
                  required
                  value={formData.kode_prodi}
                  onChange={(e) =>
                    setFormData({ ...formData, kode_prodi: e.target.value })
                  }
                  className="mt-1 min-h-[42px] w-full rounded-lg border border-slate-300 px-3 text-sm uppercase"
                  placeholder="Contoh: TI"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Nama Program Studi
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama_prodi}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_prodi: e.target.value })
                  }
                  className="mt-1 min-h-[42px] w-full rounded-lg border border-slate-300 px-3 text-sm"
                  placeholder="Contoh: Teknik Informatika"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Jenjang
                </label>
                <select
                  value={formData.jenjang}
                  onChange={(e) =>
                    setFormData({ ...formData, jenjang: e.target.value })
                  }
                  className="mt-1 min-h-[42px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
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
                  className="min-h-[42px] rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[42px] rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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