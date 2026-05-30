"use client";

import { useState } from "react";

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
}

export default function ReportList({
  reports,
  onDelete,
}: {
  reports: SerializedReport[];
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this report?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (res.ok) onDelete(id);
    } finally {
      setDeleting(null);
    }
  }

  if (reports.length === 0) {
    return (
      <div
        className="rounded-3xl p-12 text-center"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div
          className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          No reports yet.
        </p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.25)" }}>
          Click &quot;Add Report&quot; to add your first student report.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["Student", "Mobile", "Class", "Scores (A/B/C/D)", "Date", ""].map(
                (h) => (
                  <th
                    key={h}
                    className={`text-left text-xs font-semibold uppercase tracking-widest px-6 py-4 ${h === "" ? "text-right" : ""}`}
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {reports.map((report, idx) => (
              <tr
                key={report.id}
                style={{
                  borderBottom:
                    idx < reports.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                }}
                className="transition-colors"
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.03)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "transparent")
                }
              >
                <td
                  className="px-6 py-4 text-sm font-medium"
                  style={{ color: "rgba(255,255,255,0.85)" }}
                >
                  {report.studentName}
                </td>
                <td
                  className="px-6 py-4 text-sm"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {report.mobile}
                </td>
                <td
                  className="px-6 py-4 text-sm"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {report.classSection}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <span style={{ color: "#3B82F6" }}>{report.scoreA}</span>
                  <span style={{ color: "rgba(255,255,255,0.2)" }}> / </span>
                  <span style={{ color: "#8B5CF6" }}>{report.scoreB}</span>
                  <span style={{ color: "rgba(255,255,255,0.2)" }}> / </span>
                  <span style={{ color: "#F59E0B" }}>{report.scoreC}</span>
                  <span style={{ color: "rgba(255,255,255,0.2)" }}> / </span>
                  <span style={{ color: "#10B981" }}>{report.scoreD}</span>
                </td>
                <td
                  className="px-6 py-4 text-sm"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  {new Date(report.dateOfAssessment).toLocaleDateString("en-IN")}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(report.id)}
                    disabled={deleting === report.id}
                    className="text-xs font-medium transition-colors disabled:opacity-40"
                    style={{ color: "rgba(248,113,113,0.7)" }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.color = "#f87171")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.color =
                        "rgba(248,113,113,0.7)")
                    }
                  >
                    {deleting === report.id ? "\u2026" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
