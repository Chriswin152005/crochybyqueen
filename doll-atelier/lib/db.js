const { PrismaClient } = require("@prisma/client");

// Prevents "too many connections" during Next.js dev hot-reload
const globalForPrisma = globalThis;

const db = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

module.exports = { db };
