import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const list = await prisma.anggota.findMany({
      include: {
        mahasiswa: {
          select: { nama: true, jurusan: true },
        },
        ukm: {
          select: { nama: true },
        },
      },
      orderBy: { tanggalBergabung: "desc" },
    });

    const mapped = list.map((a) => ({
      nim: a.mahasiswaNim,
      namaMahasiswa: a.mahasiswa.nama,
      jurusan: a.mahasiswa.jurusan,
      ukmId: a.ukmId,
      namaUKM: a.ukm.nama,
      tanggalBergabung: a.tanggalBergabung.toISOString().split("T")[0],
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data anggota aktif" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nim = searchParams.get("nim");
    const ukmId = searchParams.get("ukmId");

    if (!nim || !ukmId) {
      return NextResponse.json({ error: "NIM dan Kode UKM wajib ditentukan" }, { status: 400 });
    }

    // Delete record in Anggota table
    await prisma.anggota.delete({
      where: {
        mahasiswaNim: nim,
      },
    });

    // Option: also update the corresponding Pendaftaran status to "Ditolak" or keep it "Disetujui"?
    // Usually, we just remove it from Anggota. Let's keep it clean.

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengeluarkan anggota dari UKM" }, { status: 500 });
  }
}
