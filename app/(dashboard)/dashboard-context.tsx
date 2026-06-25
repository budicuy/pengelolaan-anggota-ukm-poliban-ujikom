"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getDashboardStats } from "@/actions/DashboardAction";

export interface UserSession {
  email: string;
  role: string;
  name: string;
}

export interface StatsData {
  totalMahasiswa: number;
  totalUKM: number;
  totalPendaftaranPending: number;
  totalAnggota: number;
}

interface DashboardContextType {
  user: UserSession | null;
  setUser: React.Dispatch<React.SetStateAction<UserSession | null>>;
  statsData: StatsData;
  refreshStats: () => Promise<void>;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  hasAccessToMahasiswaAndUkm: () => boolean;
  hasAccessToAnggotaAndPendaftaran: () => boolean;
  toast: { message: string; type: "success" | "error" | "info" } | null;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [statsData, setStatsData] = useState<StatsData>({
    totalMahasiswa: 0,
    totalUKM: 0,
    totalPendaftaranPending: 0,
    totalAnggota: 0,
  });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Toast notification timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
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

  // Fetch stats when user logged in
  const refreshStats = async () => {
    if (!user) return;
    try {
      const data = await getDashboardStats();
      setStatsData(data);
    } catch (err) {
      console.error("Gagal mengambil statistik dashboard:", err);
    }
  };

  useEffect(() => {
    if (user) {
      refreshStats();
    }
  }, [user]);

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

  return (
    <DashboardContext.Provider
      value={{
        user,
        setUser,
        statsData,
        refreshStats,
        showToast,
        hasAccessToMahasiswaAndUkm,
        hasAccessToAnggotaAndPendaftaran,
        toast,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}
