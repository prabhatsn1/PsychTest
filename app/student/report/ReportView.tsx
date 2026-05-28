"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
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
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/BigLeagueLogo.png"
              alt="Big League Logo"
              width={90}
              height={30}
            />
            <span className="text-lg font-semibold text-gray-900">
              PsychProfile
            </span>
          </div>
          <form action={studentLogout}>
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-brand-600 font-medium mb-1">
                Psychometric Assessment Report
              </p>
              <h1 className="text-2xl font-semibold text-gray-900">
                {student.studentName}
              </h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                <span>Class {student.classSection}</span>
                <span>•</span>
                <span>
                  {new Date(student.dateOfAssessment).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {student.pdfPath && (
                <a
                  href={student.pdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-50 text-brand-600 text-sm font-medium hover:bg-brand-100 transition-colors"
                >
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download PDF
                </a>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile at a Glance */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-400 to-accent-300 rounded-2xl p-6 sm:p-8 text-white"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-3">
              Your Profile at a Glance
            </p>
            <p className="text-base sm:text-lg leading-relaxed font-light italic text-white/90 mb-6">
              &ldquo;{glanceQuotes[dominant.name]}&rdquo;
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-xs font-bold">1</span>
                <span className="text-sm font-medium">
                  Primary: {dominant.label[0]} – {traitTaglines[dominant.name]}
                </span>
              </div>
              {secondary && secondary.score > 0 && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-xs font-bold">2</span>
                  <span className="text-sm font-medium">
                    Secondary: {secondary.label[0]} – {traitTaglines[secondary.name]}
                  </span>
                </div>
              )}
              {bonus && bonus.score > 0 && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/15 text-xs font-bold">✦</span>
                  <span className="text-sm font-medium text-white/80">
                    Bonus: {bonus.label[0]} – {traitTaglines[bonus.name]}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/20">
              <p className="text-xs text-white/50 tracking-wide">
                Report by <span className="font-semibold text-white/70">TBL — The Big League</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Elaborated Student Profile */}
        {elaborated && (
          <motion.div
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            {/* Coloured header strip */}
            <div
              className="px-6 py-5 sm:px-8"
              style={{
                backgroundColor: `${dominant.color}10`,
                borderBottom: `2px solid ${dominant.color}25`,
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                Elaborated Student Profile
              </p>
              <h2 className="text-xl font-bold" style={{ color: dominant.color }}>
                {elaborated.profileTitle}
              </h2>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Core Inclination */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Core Inclination
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {elaborated.coreInclination}
                </p>
              </div>

              {/* 4-panel grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Natural Strengths */}
                <div className="rounded-xl bg-gray-50 p-4">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: dominant.color }}
                  >
                    Natural Strengths
                  </p>
                  <ul className="space-y-1.5">
                    {elaborated.naturalStrengths.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-gray-700">
                        <span style={{ color: dominant.color }} className="mt-0.5 shrink-0">›</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Preferred Learning Style */}
                <div className="rounded-xl bg-gray-50 p-4">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: dominant.color }}
                  >
                    Preferred Learning Style
                  </p>
                  <ul className="space-y-1.5">
                    {elaborated.preferredLearningStyle.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-gray-700">
                        <span style={{ color: dominant.color }} className="mt-0.5 shrink-0">›</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Typical Behaviours */}
                <div className="rounded-xl bg-gray-50 p-4">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: dominant.color }}
                  >
                    Typical Behaviours
                  </p>
                  <ul className="space-y-1.5">
                    {elaborated.typicalBehaviours.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-gray-700">
                        <span style={{ color: dominant.color }} className="mt-0.5 shrink-0">›</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Motivators & Interests */}
                <div className="rounded-xl bg-gray-50 p-4">
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-3"
                    style={{ color: dominant.color }}
                  >
                    Motivators &amp; Interests
                  </p>
                  <ul className="space-y-1.5">
                    {elaborated.motivatorsInterests.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-sm text-gray-700">
                        <span style={{ color: dominant.color }} className="mt-0.5 shrink-0">›</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Exploration Pathways */}
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: `${dominant.color}08`,
                  border: `1px solid ${dominant.color}25`,
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: dominant.color }}
                >
                  Exploration Pathways
                </p>
                <p className="text-sm text-gray-700">{elaborated.explorationPathways}</p>
                <p className="text-xs text-gray-500 mt-2 italic">
                  👉 {elaborated.counsellingNote}
                </p>
              </div>

              {/* Important Counselling Note */}
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 mb-2">
                  🌱 Important Counselling Note
                </p>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <strong>This profile reflects inclination, not limitation.</strong>
                  </p>
                  <p>
                    Most students show a mix of A, B, C, and D traits. The dominant pattern helps
                    start conversations — not make final decisions.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Score Breakdown – Pie Chart */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={3}
          variants={fadeUp}
          className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8"
        >
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-5">
            Score Distribution
          </p>
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, payload }) => `${name} ${payload?.percentage ?? 0}%`}
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${value} answers (${totalAnswers ? Math.round((Number(value) / totalAnswers) * 100) : 0}%)`,
                    name,
                  ]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Score Breakdown – Bar Chart */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={4}
          variants={fadeUp}
          className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8"
        >
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-5">
            Score Comparison
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 13 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
              <Tooltip
                formatter={(value) => [`${value} answers`, "Score"]}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {barData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Answer Distribution */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={5}
          variants={fadeUp}
          className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8"
        >
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Answer Breakdown
          </p>
          <p className="text-sm text-gray-500 mb-5">
            Total answers: <span className="font-medium text-gray-700">{totalAnswers}</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {answerDistribution.map((item) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="rounded-xl border p-4 text-center"
                style={{ borderColor: `${item.color}30`, backgroundColor: `${item.color}08` }}
              >
                <p
                  className="text-3xl font-bold"
                  style={{ color: item.color }}
                >
                  {item.percentage}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {item.count} of {totalAnswers} answers
                </p>
                <p
                  className="text-xs font-medium mt-1"
                  style={{ color: item.color }}
                >
                  {item.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Score Progress Bars */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={6}
          variants={fadeUp}
          className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8"
        >
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-5">
            Score Breakdown
          </p>
          <div className="space-y-4">
            {traits.map((trait) => (
              <div key={trait.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">
                    {trait.label}
                  </span>
                  <span className="text-sm text-gray-500">
                    {trait.score}/{totalAnswers} ({trait.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: trait.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${trait.percentage}%` }}
                    transition={{
                      duration: 1,
                      delay: 0.3,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Strength Radar */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={7}
          variants={fadeUp}
          className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8"
        >
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-5">
            Strength Radar
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="trait" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <PolarRadiusAxis angle={30} domain={[0, "auto"]} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.25}
                strokeWidth={2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Strengths */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={8}
          variants={fadeUp}
          className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8"
        >
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-5">
            Your Key Strengths
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dominant.strengths.map((strength, i) => (
              <motion.div
                key={strength}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50"
              >
                <svg
                  className="w-5 h-5 shrink-0 mt-0.5"
                  style={{ color: dominant.color }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-gray-700">{strength}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Career Suggestions */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={9}
          variants={fadeUp}
          className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8"
        >
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Career Paths to Explore
          </p>
          <p className="text-sm text-gray-500 mb-5">
            Based on your dominant profile, these careers align well with your
            natural abilities.
          </p>
          <div className="flex flex-wrap gap-2">
            {dominant.careers.map((career, i) => (
              <motion.span
                key={career}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium border"
                style={{
                  color: dominant.color,
                  borderColor: `${dominant.color}30`,
                  backgroundColor: `${dominant.color}08`,
                }}
              >
                {career}
              </motion.span>
            ))}
          </div>

          {secondary && secondary.careers.length > 0 && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-3">
                Also consider (from your secondary trait):
              </p>
              <div className="flex flex-wrap gap-2">
                {secondary.careers.slice(0, 3).map((career) => (
                  <span
                    key={career}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs text-gray-500 border border-gray-200 bg-gray-50"
                  >
                    {career}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Encouragement Footer */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={10}
          variants={fadeUp}
          className="text-center py-10"
        >
          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
            Remember, every trait is a strength. This report highlights your
            natural tendencies — your potential is limitless. Talk to your
            counsellor to explore more. 🌟
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
            <a
              href="tel:7303764346"
              className="flex items-center gap-1 hover:text-accent-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              7303764346
            </a>
            <span className="w-px h-3 bg-gray-200" />
            <a
              href="https://www.jointhebigleague.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-accent-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              www.jointhebigleague.com
            </a>
            <span className="w-px h-3 bg-gray-200" />
            <a
              href="mailto:info@jointhebigleague.com"
              className="flex items-center gap-1 hover:text-accent-300 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              info@jointhebigleague.com
            </a>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span className="w-8 h-px bg-gray-200" />
            <span>Report by <span className="font-semibold text-gray-500">TBL — the BigLeague</span></span>
            <span className="w-8 h-px bg-gray-200" />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
