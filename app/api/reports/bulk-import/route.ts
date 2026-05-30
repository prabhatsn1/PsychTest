import { NextRequest, NextResponse } from "next/server";
import {
  DATABASE_UNAVAILABLE_MESSAGE,
  isDatabaseConnectionError,
} from "@/lib/db-errors";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

interface RowPayload {
  studentName: string;
  mobile: string;
  classSection: string;
  dateOfAssessment: string;
  scoreA: number;
  scoreB: number;
  scoreC: number;
  scoreD: number;
}

interface RowResult {
  row: number;
  studentName: string;
  mobile: string;
  status: "created" | "skipped" | "error";
  reason?: string;
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let rows: RowPayload[];
  try {
    const body = await request.json();
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { error: "Request body must be a non-empty array of rows." },
        { status: 400 }
      );
    }
    rows = body as RowPayload[];
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (rows.length > 500) {
    return NextResponse.json(
      { error: "Maximum 500 rows per import." },
      { status: 400 }
    );
  }

  const results: RowResult[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 because row 1 is the header in the spreadsheet

    const { studentName, mobile, classSection, dateOfAssessment, scoreA, scoreB, scoreC, scoreD } = row;

    // --- Validation ---
    if (!studentName?.trim()) {
      results.push({ row: rowNum, studentName: studentName ?? "", mobile: mobile ?? "", status: "error", reason: "studentName is required." });
      continue;
    }
    if (!mobile || !/^\d{10}$/.test(String(mobile).trim())) {
      results.push({ row: rowNum, studentName, mobile: mobile ?? "", status: "error", reason: "mobile must be a 10-digit number." });
      continue;
    }
    if (!classSection?.trim()) {
      results.push({ row: rowNum, studentName, mobile, status: "error", reason: "classSection is required." });
      continue;
    }
    if (!dateOfAssessment) {
      results.push({ row: rowNum, studentName, mobile, status: "error", reason: "dateOfAssessment is required." });
      continue;
    }
    const parsedDate = new Date(dateOfAssessment);
    if (isNaN(parsedDate.getTime())) {
      results.push({ row: rowNum, studentName, mobile, status: "error", reason: `dateOfAssessment "${dateOfAssessment}" is not a valid date.` });
      continue;
    }
    const sa = Number(scoreA) || 0;
    const sb = Number(scoreB) || 0;
    const sc = Number(scoreC) || 0;
    const sd = Number(scoreD) || 0;
    if (sa + sb + sc + sd !== 10) {
      results.push({ row: rowNum, studentName, mobile, status: "error", reason: `Scores must add up to 10 (got ${sa + sb + sc + sd}).` });
      continue;
    }

    // --- DB upsert ---
    try {
      const existing = await prisma.report.findUnique({ where: { mobile: String(mobile).trim() } });
      if (existing) {
        results.push({ row: rowNum, studentName, mobile, status: "skipped", reason: "A report for this mobile number already exists." });
        continue;
      }

      await prisma.report.create({
        data: {
          studentName: studentName.trim(),
          mobile: String(mobile).trim(),
          classSection: classSection.trim(),
          dateOfAssessment: parsedDate,
          scoreA: sa,
          scoreB: sb,
          scoreC: sc,
          scoreD: sd,
          pdfPath: "",
        },
      });

      results.push({ row: rowNum, studentName, mobile, status: "created" });
    } catch (error) {
      if (isDatabaseConnectionError(error)) {
        return NextResponse.json({ error: DATABASE_UNAVAILABLE_MESSAGE }, { status: 503 });
      }
      results.push({ row: rowNum, studentName, mobile, status: "error", reason: "Database error." });
    }
  }

  const created = results.filter((r) => r.status === "created").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const errors = results.filter((r) => r.status === "error").length;

  return NextResponse.json({ success: true, summary: { created, skipped, errors }, results });
}
