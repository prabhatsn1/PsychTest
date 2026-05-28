import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});

// Note: DATABASE_URL should be your Neon connection string
// e.g. postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
