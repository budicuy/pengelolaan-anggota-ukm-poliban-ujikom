"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../dashboard-context";
import { getMahasiswaList, createMahasiswa, updateMahasiswa, deleteMahasiswa } from "@/actions/MahasiswaAction";
import { Search, Plus, Printer, Download, Edit, Trash2, X, AlertCircle, AlertTriangle } from "lucide-react";

interface Mahasiswa {
  nim: string;
  nama: string;
  jurusan: string;
}

export default function MahasiswaPage() {
  const { hasAccessToMahasiswaAndUkm, showToast, refreshStats } = useDashboard();
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<"addMahasiswa" | "editMahasiswa" | null>(null);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation modal states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Form states
  const [formNim, setFormNim] = useState("");
  const [formNama, setFormNama] = useState("");
  const [formJurusan, setFormJurusan] = useState("");

  const loadData = async () => {
    try {
      const data = await getMahasiswaList();
      setMahasiswaList(data);
    } catch (err) {
      console.error("Gagal memuat data mahasiswa:", err);
      showToast("Gagal mengambil data mahasiswa dari database", "error");
    }
  };

  useEffect(() => {
    if (hasAccessToMahasiswaAndUkm()) {
      loadData();
    }
  }, []);

  if (!hasAccessToMahasiswaAndUkm()) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800 space-y-3 max-w-md mx-auto mt-12 shadow-sm">
        <div className="flex items-center gap-2 font-bold">
          <AlertCircle className="h-5 w-5" />
          <span>Akses Ditolak</span>
        </div>
        <p className="text-sm">
          Anda tidak memiliki wewenang untuk mengakses halaman data mahasiswa ini.
        </p>
      </div>
    );
  }

  const handleAddMahasiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNim || !formNama || !formJurusan) {
      showToast("Semua field wajib diisi", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMahasiswa(formNim, formNama, formJurusan);
      setActiveModal(null);
      clearForm();
      showToast("Mahasiswa berhasil didaftarkan");
      loadData();
      refreshStats();
    } catch (err: any) {
      showToast(err.message || "Gagal mendaftarkan mahasiswa", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditMahasiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMahasiswa) return;

    setIsSubmitting(true);
    try {
      await updateMahasiswa(formNim, formNama, formJurusan);
      setActiveModal(null);
      clearForm();
      showToast("Data mahasiswa berhasil diperbaharui");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal memperbaharui data", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMahasiswa = (nim: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: "Hapus Data Mahasiswa",
      message: `Apakah Anda yakin ingin menghapus data mahasiswa dengan NIM ${nim}? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.`,
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          await deleteMahasiswa(nim);
          showToast("Mahasiswa berhasil dihapus");
          loadData();
          refreshStats();
        } catch (err: any) {
          showToast(err.message || "Gagal menghapus mahasiswa", "error");
        } finally {
          setIsSubmitting(false);
          setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const openEditMahasiswa = (mhs: Mahasiswa) => {
    setSelectedMahasiswa(mhs);
    setFormNim(mhs.nim);
    setFormNama(mhs.nama);
    setFormJurusan(mhs.jurusan);
    setActiveModal("editMahasiswa");
  };

  const clearForm = () => {
    setFormNim("");
    setFormNama("");
    setFormJurusan("");
    setSelectedMahasiswa(null);
  };

  const getFilteredMahasiswa = () => {
    return mahasiswaList.filter(
      (m) =>
        m.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.jurusan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const triggerPrint = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ["NIM", "Nama", "Jurusan"];
    const rows = getFilteredMahasiswa().map((m) => [m.nim, m.nama, m.jurusan]);
    const filename = `data-mahasiswa-${new Date().toISOString().split("T")[0]}.csv`;

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Berhasil mengekspor data mahasiswa ke format CSV/Excel!");
  };

  return (
    <div className="space-y-6">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Data Mahasiswa</h1>
          <p className="text-sm text-zinc-500 mt-1">Daftar mahasiswa resmi yang berhak mendaftar ke UKM.</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => { clearForm(); setActiveModal("addMahasiswa"); }}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Mahasiswa</span>
          </button>
          <button
            onClick={triggerPrint}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition cursor-pointer shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak</span>
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition cursor-pointer shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative print:hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-zinc-400" />
        </div>
        <input
          type="text"
          placeholder="Cari NIM, Nama, atau Jurusan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full max-w-sm rounded-lg border border-zinc-200 bg-white py-2.5 pl-9 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/10"
        />
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 text-xs font-bold text-zinc-700 uppercase tracking-wider border-b border-zinc-200">
              <tr>
                <th className="py-4.5 px-6">NIM</th>
                <th className="py-4.5 px-6">Nama Lengkap</th>
                <th className="py-4.5 px-6">Jurusan</th>
                <th className="py-4.5 px-6 text-right print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {getFilteredMahasiswa().length > 0 ? (
                getFilteredMahasiswa().map((m) => (
                  <tr key={m.nim} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4.5 px-6 font-mono text-xs text-zinc-900 font-bold">{m.nim}</td>
                    <td className="py-4.5 px-6 text-zinc-900 font-bold">{m.nama}</td>
                    <td className="py-4.5 px-6">{m.jurusan}</td>
                    <td className="py-4.5 px-6 text-right print:hidden">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEditMahasiswa(m)}
                          className="p-1.5 rounded text-orange-600 hover:bg-orange-50 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMahasiswa(m.nim)}
                          className="p-1.5 rounded text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-zinc-400">
                    Tidak ada data mahasiswa ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
      // MODAL: TAMBAH MAHASISWA
      // ========================================== */}
      {activeModal === "addMahasiswa" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-zinc-900">Tambah Mahasiswa Baru</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddMahasiswa} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase">NIM</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: E020323001"
                  value={formNim}
                  onChange={(e) => setFormNim(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap mahasiswa"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase">Jurusan</label>
                <select
                  value={formJurusan}
                  onChange={(e) => setFormJurusan(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 focus:border-red-500 outline-none"
                >
                  <option value="">-- Pilih Jurusan --</option>
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Teknik Elektro">Teknik Elektro</option>
                  <option value="Akuntansi">Akuntansi</option>
                  <option value="Administrasi Bisnis">Administrasi Bisnis</option>
                  <option value="Teknik Sipil">Teknik Sipil</option>
                  <option value="Teknik Mesin">Teknik Mesin</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Mahasiswa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
      // MODAL: EDIT MAHASISWA
      // ========================================== */}
      {activeModal === "editMahasiswa" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-zinc-900">Edit Data Mahasiswa</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditMahasiswa} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase">NIM (Tidak dapat diubah)</label>
                <input
                  type="text"
                  disabled
                  value={formNim}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-100 py-2 px-3 text-sm text-zinc-450 cursor-not-allowed outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap mahasiswa"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase">Jurusan</label>
                <select
                  value={formJurusan}
                  onChange={(e) => setFormJurusan(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 focus:border-red-500 outline-none"
                >
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Teknik Elektro">Teknik Elektro</option>
                  <option value="Akuntansi">Akuntansi</option>
                  <option value="Administrasi Bisnis">Administrasi Bisnis</option>
                  <option value="Teknik Sipil">Teknik Sipil</option>
                  <option value="Teknik Mesin">Teknik Mesin</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: Konfirmasi Hapus */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">{deleteConfirm.title}</h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              {deleteConfirm.message}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setDeleteConfirm((prev) => ({ ...prev, isOpen: false }))}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={deleteConfirm.onConfirm}
                disabled={isSubmitting}
                className="rounded-lg bg-red-500 hover:bg-red-650 px-4 py-2 text-xs font-bold text-white transition cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
