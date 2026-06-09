import { getStudentSession } from "@/lib/auth";
import { isDatabaseConnectionError } from "@/lib/db-errors";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildTraitProfiles, getDominantAndSecondary } from "@/lib/traits";
import ReportView from "./ReportView";

export default async function StudentReportPage() {
  const mobile = await getStudentSession();
  if (!mobile) redirect("/");

  let report;
  try {
    report = await prisma.report.findUnique({ where: { mobile } });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      redirect("/");
    }
    throw error;
  }

  if (!report) redirect("/");

  // Track every open so the admin can see when and how many times the report was viewed
  await prisma.report.update({
    where: { mobile },
    data: {
      reportOpenedAt: report.reportOpenedAt ?? new Date(),
      reportOpenCount: { increment: 1 },
    },
  });

  const traits = buildTraitProfiles(
    report.scoreA,
    report.scoreB,
    report.scoreC,
    report.scoreD
  );
  const { dominant, secondary } = getDominantAndSecondary(traits);

  return (
    <ReportView
      student={{
        studentName: report.studentName,
        mobile: report.mobile,
        classSection: report.classSection,
        dateOfAssessment: report.dateOfAssessment.toISOString(),
        pdfPath: report.pdfPath,
      }}
      traits={traits}
      dominant={dominant}
      secondary={secondary}
      scores={{
        scoreA: report.scoreA,
        scoreB: report.scoreB,
        scoreC: report.scoreC,
        scoreD: report.scoreD,
      }}
    />
  );
}
