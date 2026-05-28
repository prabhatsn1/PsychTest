"use server";

import { prisma } from "@/lib/prisma";
import {
  DATABASE_UNAVAILABLE_MESSAGE,
  isDatabaseConnectionError,
} from "@/lib/db-errors";
import { createToken } from "@/lib/auth";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function adminLogin(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  let admin;
  try {
    admin = await prisma.admin.findUnique({ where: { email } });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return { error: DATABASE_UNAVAILABLE_MESSAGE };
    }
    throw error;
  }

  if (!admin) {
    return { error: "Invalid credentials." };
  }

  const valid = await compare(password, admin.password);
  if (!valid) {
    return { error: "Invalid credentials." };
  }

  const token = await createToken({ adminId: admin.id, email: admin.email });
  const cookieStore = await cookies();
  cookieStore.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });

  redirect("/admin/dashboard");
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  redirect("/admin/login");
}
