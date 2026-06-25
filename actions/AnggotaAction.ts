"use server";
import { prisma } from "@/lib/prisma";

export async function getAnggotaList() {
  const list = await prisma.anggota.findMany({
    include: {
      mahasiswa: {
        select: { nama: true, jurusan: true },
      },
      ukm: {
        select: { nama: true },
      },
    },
    orderBy: { tanggalDaftar: "desc" },
  });

  return list.map((a: any) => ({
    nim: a.mahasiswaNim,
    namaMahasiswa: a.mahasiswa.nama,
    jurusan: a.mahasiswa.jurusan,
    ukmId: a.ukmId,
    namaUKM: a.ukm.nama,
    jabatan: a.jabatan,
    tanggalDaftar: a.tanggalDaftar.toISOString().split("T")[0],
  }));
}

export async function deleteAnggota(nim: string, ukmId: string) {
  if (!nim || !ukmId) {
    throw new Error("NIM dan Kode UKM wajib ditentukan");
  }

  return await prisma.anggota.delete({
    where: {
      mahasiswaNim: nim,
    },
  });
}
