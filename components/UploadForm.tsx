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
}

export default function UploadForm({
  onSuccess,
}: {
  onSuccess: (report: SerializedReport) => void;
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed.");
        setLoading(false);
        return;
      }

      formRef.current?.reset();
      onSuccess(data.data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-base font-medium text-gray-900 mb-5">
        Upload New Report
      </h3>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Student Name
            </label>
            <input
              name="studentName"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mobile Number
            </label>
            <input
              name="mobile"
              required
              pattern="\d{10}"
              maxLength={10}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              placeholder="10-digit number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Class / Section
            </label>
            <input
              name="classSection"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              placeholder="e.g. 10-A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Date of Assessment
            </label>
            <input
              name="dateOfAssessment"
              type="date"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        {/* Scores */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">
            Response Scores{" "}
            <span className="text-gray-400 font-normal">
              (must add up to 10)
            </span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: "scoreA", label: "A — Analytical", color: "blue" },
              { key: "scoreB", label: "B — Reflective", color: "purple" },
              { key: "scoreC", label: "C — Creative", color: "amber" },
              { key: "scoreD", label: "D — Leader", color: "emerald" },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-gray-500 mb-1">
                  {label}
                </label>
                <input
                  name={key}
                  type="number"
                  min={0}
                  max={10}
                  defaultValue={0}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Scanned PDF Report
          </label>
          <input
            name="pdf"
            type="file"
            accept=".pdf"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Uploading…" : "Upload Report"}
        </button>
      </form>
    </div>
  );
}
