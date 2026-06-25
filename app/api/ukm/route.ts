import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const list = await prisma.uKM.findMany({
      include: {
        _count: {
          select: { anggota: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Map output to structure expected by client
    const mapped = list.map((u) => ({
      id: u.id,
      nama: u.nama,
      jumlahAnggota: u._count.anggota,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data UKM" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id, nama } = await request.json();

    if (!id || !nama) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.uKM.findUnique({ where: { id } });
    if (existing) {
      return NextResponse.json({ error: "Kode UKM sudah terdaftar" }, { status: 400 });
    }

    const ukm = await prisma.uKM.create({
      data: { id, nama },
    });

    return NextResponse.json({
      ...ukm,
      jumlahAnggota: 0,
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menambahkan UKM" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, nama } = await request.json();

    if (!id || !nama) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const updated = await prisma.uKM.update({
      where: { id },
      data: { nama },
    });

    // Get members count
    const count = await prisma.anggota.count({ where: { ukmId: id } });

    return NextResponse.json({
      ...updated,
      jumlahAnggota: count,
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbaharui data UKM" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Kode UKM wajib diberikan" }, { status: 400 });
    }

    await prisma.uKM.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data UKM" }, { status: 500 });
  }
}
