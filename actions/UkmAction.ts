"use server";
import { prisma } from "@/lib/prisma";

export async function getUkmList() {
  const list = await prisma.uKM.findMany({
    include: {
      _count: {
        select: { anggota: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return list.map((u) => ({
    id: u.id,
    nama: u.nama,
    jumlahAnggota: u._count.anggota,
  }));
}

export async function createUkm(id: string, nama: string) {
  if (!id || !nama) {
    throw new Error("Semua field wajib diisi");
  }

  const existing = await prisma.uKM.findUnique({ where: { id } });
  if (existing) {
    throw new Error("Kode UKM sudah terdaftar");
  }

  const ukm = await prisma.uKM.create({
    data: { id, nama },
  });

  return {
    ...ukm,
    jumlahAnggota: 0,
  };
}

export async function updateUkm(id: string, nama: string) {
  if (!id || !nama) {
    throw new Error("Semua field wajib diisi");
  }

  const updated = await prisma.uKM.update({
    where: { id },
    data: { nama },
  });

  const count = await prisma.anggota.count({ where: { ukmId: id } });

  return {
    ...updated,
    jumlahAnggota: count,
  };
}

export async function deleteUkm(id: string) {
  if (!id) {
    throw new Error("Kode UKM wajib diberikan");
  }

  return await prisma.uKM.delete({
    where: { id },
  });
}
