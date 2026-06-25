import { NextResponse } from "next/server";
import {
  getPendaftaranList,
  createPendaftaran,
  processPendaftaran,
} from "@/actions/PendaftaranAction";

export async function GET() {
  try {
    const list = await getPendaftaranList();
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mengambil data pendaftaran" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { nim, ukmId } = await request.json();
    const result = await createPendaftaran(nim, ukmId);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal memproses pendaftaran anggota baru" },
      { status: 400 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, action } = await request.json(); // action = "Approve" | "Reject"
    const result = await processPendaftaran(id, action);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal memproses persetujuan" },
      { status: 400 }
    );
  }
}
