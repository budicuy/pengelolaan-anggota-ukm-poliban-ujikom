"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DashboardProvider, useDashboard } from "./dashboard-context";
import { loginUser } from "@/actions/UserAction";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Award,
  Users,
  UserCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const {
    user,
    setUser,
    statsData,
    toast,
    showToast,
    hasAccessToMahasiswaAndUkm,
    hasAccessToAnggotaAndPendaftaran,
  } = useDashboard();

  const pathname = usePathname();
  const router = useRouter();

  // Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

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
      
      // Auto redirect based on role
      if (data.role === "Ketua UKM") {
        router.push("/pendaftaran");
      } else {
        router.push("/");
      }
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
    showToast("Anda telah keluar dari sistem.");
    router.push("/");
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

  // If user is not authenticated, render login page
  if (!user) {
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
          <div className="absolute inset-0 bg-gradient-to-tr from-red-600/90 via-orange-500/70 to-amber-500/50 z-0 mix-blend-hard-light" />
          <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-red-900/40 to-transparent z-0 opacity-60" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-2 shadow-lg">
              <GraduationCap className="h-6 w-6 text-red-600" />
            </div>
            <span className="font-black text-white tracking-widest text-lg uppercase drop-shadow-sm">POLIBAN</span>
          </div>

          <div className="relative z-10 text-white max-w-md">
            <h2 className="text-4xl font-black tracking-tight leading-tight drop-shadow-md">
              Sistem Informasi Keanggotaan UKM.
            </h2>
            <p className="mt-4 text-sm font-medium text-zinc-100 leading-relaxed drop-shadow-sm">
              Satu pintu untuk verifikasi keaktifan organisasi, pendaftaran anggota baru, dan pelaporan terintegrasi Neon Database.
            </p>
          </div>

          <div className="relative z-10 text-xs font-bold tracking-wider uppercase text-zinc-300 select-none">
            © 2026 Politeknik Negeri Banjarmasin. All rights reserved.
          </div>
        </div>

        {/* Right Authentication Form Panel */}
        <div className="flex flex-1 flex-col justify-center py-12 px-6 sm:px-12 lg:px-20 bg-white">
          <div className="mx-auto w-full max-w-sm">
            <div className="flex items-center gap-2.5 md:hidden mb-8">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-red-500 to-orange-500 p-1.5 shadow-md">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-sm bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent uppercase tracking-wider">
                SIM UKM
              </span>
            </div>

            <div>
              <h2 className="text-3xl font-black tracking-tight text-zinc-900">Selamat Datang</h2>
              <p className="mt-2 text-sm text-zinc-500 font-medium">
                Silakan masuk menggunakan kredensial Administrator Anda.
              </p>
            </div>

            {error && (
              <div className="mt-6 flex items-center gap-2.5 rounded-lg bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700 animate-shake">
                <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                  Alamat Email
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="admin@poliban.ac.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-450 outline-none focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/10 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-bold text-red-600 hover:text-red-700 transition"
                  >
                    Lupa Sandi?
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-zinc-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-10 text-sm text-zinc-900 placeholder-zinc-400 outline-none focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/10 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-700"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-zinc-300 bg-white text-orange-500 focus:ring-orange-500/20 cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-650 cursor-pointer font-medium select-none">
                    Ingat Sesi Saya
                  </label>
                </div>
              </div>

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

  // Active Menu / Current Section Title
  const getSectionTitle = () => {
    if (pathname === "/") return "dashboard";
    return pathname.replace("/", "");
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-805 flex-col md:flex-row print:bg-white print:text-black">
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
              className="md:hidden p-1 text-zinc-405 hover:text-zinc-650"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className={`p-4 space-y-1.5 md:block ${mobileMenuOpen ? "block" : "hidden"}`}>
            {/* Overview / Stat Tab */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                pathname === "/"
                  ? "bg-red-500/10 text-red-600"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
              }`}
            >
              <TrendingUp className="h-4.5 w-4.5" />
              <span>Dashboard Overview</span>
            </Link>

            {/* Mahasiswa (Conditional Access) */}
            {hasAccessToMahasiswaAndUkm() && (
              <Link
                href="/mahasiswa"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                  pathname === "/mahasiswa"
                    ? "bg-red-500/10 text-red-600"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4.5 w-4.5" />
                  <span>Data Mahasiswa</span>
                </div>
                <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-mono font-bold">
                  {statsData.totalMahasiswa}
                </span>
              </Link>
            )}

            {/* UKM (Conditional Access) */}
            {hasAccessToMahasiswaAndUkm() && (
              <Link
                href="/ukm"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                  pathname === "/ukm"
                    ? "bg-red-500/10 text-red-600"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Award className="h-4.5 w-4.5" />
                  <span>Daftar UKM</span>
                </div>
                <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-mono font-bold">
                  {statsData.totalUKM}
                </span>
              </Link>
            )}

            {/* Pendaftaran Anggota */}
            {hasAccessToAnggotaAndPendaftaran() && (
              <Link
                href="/pendaftaran"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                  pathname === "/pendaftaran"
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
              </Link>
            )}

            {/* Anggota UKM */}
            {hasAccessToAnggotaAndPendaftaran() && (
              <Link
                href="/anggota"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold transition cursor-pointer ${
                  pathname === "/anggota"
                    ? "bg-red-500/10 text-red-600"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="h-4.5 w-4.5" />
                  <span>Anggota Resmi UKM</span>
                </div>
                <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-mono font-bold">
                  {statsData.totalAnggota}
                </span>
              </Link>
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
              <span className="block text-[9px] uppercase tracking-wider text-zinc-550 font-extrabold mt-0.5">{user.role}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-55 py-2.5 px-3 text-xs font-bold text-red-600 hover:bg-red-100 transition active:scale-[0.98] cursor-pointer"
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
            <span className="text-xs text-zinc-800 font-extrabold capitalize">{getSectionTitle()}</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="hidden sm:inline">Waktu Server: {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </header>

        {/* Scrollable Work Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 print:p-0">
          {children}
        </div>
      </main>

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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </DashboardProvider>
  );
}
