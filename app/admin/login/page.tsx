"use client";

import { useActionState, useEffect, useState } from "react";
import { adminLogin } from "@/app/actions/admin";
import { checkDbConnection } from "@/app/actions/health";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

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
      <motion.div
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
        animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
        transition={{ duration: 8 }}
      />
      <motion.div
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
        animate={{ x: [0, -20, 0], y: [0, -20, 0] }}
        transition={{ duration: 10 }}
      />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo + heading */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.div
            className="inline-flex items-center justify-center mb-5"
            whileHover={{ scale: 1.05 }}
          >
            <Image
              src="/BigLeagueLogo.png"
              alt="Big League Logo"
              width={160}
              height={54}
              priority
            />
          </motion.div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            Admin Portal
          </h1>
          <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Sign in to manage student reports
          </p>
        </motion.div>

        {/* Glass card */}
        <motion.div
          className="rounded-3xl p-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          <form action={formAction} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@school.com"
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.9)",
                  caretColor: "#5cabf6",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(92,171,246,0.5)";
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(92,171,246,0.3)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: "rgba(255,255,255,0.45)" }}
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
                className="w-full px-4 py-3 rounded-xl outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.9)",
                  caretColor: "#5cabf6",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(92,171,246,0.5)";
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(92,171,246,0.3)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
              />
            </motion.div>

            {state?.error && (
              <motion.div
                className="flex items-center gap-3 text-sm px-4 py-3 rounded-xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#f87171",
                }}
              >
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {state.error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={pending}
              className="w-full py-3 px-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              whileHover={!pending ? { scale: 1.02 } : {}}
              whileTap={!pending ? { scale: 0.98 } : {}}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              style={{
                background: pending
                  ? "linear-gradient(135deg, rgba(92,171,246,0.5) 0%, rgba(59,130,246,0.5) 100%)"
                  : "linear-gradient(135deg, #5cabf6 0%, #3b82f6 100%)",
                color: "white",
              }}
            >
              {pending ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-8 flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link
            href="/"
            className="text-sm transition-all font-medium"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(92,171,246,0.9)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)")}
          >
            ← Student Login
          </Link>
          <motion.div
            className="flex items-center gap-2 text-xs"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <motion.span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                dbStatus === "checking"
                  ? "bg-yellow-400"
                  : dbStatus === "connected"
                  ? "bg-green-400"
                  : dbStatus === "mock"
                  ? "bg-blue-400"
                  : "bg-red-400"
              }`}
              animate={dbStatus === "checking" ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1.5 }}
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
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
