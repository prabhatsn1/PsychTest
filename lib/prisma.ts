import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { mockPrisma, type MockPrisma } from "./mock-prisma";

const useMock = process.env.USE_MOCK_DB === "true";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: PrismaClient | MockPrisma = useMock
  ? mockPrisma
  : (globalForPrisma.prisma || createPrismaClient());

if (!useMock && process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma as PrismaClient;
