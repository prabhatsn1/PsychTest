import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import path from "path";

export const runtime = "nodejs";

interface ParsedData {
  studentName: string;
  mobile: string;
  classSection: string;
  dateOfAssessment: string;
  scoreA: number;
  scoreB: number;
  scoreC: number;
  scoreD: number;
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("pdf") as File | null;

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "No PDF file provided." }, { status: 400 });
  }

  if (file.type && !file.type.includes("pdf")) {
    return NextResponse.json({ error: "File must be a PDF." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractText(buffer);
    const data = parseText(text);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("PDF parse error:", error);
    return NextResponse.json(
      { error: "Could not parse the PDF. Please fill the form manually." },
      { status: 422 }
    );
  }
}

async function extractText(buffer: Buffer): Promise<string> {
  // pdfjs-dist v5 requires workerSrc to point to the actual worker file.
  // An empty string triggers "fake worker" mode which still needs a script path.
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs" as string);
  const workerPath = path.join(
    process.cwd(),
    "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"
  );
  pdfjsLib.GlobalWorkerOptions.workerSrc = `file://${workerPath}`;

  const pdfDoc = await pdfjsLib
    .getDocument({ data: new Uint8Array(buffer) })
    .promise;

  let fullText = "";

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);

    // First try: extract embedded text (works for digital/typed PDFs)
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: { str?: string }) => item.str ?? "")
      .join(" ");

    if (pageText.trim().length > 20) {
      fullText += pageText + "\n";
    } else {
      // Scanned page — render to image and run OCR
      fullText += await ocrPage(page);
    }
  }

  return fullText;
}

async function ocrPage(page: {
  getViewport: (opts: { scale: number }) => { width: number; height: number };
  render: (opts: {
    canvasContext: unknown;
    viewport: unknown;
    canvasFactory: unknown;
  }) => { promise: Promise<void> };
}): Promise<string> {
  const { createCanvas } = await import("canvas");
  const Tesseract = await import("tesseract.js");

  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext("2d");

  // pdfjs needs a NodeCanvasFactory to render without a browser
  const canvasFactory = {
    create(w: number, h: number) {
      const c = createCanvas(w, h);
      return { canvas: c, context: c.getContext("2d") };
    },
    reset(cc: { canvas: { width: number; height: number } }, w: number, h: number) {
      cc.canvas.width = w;
      cc.canvas.height = h;
    },
    destroy(cc: { canvas: { width: number; height: number } }) {
      cc.canvas.width = 0;
      cc.canvas.height = 0;
    },
  };

  await page.render({
    canvasContext: ctx as unknown,
    viewport,
    canvasFactory,
  }).promise;

  const imageData = canvas.toBuffer("image/png");
  const { data } = await Tesseract.recognize(imageData, "eng", {
    logger: () => {},
  });
  return data.text;
}

function parseText(text: string): ParsedData {
  const joined = text.replace(/\n+/g, " ").replace(/\s+/g, " ");

  // Student name — text after "name" label, up to the next field
  const nameMatch = joined.match(
    /(?:student\s*name|name)\s*[:\-]?\s*([A-Za-z][A-Za-z .]{1,38}?)(?:\s{2,}|\s*(?:mobile|phone|class|section|date))/i
  );
  const studentName = nameMatch ? nameMatch[1].trim() : "";

  // Mobile — 10 consecutive digits
  const mobileMatch =
    joined.match(/(?:mobile|phone|contact)\s*[:\-]?\s*(\d{10})/i) ||
    joined.match(/\b(\d{10})\b/);
  const mobile = mobileMatch ? mobileMatch[1] : "";

  // Class / Section
  const classMatch = joined.match(
    /(?:class\s*[\/\-]?\s*section|class|section)\s*[:\-]?\s*([A-Za-z0-9][\w\-\/ ]{0,9}?)(?:\s{2,}|\s*(?:date|name|mobile))/i
  );
  const classSection = classMatch ? classMatch[1].trim() : "";

  // Date of assessment
  const dateMatch =
    joined.match(
      /(?:date(?:\s*of\s*assessment)?)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i
    ) || joined.match(/(\d{4}-\d{2}-\d{2})/);

  let dateOfAssessment = "";
  if (dateMatch) {
    const raw = dateMatch[1];
    const parts = raw.split(/[\/\-\.]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD already
        dateOfAssessment = `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
      } else {
        // Assume DD/MM/YYYY or DD/MM/YY
        const year =
          parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        dateOfAssessment = `${year}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }
  }

  // Answers: look for "1. A", "1) A", "Q1. A", "1 A" patterns
  const answerMap: Record<number, string> = {};
  const answerRe = /\b(?:Q\.?\s*)?(\d{1,2})[.):\s]+([A-D])\b/gi;
  let m: RegExpExecArray | null;
  while ((m = answerRe.exec(text)) !== null) {
    const qNum = parseInt(m[1]);
    if (qNum >= 1 && qNum <= 10 && !(qNum in answerMap)) {
      answerMap[qNum] = m[2].toUpperCase();
    }
  }

  let scoreA = 0,
    scoreB = 0,
    scoreC = 0,
    scoreD = 0;
  for (const ans of Object.values(answerMap)) {
    if (ans === "A") scoreA++;
    else if (ans === "B") scoreB++;
    else if (ans === "C") scoreC++;
    else if (ans === "D") scoreD++;
  }

  return {
    studentName,
    mobile,
    classSection,
    dateOfAssessment,
    scoreA,
    scoreB,
    scoreC,
    scoreD,
  };
}
