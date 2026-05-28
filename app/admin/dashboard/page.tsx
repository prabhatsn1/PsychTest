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
    ...r,
    dateOfAssessment: r.dateOfAssessment?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return <AdminDashboardClient initialReports={serializedReports} />;
}
