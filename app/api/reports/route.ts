import { NextRequest, NextResponse } from "next/server";
import {
  DATABASE_UNAVAILABLE_MESSAGE,
  isDatabaseConnectionError,
} from "@/lib/db-errors";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const studentName = formData.get("studentName") as string;
  const mobile = formData.get("mobile") as string;
  const classSection = formData.get("classSection") as string;
  const dateOfAssessment = formData.get("dateOfAssessment") as string;
  const scoreA = parseInt(formData.get("scoreA") as string) || 0;
  const scoreB = parseInt(formData.get("scoreB") as string) || 0;
  const scoreC = parseInt(formData.get("scoreC") as string) || 0;
  const scoreD = parseInt(formData.get("scoreD") as string) || 0;

  if (!studentName || !mobile || !classSection || !dateOfAssessment) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  if (!/^\d{10}$/.test(mobile)) {
    return NextResponse.json(
      { error: "Mobile must be a 10-digit number." },
      { status: 400 }
    );
  }

  const totalScore = scoreA + scoreB + scoreC + scoreD;
  if (totalScore !== 10) {
    return NextResponse.json(
      { error: "Scores must add up to 10 (total questions)." },
      { status: 400 }
    );
  }

  try {
    // Check duplicate mobile
    const existing = await prisma.report.findUnique({ where: { mobile } });
    if (existing) {
      return NextResponse.json(
        { error: "A report for this mobile number already exists." },
        { status: 409 }
      );
    }

    const report = await prisma.report.create({
      data: {
        studentName,
        mobile,
        classSection,
        dateOfAssessment: new Date(dateOfAssessment),
        scoreA,
        scoreB,
        scoreC,
        scoreD,
        pdfPath: "",
      },
    });

    return NextResponse.json({ success: true, data: report });
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

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        studentName: true,
        mobile: true,
        classSection: true,
        dateOfAssessment: true,
        scoreA: true,
        scoreB: true,
        scoreC: true,
        scoreD: true,
        pdfPath: true,
        createdAt: true,
        updatedAt: true,
        reportOpenedAt: true,
        reportOpenCount: true,
      },
    });

    return NextResponse.json({ success: true, data: reports });
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
