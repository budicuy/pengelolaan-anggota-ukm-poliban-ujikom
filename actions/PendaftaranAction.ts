"use server";
import { prisma } from "@/lib/prisma";

export async function getPendaftaranList() {
  const list = await prisma.pendaftaran.findMany({
    include: {
      mahasiswa: {
        select: { nama: true },
      },
      ukm: {
        select: { nama: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return list.map((p: any) => ({
    id: p.id,
    nim: p.mahasiswaNim,
    namaMahasiswa: p.mahasiswa.nama,
    ukmId: p.ukmId,
    namaUKM: p.ukm.nama,
    jabatan: p.jabatan,
    tanggalDaftar: p.tanggalDaftar.toISOString().split("T")[0],
    status: p.status,
  }));
}

export async function createPendaftaran(nim: string, ukmId: string, jabatan: string = "Anggota") {
  if (!nim || !ukmId) {
    throw new Error("Mahasiswa dan UKM wajib dipilih");
  }

  // Verify Mahasiswa exists
  const mhs = await prisma.mahasiswa.findUnique({
    where: { nim },
  });
  if (!mhs) {
    throw new Error("Mahasiswa tidak terdaftar resmi");
  }

  // Verify UKM exists
  const ukm = await prisma.uKM.findUnique({
    where: { id: ukmId },
  });
  if (!ukm) {
    throw new Error("UKM tidak ditemukan");
  }

  // Rule 7 check: 1 student 1 UKM
  const activeMember = await prisma.anggota.findUnique({
    where: { mahasiswaNim: nim },
  });
  if (activeMember) {
    throw new Error("Mahasiswa ini sudah tergabung sebagai anggota resmi di UKM lain!");
  }

  // Check if student already has a pending application
  const pendingRegistration = await prisma.pendaftaran.findFirst({
    where: {
      mahasiswaNim: nim,
      status: "Menunggu",
    },
  });
  if (pendingRegistration) {
    throw new Error("Mahasiswa memiliki pendaftaran aktif yang sedang menunggu persetujuan!");
  }

  const reg = await prisma.pendaftaran.create({
    data: {
      mahasiswaNim: nim,
      ukmId: ukmId,
      jabatan: jabatan,
      status: "Menunggu",
    },
    include: {
      mahasiswa: { select: { nama: true } },
      ukm: { select: { nama: true } },
    },
  });

  return {
    id: reg.id,
    nim: reg.mahasiswaNim,
    namaMahasiswa: reg.mahasiswa.nama,
    ukmId: reg.ukmId,
    namaUKM: reg.ukm.nama,
    jabatan: reg.jabatan,
    tanggalDaftar: reg.tanggalDaftar.toISOString().split("T")[0],
    status: reg.status,
  };
}

export async function processPendaftaran(id: string, action: "Approve" | "Reject") {
  if (!id || !action) {
    throw new Error("ID Pendaftaran dan Aksi wajib ditentukan");
  }

  const reg = await prisma.pendaftaran.findUnique({
    where: { id },
    include: { mahasiswa: true, ukm: true },
  });

  if (!reg) {
    throw new Error("Pendaftaran tidak ditemukan");
  }

  if (reg.status !== "Menunggu") {
    throw new Error("Pendaftaran ini sudah diproses");
  }

  if (action === "Reject") {
    const updated = await prisma.pendaftaran.update({
      where: { id },
      data: { status: "Ditolak" },
    });
    return {
      id: updated.id,
      status: updated.status,
    };
  }

  if (action === "Approve") {
    // Rule 7 double-check: 1 student 1 UKM
    const activeMember = await prisma.anggota.findUnique({
      where: { mahasiswaNim: reg.mahasiswaNim },
    });
    if (activeMember) {
      throw new Error("Mahasiswa ini sudah tergabung di UKM lain!");
    }

    // Execute transaction: update registration status + add to Anggota
    const result = await prisma.$transaction(async (tx: any) => {
      const updatedReg = await tx.pendaftaran.update({
        where: { id },
        data: { status: "Disetujui" },
      });

      const newMember = await tx.anggota.create({
        data: {
          mahasiswaNim: reg.mahasiswaNim,
          ukmId: reg.ukmId,
          jabatan: reg.jabatan,
          tanggalDaftar: reg.tanggalDaftar,
        },
      });

      return { updatedReg, newMember };
    });

    return {
      id: result.updatedReg.id,
      status: result.updatedReg.status,
      member: result.newMember,
    };
  }

  throw new Error("Aksi tidak valid");
}
