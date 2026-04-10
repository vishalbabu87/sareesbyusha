import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

/**
 * ABSOLUTE ESSENTIALS CLIENT
 * No proxies, no clever logic. Just the standard Prisma pattern.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

const url = process.env.DATABASE_URL || (globalThis as any).DATABASE_URL;

export const db = globalForPrisma.prisma || new PrismaClient({
  datasources: { db: { url: url || '' } },
  log: ['error'],
}).$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
