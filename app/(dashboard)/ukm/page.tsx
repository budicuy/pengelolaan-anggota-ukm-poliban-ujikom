"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../dashboard-context";
import { getUkmList, createUkm, updateUkm, deleteUkm } from "@/actions/UkmAction";
import { Search, Plus, Printer, Download, Edit, Trash2, X, AlertCircle } from "lucide-react";

interface UKM {
  id: string;
  nama: string;
  jumlahAnggota: number;
}

export default function UkmPage() {
  const { hasAccessToMahasiswaAndUkm, showToast, refreshStats } = useDashboard();
  const [ukmList, setUkmList] = useState<UKM[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<"addUkm" | "editUkm" | null>(null);
  const [selectedUkm, setSelectedUkm] = useState<UKM | null>(null);

  // Form states
  const [formUkmId, setFormUkmId] = useState("");
  const [formUkmNama, setFormUkmNama] = useState("");

  const loadData = async () => {
    try {
      const data = await getUkmList();
      setUkmList(data);
    } catch (err) {
      console.error("Gagal memuat data UKM:", err);
      showToast("Gagal mengambil data UKM dari database", "error");
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
          Anda tidak memiliki wewenang untuk mengakses halaman daftar UKM ini.
        </p>
      </div>
    );
  }

  const handleAddUkm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUkmId || !formUkmNama) {
      showToast("Semua field wajib diisi", "error");
      return;
    }

    try {
      await createUkm(formUkmId, formUkmNama);
      setActiveModal(null);
      clearForm();
      showToast("Unit Kegiatan Mahasiswa berhasil ditambahkan");
      loadData();
      refreshStats();
    } catch (err: any) {
      showToast(err.message || "Gagal menambahkan UKM", "error");
    }
  };

  const handleEditUkm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUkm) return;

    try {
      await updateUkm(formUkmId, formUkmNama);
      setActiveModal(null);
      clearForm();
      showToast("Data UKM berhasil diperbaharui");
      loadData();
    } catch (err: any) {
      showToast(err.message || "Gagal mengupdate UKM", "error");
    }
  };

  const handleDeleteUkm = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus UKM ini beserta semua datanya?")) {
      try {
        await deleteUkm(id);
        showToast("UKM berhasil dihapus");
        loadData();
        refreshStats();
      } catch (err: any) {
        showToast(err.message || "Gagal menghapus UKM", "error");
      }
    }
  };

  const openEditUkm = (ukm: UKM) => {
    setSelectedUkm(ukm);
    setFormUkmId(ukm.id);
    setFormUkmNama(ukm.nama);
    setActiveModal("editUkm");
  };

  const clearForm = () => {
    setFormUkmId("");
    setFormUkmNama("");
    setSelectedUkm(null);
  };

  const getFilteredUkm = () => {
    return ukmList.filter(
      (u) =>
        u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const triggerPrint = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ["Kode UKM", "Nama UKM", "Jumlah Anggota"];
    const rows = getFilteredUkm().map((u) => [u.id, u.nama, u.jumlahAnggota.toString()]);
    const filename = `data-ukm-${new Date().toISOString().split("T")[0]}.csv`;

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
    showToast("Berhasil mengekspor data UKM ke format CSV/Excel!");
  };

  return (
    <div className="space-y-6">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Daftar UKM Terdaftar</h1>
          <p className="text-sm text-zinc-500 mt-1">Daftar Unit Kegiatan Mahasiswa resmi di Politeknik Negeri Banjarmasin.</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => { clearForm(); setActiveModal("addUkm"); }}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah UKM</span>
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
          placeholder="Cari UKM berdasarkan Kode atau Nama..."
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
                <th className="py-4.5 px-6">Kode UKM</th>
                <th className="py-4.5 px-6">Nama UKM</th>
                <th className="py-4.5 px-6">Anggota Resmi</th>
                <th className="py-4.5 px-6 text-right print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {getFilteredUkm().length > 0 ? (
                getFilteredUkm().map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4.5 px-6 font-mono text-xs text-zinc-900 font-bold">{u.id}</td>
                    <td className="py-4.5 px-6 text-zinc-900 font-bold">{u.nama}</td>
                    <td className="py-4.5 px-6 text-xs text-rose-600 font-extrabold">{u.jumlahAnggota} Mahasiswa</td>
                    <td className="py-4.5 px-6 text-right print:hidden">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEditUkm(u)}
                          className="p-1.5 rounded text-orange-600 hover:bg-orange-50 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUkm(u.id)}
                          className="p-1.5 rounded text-red-600 hover:bg-red-55 transition cursor-pointer"
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
                    Tidak ada data UKM ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
      // MODAL: TAMBAH UKM
      // ========================================== */}
      {activeModal === "addUkm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-zinc-900">Tambah UKM Baru</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddUkm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase">Kode UKM</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: UKM-005"
                  value={formUkmId}
                  onChange={(e) => setFormUkmId(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase">Nama UKM</label>
                <input
                  type="text"
                  required
                  placeholder="Nama unit kegiatan mahasiswa"
                  value={formUkmNama}
                  onChange={(e) => setFormUkmNama(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 focus:border-red-500 outline-none"
                />
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
                  className="rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition cursor-pointer"
                >
                  Simpan UKM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
      // MODAL: EDIT UKM
      // ========================================== */}
      {activeModal === "editUkm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-zinc-900">Edit Data UKM</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditUkm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase">Kode UKM (Tidak dapat diubah)</label>
                <input
                  type="text"
                  disabled
                  value={formUkmId}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-100 py-2 px-3 text-sm text-zinc-400 cursor-not-allowed outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase">Nama UKM</label>
                <input
                  type="text"
                  required
                  placeholder="Nama unit kegiatan mahasiswa"
                  value={formUkmNama}
                  onChange={(e) => setFormUkmNama(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 focus:border-red-500 outline-none"
                />
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
                  className="rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
