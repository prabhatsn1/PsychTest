"use client";

import { useActionState, useEffect, useState } from "react";
import { adminLogin } from "@/app/actions/admin";
import { checkDbConnection } from "@/app/actions/health";
import Link from "next/link";
import Image from "next/image";

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
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, #0a0a1a 0%, #0f0f2e 50%, #0a0a1a 100%)",
      }}
    >
      {/* Aurora blobs */}
      <div
        className="fixed pointer-events-none"
        style={{
          top: -180,
          right: -180,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "#2a275e",
          opacity: 0.18,
          filter: "blur(120px)",
          zIndex: 0,
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          bottom: -180,
          left: -180,
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "#5cabf6",
          opacity: 0.08,
          filter: "blur(120px)",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo + heading */}
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
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ color: "rgba(255,255,255,0.88)" }}
          >
            Admin Portal
          </h1>
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Sign in to manage student reports
          </p>
        </div>

        {/* Glass card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          <form action={formAction} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@school.com"
                className="w-full px-4 py-2.5 rounded-xl outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.88)",
                  caretColor: "#5cabf6",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.border =
                    "1px solid rgba(92,171,246,0.55)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.border =
                    "1px solid rgba(255,255,255,0.1)")
                }
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "rgba(255,255,255,0.38)" }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.88)",
                  caretColor: "#5cabf6",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.border =
                    "1px solid rgba(92,171,246,0.55)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.border =
                    "1px solid rgba(255,255,255,0.1)")
                }
              />
            </div>

            {state?.error && (
              <div
                className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171",
                }}
              >
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
              className="w-full py-2.5 px-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #5cabf6 0%, #3b82f6 100%)",
                color: "white",
              }}
            >
              {pending ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(92,171,246,0.9)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)")}
          >
            ← Student Login
          </Link>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                dbStatus === "checking"
                  ? "bg-yellow-400 animate-pulse"
                  : dbStatus === "connected"
                  ? "bg-green-400"
                  : dbStatus === "mock"
                  ? "bg-blue-400"
                  : "bg-red-400"
              }`}
            />
            <span>
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
