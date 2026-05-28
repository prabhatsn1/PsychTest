"use server";

import { prisma } from "@/lib/prisma";

export async function checkDbConnection(): Promise<{
  connected: boolean;
  mock: boolean;
}> {
  const mock = process.env.USE_MOCK_DB === "true";
  try {
    await (prisma as any).$queryRaw`SELECT 1`;
    return { connected: true, mock };
  } catch {
    return { connected: false, mock };
  }
}
