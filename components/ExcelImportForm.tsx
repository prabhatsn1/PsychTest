"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";

interface ParsedRow {
  row: number;
  studentName: string;
  mobile: string;
  classSection: string;
  dateOfAssessment: string;
  scoreA: number;
  scoreB: number;
  scoreC: number;
  scoreD: number;
  valid: boolean;
  error?: string;
}

interface ImportResult {
  row: number;
  studentName: string;
  mobile: string;
  status: "created" | "skipped" | "error";
  reason?: string;
}

interface ImportSummary {
  created: number;
  skipped: number;
  errors: number;
}

// Required columns (case-insensitive match)
const REQUIRED_COLUMNS = [
  "studentName",
  "mobile",
  "classSection",
  "dateOfAssessment",
  "scoreA",
  "scoreB",
  "scoreC",
  "scoreD",
] as const;

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.88)",
};

/** Normalise an Excel date serial or plain string to YYYY-MM-DD */
function normaliseDate(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  // Excel numeric date serial
  if (typeof value === "number") {
    const jsDate = XLSX.SSF.parse_date_code(value);
    if (!jsDate) return String(value);
    const y = jsDate.y;
    const m = String(jsDate.m).padStart(2, "0");
    const d = String(jsDate.d).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  // Already a string – try to parse & normalise
  const str = String(value).trim();
  // Common DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const mon = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3].length === 2 ? `20${dmyMatch[3]}` : dmyMatch[3];
    return `${year}-${mon}-${day}`;
  }
  return str;
}

function validateRow(raw: Record<string, unknown>, rowNum: number): ParsedRow {
  // Case-insensitive column lookup helper
  const get = (key: string): unknown => {
    const lower = key.toLowerCase();
    const found = Object.keys(raw).find((k) => k.toLowerCase() === lower);
    return found !== undefined ? raw[found] : undefined;
  };

  const studentName = String(get("studentName") ?? "").trim();
  const mobile = String(get("mobile") ?? "").trim();
  const classSection = String(get("classSection") ?? "").trim();
  const dateOfAssessment = normaliseDate(get("dateOfAssessment"));
  const scoreA = Number(get("scoreA")) || 0;
  const scoreB = Number(get("scoreB")) || 0;
  const scoreC = Number(get("scoreC")) || 0;
  const scoreD = Number(get("scoreD")) || 0;

  let error: string | undefined;
  if (!studentName) error = "studentName is empty";
  else if (!/^\d{10}$/.test(mobile)) error = "mobile must be 10 digits";
  else if (!classSection) error = "classSection is empty";
  else if (!dateOfAssessment || isNaN(new Date(dateOfAssessment).getTime())) error = "invalid date";
  else if (scoreA + scoreB + scoreC + scoreD !== 10) error = `scores sum to ${scoreA + scoreB + scoreC + scoreD}, must be 10`;

  return {
    row: rowNum,
    studentName,
    mobile,
    classSection,
    dateOfAssessment,
    scoreA,
    scoreB,
    scoreC,
    scoreD,
    valid: !error,
    error,
  };
}

export default function ExcelImportForm({
  onImported,
}: {
  onImported: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [parseError, setParseError] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setParsedRows([]);
    setParseError("");
    setResults(null);
    setSummary(null);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: false });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: "",
        });

        if (jsonRows.length === 0) {
          setParseError("The sheet appears to be empty.");
          return;
        }

        // Check for required columns (case-insensitive)
        const headers = Object.keys(jsonRows[0]).map((k) => k.toLowerCase());
        const missing = REQUIRED_COLUMNS.filter(
          (col) => !headers.includes(col.toLowerCase())
        );
        if (missing.length > 0) {
          setParseError(`Missing column(s): ${missing.join(", ")}`);
          return;
        }

        const validated = jsonRows.map((raw, i) => validateRow(raw, i + 2));
        setParsedRows(validated);
      } catch {
        setParseError("Could not read the file. Make sure it is a valid .xlsx or .csv file.");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  async function handleImport() {
    const validRows = parsedRows.filter((r) => r.valid);
    if (validRows.length === 0) return;

    setImporting(true);
    setResults(null);
    setSummary(null);
    try {
      const payload = validRows.map(({ studentName, mobile, classSection, dateOfAssessment, scoreA, scoreB, scoreC, scoreD }) => ({
        studentName,
        mobile,
        classSection,
        dateOfAssessment,
        scoreA,
        scoreB,
        scoreC,
        scoreD,
      }));

      const res = await fetch("/api/reports/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setParseError(json.error || "Import failed.");
        return;
      }
      setResults(json.results as ImportResult[]);
      setSummary(json.summary as ImportSummary);
      if (json.summary.created > 0) onImported();
    } catch {
      setParseError("Network error. Please try again.");
    } finally {
      setImporting(false);
    }
  }

  function handleReset() {
    setParsedRows([]);
    setParseError("");
    setResults(null);
    setSummary(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const validCount = parsedRows.filter((r) => r.valid).length;
  const invalidCount = parsedRows.filter((r) => !r.valid).length;

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <h3
        className="text-base font-semibold mb-1"
        style={{ color: "rgba(255,255,255,0.88)" }}
      >
        Import from Excel / CSV
      </h3>
      <p className="text-xs mb-5" style={{ color: "rgba(255,255,255,0.38)" }}>
        Upload a <strong style={{ color: "rgba(255,255,255,0.55)" }}>.xlsx</strong> or{" "}
        <strong style={{ color: "rgba(255,255,255,0.55)" }}>.csv</strong> file with the columns below. Scores A+B+C+D must total 10.
      </p>

      {/* Column guide */}
      <div
        className="rounded-xl p-4 mb-5 overflow-x-auto"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>
          Required columns
        </p>
        <table className="w-full text-xs border-collapse min-w-[520px]">
          <thead>
            <tr style={{ color: "rgba(255,255,255,0.4)" }}>
              {["Column name", "Type", "Example", "Notes"].map((h) => (
                <th key={h} className="text-left py-1 pr-4 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ color: "rgba(255,255,255,0.7)" }}>
            {[
              ["studentName", "Text", "Riya Sharma", "Full name of the student"],
              ["mobile", "Number / Text", "9876543210", "10-digit mobile, no spaces"],
              ["classSection", "Text", "10-A", "Class + section"],
              ["dateOfAssessment", "Date", "2024-06-15", "YYYY-MM-DD or DD/MM/YYYY"],
              ["scoreA", "Number", "3", "Integer; A+B+C+D must equal 10"],
              ["scoreB", "Number", "4", "Integer"],
              ["scoreC", "Number", "2", "Integer"],
              ["scoreD", "Number", "1", "Integer"],
            ].map(([col, type, ex, note]) => (
              <tr key={col} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <td className="py-1 pr-4 font-mono" style={{ color: "#5cabf6" }}>{col}</td>
                <td className="py-1 pr-4">{type}</td>
                <td className="py-1 pr-4">{ex}</td>
                <td className="py-1" style={{ color: "rgba(255,255,255,0.4)" }}>{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* File input */}
      {!summary && (
        <div className="flex items-center gap-3 mb-4">
          <label
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-all"
            style={{
              background: "linear-gradient(135deg, #5cabf6 0%, #3b82f6 100%)",
              color: "white",
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Choose file
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {fileRef.current?.files?.[0] && (
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              {fileRef.current.files[0].name}
            </span>
          )}
        </div>
      )}

      {/* Parse error */}
      {parseError && (
        <p className="text-xs mb-4 rounded-xl px-4 py-2" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
          {parseError}
        </p>
      )}

      {/* Preview table */}
      {parsedRows.length > 0 && !summary && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs rounded-full px-3 py-1" style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>
              {validCount} valid
            </span>
            {invalidCount > 0 && (
              <span className="text-xs rounded-full px-3 py-1" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                {invalidCount} error{invalidCount > 1 ? "s" : ""}
              </span>
            )}
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              {parsedRows.length} row{parsedRows.length > 1 ? "s" : ""} detected
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl mb-4" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <table className="w-full text-xs min-w-[640px]">
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}>
                  {["#", "Name", "Mobile", "Class", "Date", "A", "B", "C", "D", "Status"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedRows.map((r) => (
                  <tr key={r.row} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", color: r.valid ? "rgba(255,255,255,0.75)" : "#f87171" }}>
                    <td className="py-2 px-3">{r.row}</td>
                    <td className="py-2 px-3">{r.studentName || "—"}</td>
                    <td className="py-2 px-3">{r.mobile || "—"}</td>
                    <td className="py-2 px-3">{r.classSection || "—"}</td>
                    <td className="py-2 px-3">{r.dateOfAssessment || "—"}</td>
                    <td className="py-2 px-3">{r.scoreA}</td>
                    <td className="py-2 px-3">{r.scoreB}</td>
                    <td className="py-2 px-3">{r.scoreC}</td>
                    <td className="py-2 px-3">{r.scoreD}</td>
                    <td className="py-2 px-3">
                      {r.valid ? (
                        <span style={{ color: "#4ade80" }}>✓ OK</span>
                      ) : (
                        <span title={r.error}>⚠ {r.error}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleImport}
              disabled={importing || validCount === 0}
              className="px-5 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #5cabf6 0%, #3b82f6 100%)", color: "white" }}
            >
              {importing ? "Importing…" : `Import ${validCount} valid row${validCount !== 1 ? "s" : ""}`}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-sm transition-all"
              style={{ ...inputStyle, border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Clear
            </button>
          </div>
        </>
      )}

      {/* Results */}
      {summary && results && (
        <>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-xs rounded-full px-3 py-1" style={{ background: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>
              {summary.created} created
            </span>
            {summary.skipped > 0 && (
              <span className="text-xs rounded-full px-3 py-1" style={{ background: "rgba(234,179,8,0.1)", color: "#facc15", border: "1px solid rgba(234,179,8,0.2)" }}>
                {summary.skipped} skipped (duplicate)
              </span>
            )}
            {summary.errors > 0 && (
              <span className="text-xs rounded-full px-3 py-1" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                {summary.errors} error{summary.errors > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {(summary.skipped > 0 || summary.errors > 0) && (
            <div className="overflow-x-auto rounded-xl mb-4" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <table className="w-full text-xs min-w-[480px]">
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)" }}>
                    {["Row", "Name", "Mobile", "Status", "Reason"].map((h) => (
                      <th key={h} className="text-left py-2 px-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results
                    .filter((r) => r.status !== "created")
                    .map((r) => (
                      <tr key={r.row} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", color: r.status === "skipped" ? "#facc15" : "#f87171" }}>
                        <td className="py-2 px-3">{r.row}</td>
                        <td className="py-2 px-3">{r.studentName}</td>
                        <td className="py-2 px-3">{r.mobile}</td>
                        <td className="py-2 px-3 capitalize">{r.status}</td>
                        <td className="py-2 px-3">{r.reason ?? "—"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl text-sm transition-all"
            style={{ ...inputStyle, border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Import another file
          </button>
        </>
      )}
    </div>
  );
}
