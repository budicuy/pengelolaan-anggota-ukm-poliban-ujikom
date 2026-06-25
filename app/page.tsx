"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getMahasiswaList, createMahasiswa, updateMahasiswa, deleteMahasiswa } from "@/actions/MahasiswaAction";
import { getUkmList, createUkm, updateUkm, deleteUkm } from "@/actions/UkmAction";
import { getPendaftaranList, createPendaftaran, processPendaftaran } from "@/actions/PendaftaranAction";
import { getAnggotaList, deleteAnggota } from "@/actions/AnggotaAction";
import { getDashboardStats } from "@/actions/DashboardAction";
import { loginUser } from "@/actions/UserAction";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  GraduationCap,
  Award,
  Users,
  UserCheck,
  Search,
  Plus,
  Trash2,
  Edit,
  Printer,
  Download,
  LogOut,
  Menu,
  X,
  Check,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  AlertCircle
} from "lucide-react";

// ==========================================
// TYPES & SCHEMAS
// ==========================================
interface Mahasiswa {
  nim: string;
  nama: string;
  jurusan: string;
}

interface UKM {
  id: string;
  nama: string;
  deskripsi: string;
  jumlahAnggota: number;
}

interface Pendaftaran {
  id: string;
  nim: string;
  namaMahasiswa: string;
  ukmId: string;
  namaUKM: string;
  tanggalDaftar: string;
  status: "Menunggu" | "Disetujui" | "Ditolak" | string;
}

interface AnggotaUKM {
  nim: string;
  namaMahasiswa: string;
  jurusan: string;
  ukmId: string;
  namaUKM: string;
  tanggalDaftar: string;
}

interface UserSession {
  email: string;
  role: "Administrator" | "Wakil Direktur 3" | "Kepala Bagian Akademik" | "Ketua UKM" | string;
  name: string;
}

export default function App() {
  // ==========================================
  // AUTH STATES
  // ==========================================
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);

  // For forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // ==========================================
  // DATABASE STATES
  // ==========================================
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [ukmList, setUkmList] = useState<UKM[]>([]);
  const [pendaftaranList, setPendaftaranList] = useState<Pendaftaran[]>([]);
  const [anggotaList, setAnggotaList] = useState<AnggotaUKM[]>([]);
  const [statsData, setStatsData] = useState({
    totalMahasiswa: 0,
    totalUKM: 0,
    totalPendaftaranPending: 0,
    totalAnggota: 0
  });

  // ==========================================
  // DASHBOARD LAYOUT & VIEW STATES
  // ==========================================
  const [activeMenu, setActiveMenu] = useState<"dashboard" | "mahasiswa" | "ukm" | "pendaftaran" | "anggota">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals for Create/Edit
  const [activeModal, setActiveModal] = useState<"addMahasiswa" | "editMahasiswa" | "addUkm" | "editUkm" | "addPendaftaran" | null>(null);
  
  // Selected items for editing
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<Mahasiswa | null>(null);
  const [selectedUkm, setSelectedUkm] = useState<UKM | null>(null);

  // Form input fields for Modals
  const [formNim, setFormNim] = useState("");
  const [formNama, setFormNama] = useState("");
  const [formJurusan, setFormJurusan] = useState("");

  const [formUkmId, setFormUkmId] = useState("");
  const [formUkmNama, setFormUkmNama] = useState("");
  const [formUkmDeskripsi, setFormUkmDeskripsi] = useState("");

  const [formDaftarNim, setFormDaftarNim] = useState("");
  const [formDaftarUkmId, setFormDaftarUkmId] = useState("");

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

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

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  // ==========================================
  // FETCH DATA FROM DATABASE
  // ==========================================
  const refreshData = async () => {
    try {
      const [mhsData, ukmData, regData, memData, statsData] = await Promise.all([
        getMahasiswaList(),
        getUkmList(),
        getPendaftaranList(),
        getAnggotaList(),
        getDashboardStats()
      ]);

      setMahasiswaList(mhsData);
      setUkmList(ukmData);
      setPendaftaranList(regData);
      setAnggotaList(memData);
      setStatsData(statsData);
    } catch (err) {
      console.error("Gagal mengambil data dari database:", err);
      showToast("Gagal menyinkronkan data dengan database", "error");
    }
  };

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem("userSession");
    if (savedSession) {
      try {
        setUser(JSON.parse(savedSession));
      } catch (err) {
        console.error("Gagal memuat sesi:", err);
      }
    }
  }, []);

  // Load database content when user logs in
  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  // ==========================================
  // AUTHENTICATION LOGIC (NEON DB INTEGRATION)
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email tidak boleh kosong");
      return;
    }
    if (!password) {
      setError("Kata sandi tidak boleh kosong");
      return;
    }

    setIsLoading(true);

    try {
      const data = await loginUser(email, password);
      localStorage.setItem("userSession", JSON.stringify(data));
      setUser(data);
      showToast(`Selamat datang kembali, ${data.name}!`);
    } catch (err: any) {
      setError(err.message || "Email atau kata sandi salah");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    setUser(null);
    setEmail("");
    setPassword("");
    setActiveMenu("dashboard");
    showToast("Anda telah keluar dari sistem.");
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSent(false);
      setForgotEmail("");
      showToast("Link reset password telah dikirim ke email Anda", "info");
    }, 1500);
  };

  // ==========================================
  // CORE FUNCTIONS: MAHASISWA
  // ==========================================
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
      clearMahasiswaForm();
      showToast("Mahasiswa berhasil didaftarkan");
      refreshData();
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
      clearMahasiswaForm();
      showToast("Data mahasiswa berhasil diperbaharui");
      refreshData();
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
          refreshData();
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

  const clearMahasiswaForm = () => {
    setFormNim("");
    setFormNama("");
    setFormJurusan("");
    setSelectedMahasiswa(null);
  };

  // ==========================================
  // CORE FUNCTIONS: UKM
  // ==========================================
  const handleAddUkm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUkmId || !formUkmNama) {
      showToast("Semua field wajib diisi", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      await createUkm(formUkmId, formUkmNama, formUkmDeskripsi);
      setActiveModal(null);
      clearUkmForm();
      showToast("Unit Kegiatan Mahasiswa berhasil ditambahkan");
      refreshData();
    } catch (err: any) {
      showToast(err.message || "Gagal menambahkan UKM", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUkm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUkm) return;

    setIsSubmitting(true);
    try {
      await updateUkm(formUkmId, formUkmNama, formUkmDeskripsi);
      setActiveModal(null);
      clearUkmForm();
      showToast("Data UKM berhasil diperbaharui");
      refreshData();
    } catch (err: any) {
      showToast(err.message || "Gagal mengupdate UKM", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUkm = (id: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: "Hapus Unit Kegiatan Mahasiswa",
      message: `Apakah Anda yakin ingin menghapus UKM dengan Kode ${id} beserta seluruh datanya? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.`,
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          await deleteUkm(id);
          showToast("UKM berhasil dihapus");
          refreshData();
        } catch (err: any) {
          showToast(err.message || "Gagal menghapus UKM", "error");
        } finally {
          setIsSubmitting(false);
          setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const openEditUkm = (ukm: UKM) => {
    setSelectedUkm(ukm);
    setFormUkmId(ukm.id);
    setFormUkmNama(ukm.nama);
    setFormUkmDeskripsi(ukm.deskripsi || "");
    setActiveModal("editUkm");
  };

  const clearUkmForm = () => {
    setFormUkmId("");
    setFormUkmNama("");
    setFormUkmDeskripsi("");
    setSelectedUkm(null);
  };

  // ==========================================
  // CORE FUNCTIONS: PENDAFTARAN & ANGGOTA
  // ==========================================
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
      refreshData();
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
      refreshData();
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
      refreshData();
    } catch (err: any) {
      showToast(err.message || "Gagal menolak pendaftaran", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnggota = (nim: string, ukmId: string) => {
    setDeleteConfirm({
      isOpen: true,
      title: "Keluarkan Anggota UKM",
      message: `Apakah Anda yakin ingin mengeluarkan mahasiswa dengan NIM ${nim} dari UKM ${ukmId}?`,
      onConfirm: async () => {
        setIsSubmitting(true);
        try {
          await deleteAnggota(nim, ukmId);
          showToast("Anggota berhasil dikeluarkan dari UKM");
          refreshData();
        } catch (err: any) {
          showToast(err.message || "Gagal mengeluarkan anggota", "error");
        } finally {
          setIsSubmitting(false);
          setDeleteConfirm((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // ==========================================
  // SEARCH & FILTER LOGIC
  // ==========================================
  const getFilteredMahasiswa = () => {
    return mahasiswaList.filter(
      (m) =>
        m.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.jurusan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getFilteredUkm = () => {
    return ukmList.filter(
      (u) =>
        u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.deskripsi && u.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const getFilteredPendaftaran = () => {
    return pendaftaranList.filter(
      (p) =>
        p.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.namaMahasiswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.namaUKM.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.status.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

  // ==========================================
  // EXCEL EXPORT & PRINT HELPERS
  // ==========================================
  const triggerPrint = (title: string) => {
    window.print();
  };

  const exportToExcel = (menuType: string) => {
    let headers: string[] = [];
    let rows: string[][] = [];
    const filename = `data-${menuType}-${new Date().toISOString().split("T")[0]}.csv`;

    if (menuType === "mahasiswa") {
      headers = ["NIM", "Nama", "Jurusan"];
      rows = mahasiswaList.map((m) => [m.nim, m.nama, m.jurusan]);
    } else if (menuType === "ukm") {
      headers = ["Kode UKM", "Nama UKM", "Deskripsi", "Jumlah Anggota"];
      rows = ukmList.map((u) => [u.id, u.nama, u.deskripsi || "", u.jumlahAnggota.toString()]);
    } else if (menuType === "pendaftaran") {
      headers = ["ID Registrasi", "NIM", "Nama Mahasiswa", "ID UKM", "Nama UKM", "Tanggal Daftar", "Status"];
      rows = pendaftaranList.map((p) => [p.id, p.nim, p.namaMahasiswa, p.ukmId, p.namaUKM, p.tanggalDaftar, p.status]);
    } else if (menuType === "anggota") {
      headers = ["NIM", "Nama Mahasiswa", "Jurusan", "ID UKM", "Nama UKM", "Tanggal Daftar"];
      rows = anggotaList.map((a) => [a.nim, a.namaMahasiswa, a.jurusan, a.ukmId, a.namaUKM, a.tanggalDaftar]);
    }

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
    showToast(`Berhasil mengekspor data ${menuType} ke format CSV/Excel!`);
  };

  // ==========================================
  // ACCESS CONTROLS (PRD ALIGNMENT)
  // ==========================================
  const hasAccessToMahasiswaAndUkm = () => {
    if (!user) return false;
    return (
      user.role === "Administrator" ||
      user.role === "Wakil Direktur 3" ||
      user.role === "Kepala Bagian Akademik"
    );
  };

  const hasAccessToAnggotaAndPendaftaran = () => {
    if (!user) return false;
    return user.role === "Administrator" || user.role === "Ketua UKM";
  };

  // Auto-switch tabs when logging in
  useEffect(() => {
    if (user) {
      if (user.role === "Ketua UKM") {
        setActiveMenu("pendaftaran");
      } else {
        setActiveMenu("dashboard");
      }
    }
  }, [user]);

  // Reset search on tab changes
  useEffect(() => {
    setSearchQuery("");
  }, [activeMenu]);

  // ==========================================
  // VIEW RENDERER
  // ==========================================
  if (!user) {
    // ==========================================
    // RENDER LOGIN SCREEN (LIGHT DESIGN, RED-ORANGE GRADIENT)
    // ==========================================
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50 font-sans md:flex-row text-zinc-900">
        
        {/* Left Visual Branding Panel */}
        <div className="relative hidden w-1/2 flex-col justify-between bg-zinc-100 p-12 md:flex overflow-hidden border-r border-zinc-200">
          <div className="absolute inset-0 z-0 opacity-80 mix-blend-multiply">
            <Image
              src="/login_banner.jpg"
              alt="POLIBAN Student Life"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
            />
          </div>
          {/* Light-tint red-orange gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-red-600/90 via-orange-500/70 to-amber-500/50 z-0 mix-blend-hard-light" />
          <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-red-900/40 to-transparent z-0 opacity-60" />

          {/* Logo Head */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-2 shadow-lg shadow-red-500/25">
              <GraduationCap className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-lg text-white">
                POLIBAN UKM
              </span>
              <span className="block text-[10px] text-red-100 uppercase tracking-widest font-bold">
                Portal Pengelolaan Anggota
              </span>
            </div>
          </div>

          {/* Middle Promotion */}
          <div className="relative z-10 max-w-lg mt-auto text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs text-white font-semibold mb-4 backdrop-blur-sm">
              <Shield className="h-3.5 w-3.5" />
              Sistem Terintegrasi Resmi
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight drop-shadow-sm">
              Satukan Semangat Organisasi & Bakat Mahasiswa.
            </h1>
            <p className="mt-4 text-base text-red-50/90 leading-relaxed font-medium">
              Mulai pencatatan, pendaftaran, hingga pelaporan aktivitas Unit Kegiatan Mahasiswa (UKM) Politeknik Negeri Banjarmasin dengan lebih cepat, terstruktur, dan efisien.
            </p>
          </div>

          {/* Footer Branding */}
          <div className="relative z-10 mt-auto flex items-center justify-between border-t border-white/20 pt-6 text-xs text-red-100/80 font-medium">
            <p>© 2026 Politeknik Negeri Banjarmasin.</p>
            <div className="flex gap-4">
              <span className="hover:text-white cursor-pointer transition">Panduan</span>
              <span className="hover:text-white cursor-pointer transition">Kontak UKM</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel (Clean Light Theme) */}
        <div className="flex w-full flex-col justify-center px-6 py-12 md:w-1/2 lg:px-20 bg-white relative">
          
          {/* Mobile Top Bar */}
          <div className="flex items-center gap-3 md:hidden mb-12">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-red-500 to-orange-500 p-1.5 shadow-md">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-md text-zinc-900">POLIBAN UKM</span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            {/* Header Form */}
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">Selamat Datang Kembali</h2>
              <p className="mt-2 text-sm text-zinc-500">
                Silakan masuk dengan email & kata sandi Anda untuk mengelola program.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <div>
                  <span className="font-semibold block mb-0.5">Kesalahan Masuk:</span>
                  {error}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Alamat Email
                  </label>
                  <div className="relative mt-1.5 rounded-lg shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4.5 w-4.5 text-zinc-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="nama@poliban.ac.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition duration-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      Kata Sandi
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-500 transition"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>
                  <div className="relative mt-1.5 rounded-lg shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4.5 w-4.5 text-zinc-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-10 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition duration-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-650"
                    >
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-zinc-300 bg-white text-orange-500 focus:ring-orange-500/20 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-600 cursor-pointer font-medium select-none">
                    Ingat Sesi Saya
                  </label>
                </div>
              </div>

              {/* Login Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative flex w-full justify-center rounded-lg bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 py-3 px-4 text-sm font-bold text-white shadow-md shadow-red-500/10 hover:shadow-red-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    "Masuk ke Dashboard"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* FORGOT PASSWORD MODAL */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-zinc-900">Lupa Kata Sandi?</h3>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-zinc-600 mb-6 leading-relaxed">
                Masukkan alamat email resmi Anda di bawah, kami akan mengirimkan link pengaturan ulang kata sandi.
              </p>
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Alamat Email
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    placeholder="nama@poliban.ac.id"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-red-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotSent}
                  className="w-full rounded-lg bg-gradient-to-r from-red-500 to-orange-500 py-2.5 px-4 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {forgotSent ? "Mengirim..." : "Kirim Link Atur Ulang"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Global Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg border text-sm animate-in slide-in-from-top-2 duration-300 bg-zinc-900 border-zinc-800 text-white ${
            toast.type === "success"
              ? "border-l-4 border-l-emerald-500"
              : toast.type === "error"
              ? "border-l-4 border-l-red-500"
              : "border-l-4 border-l-blue-500"
          }`}>
            <span>{toast.message}</span>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER MAIN DASHBOARD SYSTEM (DATABASE-DRIVEN)
  // ==========================================
  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-800 flex-col md:flex-row print:bg-white print:text-black">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col justify-between shrink-0 print:hidden">
        <div>
          {/* Side Logo Head */}
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-red-500 to-orange-500 p-1.5 shadow-md">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-sm bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent uppercase tracking-wider">
                SIM UKM
              </span>
            </div>
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1 text-zinc-400 hover:text-zinc-655"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className={`p-4 space-y-1.5 md:block ${mobileMenuOpen ? "block" : "hidden"}`}>
            {/* Overview / Stat Tab */}
            <button
              onClick={() => { setActiveMenu("dashboard"); setMobileMenuOpen(false); }}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                activeMenu === "dashboard"
                  ? "bg-red-500/10 text-red-600"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
              }`}
            >
              <TrendingUp className="h-4.5 w-4.5" />
              <span>Dashboard Overview</span>
            </button>

            {/* Mahasiswa (Conditional Access) */}
            {hasAccessToMahasiswaAndUkm() && (
              <button
                onClick={() => { setActiveMenu("mahasiswa"); setMobileMenuOpen(false); }}
                className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                  activeMenu === "mahasiswa"
                    ? "bg-red-500/10 text-red-600"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4.5 w-4.5" />
                  <span>Data Mahasiswa</span>
                </div>
                <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-mono font-bold">
                  {mahasiswaList.length}
                </span>
              </button>
            )}

            {/* UKM (Conditional Access) */}
            {hasAccessToMahasiswaAndUkm() && (
              <button
                onClick={() => { setActiveMenu("ukm"); setMobileMenuOpen(false); }}
                className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                  activeMenu === "ukm"
                    ? "bg-red-500/10 text-red-600"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Award className="h-4.5 w-4.5" />
                  <span>Daftar UKM</span>
                </div>
                <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-mono font-bold">
                  {ukmList.length}
                </span>
              </button>
            )}

            {/* Pendaftaran Anggota */}
            {hasAccessToAnggotaAndPendaftaran() && (
              <button
                onClick={() => { setActiveMenu("pendaftaran"); setMobileMenuOpen(false); }}
                className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                  activeMenu === "pendaftaran"
                    ? "bg-red-500/10 text-red-600"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-4.5 w-4.5" />
                  <span>Pendaftaran Anggota</span>
                </div>
                {statsData.totalPendaftaranPending > 0 && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-700 px-1.5 py-0.5 rounded font-extrabold animate-pulse">
                    {statsData.totalPendaftaranPending}
                  </span>
                )}
              </button>
            )}

            {/* Anggota UKM */}
            {hasAccessToAnggotaAndPendaftaran() && (
              <button
                onClick={() => { setActiveMenu("anggota"); setMobileMenuOpen(false); }}
                className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                  activeMenu === "anggota"
                    ? "bg-red-500/10 text-red-600"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="h-4.5 w-4.5" />
                  <span>Anggota Resmi UKM</span>
                </div>
                <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-mono font-bold">
                  {anggotaList.length}
                </span>
              </button>
            )}
          </nav>
        </div>

        {/* Logged In Info & Logout */}
        <div className={`p-4 border-t border-zinc-100 md:block ${mobileMenuOpen ? "block" : "hidden"}`}>
          <div className="flex items-center gap-3 bg-zinc-50 rounded-xl p-3 border border-zinc-200">
            <div className="h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 flex font-extrabold">
              {user.name.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-zinc-900 truncate">{user.name}</p>
              <span className="block text-[9px] uppercase tracking-wider text-zinc-500 font-extrabold mt-0.5">{user.role}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 px-3 text-xs font-bold text-red-600 hover:bg-red-100 transition active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-6 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-semibold">Pengelolaan Anggota UKM POLIBAN</span>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-xs text-zinc-800 font-extrabold capitalize">{activeMenu}</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-505">
            <span className="hidden sm:inline">Waktu Server: {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </header>

        {/* Scrollable Work Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 print:p-0">
          
          {/* ==========================================
          // MENU: OVERVIEW / STATISTICS
          // ========================================== */}
          {activeMenu === "dashboard" && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Ringkasan Sistem (Database Active)</h1>
                <p className="text-sm text-zinc-500 mt-1">Data terbaru dari Neon Database PostgreSQL.</p>
              </div>

              {/* Statistics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-red-500 transition-opacity group-hover:opacity-10">
                    <GraduationCap className="h-24 w-24" />
                  </div>
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-extrabold">Total Mahasiswa</span>
                  <h3 className="text-3xl font-black text-zinc-900 mt-1.5">{statsData.totalMahasiswa}</h3>
                  <p className="text-[10px] text-zinc-500 mt-2">Terdaftar resmi di database</p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-orange-500 transition-opacity group-hover:opacity-10">
                    <Award className="h-24 w-24" />
                  </div>
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-extrabold">Total UKM</span>
                  <h3 className="text-3xl font-black text-zinc-900 mt-1.5">{statsData.totalUKM}</h3>
                  <p className="text-[10px] text-zinc-500 mt-2">Organisasi aktif resmi</p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-amber-500 transition-opacity group-hover:opacity-10">
                    <Users className="h-24 w-24" />
                  </div>
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-extrabold">Pendaftaran Pending</span>
                  <h3 className="text-3xl font-black text-zinc-900 mt-1.5 text-amber-600">
                    {statsData.totalPendaftaranPending}
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-2">Menunggu persetujuan ketua</p>
                </div>

                <div className="bg-white rounded-xl p-5 border border-zinc-200 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 text-red-500 transition-opacity group-hover:opacity-10">
                    <UserCheck className="h-24 w-24" />
                  </div>
                  <span className="text-xs text-zinc-400 uppercase tracking-wider font-extrabold">Anggota Resmi</span>
                  <h3 className="text-3xl font-black text-zinc-900 mt-1.5 text-red-600">{statsData.totalAnggota}</h3>
                  <p className="text-[10px] text-zinc-505 mt-2">Sudah bergabung dengan UKM</p>
                </div>
              </div>

              {/* Roles Info Box */}
              <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="h-4.5 w-4.5 text-red-600" />
                  Struktur Otoritas Akun & Validasi Prisma
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Data saat ini didukung oleh database relational PostgreSQL pada Neon Database. Relasi data diikat secara kuat melalui Prisma ORM:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                    <span className="text-xs font-bold text-red-600 block mb-1">Administrator</span>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">Akun pengelola utama yang tersimpan pada tabel `User` di database. Memiliki hak akses penuh terhadap seluruh operasi database.</p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                    <span className="text-xs font-bold text-orange-600 block mb-1">Relasi Tabel Kuat</span>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">Tabel `Mahasiswa` dan `UKM` terelasi ke `Pendaftaran` (Foreign Key). Saat pendaftaran disetujui, relasi `Anggota` dibuat secara atomic.</p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                    <span className="text-xs font-bold text-amber-600 block mb-1">Validasi Unik (PRD-7)</span>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">Relasi 1-to-1 unik antara `Mahasiswa` dan `Anggota` memastikan mahasiswa hanya diperbolehkan bergabung ke dalam maksimal 1 UKM.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
          // MENU: MAHASISWA
          // ========================================== */}
          {activeMenu === "mahasiswa" && (
            <div className="space-y-6">
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Data Mahasiswa</h1>
                  <p className="text-sm text-zinc-500 mt-1">Daftar mahasiswa resmi yang berhak mendaftar ke UKM.</p>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={() => { clearMahasiswaForm(); setActiveModal("addMahasiswa"); }}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Mahasiswa</span>
                  </button>
                  <button
                    onClick={() => triggerPrint("mahasiswa")}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition cursor-pointer shadow-sm"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Cetak</span>
                  </button>
                  <button
                    onClick={() => exportToExcel("mahasiswa")}
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
                          <td colSpan={6} className="py-12 text-center text-zinc-400">
                            Tidak ada data mahasiswa ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
          // MENU: UKM
          // ========================================== */}
          {activeMenu === "ukm" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Daftar UKM Terdaftar</h1>
                  <p className="text-sm text-zinc-500 mt-1">Daftar Unit Kegiatan Mahasiswa resmi di Politeknik Negeri Banjarmasin.</p>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={() => { clearUkmForm(); setActiveModal("addUkm"); }}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah UKM</span>
                  </button>
                  <button
                    onClick={() => triggerPrint("ukm")}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition cursor-pointer shadow-sm"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Cetak</span>
                  </button>
                  <button
                    onClick={() => exportToExcel("ukm")}
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
                        <th className="py-4.5 px-6">Deskripsi</th>
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
                            <td className="py-4.5 px-6 text-xs text-zinc-500 max-w-xs truncate" title={u.deskripsi}>{u.deskripsi || "-"}</td>
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
                          <td colSpan={5} className="py-12 text-center text-zinc-400">
                            Tidak ada data UKM ditemukan.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
          // MENU: PENDAFTARAN ANGGOTA
          // ========================================== */}
          {activeMenu === "pendaftaran" && (
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
                    onClick={() => triggerPrint("pendaftaran")}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition cursor-pointer shadow-sm"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Cetak</span>
                  </button>
                  <button
                    onClick={() => exportToExcel("pendaftaran")}
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
                                    className="flex items-center gap-1 rounded bg-red-50 border border-red-200 hover:bg-red-650 hover:text-white px-2 py-1 text-xs font-bold text-red-700 transition cursor-pointer disabled:opacity-50"
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
            </div>
          )}

          {/* ==========================================
          // MENU: ANGGOTA UKM
          // ========================================== */}
          {activeMenu === "anggota" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">Anggota Resmi UKM</h1>
                  <p className="text-sm text-zinc-500 mt-1">Daftar Mahasiswa yang aktif dan tergabung secara resmi dalam UKM.</p>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={() => triggerPrint("anggota")}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition cursor-pointer shadow-sm"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Cetak Laporan</span>
                  </button>
                  <button
                    onClick={() => exportToExcel("anggota")}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition cursor-pointer shadow-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>Ekspor ke Excel</span>
                  </button>
                </div>
              </div>

              {/* Alert reminder of Rule 7 */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3.5 text-xs text-blue-700 flex gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-505" />
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
                        <th className="py-4.5 px-6">Tanggal Daftar</th>
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
                            <td className="py-4.5 px-6 text-xs">{a.tanggalDaftar}</td>
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
          )}
        </div>
      </main>

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
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-850"
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
                  className="mt-1 block w-full rounded-lg border border-zinc-205 bg-zinc-100 py-2 px-3 text-sm text-zinc-400 cursor-not-allowed outline-none"
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
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase">Deskripsi UKM</label>
                <textarea
                  placeholder="Deskripsi singkat unit kegiatan mahasiswa"
                  value={formUkmDeskripsi}
                  onChange={(e) => setFormUkmDeskripsi(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-900 focus:border-red-500 outline-none resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-550 hover:bg-zinc-50 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan UKM"}
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
                <label className="block text-xs font-bold text-zinc-555 uppercase">Nama UKM</label>
                <input
                  type="text"
                  required
                  placeholder="Nama unit kegiatan mahasiswa"
                  value={formUkmNama}
                  onChange={(e) => setFormUkmNama(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 px-3 text-sm text-zinc-900 focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase">Deskripsi UKM</label>
                <textarea
                  placeholder="Deskripsi singkat unit kegiatan mahasiswa"
                  value={formUkmDeskripsi}
                  onChange={(e) => setFormUkmDeskripsi(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-sm text-zinc-900 focus:border-red-500 outline-none resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-550 hover:bg-zinc-50 transition cursor-pointer"
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
                className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-850"
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
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 text-[11px] text-zinc-550 leading-normal">
                <strong>Catatan Validasi Database:</strong> Sistem akan memeriksa apakah mahasiswa sudah terdaftar di UKM lain demi mematuhi batas maksimal 1 UKM per mahasiswa.
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-505 hover:bg-zinc-50 transition cursor-pointer"
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

      {/* Global Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg border text-sm animate-in slide-in-from-top-2 duration-300 bg-zinc-900 border-zinc-800 text-white ${
          toast.type === "success"
            ? "border-l-4 border-l-emerald-500"
            : toast.type === "error"
            ? "border-l-4 border-l-red-500"
            : "border-l-4 border-l-blue-500"
        }`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
