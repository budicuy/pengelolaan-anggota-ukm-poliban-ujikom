"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../dashboard-context";
import { getPendaftaranList, createPendaftaran, processPendaftaran } from "@/actions/PendaftaranAction";
import { getMahasiswaList } from "@/actions/MahasiswaAction";
import { getUkmList } from "@/actions/UkmAction";
import { Search, Plus, Printer, Download, Check, X, AlertCircle } from "lucide-react";

interface Pendaftaran {
  id: string;
  nim: string;
  namaMahasiswa: string;
  ukmId: string;
  namaUKM: string;
  tanggalDaftar: string;
  status: string;
}

interface Mahasiswa {
  nim: string;
  nama: string;
  jurusan: string;
}

interface UKM {
  id: string;
  nama: string;
  jumlahAnggota: number;
}

export default function PendaftaranPage() {
  const { hasAccessToAnggotaAndPendaftaran, showToast, refreshStats } = useDashboard();
  const [pendaftaranList, setPendaftaranList] = useState<Pendaftaran[]>([]);
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [ukmList, setUkmList] = useState<UKM[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModal, setActiveModal] = useState<"addPendaftaran" | null>(null);

  // Form states
  const [formDaftarNim, setFormDaftarNim] = useState("");
  const [formDaftarUkmId, setFormDaftarUkmId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [regData, mhsData, ukmData] = await Promise.all([
        getPendaftaranList(),
        getMahasiswaList(),
        getUkmList()
      ]);
      setPendaftaranList(regData);
      setMahasiswaList(mhsData);
      setUkmList(ukmData);
    } catch (err) {
      console.error("Gagal memuat data pendaftaran:", err);
      showToast("Gagal mengambil data dari database", "error");
    }
  };

  useEffect(() => {
    if (hasAccessToAnggotaAndPendaftaran()) {
      loadData();
    }
  }, []);

  if (!hasAccessToAnggotaAndPendaftaran()) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800 space-y-3 max-w-md mx-auto mt-12 shadow-sm">
        <div className="flex items-center gap-2 font-bold">
          <AlertCircle className="h-5 w-5" />
          <span>Akses Ditolak</span>
        </div>
        <p className="text-sm">
          Anda tidak memiliki wewenang untuk mengakses halaman registrasi anggota UKM ini.
        </p>
      </div>
    );
  }

  const handleAddPendaftaran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDaftarNim || !formDaftarUkmId) {
      showToast("Pilih mahasiswa dan UKM terlebih dahulu", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPendaftaran(formDaftarNim, formDaftarUkmId);
      setActiveModal(null);
      setFormDaftarNim("");
      setFormDaftarUkmId("");
      showToast("Pendaftaran anggota baru berhasil diajukan");
      loadData();
      refreshStats();
    } catch (err: any) {
      showToast(err.message || "Gagal mengajukan pendaftaran", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprovePendaftaran = async (regId: string) => {
    setIsSubmitting(true);
    try {
      await processPendaftaran(regId, "Approve");
      showToast("Pendaftaran anggota berhasil disetujui!");
      loadData();
      refreshStats();
    } catch (err: any) {
      showToast(err.message || "Gagal menyetujui pendaftaran", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectPendaftaran = async (regId: string) => {
    setIsSubmitting(true);
    try {
      await processPendaftaran(regId, "Reject");
      showToast("Pendaftaran anggota berhasil ditolak");
      loadData();
      refreshStats();
    } catch (err: any) {
      showToast(err.message || "Gagal menolak pendaftaran", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilteredPendaftaran = () => {
    return pendaftaranList.filter(
      (p) =>
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.namaMahasiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.namaUKM.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const triggerPrint = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ["ID Registrasi", "NIM", "Nama Mahasiswa", "ID UKM", "Nama UKM", "Tanggal Daftar", "Status"];
    const rows = getFilteredPendaftaran().map((p) => [p.id, p.nim, p.namaMahasiswa, p.ukmId, p.namaUKM, p.tanggalDaftar, p.status]);
    const filename = `data-pendaftaran-${new Date().toISOString().split("T")[0]}.csv`;

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
    showToast("Berhasil mengekspor data pendaftaran ke format CSV/Excel!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Registrasi Anggota UKM</h1>
          <p className="text-sm text-zinc-500 mt-1">Daftar permohonan gabung UKM yang diajukan mahasiswa.</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => setActiveModal("addPendaftaran")}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Daftarkan Anggota Baru</span>
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
          placeholder="Cari NIM, Nama, UKM, atau Status..."
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
                <th className="py-4.5 px-6">Nama Mahasiswa</th>
                <th className="py-4.5 px-6">UKM yang Dituju</th>
                <th className="py-4.5 px-6">Tanggal Daftar</th>
                <th className="py-4.5 px-6 text-center">Status</th>
                <th className="py-4.5 px-6 text-right print:hidden">Verifikasi Pimpinan UKM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {getFilteredPendaftaran().length > 0 ? (
                getFilteredPendaftaran().map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4.5 px-6 font-mono text-xs text-zinc-900 font-bold">{p.nim}</td>
                    <td className="py-4.5 px-6 text-zinc-900 font-bold">{p.namaMahasiswa}</td>
                    <td className="py-4.5 px-6 text-rose-600 font-bold">{p.namaUKM}</td>
                    <td className="py-4.5 px-6 text-xs">{p.tanggalDaftar}</td>
                    <td className="py-4.5 px-6 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        p.status === "Disetujui"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : p.status === "Ditolak"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4.5 px-6 text-right print:hidden">
                      {p.status === "Menunggu" ? (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleApprovePendaftaran(p.id)}
                            disabled={isSubmitting}
                            className="flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 hover:bg-emerald-600 hover:text-white px-2 py-1 text-xs font-bold text-emerald-700 transition cursor-pointer disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>{isSubmitting ? "Memproses..." : "Setuju"}</span>
                          </button>
                          <button
                            onClick={() => handleRejectPendaftaran(p.id)}
                            disabled={isSubmitting}
                            className="flex items-center gap-1 rounded bg-red-50 border border-red-200 hover:bg-red-600 hover:text-white px-2 py-1 text-xs font-bold text-red-700 transition cursor-pointer disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>{isSubmitting ? "Memproses..." : "Tolak"}</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 font-bold">Sudah Diproses</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    Tidak ada data pendaftaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==========================================
      // MODAL: TAMBAH PENDAFTARAN
      // ========================================== */}
      {activeModal === "addPendaftaran" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-zinc-900">Ajukan Anggota UKM Baru</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddPendaftaran} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase">Pilih Mahasiswa</label>
                <select
                  value={formDaftarNim}
                  onChange={(e) => setFormDaftarNim(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-900 focus:border-red-500 outline-none"
                >
                  <option value="">-- Pilih Mahasiswa --</option>
                  {mahasiswaList.map((m) => (
                    <option key={m.nim} value={m.nim}>
                      {m.nim} - {m.nama} ({m.jurusan})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase">Pilih UKM Tujuan</label>
                <select
                  value={formDaftarUkmId}
                  onChange={(e) => setFormDaftarUkmId(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-900 focus:border-red-500 outline-none"
                >
                  <option value="">-- Pilih UKM --</option>
                  {ukmList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.id} - {u.nama}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 text-[11px] text-zinc-500 leading-normal">
                <strong>Catatan Validasi Database:</strong> Sistem akan memeriksa apakah mahasiswa sudah terdaftar di UKM lain demi mematuhi batas maksimal 1 UKM per mahasiswa.
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
                  {isSubmitting ? "Mendaftarkan..." : "Daftarkan Anggota"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
