import Link from "next/link";
import Image from "next/image";

export default function AssessmentSuccess() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center mb-6">
          <Image
            src="/BigLeagueLogo.png"
            alt="Big League Logo"
            width={140}
            height={48}
            priority
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Success icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Assessment Submitted!
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Thank you for completing the psychometric assessment. Your responses
            have been recorded successfully. Your counsellor will review your
            results and prepare your personalised report.
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors text-center"
            >
              Back to Home
            </Link>
            <Link
              href="/assessment"
              className="block w-full px-5 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors text-center"
            >
              Take Another Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
