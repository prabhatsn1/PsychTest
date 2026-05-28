import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@psychtest.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const hashedPassword = await hash(password, 12);
  await prisma.admin.create({
    data: { email, password: hashedPassword },
  });

  console.log(`Admin created: ${email}`);

  // Seed 4 sample student reports
  const students = [
    {
      studentName: "Arjun Mehta",
      mobile: "9876543210",
      classSection: "10-A",
      dateOfAssessment: new Date("2026-05-15"),
      scoreA: 4,
      scoreB: 2,
      scoreC: 3,
      scoreD: 1,
    },
    {
      studentName: "Priya Sharma",
      mobile: "9876543211",
      classSection: "10-B",
      dateOfAssessment: new Date("2026-05-16"),
      scoreA: 1,
      scoreB: 5,
      scoreC: 2,
      scoreD: 2,
    },
    {
      studentName: "Rohan Gupta",
      mobile: "9876543212",
      classSection: "10-A",
      dateOfAssessment: new Date("2026-05-17"),
      scoreA: 2,
      scoreB: 1,
      scoreC: 5,
      scoreD: 2,
    },
    {
      studentName: "Sneha Patel",
      mobile: "9876543213",
      classSection: "10-C",
      dateOfAssessment: new Date("2026-05-18"),
      scoreA: 1,
      scoreB: 2,
      scoreC: 1,
      scoreD: 6,
    },
  ];

  for (const student of students) {
    const exists = await prisma.report.findUnique({
      where: { mobile: student.mobile },
    });
    if (!exists) {
      await prisma.report.create({
        data: { ...student, pdfPath: "" },
      });
      console.log(`Created report: ${student.studentName} (${student.mobile})`);
    } else {
      console.log(`Already exists: ${student.studentName} (${student.mobile})`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
