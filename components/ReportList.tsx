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
      if (res.ok) {
        onDelete(id);
      }
    } finally {
      setDeleting(null);
    }
  }

  if (reports.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 mb-4">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <p className="text-gray-500">No reports uploaded yet.</p>
        <p className="text-sm text-gray-400 mt-1">
          Click &quot;Upload Report&quot; to add your first student report.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                Student
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                Mobile
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                Class
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                Scores (A/B/C/D)
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                Date
              </th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {reports.map((report) => (
              <tr
                key={report.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {report.studentName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {report.mobile}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {report.classSection}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <span className="text-blue-600">{report.scoreA}</span> /{" "}
                  <span className="text-purple-600">{report.scoreB}</span> /{" "}
                  <span className="text-amber-600">{report.scoreC}</span> /{" "}
                  <span className="text-emerald-600">{report.scoreD}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(report.dateOfAssessment).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {report.pdfPath && (
                      <a
                        href={report.pdfPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        PDF
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(report.id)}
                      disabled={deleting === report.id}
                      className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                    >
                      {deleting === report.id ? "…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
