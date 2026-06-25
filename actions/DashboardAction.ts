"use server";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const totalMahasiswa = await prisma.mahasiswa.count();
  const totalUKM = await prisma.uKM.count();
  const totalPendaftaranPending = await prisma.pendaftaran.count({
    where: { status: "Menunggu" },
  });
  const totalAnggota = await prisma.anggota.count();

  return {
    totalMahasiswa,
    totalUKM,
    totalPendaftaranPending,
    totalAnggota,
  };
}
