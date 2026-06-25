"use client";

import React from "react";
import { useDashboard } from "./dashboard-context";
import { GraduationCap, Award, Users, UserCheck, Shield } from "lucide-react";

export default function DashboardPage() {
  const { statsData } = useDashboard();

  return (
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
          <p className="text-[10px] text-zinc-550 mt-2">Sudah bergabung dengan UKM</p>
        </div>
      </div>

    </div>
  );
}
