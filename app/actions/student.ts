"use server";

import { prisma } from "@/lib/prisma";
import {
  DATABASE_UNAVAILABLE_MESSAGE,
  isDatabaseConnectionError,
} from "@/lib/db-errors";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function studentLogin(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const mobile = (formData.get("mobile") as string)?.trim();

  if (!mobile) {
    return { error: "Please enter your mobile number." };
  }

  if (!/^\d{10}$/.test(mobile)) {
    return { error: "Please enter a valid 10-digit mobile number." };
  }

  let report;
  try {
    report = await prisma.report.findUnique({ where: { mobile } });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return { error: DATABASE_UNAVAILABLE_MESSAGE };
    }
    throw error;
  }

  if (!report) {
    return { error: "No report found for this mobile number. Please contact your counsellor." };
  }

  const cookieStore = await cookies();
  cookieStore.set("student_mobile", mobile, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 2, // 2 hours
    path: "/",
  });

  redirect("/student/report");
}

export async function studentLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("student_mobile");
  redirect("/");
}
