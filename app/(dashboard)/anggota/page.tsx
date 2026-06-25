"use client";

import React, { useState, useEffect } from "react";
import { useDashboard } from "../dashboard-context";
import { getAnggotaList, deleteAnggota } from "@/actions/AnggotaAction";
import { Search, Printer, Download, Trash2, AlertCircle } from "lucide-react";

interface AnggotaUKM {
  nim: string;
  namaMahasiswa: string;
  jurusan: string;
  ukmId: string;
  namaUKM: string;
  tanggalBergabung: string;
}

export default function AnggotaPage() {
  const { hasAccessToAnggotaAndPendaftaran, showToast, refreshStats } = useDashboard();
  const [anggotaList, setAnggotaList] = useState<AnggotaUKM[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      const data = await getAnggotaList();
      setAnggotaList(data);
    } catch (err) {
      console.error("Gagal memuat data anggota:", err);
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
          Anda tidak memiliki wewenang untuk mengakses halaman anggota resmi UKM ini.
        </p>
      </div>
    );
  }

  const handleDeleteAnggota = async (nim: string, ukmId: string) => {
    if (confirm("Keluarkan mahasiswa ini dari UKM?")) {
      try {
        await deleteAnggota(nim, ukmId);
        showToast("Anggota berhasil dikeluarkan dari UKM");
        loadData();
        refreshStats();
      } catch (err: any) {
        showToast(err.message || "Gagal mengeluarkan anggota", "error");
      }
    }
  };

  const getFilteredAnggota = () => {
    return anggotaList.filter(
      (a) =>
        a.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.namaMahasiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.namaUKM.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.jurusan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const triggerPrint = () => {
    window.print();
  };

  const exportToExcel = () => {
    const headers = ["NIM", "Nama Mahasiswa", "Jurusan", "ID UKM", "Nama UKM", "Tanggal Bergabung"];
    const rows = getFilteredAnggota().map((a) => [a.nim, a.namaMahasiswa, a.jurusan, a.ukmId, a.namaUKM, a.tanggalBergabung]);
    const filename = `data-anggota-${new Date().toISOString().split("T")[0]}.csv`;

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
    showToast("Berhasil mengekspor data anggota ke format CSV/Excel!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Anggota Resmi UKM</h1>
          <p className="text-sm text-zinc-500 mt-1">Daftar Mahasiswa yang aktif dan tergabung secara resmi dalam UKM.</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={triggerPrint}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition cursor-pointer shadow-sm"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Laporan</span>
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-650 hover:bg-zinc-50 hover:text-zinc-900 transition cursor-pointer shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>Ekspor ke Excel</span>
          </button>
        </div>
      </div>

      {/* Alert reminder of Rule 7 */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3.5 text-xs text-blue-700 flex gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
        <span>
          <strong>Informasi Aturan (PRD-7):</strong> Setiap anggota yang terdaftar wajib merupakan mahasiswa aktif yang terdaftar resmi, dan 1 mahasiswa hanya boleh tergabung dalam 1 Unit Kegiatan Mahasiswa (UKM).
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative print:hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-zinc-400" />
        </div>
        <input
          type="text"
          placeholder="Cari NIM, Nama, Jurusan, atau UKM..."
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
                <th className="py-4.5 px-6">Jurusan</th>
                <th className="py-4.5 px-6">Tergabung Di UKM</th>
                <th className="py-4.5 px-6">Tanggal Bergabung</th>
                <th className="py-4.5 px-6 text-right print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {getFilteredAnggota().length > 0 ? (
                getFilteredAnggota().map((a) => (
                  <tr key={`${a.nim}-${a.ukmId}`} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-4.5 px-6 font-mono text-xs text-zinc-900 font-bold">{a.nim}</td>
                    <td className="py-4.5 px-6 text-zinc-900 font-bold">{a.namaMahasiswa}</td>
                    <td className="py-4.5 px-6">{a.jurusan}</td>
                    <td className="py-4.5 px-6">
                      <span className="text-rose-600 font-bold">{a.namaUKM}</span>
                    </td>
                    <td className="py-4.5 px-6 text-xs">{a.tanggalBergabung}</td>
                    <td className="py-4.5 px-6 text-right print:hidden">
                      <button
                        onClick={() => handleDeleteAnggota(a.nim, a.ukmId)}
                        className="flex items-center gap-1.5 ml-auto text-xs font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-100 px-2.5 py-1.5 rounded transition cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Keluarkan</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    Belum ada anggota resmi yang terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
