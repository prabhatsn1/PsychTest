import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedReports = reports.map((r) => ({
    id: r.id!,
    studentName: r.studentName!,
    mobile: r.mobile!,
    classSection: r.classSection!,
    dateOfAssessment: r.dateOfAssessment?.toISOString() ?? "",
    scoreA: r.scoreA!,
    scoreB: r.scoreB!,
    scoreC: r.scoreC!,
    scoreD: r.scoreD!,
    pdfPath: r.pdfPath!,
    createdAt: r.createdAt?.toISOString() ?? "",
    updatedAt: r.updatedAt?.toISOString() ?? "",
  }));

  return <AdminDashboardClient initialReports={serializedReports} />;
}
