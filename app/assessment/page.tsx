"use client";

import { useActionState, useState } from "react";
import { submitAssessment } from "@/app/actions/assessment";
import Image from "next/image";

const questions = [
  {
    id: 1,
    text: "When you get some free time, what do you enjoy most?",
    options: [
      { value: "A", label: "Solving puzzles, maths questions, or logic games" },
      { value: "B", label: "Reading, observing, or learning new ideas" },
      { value: "C", label: "Drawing, writing, singing, or making something creative" },
      { value: "D", label: "Playing sports, leading a group, or doing active work" },
    ],
  },
  {
    id: 2,
    text: "In school, which type of task do you usually like the most?",
    options: [
      { value: "A", label: "Practical problem-solving and calculations" },
      { value: "B", label: "Research, reading, and understanding concepts" },
      { value: "C", label: "Presentations, art, storytelling, or design work" },
      { value: "D", label: "Group activities, competitions, or organizing events" },
    ],
  },
  {
    id: 3,
    text: "Which subjects make you feel most confident?",
    options: [
      { value: "A", label: "Maths and science" },
      { value: "B", label: "English, social science, or general knowledge" },
      { value: "C", label: "Art, music, literature, or creative writing" },
      { value: "D", label: "Sports, teamwork-based work, or leadership tasks" },
    ],
  },
  {
    id: 4,
    text: "When faced with a difficult problem, what do you do first?",
    options: [
      { value: "A", label: "Break it into parts and solve it logically" },
      { value: "B", label: "Think deeply and try to understand the full situation" },
      { value: "C", label: "Come up with a new or unusual idea" },
      { value: "D", label: "Talk to others and take quick action" },
    ],
  },
  {
    id: 5,
    text: "How do your teachers or friends usually describe you?",
    options: [
      { value: "A", label: "Logical and focused" },
      { value: "B", label: "Calm and thoughtful" },
      { value: "C", label: "Creative and expressive" },
      { value: "D", label: "Confident and energetic" },
    ],
  },
  {
    id: 6,
    text: "Which project would you be most excited to do?",
    options: [
      { value: "A", label: "A science model, coding task, or experiment" },
      { value: "B", label: "A debate, essay, survey, or research project" },
      { value: "C", label: "A poster, play, video, design, or creative campaign" },
      { value: "D", label: "A team event, club activity, or leadership role" },
    ],
  },
  {
    id: 7,
    text: "What kind of success makes you happiest?",
    options: [
      { value: "A", label: "Solving something difficult correctly" },
      { value: "B", label: "Understanding something deeply and explaining it well" },
      { value: "C", label: "Creating something original that others appreciate" },
      { value: "D", label: "Winning, leading, or making a team perform well" },
    ],
  },
  {
    id: 8,
    text: "Which activity would you like to explore more in the future?",
    options: [
      { value: "A", label: "Robotics, coding, maths Olympiads, or technical work" },
      { value: "B", label: "Writing, public speaking, psychology, or social issues" },
      { value: "C", label: "Designing, filmmaking, music, content, or fine arts" },
      { value: "D", label: "Entrepreneurship, sports, event management, or leadership" },
    ],
  },
  {
    id: 9,
    text: "What kind of environment suits you best?",
    options: [
      { value: "A", label: "A place where I can analyze, build, and solve" },
      { value: "B", label: "A place where I can think, discuss, and understand" },
      { value: "C", label: "A place where I can imagine, express, and create" },
      { value: "D", label: "A place where I can interact, lead, and act" },
    ],
  },
  {
    id: 10,
    text: "What would you most like people to recognize you for?",
    options: [
      { value: "A", label: "Intelligence and problem-solving ability" },
      { value: "B", label: "Wisdom, understanding, and clear thinking" },
      { value: "C", label: "Talent, imagination, and originality" },
      { value: "D", label: "Leadership, confidence, and action" },
    ],
  },
];

export default function AssessmentPage() {
  const [state, formAction, pending] = useActionState(submitAssessment, null);
  const [currentStep, setCurrentStep] = useState(0); // 0 = student info, 1-10 = questions
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [studentInfo, setStudentInfo] = useState({
    studentName: "",
    mobile: "",
    classSection: "",
  });

  const totalSteps = questions.length + 1; // info + 10 questions
  const progress = ((currentStep) / totalSteps) * 100;

  const handleOptionSelect = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [`q${questionId}`]: value }));
  };

  const canGoNext = () => {
    if (currentStep === 0) {
      return (
        studentInfo.studentName.trim() !== "" &&
        /^\d{10}$/.test(studentInfo.mobile) &&
        studentInfo.classSection.trim() !== ""
      );
    }
    return !!answers[`q${currentStep}`];
  };

  const handleNext = () => {
    if (canGoNext() && currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <Image
              src="/BigLeagueLogo.png"
              alt="Big League Logo"
              width={140}
              height={48}
              priority
            />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Psychometric Assessment
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Answer all 10 questions to discover your strengths
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>
              {currentStep === 0
                ? "Student Details"
                : `Question ${currentStep} of ${questions.length}`}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-accent-300 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Error */}
        {state?.error && (
          <div className="mb-6 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
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

        {/* Form */}
        <form action={formAction}>
          {/* Hidden fields for form submission */}
          <input type="hidden" name="studentName" value={studentInfo.studentName} />
          <input type="hidden" name="mobile" value={studentInfo.mobile} />
          <input type="hidden" name="classSection" value={studentInfo.classSection} />
          {Object.entries(answers).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {/* Step 0: Student Info */}
            {currentStep === 0 && (
              <div className="space-y-5">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Enter Your Details
                </h2>
                <div>
                  <label
                    htmlFor="studentNameInput"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="studentNameInput"
                    type="text"
                    required
                    value={studentInfo.studentName}
                    onChange={(e) =>
                      setStudentInfo((s) => ({ ...s, studentName: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-300/20 focus:border-accent-300 transition-all"
                    placeholder="e.g. Hardik Dwivedi"
                  />
                </div>
                <div>
                  <label
                    htmlFor="mobileInput"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      +91
                    </span>
                    <input
                      id="mobileInput"
                      type="tel"
                      required
                      maxLength={10}
                      value={studentInfo.mobile}
                      onChange={(e) =>
                        setStudentInfo((s) => ({
                          ...s,
                          mobile: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-300/20 focus:border-accent-300 transition-all"
                      placeholder="Enter 10-digit number"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="classSectionInput"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Class & Section
                  </label>
                  <input
                    id="classSectionInput"
                    type="text"
                    required
                    value={studentInfo.classSection}
                    onChange={(e) =>
                      setStudentInfo((s) => ({ ...s, classSection: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-accent-300/20 focus:border-accent-300 transition-all"
                    placeholder="e.g. Xth - B"
                  />
                </div>
              </div>
            )}

            {/* Steps 1-10: Questions */}
            {currentStep >= 1 && currentStep <= questions.length && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-1">
                  Question {currentStep}
                </h2>
                <p className="text-base text-gray-700 mb-6">
                  {questions[currentStep - 1].text}
                </p>
                <div className="space-y-3">
                  {questions[currentStep - 1].options.map((option) => {
                    const isSelected =
                      answers[`q${currentStep}`] === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          handleOptionSelect(currentStep, option.value)
                        }
                        className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-accent-300 bg-brand-50 text-brand-900"
                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold mr-3 ${
                            isSelected
                              ? "bg-accent-300 text-white"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {option.value}
                        </span>
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Back
              </button>

              {currentStep < totalSteps - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canGoNext() || pending}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {pending ? "Submitting..." : "Submit Assessment"}
                </button>
              )}
            </div>
          </div>

          {/* Question indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalSteps }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  // Only allow jumping to answered questions or the info step
                  if (i === 0 || (i >= 1 && answers[`q${i}`])) {
                    setCurrentStep(i);
                  }
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? "bg-accent-300 scale-125"
                    : i === 0
                      ? "bg-accent-200"
                      : answers[`q${i}`]
                        ? "bg-accent-300"
                        : "bg-gray-200"
                }`}
                title={
                  i === 0 ? "Student Details" : `Question ${i}`
                }
              />
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
