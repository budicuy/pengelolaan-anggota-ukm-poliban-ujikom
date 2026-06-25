import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const list = await prisma.mahasiswa.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data mahasiswa" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nim, nama, jurusan } = await request.json();

    if (!nim || !nama || !jurusan) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const existingNim = await prisma.mahasiswa.findUnique({ where: { nim } });
    if (existingNim) {
      return NextResponse.json({ error: "NIM sudah terdaftar" }, { status: 400 });
    }

    const mhs = await prisma.mahasiswa.create({
      data: { nim, nama, jurusan },
    });

    return NextResponse.json(mhs);
  } catch (error) {
    return NextResponse.json({ error: "Gagal menambahkan mahasiswa" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { nim, nama, jurusan } = await request.json();

    if (!nim || !nama || !jurusan) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const updated = await prisma.mahasiswa.update({
      where: { nim },
      data: { nama, jurusan },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbaharui data mahasiswa" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nim = searchParams.get("nim");

    if (!nim) {
      return NextResponse.json({ error: "NIM wajib diberikan" }, { status: 400 });
    }

    await prisma.mahasiswa.delete({
      where: { nim },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus data mahasiswa" }, { status: 500 });
  }
}
