"use server";
import { prisma } from "@/lib/prisma";

export async function loginUser(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email dan password wajib diisi");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.password !== password) {
    throw new Error("Email atau kata sandi salah");
  }

  return {
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
