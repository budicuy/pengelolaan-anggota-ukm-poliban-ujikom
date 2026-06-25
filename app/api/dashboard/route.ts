import { NextResponse } from "next/server";
import { getDashboardStats } from "@/actions/DashboardAction";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengambil data ringkasan" },
      { status: 500 }
    );
  }
}
