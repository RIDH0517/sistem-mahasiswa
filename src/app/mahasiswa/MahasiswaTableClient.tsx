'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUi } from '@/components/ui/UiProvider';
import { fetchCsrfToken } from '@/lib/client-auth';
import {
  Search,
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
  Download,
  RotateCcw,
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
  PTE: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  PTIK: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
  TE: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  TEKKOM: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30',
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
  const [selectedAngkatan, setSelectedAngkatan] = useState<string>('ALL');
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
      const token = csrfToken || (await fetchCsrfToken());
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { id: editingItem.id, ...formData } : formData;

      const res = await fetch('/api/mahasiswa', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': token,
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

    const token = csrfToken || (await fetchCsrfToken());
    const res = await fetch('/api/mahasiswa', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': token,
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

  const angkatanOptions = useMemo(
    () => Array.from(new Set(initialData.map((m) => m.angkatan))).sort((a, b) => b - a),
    [initialData]
  );

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedProdi !== 'ALL' ||
    selectedGender !== 'ALL' ||
    selectedAngkatan !== 'ALL';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedProdi('ALL');
    setSelectedGender('ALL');
    setSelectedAngkatan('ALL');
    setCurrentPage(1);
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
        const matchAngkatan = selectedAngkatan === 'ALL' || String(mhs.angkatan) === selectedAngkatan;
        return matchSearch && matchProdi && matchGender && matchAngkatan;
      })
      .sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [initialData, searchQuery, selectedProdi, selectedGender, selectedAngkatan, sortKey, sortOrder]);

  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedData = filteredAndSortedData.slice(startIndex, startIndex + pageSize);

  const renderSortIcon = (key: SortKey) =>
    sortKey === key ? (
      sortOrder === 'asc' ? (
        <ArrowUp className="h-3.5 w-3.5 text-accent-text" />
      ) : (
        <ArrowDown className="h-3.5 w-3.5 text-accent-text" />
      )
    ) : (
      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
    );

  const handleExportCsv = () => {
    if (filteredAndSortedData.length === 0) {
      toast('info', 'Tidak ada data untuk diekspor.');
      return;
    }

    // Cegah formula injection di Excel (=, +, -, @) dan escape tanda kutip
    const cell = (value: string | number) => {
      let text = String(value ?? '');
      if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
      return '"' + text.replace(/"/g, '""') + '"';
    };

    const header = [
      'No',
      'NIM',
      'Nama',
      'Email',
      'Jenis Kelamin',
      'Program Studi',
      'Kode Prodi',
      'Angkatan',
    ];
    const lines = filteredAndSortedData.map((m, i) =>
      [
        i + 1,
        m.nim,
        m.nama,
        m.email,
        m.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        m.nama_prodi,
        m.kode_prodi,
        m.angkatan,
      ]
        .map(cell)
        .join(';')
    );

    // BOM agar Excel membaca UTF-8; pemisah ";" sesuai Excel regional Indonesia
    const csv = '\uFEFF' + [header.map(cell).join(';'), ...lines].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data-mahasiswa-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('success', `${filteredAndSortedData.length} data mahasiswa berhasil diekspor.`);
  };

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
      {/* Header & Aksi Utama */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
            Data Mahasiswa
          </h2>
          <p className="mt-1 text-sm text-slate-600 tabular-nums dark:text-slate-400">
            Menampilkan {filteredAndSortedData.length} dari {initialData.length} mahasiswa terdaftar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCsv}
            className="ui-btn-secondary inline-flex min-h-[42px] items-center gap-2 px-4 py-2 text-sm font-semibold"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="ui-btn-primary inline-flex min-h-[42px] items-center gap-2 px-4 py-2 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Mahasiswa</span>
          </button>
        </div>
      </div>

      {/* Panel Kontrol Filter & Pencarian */}
      <div className="ui-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari NIM, nama mahasiswa, atau email..."
              className="ui-input min-h-[42px] w-full pr-3.5 pl-10 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2">
              <Filter className="hidden h-4 w-4 text-slate-400 sm:block dark:text-slate-500" />
              <select
                value={selectedGender}
                onChange={(e) => {
                  setSelectedGender(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter jenis kelamin"
                className="ui-input min-h-[42px] px-3 py-2 text-sm font-medium"
              >
                <option value="ALL">Semua Gender</option>
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <select
              value={selectedAngkatan}
              onChange={(e) => {
                setSelectedAngkatan(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter angkatan"
              className="ui-input min-h-[42px] px-3 py-2 text-sm font-medium"
            >
              <option value="ALL">Semua Angkatan</option>
              {angkatanOptions.map((a) => (
                <option key={a} value={String(a)}>
                  Angkatan {a}
                </option>
              ))}
            </select>

            {/* Kontrol Sort Khusus Mobile */}
            <div className="flex items-center gap-1.5 md:hidden">
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                aria-label="Urutkan berdasarkan"
                className="ui-input min-h-[42px] px-3 py-2 text-sm font-medium"
              >
                <option value="nim">Urut: NIM</option>
                <option value="nama">Urut: Nama</option>
                <option value="kode_prodi">Urut: Prodi</option>
                <option value="angkatan">Urut: Angkatan</option>
              </select>
              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                aria-label={sortOrder === 'asc' ? 'Urutan naik' : 'Urutan turun'}
                className="ui-btn-secondary flex h-[42px] w-[42px] items-center justify-center"
              >
                {sortOrder === 'asc' ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </button>
            </div>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Jumlah baris per halaman"
              className="ui-input min-h-[42px] px-3 py-2 text-sm font-medium"
            >
              <option value={10}>10 baris</option>
              <option value={25}>25 baris</option>
              <option value={50}>50 baris</option>
              <option value={100}>100 baris</option>
            </select>
          </div>
        </div>

        {/* Filter Pill Prodi */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3.5 dark:border-slate-800">
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
                className={`inline-flex min-h-[36px] items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-accent text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {kode === 'ALL' ? 'Semua Prodi' : kode}
              </button>
            );
          })}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="ml-auto inline-flex min-h-[36px] items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State / Data View */}
      {paginatedData.length === 0 ? (
        <div className="ui-card px-6 py-12 text-center">
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Data mahasiswa tidak ditemukan
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {hasActiveFilters
              ? 'Coba ubah kata kunci pencarian atau reset filter yang sedang aktif.'
              : 'Belum ada data mahasiswa yang tersimpan.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="ui-btn-secondary mt-4 inline-flex min-h-[40px] items-center gap-2 px-4 text-sm font-semibold"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Filter
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="space-y-3 md:hidden">
            {paginatedData.map((mhs) => (
              <div
                key={mhs.id}
                className="ui-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-slate-500 tabular-nums dark:text-slate-400">
                      {mhs.nim}
                    </p>
                    <h3 className="mt-0.5 truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                      {mhs.nama}
                    </h3>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {mhs.email}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(mhs)}
                      aria-label={`Edit ${mhs.nama}`}
                      title="Edit Mahasiswa"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-accent-text hover:bg-accent-soft dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(mhs)}
                      aria-label={`Hapus ${mhs.nama}`}
                      title="Hapus Mahasiswa"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${
                      PRODI_BADGE_STYLES[mhs.kode_prodi] ||
                      'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {mhs.kode_prodi}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                      mhs.jenis_kelamin === 'L'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                    }`}
                  >
                    {mhs.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </span>
                  <span className="ml-auto text-xs font-medium text-slate-600 tabular-nums dark:text-slate-400">
                    Angkatan {mhs.angkatan}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="ui-card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="border-b border-slate-200/80 bg-slate-50/80 text-xs font-semibold tracking-wider text-slate-600 uppercase dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                  <tr>
                    <th className="w-14 px-5 py-3.5">No</th>
                    <th className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleSort('nim')}
                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-accent-text"
                      >
                        NIM
                        {renderSortIcon('nim')}
                      </button>
                    </th>
                    <th className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleSort('nama')}
                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-accent-text"
                      >
                        Nama Mahasiswa
                        {renderSortIcon('nama')}
                      </button>
                    </th>
                    <th className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleSort('kode_prodi')}
                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-accent-text"
                      >
                        Program Studi
                        {renderSortIcon('kode_prodi')}
                      </button>
                    </th>
                    <th className="px-5 py-3.5 text-center">Gender</th>
                    <th className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleSort('angkatan')}
                        className="inline-flex items-center gap-1.5 font-semibold uppercase hover:text-accent-text"
                      >
                        Angkatan
                        {renderSortIcon('angkatan')}
                      </button>
                    </th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedData.map((mhs, index) => (
                    <tr
                      key={mhs.id}
                      className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-5 py-3.5 font-medium text-slate-500 tabular-nums dark:text-slate-400">
                        {startIndex + index + 1}
                      </td>
                      <td className="px-5 py-3.5 font-mono font-semibold text-slate-800 tabular-nums dark:text-slate-200">
                        {mhs.nim}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {mhs.nama}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{mhs.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-md border px-2.5 py-0.5 font-mono text-xs font-semibold ${
                            PRODI_BADGE_STYLES[mhs.kode_prodi] ||
                            'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {mhs.kode_prodi}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            mhs.jenis_kelamin === 'L'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                          }`}
                        >
                          {mhs.jenis_kelamin}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-700 tabular-nums dark:text-slate-300">
                        {mhs.angkatan}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(mhs)}
                            aria-label={`Edit ${mhs.nama}`}
                            title="Edit Mahasiswa"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-accent-text transition-colors hover:bg-accent-soft dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(mhs)}
                            aria-label={`Hapus ${mhs.nama}`}
                            title="Hapus Mahasiswa"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-600 transition-colors hover:bg-rose-50 dark:border-slate-700 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-500/10"
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
        </>
      )}

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="ui-card flex flex-col items-center justify-between gap-3 px-5 py-3 sm:flex-row">
          <p className="text-xs text-slate-600 tabular-nums sm:text-sm dark:text-slate-400">
            Menampilkan <strong className="text-slate-900 dark:text-slate-200">{startIndex + 1}</strong>–
            <strong className="text-slate-900 dark:text-slate-200">
              {Math.min(startIndex + pageSize, totalItems)}
            </strong>{' '}
            dari <strong className="text-slate-900 dark:text-slate-200">{totalItems}</strong> data •
            Halaman <strong className="text-slate-900 dark:text-slate-200">{safeCurrentPage}</strong>/
            <strong className="text-slate-900 dark:text-slate-200">{totalPages}</strong>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="ui-btn-secondary inline-flex min-h-[38px] items-center gap-1 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" /> Sebelumnya
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="ui-btn-secondary inline-flex min-h-[38px] items-center gap-1 px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              Selanjutnya <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit Mahasiswa */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs dark:bg-black/70"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mhs-modal-title"
            onClick={(e) => e.stopPropagation()}
            className="ui-modal flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800">
              <h3
                id="mhs-modal-title"
                className="text-lg font-bold text-slate-900 dark:text-slate-100"
              >
                {editingItem ? 'Edit Data Mahasiswa' : 'Tambah Mahasiswa Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup modal"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 overflow-y-auto p-6">
              {formError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-800/70 dark:bg-rose-950/60 dark:text-rose-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                    NIM
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    className="ui-input mt-1.5 min-h-[42px] w-full px-3.5 text-sm"
                    placeholder="Contoh: 5301424099"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                    Angkatan
                  </label>
                  <input
                    type="number"
                    required
                    min={2000}
                    max={2100}
                    value={formData.angkatan}
                    onChange={(e) =>
                      setFormData({ ...formData, angkatan: Number(e.target.value) })
                    }
                    className="ui-input mt-1.5 min-h-[42px] w-full px-3.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="ui-input mt-1.5 min-h-[42px] w-full px-3.5 text-sm"
                  placeholder="Nama lengkap mahasiswa"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                  Email Mahasiswa
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="ui-input mt-1.5 min-h-[42px] w-full px-3.5 text-sm"
                  placeholder="nama@students.ac.id"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
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
                    className="ui-input mt-1.5 min-h-[42px] w-full px-3.5 text-sm"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider text-slate-700 uppercase dark:text-slate-300">
                    Program Studi
                  </label>
                  <select
                    value={formData.prodi_id}
                    onChange={(e) =>
                      setFormData({ ...formData, prodi_id: Number(e.target.value) })
                    }
                    className="ui-input mt-1.5 min-h-[42px] w-full px-3.5 text-sm"
                  >
                    {prodiOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.kode_prodi} - {p.nama_prodi}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="ui-btn-secondary min-h-[42px] px-4 text-sm font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="ui-btn-primary min-h-[42px] px-5 text-sm font-semibold disabled:opacity-50"
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
