import { NextResponse } from "next/server";
import { loginUser } from "@/actions/UserAction";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const result = await loginUser(email, password);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Login Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan internal server" },
      { status: error.message ? 400 : 500 }
    );
  }
}
