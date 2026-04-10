import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as { prisma: any };

function createClient() {
  const url =
    process.env.DATABASE_URL ||
    (globalThis as any).DATABASE_URL ||
    (globalThis as any).env?.DATABASE_URL;

  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Add it in Vercel → Settings → Environment Variables.'
    );
  }

  return new PrismaClient({
    datasources: { db: { url } },
    log: ['error'],
  }).$extends(withAccelerate());
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
