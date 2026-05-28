"use server";

import { prisma } from "@/lib/prisma";
import {
  DATABASE_UNAVAILABLE_MESSAGE,
  isDatabaseConnectionError,
} from "@/lib/db-errors";
import { redirect } from "next/navigation";

export type AssessmentState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

export async function submitAssessment(
  _prevState: AssessmentState,
  formData: FormData
): Promise<AssessmentState> {
  const studentName = (formData.get("studentName") as string)?.trim();
  const mobile = (formData.get("mobile") as string)?.trim();
  const classSection = (formData.get("classSection") as string)?.trim();

  if (!studentName || !mobile || !classSection) {
    return { error: "Please fill in all student details." };
  }

  if (!/^\d{10}$/.test(mobile)) {
    return { error: "Please enter a valid 10-digit mobile number." };
  }

  const answers: Record<string, string> = {};
  for (let i = 1; i <= 10; i++) {
    const val = formData.get(`q${i}`) as string;
    if (!val || !["A", "B", "C", "D"].includes(val)) {
      return { error: `Please answer question ${i}.` };
    }
    answers[`q${i}`] = val;
  }

  // Calculate scores
  let scoreA = 0,
    scoreB = 0,
    scoreC = 0,
    scoreD = 0;
  for (let i = 1; i <= 10; i++) {
    switch (answers[`q${i}`]) {
      case "A":
        scoreA++;
        break;
      case "B":
        scoreB++;
        break;
      case "C":
        scoreC++;
        break;
      case "D":
        scoreD++;
        break;
    }
  }

  try {
    await prisma.assessment.create({
      data: {
        studentName,
        mobile,
        classSection,
        q1: answers.q1,
        q2: answers.q2,
        q3: answers.q3,
        q4: answers.q4,
        q5: answers.q5,
        q6: answers.q6,
        q7: answers.q7,
        q8: answers.q8,
        q9: answers.q9,
        q10: answers.q10,
        scoreA,
        scoreB,
        scoreC,
        scoreD,
      },
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      return { error: DATABASE_UNAVAILABLE_MESSAGE };
    }
    throw error;
  }

  redirect("/assessment/success");
}
