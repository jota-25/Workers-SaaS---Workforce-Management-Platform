import { PrismaClient } from "@prisma/client";
console.log("DATABASE_URL:", process.env.DATABASE_URL);
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}