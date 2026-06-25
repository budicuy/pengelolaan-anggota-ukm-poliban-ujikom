import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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

    const mapped = list.map((p) => ({
      id: p.id,
      nim: p.mahasiswaNim,
      namaMahasiswa: p.mahasiswa.nama,
      ukmId: p.ukmId,
      namaUKM: p.ukm.nama,
      tanggalDaftar: p.tanggalDaftar.toISOString().split("T")[0],
      status: p.status,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data pendaftaran" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nim, ukmId } = await request.json();

    if (!nim || !ukmId) {
      return NextResponse.json({ error: "Mahasiswa dan UKM wajib dipilih" }, { status: 400 });
    }

    // Verify Mahasiswa exists
    const mhs = await prisma.mahasiswa.findUnique({
      where: { nim },
    });
    if (!mhs) {
      return NextResponse.json({ error: "Mahasiswa tidak terdaftar resmi" }, { status: 400 });
    }

    // Verify UKM exists
    const ukm = await prisma.uKM.findUnique({
      where: { id: ukmId },
    });
    if (!ukm) {
      return NextResponse.json({ error: "UKM tidak ditemukan" }, { status: 400 });
    }

    // Rule 7 check: 1 student 1 UKM
    // Check if student is already in Anggota (active member of any UKM)
    const activeMember = await prisma.anggota.findUnique({
      where: { mahasiswaNim: nim },
    });
    if (activeMember) {
      return NextResponse.json(
        { error: "Mahasiswa ini sudah tergabung sebagai anggota resmi di UKM lain!" },
        { status: 400 }
      );
    }

    // Check if student already has a pending application
    const pendingRegistration = await prisma.pendaftaran.findFirst({
      where: {
        mahasiswaNim: nim,
        status: "Menunggu",
      },
    });
    if (pendingRegistration) {
      return NextResponse.json(
        { error: "Mahasiswa memiliki pendaftaran aktif yang sedang menunggu persetujuan!" },
        { status: 400 }
      );
    }

    const reg = await prisma.pendaftaran.create({
      data: {
        mahasiswaNim: nim,
        ukmId: ukmId,
        status: "Menunggu",
      },
      include: {
        mahasiswa: { select: { nama: true } },
        ukm: { select: { nama: true } },
      },
    });

    return NextResponse.json({
      id: reg.id,
      nim: reg.mahasiswaNim,
      namaMahasiswa: reg.mahasiswa.nama,
      ukmId: reg.ukmId,
      namaUKM: reg.ukm.nama,
      tanggalDaftar: reg.tanggalDaftar.toISOString().split("T")[0],
      status: reg.status,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memproses pendaftaran anggota baru" }, { status: 500 });
  }
}

// Action: Approve or Reject
export async function PUT(request: Request) {
  try {
    const { id, action } = await request.json(); // action = "Approve" | "Reject"

    if (!id || !action) {
      return NextResponse.json({ error: "ID Pendaftaran dan Aksi wajib ditentukan" }, { status: 400 });
    }

    const reg = await prisma.pendaftaran.findUnique({
      where: { id },
      include: { mahasiswa: true, ukm: true },
    });

    if (!reg) {
      return NextResponse.json({ error: "Pendaftaran tidak ditemukan" }, { status: 404 });
    }

    if (reg.status !== "Menunggu") {
      return NextResponse.json({ error: "Pendaftaran ini sudah diproses" }, { status: 400 });
    }

    if (action === "Reject") {
      const updated = await prisma.pendaftaran.update({
        where: { id },
        data: { status: "Ditolak" },
      });
      return NextResponse.json({
        id: updated.id,
        status: updated.status,
      });
    }

    if (action === "Approve") {
      // Rule 7 double-check: 1 student 1 UKM
      const activeMember = await prisma.anggota.findUnique({
        where: { mahasiswaNim: reg.mahasiswaNim },
      });
      if (activeMember) {
        return NextResponse.json(
          { error: "Mahasiswa ini sudah tergabung di UKM lain!" },
          { status: 400 }
        );
      }

      // Execute transaction: update registration status + add to Anggota
      const result = await prisma.$transaction(async (tx) => {
        const updatedReg = await tx.pendaftaran.update({
          where: { id },
          data: { status: "Disetujui" },
        });

        const newMember = await tx.anggota.create({
          data: {
            mahasiswaNim: reg.mahasiswaNim,
            ukmId: reg.ukmId,
          },
        });

        return { updatedReg, newMember };
      });

      return NextResponse.json({
        id: result.updatedReg.id,
        status: result.updatedReg.status,
        member: result.newMember,
      });
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memproses persetujuan" }, { status: 500 });
  }
}
