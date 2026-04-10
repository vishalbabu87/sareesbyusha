import { Prisma, PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('[db] DATABASE_URL is missing. Set it in Cloudflare Pages -> Settings -> Environment Variables.');
}

const prismaOptions: Prisma.PrismaClientOptions = {
  log: ['error'],
};

if (databaseUrl) {
  prismaOptions.datasources = { db: { url: databaseUrl } };
}

export const db =
  globalForPrisma.prisma || new PrismaClient(prismaOptions).$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
