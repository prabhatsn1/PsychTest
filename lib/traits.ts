import type { TraitProfile } from "./types";

const traitDefinitions: Record<
  string,
  Omit<TraitProfile, "score" | "percentage">
> = {
  A: {
    name: "analytical",
    label: "Analytical",
    color: "#3B82F6",
    description:
      "You have a sharp, logical mind. You enjoy solving problems step-by-step, spotting patterns, and working with data. You thrive in structured environments where precision and clarity matter.",
    strengths: [
      "Critical thinking & logical reasoning",
      "Strong attention to detail",
      "Data-driven decision making",
      "Systematic problem solving",
      "Research & investigation skills",
    ],
    careers: [
      "Data Scientist / Analyst",
      "Software Engineer",
      "Research Scientist",
      "Financial Analyst",
      "Medical Doctor",
      "Chartered Accountant",
    ],
  },
  B: {
    name: "reflective",
    label: "Reflective",
    color: "#8B5CF6",
    description:
      "You are a deep thinker who values understanding and empathy. You take time to reflect on experiences and consider multiple perspectives. You connect well with others on an emotional level.",
    strengths: [
      "Empathy & emotional intelligence",
      "Deep listening & understanding",
      "Thoughtful decision making",
      "Strong self-awareness",
      "Ability to see the bigger picture",
    ],
    careers: [
      "Psychologist / Counsellor",
      "Teacher / Professor",
      "Writer / Author",
      "Social Worker",
      "Human Resources Manager",
      "Philosopher / Researcher",
    ],
  },
  C: {
    name: "creative",
    label: "Creative",
    color: "#F59E0B",
    description:
      "You are imaginative and love thinking outside the box. You bring originality to everything you do and are drawn to self-expression, design, and innovation. You see possibilities where others see limits.",
    strengths: [
      "Innovative & original thinking",
      "Artistic expression & design sense",
      "Adaptability & flexibility",
      "Storytelling & communication",
      "Visionary problem solving",
    ],
    careers: [
      "Graphic / UX Designer",
      "Architect",
      "Film Director / Content Creator",
      "Marketing & Brand Strategist",
      "Entrepreneur",
      "Game Designer",
    ],
  },
  D: {
    name: "leader",
    label: "Leader / Action-Taker",
    color: "#10B981",
    description:
      "You are a natural leader who takes initiative and inspires others. You prefer action over deliberation and are energised by challenges. People look to you for direction and motivation.",
    strengths: [
      "Confident decision making",
      "Team leadership & motivation",
      "Goal-oriented & results-driven",
      "Strong communication & persuasion",
      "Resilience under pressure",
    ],
    careers: [
      "Business Executive / CEO",
      "Lawyer / Advocate",
      "Military / Defence Officer",
      "Politician / Public Leader",
      "Sports Coach / Manager",
      "Project Manager",
    ],
  },
};

export function buildTraitProfiles(
  scoreA: number,
  scoreB: number,
  scoreC: number,
  scoreD: number
): TraitProfile[] {
  const total = scoreA + scoreB + scoreC + scoreD || 1;
  const scores: Record<string, number> = {
    A: scoreA,
    B: scoreB,
    C: scoreC,
    D: scoreD,
  };

  return Object.entries(scores).map(([key, score]) => ({
    ...traitDefinitions[key],
    score,
    percentage: Math.round((score / total) * 100),
  }));
}

export function getDominantAndSecondary(traits: TraitProfile[]) {
  const sorted = [...traits].sort((a, b) => b.score - a.score);
  return { dominant: sorted[0], secondary: sorted[1] };
}
