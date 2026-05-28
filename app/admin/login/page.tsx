"use client";

import { useActionState, useEffect, useState } from "react";
import { adminLogin } from "@/app/actions/admin";
import { checkDbConnection } from "@/app/actions/health";
import Link from "next/link";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(adminLogin, null);
  const [dbStatus, setDbStatus] = useState<
    "checking" | "connected" | "mock" | "disconnected"
  >("checking");

  useEffect(() => {
    checkDbConnection().then((res) =>
      setDbStatus(
        res.mock ? "mock" : res.connected ? "connected" : "disconnected"
      )
    );
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 mb-4">
            <svg
              className="w-7 h-7 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Admin Portal
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage student reports
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                placeholder="admin@school.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                placeholder="••••••••"
              />
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
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            <Link href="/" className="hover:text-indigo-600 transition-colors">
              ← Back to Student Login
            </Link>
          </p>
          <div className="flex items-center gap-1.5 text-xs">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                dbStatus === "checking"
                  ? "bg-yellow-400 animate-pulse"
                  : dbStatus === "connected"
                  ? "bg-green-500"
                  : dbStatus === "mock"
                  ? "bg-blue-500"
                  : "bg-red-500"
              }`}
            />
            <span className="text-gray-400">
              {dbStatus === "checking"
                ? "Checking DB…"
                : dbStatus === "connected"
                ? "DB Connected"
                : dbStatus === "mock"
                ? "Mock DB"
                : "DB Disconnected"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
