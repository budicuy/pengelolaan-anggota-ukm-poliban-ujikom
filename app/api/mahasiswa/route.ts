import { NextResponse } from "next/server";
import {
  getMahasiswaList,
  createMahasiswa,
  updateMahasiswa,
  deleteMahasiswa,
} from "@/actions/MahasiswaAction";

export async function GET() {
  try {
    const list = await getMahasiswaList();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengambil data mahasiswa" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { nim, nama, jurusan } = await request.json();
    const mhs = await createMahasiswa(nim, nama, jurusan);
    return NextResponse.json(mhs);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal menambahkan mahasiswa" },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { nim, nama, jurusan } = await request.json();
    const updated = await updateMahasiswa(nim, nama, jurusan);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal memperbaharui data mahasiswa" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const nim = searchParams.get("nim");

    if (!nim) {
      return NextResponse.json({ error: "NIM wajib diberikan" }, { status: 400 });
    }

    await deleteMahasiswa(nim);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal menghapus data mahasiswa" },
      { status: 500 }
    );
  }
}
