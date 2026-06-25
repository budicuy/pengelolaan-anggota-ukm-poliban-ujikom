import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalMahasiswa = await prisma.mahasiswa.count();
    const totalUKM = await prisma.uKM.count();
    const totalPendaftaranPending = await prisma.pendaftaran.count({
      where: { status: "Menunggu" },
    });
    const totalAnggota = await prisma.anggota.count();

    return NextResponse.json({
      totalMahasiswa,
      totalUKM,
      totalPendaftaranPending,
      totalAnggota,
    });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data ringkasan" },
      { status: 500 }
    );
  }
}
