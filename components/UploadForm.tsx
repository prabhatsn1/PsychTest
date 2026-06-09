"use client";

import { useState, useRef } from "react";

interface SerializedReport {
  id: string;
  studentName: string;
  mobile: string;
  classSection: string;
  dateOfAssessment: string;
  scoreA: number;
  scoreB: number;
  scoreC: number;
  scoreD: number;
  pdfPath: string;
  createdAt: string;
  updatedAt: string;
  reportOpenedAt: string | null;
  reportOpenCount: number;
}

const emptyFields = {
  studentName: "",
  mobile: "",
  classSection: "",
  dateOfAssessment: "",
  scoreA: 0,
  scoreB: 0,
  scoreC: 0,
  scoreD: 0,
};

type Fields = typeof emptyFields;

// Reusable dark input style
const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.88)",
  caretColor: "#5cabf6",
};
const inputFocus = "1px solid rgba(92,171,246,0.55)";
const inputBlur = "1px solid rgba(255,255,255,0.1)";

export default function UploadForm({
  onSuccess,
}: {
  onSuccess: (report: SerializedReport) => void;
}) {
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<{
    type: "success" | "warn" | "error";
    message: string;
  } | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  function setField<K extends keyof Fields>(key: K, value: Fields[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function handleParsePDF() {
    const file = pdfInputRef.current?.files?.[0];
    if (!file) {
      setParseStatus({ type: "error", message: "Please select a PDF first." });
      return;
    }
    setParsing(true);
    setParseStatus(null);
    setError("");
    const fd = new FormData();
    fd.append("pdf", file);
    try {
      const res = await fetch("/api/parse-pdf", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setParseStatus({ type: "error", message: json.error || "Could not parse PDF." });
        return;
      }
      const d = json.data;
      setFields({
        studentName: d.studentName || "",
        mobile: d.mobile || "",
        classSection: d.classSection || "",
        dateOfAssessment: d.dateOfAssessment || "",
        scoreA: d.scoreA ?? 0,
        scoreB: d.scoreB ?? 0,
        scoreC: d.scoreC ?? 0,
        scoreD: d.scoreD ?? 0,
      });
      const total = (d.scoreA ?? 0) + (d.scoreB ?? 0) + (d.scoreC ?? 0) + (d.scoreD ?? 0);
      setParseStatus({
        type: total === 10 ? "success" : "warn",
        message:
          total === 10
            ? "PDF parsed — review the fields below before saving."
            : `Parsed with partial confidence (scores ${total}/10). Please review.`,
      });
    } catch {
      setParseStatus({ type: "error", message: "Failed to parse PDF. Fill the form manually." });
    } finally {
      setParsing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData();
    (Object.entries(fields) as [string, string | number][]).forEach(([k, v]) =>
      fd.append(k, String(v))
    );
    try {
      const res = await fetch("/api/reports", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed.");
        return;
      }
      setFields(emptyFields);
      if (pdfInputRef.current) pdfInputRef.current.value = "";
      setParseStatus(null);
      onSuccess(data.data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-3xl p-6 sm:p-8"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-6"
        style={{ color: "rgba(255,255,255,0.38)" }}
      >
        Add New Report
      </p>

      {/* PDF Auto-fill */}
      <div
        className="mb-7 rounded-2xl p-4"
        style={{
          background: "rgba(92,171,246,0.05)",
          border: "1px dashed rgba(92,171,246,0.25)",
        }}
      >
        <p className="text-sm font-medium mb-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>
          Auto-fill from scanned PDF
        </p>
        <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
          Upload the student&apos;s answer sheet — fields will be pre-filled automatically.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf"
            className="text-sm file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:cursor-pointer transition-all"
            style={{
              color: "rgba(255,255,255,0.5)",
            }}
          />
          <button
            type="button"
            onClick={handleParsePDF}
            disabled={parsing}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #5cabf6 0%, #3b82f6 100%)",
              color: "white",
            }}
          >
            {parsing ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Parsing&hellip;
              </>
            ) : (
              "Parse PDF"
            )}
          </button>
        </div>
        {parseStatus && (
          <p
            className="mt-2.5 text-xs font-medium"
            style={{
              color:
                parseStatus.type === "success"
                  ? "#4ade80"
                  : parseStatus.type === "warn"
                  ? "#fbbf24"
                  : "#f87171",
            }}
          >
            {parseStatus.message}
          </p>
        )}
      </div>

      {/* Manual form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(
            [
              { key: "studentName", label: "Student Name", placeholder: "Enter full name", type: "text" },
              { key: "mobile", label: "Mobile Number", placeholder: "10-digit number", type: "text" },
              { key: "classSection", label: "Class / Section", placeholder: "e.g. 10-A", type: "text" },
              { key: "dateOfAssessment", label: "Date of Assessment", placeholder: "", type: "date" },
            ] as { key: keyof Fields; label: string; placeholder: string; type: string }[]
          ).map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                {label}
              </label>
              <input
                name={key}
                type={type}
                required
                {...(key === "mobile" ? { pattern: "\\d{10}", maxLength: 10 } : {})}
                value={fields[key] as string}
                onChange={(e) => setField(key, e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl outline-none transition-all"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.border = inputFocus)}
                onBlur={(e) => (e.currentTarget.style.border = inputBlur)}
              />
            </div>
          ))}
        </div>

        {/* Scores */}
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            Response Scores{" "}
            <span style={{ color: "rgba(255,255,255,0.25)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
              (must add up to 10)
            </span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(
              [
                { key: "scoreA", label: "A — Analytical", color: "#3B82F6" },
                { key: "scoreB", label: "B — Reflective", color: "#8B5CF6" },
                { key: "scoreC", label: "C — Creative", color: "#F59E0B" },
                { key: "scoreD", label: "D — Leader", color: "#10B981" },
              ] as { key: keyof Fields; label: string; color: string }[]
            ).map(({ key, label, color }) => (
              <div key={key}>
                <label
                  className="block text-xs mb-1.5 font-medium"
                  style={{ color }}
                >
                  {label}
                </label>
                <input
                  name={key}
                  type="number"
                  min={0}
                  max={10}
                  required
                  value={fields[key] as number}
                  onChange={(e) => setField(key, parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg text-center outline-none transition-all"
                  style={{ ...inputStyle, borderColor: `${color}40` }}
                  onFocus={(e) => (e.currentTarget.style.border = `1px solid ${color}99`)}
                  onBlur={(e) => (e.currentTarget.style.border = `1px solid ${color}40`)}
                />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div
            className="text-sm px-4 py-2.5 rounded-xl"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "#f87171",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #5cabf6 0%, #3b82f6 100%)",
            color: "white",
          }}
        >
          {loading ? "Saving\u2026" : "Save Report"}
        </button>
      </form>
    </div>
  );
}
