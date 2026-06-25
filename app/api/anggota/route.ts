import { NextResponse } from "next/server";
import { getAnggotaList, deleteAnggota } from "@/actions/AnggotaAction";

export async function GET() {
  try {
    const list = await getAnggotaList();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengambil data anggota aktif" },
      { status: 500 }
    );
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

    await deleteAnggota(nim, ukmId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengeluarkan anggota dari UKM" },
      { status: 500 }
    );
  }
}
