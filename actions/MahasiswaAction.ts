"use server";
import { prisma } from "@/lib/prisma";

export async function getMahasiswaList() {
  return await prisma.mahasiswa.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createMahasiswa(nim: string, nama: string, jurusan: string) {
  if (!nim || !nama || !jurusan) {
    throw new Error("Semua field wajib diisi");
  }

  const existingNim = await prisma.mahasiswa.findUnique({ where: { nim } });
  if (existingNim) {
    throw new Error("NIM sudah terdaftar");
  }

  return await prisma.mahasiswa.create({
    data: { nim, nama, jurusan },
  });
}

export async function updateMahasiswa(nim: string, nama: string, jurusan: string) {
  if (!nim || !nama || !jurusan) {
    throw new Error("Semua field wajib diisi");
  }

  return await prisma.mahasiswa.update({
    where: { nim },
    data: { nama, jurusan },
  });
}

export async function deleteMahasiswa(nim: string) {
  if (!nim) {
    throw new Error("NIM wajib diberikan");
  }

  return await prisma.mahasiswa.delete({
    where: { nim },
  });
}
