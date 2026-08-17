import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrisma() {
  const url = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), "dev.db")}`;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const adapter = new PrismaLibSql({ url, authToken } as any);
  return new PrismaClient({ adapter } as any);
}

export const db = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
