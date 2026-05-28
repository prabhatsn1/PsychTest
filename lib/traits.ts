import type { TraitProfile, ElaboratedProfile } from "./types";

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

const elaboratedProfiles: Record<string, ElaboratedProfile> = {
  analytical: {
    profileTitle: "Analytical & Logical Thinker",
    coreInclination:
      "The student shows a strong preference for logic, structure, problem-solving, and objective reasoning.",
    naturalStrengths: [
      "Analysing problems step-by-step",
      "Working with numbers, systems, or data",
      "Identifying patterns and errors",
      "Thinking objectively rather than emotionally",
    ],
    preferredLearningStyle: [
      "Clear concepts, formulas, models",
      "Problem sets, experiments, case analysis",
      "Independent or focused work environments",
    ],
    typicalBehaviours: [
      'Asks "why" and "how does this work?"',
      "Enjoys solving puzzles or technical challenges",
      "Prefers clarity over ambiguity",
    ],
    motivatorsInterests: [
      "Mastery, accuracy, efficiency",
      "Subjects with right/wrong answers",
    ],
    explorationPathways:
      "Engineering, technology, data science, finance, economics, pure sciences",
    counsellingNote:
      "Encourage exposure to teamwork and communication skills alongside technical depth.",
  },
  reflective: {
    profileTitle: "Reflective & People-Understanding Thinker",
    coreInclination:
      "The student demonstrates depth of thought, empathy, and interest in understanding people, ideas, and systems at a conceptual level.",
    naturalStrengths: [
      "Critical reading and writing",
      "Listening and perspective-taking",
      "Research and reflection",
      "Ethical and value-based thinking",
    ],
    preferredLearningStyle: [
      "Discussions, debates, essays",
      "Reading, writing, case studies",
      "Time to reflect before responding",
    ],
    typicalBehaviours: [
      "Thinks before speaking",
      "Enjoys meaningful conversations",
      "Connects ideas across subjects",
    ],
    motivatorsInterests: [
      "Purpose, meaning, impact on people",
      'Understanding "why society works the way it does"',
    ],
    explorationPathways:
      "Law, teaching, psychology, research, policy studies, humanities, social sciences",
    counsellingNote:
      "Encourage confidence-building and decision-making in real-world contexts.",
  },
  creative: {
    profileTitle: "Creative & Expressive Thinker",
    coreInclination:
      "The student is driven by imagination, expression, aesthetics, and originality.",
    naturalStrengths: [
      "Visual or verbal creativity",
      "Storytelling and idea generation",
      "Seeing possibilities beyond rules",
      "Emotional and sensory awareness",
    ],
    preferredLearningStyle: [
      "Open-ended tasks and projects",
      "Visual, hands-on, or experiential learning",
      "Freedom to explore and experiment",
    ],
    typicalBehaviours: [
      "Thinks in images or stories",
      "Enjoys creating rather than analysing",
      "Dislikes rigid or repetitive tasks",
    ],
    motivatorsInterests: [
      "Self-expression, originality, recognition",
      "Creating something meaningful or beautiful",
    ],
    explorationPathways:
      "Design, media, architecture, communication, writing, arts, content creation",
    counsellingNote:
      "Support structure, deadlines, and practical execution skills.",
  },
  leader: {
    profileTitle: "Leadership & Action-Oriented Thinker",
    coreInclination:
      "The student is energetic, decisive, and socially driven, with a preference for action and influence.",
    naturalStrengths: [
      "Leadership and initiative",
      "Persuasion and communication",
      "Organising people and activities",
      "Taking decisions under pressure",
    ],
    preferredLearningStyle: [
      "Group work, simulations, real-life challenges",
      "Hands-on projects and competitions",
      "Learning by doing",
    ],
    typicalBehaviours: [
      "Comfortable speaking up",
      "Takes charge in group settings",
      "Seeks impact and results",
    ],
    motivatorsInterests: [
      "Achievement, recognition, momentum",
      "Making things happen",
    ],
    explorationPathways:
      "Business, management, entrepreneurship, sports, events, public-facing roles",
    counsellingNote:
      "Build patience, listening skills, and reflective thinking.",
  },
};

export function getElaboratedProfile(
  traitName: string
): ElaboratedProfile | undefined {
  return elaboratedProfiles[traitName];
}
