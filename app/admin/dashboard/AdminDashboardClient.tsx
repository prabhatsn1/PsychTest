"use client";

import { useState } from "react";
import { adminLogout } from "@/app/actions/admin";
import UploadForm from "@/components/UploadForm";
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

export default function AdminDashboardClient({
  initialReports,
}: {
  initialReports: SerializedReport[];
}) {
  const [reports, setReports] = useState(initialReports);
  const [showUpload, setShowUpload] = useState(false);

  const handleUploaded = (newReport: SerializedReport) => {
    setReports((prev) => [newReport, ...prev]);
    setShowUpload(false);
  };

  const handleDeleted = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/BigLeagueLogo.png"
              alt="Big League Logo"
              width={90}
              height={30}
            />
            <h1 className="text-lg font-semibold text-gray-900">
              Admin Dashboard
            </h1>
          </div>
          <form action={adminLogout}>
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Total Reports</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {reports.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500">With PDF</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {reports.filter((r) => r.pdfPath).length}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm text-gray-500">Latest Upload</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">
              {reports.length > 0
                ? dashboardDateFormatter.format(new Date(reports[0].createdAt))
                : "—"}
            </p>
          </div>
        </div>

        {/* Upload Toggle */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Student Reports
          </h2>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-all"
          >
            {showUpload ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Upload Report
              </>
            )}
          </button>
        </div>

        {/* Upload Form */}
        {showUpload && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <UploadForm onSuccess={handleUploaded} />
          </div>
        )}

        {/* Report List */}
        <ReportList reports={reports} onDelete={handleDeleted} />
      </main>
    </div>
  );
}
