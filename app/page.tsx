"use client";

import { useActionState } from "react";
import { studentLogin } from "@/app/actions/student";
import Link from "next/link";
import Image from "next/image";

export default function StudentLoginPage() {
  const [state, formAction, pending] = useActionState(studentLogin, null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-5">
            <Image
              src="/BigLeagueLogo.png"
              alt="Big League Logo"
              width={160}
              height={54}
              priority
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            PsychProfile
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-xs mx-auto">
            Discover your unique strengths and find the right career path for you
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-base font-medium text-gray-900 mb-1">
            View Your Report
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter the mobile number linked to your assessment
          </p>

          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="mobile"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  +91
                </span>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  maxLength={10}
                  pattern="\d{10}"
                  autoComplete="tel"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-300/20 focus:border-accent-300 transition-all"
                  placeholder="Enter 10-digit number"
                />
              </div>
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-xl">
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-accent-300/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {pending ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Looking up…
                </span>
              ) : (
                "View My Report"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Your report was prepared by a certified counsellor.
          </p>
          <Link
            href="/admin/login"
            className="inline-block mt-3 text-xs text-gray-400 hover:text-brand-600 transition-colors"
          >
            Admin Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
