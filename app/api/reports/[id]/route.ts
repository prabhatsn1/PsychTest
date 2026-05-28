import { NextRequest, NextResponse } from "next/server";
import {
  DATABASE_UNAVAILABLE_MESSAGE,
  isDatabaseConnectionError,
} from "@/lib/db-errors";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Delete PDF file if exists
    if (report.pdfPath) {
      try {
        const filePath = path.join(process.cwd(), "public", report.pdfPath);
        await unlink(filePath);
      } catch {
        // File may not exist, continue
      }
    }

    await prisma.report.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return NextResponse.json(
        { error: DATABASE_UNAVAILABLE_MESSAGE },
        { status: 503 }
      );
    }
    throw error;
  }
}
