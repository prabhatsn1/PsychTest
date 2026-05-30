"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { studentLogout } from "@/app/actions/student";
import Image from "next/image";
import type { TraitProfile } from "@/lib/types";
import { getElaboratedProfile } from "@/lib/traits";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

interface Props {
  student: {
    studentName: string;
    mobile: string;
    classSection: string;
    dateOfAssessment: string;
    pdfPath: string;
  };
  traits: TraitProfile[];
  dominant: TraitProfile;
  secondary: TraitProfile;
  scores: { scoreA: number; scoreB: number; scoreC: number; scoreD: number };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AnimatedCounter({ value, color }: { value: number; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionVal, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value, motionVal]);

  return (
    <span
      ref={ref}
      className="text-4xl font-bold tabular-nums"
      style={{ color, textShadow: `0 0 20px ${color}80` }}
    >
      {display}%
    </span>
  );
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function GlassCard({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`rounded-3xl ${className}`}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function DarkTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string; payload?: { percentage?: number } }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.88)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: "8px 14px",
        color: "rgba(255,255,255,0.9)",
        fontSize: 13,
        backdropFilter: "blur(12px)",
      }}
    >
      {label && (
        <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: 4, fontSize: 11, letterSpacing: "0.06em" }}>
          {label}
        </p>
      )}
      {payload.map((p, i) => (
        <p key={i}>
          <span style={{ color: p.color ?? "white" }}>{p.name}</span>:{" "}
          <strong>{p.value}</strong>
          {p.payload?.percentage !== undefined && ` (${p.payload.percentage}%)`}
        </p>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="uppercase font-semibold mb-5"
      style={{ color: "rgba(255,255,255,0.38)", letterSpacing: "0.13em", fontSize: 11 }}
    >
      {children}
    </p>
  );
}

export default function ReportView({
  student,
  traits,
  dominant,
  secondary,
  scores,
}: Props) {
  const totalAnswers = scores.scoreA + scores.scoreB + scores.scoreC + scores.scoreD;

  const pieData = traits.map((t) => ({
    name: t.label,
    value: t.score,
    percentage: t.percentage,
    color: t.color,
  }));

  const barData = traits.map((t) => ({
    name: t.label,
    score: t.score,
    fill: t.color,
  }));

  const answerDistribution = [
    { label: "A – Analytical", count: scores.scoreA, percentage: totalAnswers ? Math.round((scores.scoreA / totalAnswers) * 100) : 0, color: "#3B82F6" },
    { label: "B – Reflective", count: scores.scoreB, percentage: totalAnswers ? Math.round((scores.scoreB / totalAnswers) * 100) : 0, color: "#8B5CF6" },
    { label: "C – Creative", count: scores.scoreC, percentage: totalAnswers ? Math.round((scores.scoreC / totalAnswers) * 100) : 0, color: "#F59E0B" },
    { label: "D – Leader", count: scores.scoreD, percentage: totalAnswers ? Math.round((scores.scoreD / totalAnswers) * 100) : 0, color: "#10B981" },
  ];

  // Sorted traits for primary / secondary / bonus
  const sorted = [...traits].sort((a, b) => b.score - a.score);
  const bonus = sorted[2]; // 3rd strongest trait

  const radarData = traits.map((t) => ({
    trait: t.label,
    score: t.score,
    fullMark: totalAnswers || 10,
  }));

  const elaborated = getElaboratedProfile(dominant.name);

  const traitTaglines: Record<string, string> = {
    analytical: "Analytical Thinking",
    reflective: "Reflective & Empathetic",
    creative: "Creative & Expressive",
    leader: "Leader & Action-Taker",
  };

  const glanceQuotes: Record<string, string> = {
    leader:
      "You are the kind of person who doesn\u2019t just dream about big things \u2014 you go out and make them happen. Your energy, confidence, and drive to lead are rare. Use them well!",
    analytical:
      "You see the world through a lens of logic and precision. Where others guess, you calculate. Your sharp mind is your superpower \u2014 keep sharpening it!",
    reflective:
      "You feel deeply and think before you act. Your empathy and wisdom make you a trusted guide for others. The world needs more thoughtful souls like you.",
    creative:
      "Your imagination knows no bounds. You turn ordinary moments into extraordinary ideas. Keep creating \u2014 the world is your canvas!",
  };

  const quoteWords = (glanceQuotes[dominant.name] ?? "").split(" ");

  // Progress bars scroll trigger
  const progressRef = useRef<HTMLDivElement>(null);
  const progressInView = useInView(progressRef, { once: true, margin: "-80px" });

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "linear-gradient(135deg, #0a0a1a 0%, #0f0f2e 50%, #0a0a1a 100%)" }}
    >
      {/* Aurora background blobs */}
      <motion.div
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
        animate={{ x: [0, 30, -10, 0], y: [0, -30, 15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed pointer-events-none"
        style={{
          bottom: -200,
          left: -200,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "#5cabf6",
          opacity: 0.1,
          filter: "blur(120px)",
          zIndex: 0,
        }}
        animate={{ x: [0, -25, 15, 0], y: [0, 25, -15, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/BigLeagueLogo.png" alt="Big League Logo" width={90} height={30} />
            <span
              className="text-lg font-semibold tracking-wide"
              style={{ color: "rgba(255,255,255,0.88)" }}
            >
              PsychProfile
            </span>
          </div>
          <form action={studentLogout}>
            <button
              type="submit"
              className="text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseEnter={(e) => { (e.currentTarget).style.color = "rgba(255,255,255,0.88)"; }}
              onMouseLeave={(e) => { (e.currentTarget).style.color = "rgba(255,255,255,0.45)"; }}
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Hero ── */}
        <Section>
          <GlassCard
            className="p-6 sm:p-10"
            style={{ minHeight: "40vh", display: "flex", flexDirection: "column", justifyContent: "center" }}
          >
            {/* Badge */}
            <div className="mb-6">
              <span
                className="text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full"
                style={{
                  border: "1px solid rgba(92,171,246,0.4)",
                  color: "#5cabf6",
                  background: "rgba(92,171,246,0.08)",
                }}
              >
                Psychometric Report
              </span>
            </div>

            {/* Animated name */}
            <h1 className="text-4xl sm:text-5xl font-thin tracking-tight mb-4" style={{ color: "white" }}>
              {student.studentName.split(" ").map((word, wi) => (
                <motion.span
                  key={wi}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: wi * 0.12, duration: 0.6, ease: "easeOut" }}
                  className="inline-block mr-3"
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <div
              className="flex flex-wrap gap-x-4 gap-y-1 mb-8"
              style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}
            >
              <span>Class {student.classSection}</span>
              <span>•</span>
              <span>
                {new Date(student.dateOfAssessment).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <div
              className="w-full h-px mb-8"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
            />

            {student.pdfPath && (
              <a
                href={student.pdfPath}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all self-start"
                style={{
                  color: "white",
                  border: "1px solid rgba(92,171,246,0.4)",
                  background: "rgba(92,171,246,0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(92,171,246,0.18)";
                  e.currentTarget.style.boxShadow = "0 0 20px rgba(92,171,246,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(92,171,246,0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </a>
            )}
          </GlassCard>
        </Section>

        {/* ── Profile at a Glance ── */}
        <Section>
          <div
            className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${dominant.color}1a 0%, rgba(255,255,255,0.02) 100%)`,
              border: `1px solid ${dominant.color}40`,
              borderLeft: `3px solid ${dominant.color}`,
              boxShadow: `0 0 40px ${dominant.color}20`,
            }}
          >
            <p
              className="text-xs font-semibold uppercase mb-4"
              style={{ color: "rgba(255,255,255,0.38)", letterSpacing: "0.14em" }}
            >
              Your Profile at a Glance
            </p>

            {/* Word-by-word animated quote */}
            <p
              className="text-base sm:text-lg leading-relaxed font-light italic mb-6"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              &ldquo;
              {quoteWords.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.04, duration: 0.4 }}
                  className="inline-block mr-1"
                >
                  {word}
                </motion.span>
              ))}
              &rdquo;
            </p>

            {/* Trait badges */}
            <div className="space-y-2.5">
              {[
                { num: "1", label: `Primary: ${dominant.label[0]} \u2013 ${traitTaglines[dominant.name]}`, color: dominant.color, show: true },
                { num: "2", label: `Secondary: ${secondary?.label[0]} \u2013 ${traitTaglines[secondary?.name]}`, color: secondary?.color ?? "rgba(255,255,255,0.5)", show: secondary && secondary.score > 0 },
                { num: "\u2736", label: `Bonus: ${bonus?.label[0]} \u2013 ${traitTaglines[bonus?.name]}`, color: "rgba(255,255,255,0.45)", show: bonus && bonus.score > 0 },
              ]
                .filter((item) => item.show)
                .map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.14, duration: 0.5 }}
                    className="flex items-center gap-3"
                  >
                    <span
                      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: item.color,
                        boxShadow: `0 0 10px ${item.color}60`,
                      }}
                    >
                      {item.num}
                    </span>
                    <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
                      {item.label}
                    </span>
                  </motion.div>
                ))}
            </div>

            <div className="mt-6 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs tracking-wide" style={{ color: "rgba(255,255,255,0.28)" }}>
                Report by{" "}
                <span style={{ color: "rgba(255,255,255,0.48)", fontWeight: 600 }}>
                  TBL — The Big League
                </span>
              </p>
            </div>
          </div>
        </Section>

        {/* ── Elaborated Student Profile ── */}
        {elaborated && (
          <Section>
            <GlassCard className="overflow-hidden">
              {/* Title with glowing left bar */}
              <div className="flex items-stretch gap-5 p-6 sm:p-8 pb-4">
                <div
                  className="w-1 rounded-full shrink-0"
                  style={{ background: dominant.color, boxShadow: `0 0 16px ${dominant.color}` }}
                />
                <div>
                  <p
                    className="text-xs uppercase tracking-widest font-semibold mb-1"
                    style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}
                  >
                    Elaborated Student Profile
                  </p>
                  <h2 className="text-xl font-bold" style={{ color: dominant.color }}>
                    {elaborated.profileTitle}
                  </h2>
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-6">
                {/* Core Inclination */}
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}
                  >
                    Core Inclination
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                    {elaborated.coreInclination}
                  </p>
                </div>

                {/* 4-panel grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "Natural Strengths", items: elaborated.naturalStrengths },
                    { title: "Preferred Learning Style", items: elaborated.preferredLearningStyle },
                    { title: "Typical Behaviours", items: elaborated.typicalBehaviours },
                    { title: "Motivators & Interests", items: elaborated.motivatorsInterests },
                  ].map(({ title, items }) => (
                    <div
                      key={title}
                      className="rounded-2xl p-5"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <p
                        className="text-xs font-semibold uppercase tracking-wider mb-3"
                        style={{ color: dominant.color, letterSpacing: "0.1em" }}
                      >
                        {title}
                      </p>
                      <ul className="space-y-2">
                        {items.map((s) => (
                          <li
                            key={s}
                            className="flex items-start gap-2.5 text-sm"
                            style={{ color: "rgba(255,255,255,0.7)" }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                              style={{
                                background: dominant.color,
                                boxShadow: `0 0 6px ${dominant.color}`,
                              }}
                            />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Exploration Pathways */}
                <div
                  className="rounded-xl p-4 pl-5"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    borderLeft: `2px solid ${dominant.color}`,
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: dominant.color }}
                  >
                    Exploration Pathways
                  </p>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {elaborated.explorationPathways}
                  </p>
                  <p className="text-xs mt-2 italic" style={{ color: "rgba(255,255,255,0.38)" }}>
                    👉 {elaborated.counsellingNote}
                  </p>
                </div>

                {/* Counselling Note */}
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(245,158,11,0.07)",
                    border: "1px solid rgba(245,158,11,0.2)",
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "#F59E0B", letterSpacing: "0.1em" }}
                  >
                    🌱 Important Counselling Note
                  </p>
                  <div className="space-y-2 text-sm" style={{ color: "rgba(255,255,255,0.68)" }}>
                    <p>
                      <strong style={{ color: "rgba(255,255,255,0.88)" }}>
                        This profile reflects inclination, not limitation.
                      </strong>
                    </p>
                    <p>
                      Most students show a mix of A, B, C, and D traits. The dominant pattern helps
                      start conversations — not make final decisions.
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </Section>
        )}

        {/* ── Score Distribution (Pie) ── */}
        <Section>
          <GlassCard className="p-6 sm:p-8">
            <SectionLabel>Score Distribution</SectionLabel>
            <div className="relative flex flex-col items-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={6}
                    dataKey="value"
                    label={({ name, payload }) => `${(name as string)[0]} ${(payload as { percentage?: number })?.percentage ?? 0}%`}
                    labelLine={{ stroke: "rgba(255,255,255,0.15)" }}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
              >
                <p
                  className="text-2xl font-bold"
                  style={{ color: dominant.color, textShadow: `0 0 18px ${dominant.color}` }}
                >
                  {dominant.percentage}%
                </p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {dominant.label[0]}
                </p>
              </div>
            </div>
            {/* Custom pill legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-3">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ background: entry.color, boxShadow: `0 0 6px ${entry.color}` }}
                  />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {entry.name[0]}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </Section>

        {/* ── Score Comparison (Bar) ── */}
        <Section>
          <GlassCard className="p-6 sm:p-8">
            <SectionLabel>Score Comparison</SectionLabel>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} barSize={32}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "rgba(255,255,255,0.5)" }}
                  axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
                  tickLine={false}
                />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} isAnimationActive>
                  {barData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>
        </Section>

        {/* ── Answer Breakdown ── */}
        <Section>
          <GlassCard className="p-6 sm:p-8">
            <SectionLabel>Answer Breakdown</SectionLabel>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
              Total answers:{" "}
              <span style={{ color: "rgba(255,255,255,0.82)", fontWeight: 600 }}>
                {totalAnswers}
              </span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {answerDistribution.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl p-5 text-center"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderLeft: `3px solid ${item.color}`,
                    boxShadow: `inset 0 0 30px ${item.color}06`,
                  }}
                >
                  <AnimatedCounter value={item.percentage} color={item.color} />
                  <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.38)" }}>
                    {item.count} of {totalAnswers}
                  </p>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mt-1"
                    style={{ color: item.color, letterSpacing: "0.07em" }}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </GlassCard>
        </Section>

        {/* ── Score Progress Bars ── */}
        <Section>
          <GlassCard className="p-6 sm:p-8">
            <SectionLabel>Score Breakdown</SectionLabel>
            <div className="space-y-5" ref={progressRef}>
              {traits.map((trait) => (
                <div key={trait.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>
                      {trait.label}
                    </span>
                    <span className="text-sm tabular-nums" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {trait.score}/{totalAnswers} ({trait.percentage}%)
                    </span>
                  </div>
                  <div
                    className="w-full rounded-full h-2 overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${trait.color}88, ${trait.color})`,
                        boxShadow: `0 0 12px ${trait.color}80`,
                      }}
                      initial={{ width: 0 }}
                      animate={progressInView ? { width: `${trait.percentage}%` } : { width: 0 }}
                      transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </Section>

        {/* ── Strength Radar ── */}
        <Section>
          <GlassCard className="p-6 sm:p-8">
            <SectionLabel>Strength Radar</SectionLabel>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis
                  dataKey="trait"
                  tick={{ fontSize: 12, fill: "rgba(255,255,255,0.6)" }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, "auto"]}
                  tick={{ fontSize: 10, fill: "rgba(255,255,255,0.28)" }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke={dominant.color}
                  fill={dominant.color}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Radar
                  name="Depth"
                  dataKey="score"
                  stroke="transparent"
                  fill="#5cabf6"
                  fillOpacity={0.05}
                />
                <Tooltip content={<DarkTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </GlassCard>
        </Section>

        {/* ── Key Strengths ── */}
        <Section>
          <GlassCard className="p-6 sm:p-8">
            <SectionLabel>Your Key Strengths</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dominant.strengths.map((strength, i) => (
                <motion.div
                  key={strength}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
                  className="flex items-start gap-3 rounded-xl p-4"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <span
                    className="text-lg shrink-0 mt-0.5 leading-none"
                    style={{
                      color: dominant.color,
                      filter: `drop-shadow(0 0 6px ${dominant.color})`,
                    }}
                  >
                    ✦
                  </span>
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {strength}
                  </span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </Section>

        {/* ── Career Paths ── */}
        <Section>
          <GlassCard className="p-6 sm:p-8">
            <SectionLabel>Career Paths to Explore</SectionLabel>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
              Based on your dominant profile, these careers align well with your natural abilities.
            </p>
            <div className="flex flex-wrap gap-2">
              {dominant.careers.map((career, i) => (
                <motion.span
                  key={career}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.06 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium cursor-default"
                  style={{
                    color: "white",
                    border: `1px solid ${dominant.color}50`,
                    background: `${dominant.color}1e`,
                  }}
                >
                  {career}
                </motion.span>
              ))}
            </div>

            {secondary && secondary.careers.length > 0 && (
              <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Also consider (from your secondary trait):
                </p>
                <div className="flex flex-wrap gap-2">
                  {secondary.careers.slice(0, 3).map((career) => (
                    <span
                      key={career}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs"
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      {career}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </Section>

        {/* ── Footer / Encouragement ── */}
        <Section>
          <div
            className="rounded-3xl py-12 px-8 text-center"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span
              className="text-3xl"
              style={{ color: "#F59E0B", filter: "drop-shadow(0 0 10px #F59E0B)" }}
            >
              ✦
            </span>
            <p
              className="text-sm italic mt-4 max-w-sm mx-auto leading-relaxed"
              style={{ color: "rgba(255,255,255,0.52)" }}
            >
              Remember, every trait is a strength. This report highlights your natural tendencies —
              your potential is limitless. Talk to your counsellor to explore more.
            </p>

            {/* Animated expanding line */}
            <motion.div
              className="mx-auto my-7 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                maxWidth: 220,
              }}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />

            <div
              className="flex items-center justify-center flex-wrap gap-4 text-xs"
              style={{ color: "rgba(255,255,255,0.38)" }}
            >
              <a
                href="tel:7303764346"
                className="flex items-center gap-1 transition-all"
                style={{ color: "rgba(255,255,255,0.38)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#5cabf6";
                  e.currentTarget.style.textShadow = "0 0 12px #5cabf6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.38)";
                  e.currentTarget.style.textShadow = "none";
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                7303764346
              </a>
              <span className="w-px h-3" style={{ background: "rgba(255,255,255,0.15)" }} />
              <a
                href="https://www.jointhebigleague.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 transition-all"
                style={{ color: "rgba(255,255,255,0.38)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#5cabf6";
                  e.currentTarget.style.textShadow = "0 0 12px #5cabf6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.38)";
                  e.currentTarget.style.textShadow = "none";
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                www.jointhebigleague.com
              </a>
              <span className="w-px h-3" style={{ background: "rgba(255,255,255,0.15)" }} />
              <a
                href="mailto:info@jointhebigleague.com"
                className="flex items-center gap-1 transition-all"
                style={{ color: "rgba(255,255,255,0.38)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#5cabf6";
                  e.currentTarget.style.textShadow = "0 0 12px #5cabf6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.38)";
                  e.currentTarget.style.textShadow = "none";
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                info@jointhebigleague.com
              </a>
            </div>

            <div
              className="mt-6 flex items-center justify-center gap-2 text-xs"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              <span className="w-8 h-px inline-block" style={{ background: "rgba(255,255,255,0.14)" }} />
              <span>
                Report by{" "}
                <span style={{ color: "rgba(255,255,255,0.38)", fontWeight: 600 }}>
                  TBL — the BigLeague
                </span>
              </span>
              <span className="w-8 h-px inline-block" style={{ background: "rgba(255,255,255,0.14)" }} />
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}
