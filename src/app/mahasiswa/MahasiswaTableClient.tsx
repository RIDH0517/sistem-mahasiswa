'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUi } from '@/components/ui/UiProvider';
import {
  Search,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Pencil,
  Trash2,
  Filter,
} from 'lucide-react';

export interface MahasiswaRow {
  id: number;
  nim: string;
  nama: string;
  email: string;
  jenis_kelamin: 'L' | 'P';
  angkatan: number;
  prodi_id: number;
  nama_prodi: string;
  kode_prodi: string;
}

export interface ProdiOption {
  id: number;
  kode_prodi: string;
  nama_prodi: string;
}

const PRODI_BADGE_STYLES: Record<string, string> = {
  PTE: 'bg-amber-50 text-amber-800 border-amber-200',
  PTIK: 'bg-blue-50 text-blue-800 border-blue-200',
  TE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  TEKKOM: 'bg-purple-50 text-purple-800 border-purple-200',
};

type SortKey = 'nim' | 'nama' | 'kode_prodi' | 'angkatan';

export default function MahasiswaTableClient({
  initialData,
  prodiOptions,
}: {
  initialData: MahasiswaRow[];
  prodiOptions: ProdiOption[];
}) {
  const router = useRouter();
  const { confirm: confirmDialog, toast } = useUi();
  const [csrfToken, setCsrfToken] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProdi, setSelectedProdi] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [sortKey, setSortKey] = useState<SortKey>('nim');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State Modal CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MahasiswaRow | null>(null);
  const [formData, setFormData] = useState({
    nim: '',
    nama: '',
    email: '',
    jenis_kelamin: 'L' as 'L' | 'P',
    angkatan: 2024,
    prodi_id: prodiOptions[0]?.id || 1,
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/auth/csrf')
      .then((r) => r.json())
      .then((d) => setCsrfToken(d.csrfToken || ''));
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setFormError('');
    setFormData({
      nim: '',
      nama: '',
      email: '',
      jenis_kelamin: 'L',
      angkatan: 2024,
      prodi_id: prodiOptions[0]?.id || 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (mhs: MahasiswaRow) => {
    setEditingItem(mhs);
    setFormError('');
    setFormData({
      nim: mhs.nim,
      nama: mhs.nama,
      email: mhs.email,
      jenis_kelamin: mhs.jenis_kelamin,
      angkatan: mhs.angkatan,
      prodi_id: mhs.prodi_id,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { id: editingItem.id, ...formData } : formData;

      const res = await fetch('/api/mahasiswa', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Gagal menyimpan data.');
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

  const handleDelete = async (mhs: MahasiswaRow) => {
    const ok = await confirmDialog({
      title: 'Hapus Mahasiswa?',
      message: `Data ${mhs.nama} (${mhs.nim}) akan dihapus permanen dan tidak bisa dikembalikan.`,
      confirmText: 'Ya, Hapus',
    });
    if (!ok) return;

    const res = await fetch('/api/mahasiswa', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      body: JSON.stringify({ id: mhs.id }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast('error', data.error || 'Gagal menghapus mahasiswa');
    } else {
      toast('success', data.message || 'Mahasiswa berhasil dihapus.');
      router.refresh();
    }
  };

  const filteredAndSortedData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return initialData
      .filter((mhs) => {
        const matchSearch =
          !query ||
          mhs.nama.toLowerCase().includes(query) ||
          mhs.nim.toLowerCase().includes(query) ||
          mhs.email.toLowerCase().includes(query);
        const matchProdi = selectedProdi === 'ALL' || mhs.kode_prodi === selectedProdi;
        const matchGender = selectedGender === 'ALL' || mhs.jenis_kelamin === selectedGender;
        return matchSearch && matchProdi && matchGender;
      })
      .sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [initialData, searchQuery, selectedProdi, selectedGender, sortKey, sortOrder]);

  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tombol Tambah */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Data Mahasiswa
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Menampilkan {filteredAndSortedData.length} dari {initialData.length} Mahasiswa terdaftar.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex min-h-[44px] items-center gap-2 self-start rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Mahasiswa</span>
        </button>
      </div>

      {/* Panel Kontrol Filter & Pencarian */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari NIM, nama mahasiswa, atau email..."
              className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-slate-50/60 pr-10 pl-10 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={selectedGender}
                onChange={(e) => {
                  setSelectedGender(e.target.value);
                  setCurrentPage(1);
                }}
                className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
              >
                <option value="ALL">Semua Gender</option>
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            >
              <option value={10}>10 baris</option>
              <option value={25}>25 baris</option>
              <option value={50}>50 baris</option>
              <option value={100}>100 baris</option>
            </select>
          </div>
        </div>

        {/* Filter Pill Prodi */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          {['ALL', ...prodiOptions.map((p) => p.kode_prodi)].map((kode) => {
            const isActive = selectedProdi === kode;
            return (
              <button
                key={kode}
                type="button"
                onClick={() => {
                  setSelectedProdi(kode);
                  setCurrentPage(1);
                }}
                className={`inline-flex min-h-[38px] items-center rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {kode === 'ALL' ? 'Semua Prodi' : kode}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabel Data Mahasiswa */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wider text-slate-600 uppercase">
              <tr>
                <th className="w-14 px-6 py-4">No</th>
                <th className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleSort('nim')}
                    className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-blue-600"
                  >
                    NIM
                    {sortKey === 'nim' ? (
                      sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleSort('nama')}
                    className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-blue-600"
                  >
                    Nama Mahasiswa
                    {sortKey === 'nama' ? (
                      sortOrder === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-4">Program Studi</th>
                <th className="px-6 py-4 text-center">Gender</th>
                <th className="px-6 py-4">Angkatan</th>
                <th className="px-6 py-4 text-right">Aksi CRUD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedData.map((mhs, index) => (
                <tr key={mhs.id} className="hover:bg-blue-50/30">
                  <td className="px-6 py-4 font-medium text-slate-500">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-slate-800">
                    {mhs.nim}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{mhs.nama}</div>
                    <div className="text-xs text-slate-500">{mhs.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-bold ${
                        PRODI_BADGE_STYLES[mhs.kode_prodi] ||
                        'border-slate-200 bg-slate-100 text-slate-700'
                      }`}
                    >
                      {mhs.kode_prodi}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        mhs.jenis_kelamin === 'L'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {mhs.jenis_kelamin}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{mhs.angkatan}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(mhs)}
                        title="Edit Mahasiswa"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600 hover:bg-blue-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(mhs)}
                        title="Hapus Mahasiswa"
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

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-6 py-3 sm:flex-row">
          <p className="text-xs text-slate-600 sm:text-sm">
            Halaman <strong>{safeCurrentPage}</strong> dari <strong>{totalPages}</strong>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" /> Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              Selanjutnya <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit Mahasiswa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingItem ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    NIM
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    className="mt-1 min-h-[42px] w-full rounded-lg border border-slate-300 px-3 text-sm"
                    placeholder="Contoh: 5301424099"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Angkatan
                  </label>
                  <input
                    type="number"
                    required
                    min={2018}
                    max={2030}
                    value={formData.angkatan}
                    onChange={(e) =>
                      setFormData({ ...formData, angkatan: Number(e.target.value) })
                    }
                    className="mt-1 min-h-[42px] w-full rounded-lg border border-slate-300 px-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="mt-1 min-h-[42px] w-full rounded-lg border border-slate-300 px-3 text-sm"
                  placeholder="Nama lengkap mahasiswa"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase">
                  Email Mahasiswa
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 min-h-[42px] w-full rounded-lg border border-slate-300 px-3 text-sm"
                  placeholder="nama@students.ac.id"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.jenis_kelamin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        jenis_kelamin: e.target.value as 'L' | 'P',
                      })
                    }
                    className="mt-1 min-h-[42px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase">
                    Program Studi
                  </label>
                  <select
                    value={formData.prodi_id}
                    onChange={(e) =>
                      setFormData({ ...formData, prodi_id: Number(e.target.value) })
                    }
                    className="mt-1 min-h-[42px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
                  >
                    {prodiOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.kode_prodi} - {p.nama_prodi}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-[42px] rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[42px] rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}