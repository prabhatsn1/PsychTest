"use client";

import { useState } from "react";
import { adminLogout } from "@/app/actions/admin";
import UploadForm from "@/components/UploadForm";
import ExcelImportForm from "@/components/ExcelImportForm";
import ReportList from "@/components/ReportList";
import Image from "next/image";

const dashboardDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

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
}

type ActivePanel = "none" | "single" | "excel";

export default function AdminDashboardClient({
  initialReports,
}: {
  initialReports: SerializedReport[];
}) {
  const [reports, setReports] = useState(initialReports);
  const [activePanel, setActivePanel] = useState<ActivePanel>("none");

  const handleUploaded = (newReport: SerializedReport) => {
    setReports((prev) => [newReport, ...prev]);
    setActivePanel("none");
  };

  const handleDeleted = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  async function handleExcelImported() {
    // Refresh the report list after a bulk import
    try {
      const res = await fetch("/api/reports");
      const json = await res.json();
      if (res.ok && Array.isArray(json.data)) {
        setReports(json.data as SerializedReport[]);
      }
    } catch {
      // non-critical; list will refresh on next hard load
    }
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        background:
          "linear-gradient(135deg, #0a0a1a 0%, #0f0f2e 50%, #0a0a1a 100%)",
      }}
    >
      {/* Aurora blobs */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: -200,
          right: -200,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "#2a275e",
          opacity: 0.15,
          filter: "blur(120px)",
          zIndex: 0,
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: -200,
          left: -200,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "#5cabf6",
          opacity: 0.08,
          filter: "blur(120px)",
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background: "rgba(0,0,0,0.25)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/BigLeagueLogo.png" alt="Big League Logo" width={90} height={30} />
            <span
              className="text-lg font-semibold tracking-wide"
              style={{ color: "rgba(255,255,255,0.88)" }}
            >
              Admin Dashboard
            </span>
          </div>
          <form action={adminLogout}>
            <button
              type="submit"
              className="text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.4)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.88)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)")}
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Reports", value: String(reports.length) },
            {
              label: "Latest Entry",
              value:
                reports.length > 0
                  ? dashboardDateFormatter.format(new Date(reports[0].createdAt))
                  : "\u2014",
            },
            {
              label: "Last Modified",
              value:
                reports.length > 0
                  ? dashboardDateFormatter.format(new Date(reports[0].updatedAt))
                  : "\u2014",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-2xl p-5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                {label}
              </p>
              <p
                className="text-2xl font-semibold tabular-nums"
                style={{ color: "rgba(255,255,255,0.88)" }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.38)" }}
          >
            Student Reports
          </p>
          <div className="flex items-center gap-2">
            {/* Import from Excel */}
            <button
              onClick={() => setActivePanel(activePanel === "excel" ? "none" : "excel")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activePanel === "excel"
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(34,197,94,0.15)",
                color: activePanel === "excel" ? "rgba(255,255,255,0.7)" : "#4ade80",
                border: activePanel === "excel"
                  ? "1px solid rgba(255,255,255,0.12)"
                  : "1px solid rgba(34,197,94,0.25)",
              }}
            >
              {activePanel === "excel" ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Import Excel
                </>
              )}
            </button>

            {/* Add single report */}
            <button
              onClick={() => setActivePanel(activePanel === "single" ? "none" : "single")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activePanel === "single"
                  ? "rgba(255,255,255,0.08)"
                  : "linear-gradient(135deg, #5cabf6 0%, #3b82f6 100%)",
                color: "white",
                border: activePanel === "single" ? "1px solid rgba(255,255,255,0.12)" : "none",
              }}
            >
              {activePanel === "single" ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Panels */}
        {activePanel === "single" && (
          <div className="mb-8">
            <UploadForm onSuccess={handleUploaded} />
          </div>
        )}
        {activePanel === "excel" && (
          <div className="mb-8">
            <ExcelImportForm onImported={handleExcelImported} />
          </div>
        )}
        </div>

        {/* Report List */}
        <ReportList reports={reports} onDelete={handleDeleted} />
      </main>
    </div>
  );
}
