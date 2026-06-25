import { NextResponse } from "next/server";
import {
  getUkmList,
  createUkm,
  updateUkm,
  deleteUkm,
} from "@/actions/UkmAction";

export async function GET() {
  try {
    const list = await getUkmList();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengambil data UKM" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { id, nama } = await request.json();
    const ukm = await createUkm(id, nama);
    return NextResponse.json(ukm);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal menambahkan UKM" },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, nama } = await request.json();
    const updated = await updateUkm(id, nama);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal memperbaharui data UKM" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Kode UKM wajib diberikan" }, { status: 400 });
    }

    await deleteUkm(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal menghapus data UKM" },
      { status: 500 }
    );
  }
}
