import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// Simple lazy client - created on first use, not at import time
let _prisma: any = null;

export function getDb() {
  if (_prisma) return _prisma;

  const url =
    process.env.DATABASE_URL ||
    (globalThis as any).DATABASE_URL ||
    (globalThis as any).env?.DATABASE_URL;

  if (!url) {
    throw new Error(
      '[Saree Studio] DATABASE_URL is not set. ' +
      'Add it in Vercel → Project Settings → Environment Variables, then redeploy.'
    );
  }

  _prisma = new PrismaClient({
    datasources: { db: { url } },
    log: ['error'],
  }).$extends(withAccelerate());

  return _prisma;
}

// Keep `db` as a named export for backwards compatibility
// but it's now a getter function call, not a module-level object
export const db = {
  get user() { return getDb().user; },
  get session() { return getDb().session; },
  get saree() { return getDb().saree; },
  get expense() { return getDb().expense; },
  get sale() { return getDb().sale; },
  get bill() { return getDb().bill; },
  $transaction: (...args: any[]) => getDb().$transaction(...args),
  $connect: () => getDb().$connect(),
  $disconnect: () => getDb().$disconnect(),
};
