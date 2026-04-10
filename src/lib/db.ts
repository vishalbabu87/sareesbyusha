import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// Lazy singleton - only created on first actual query, not at import time
let _client: any = null;

function getClient() {
  if (_client) return _client;

  const url =
    process.env.DATABASE_URL ||
    (globalThis as any).DATABASE_URL ||
    (globalThis as any).env?.DATABASE_URL;

  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Add it in Vercel → Settings → Environment Variables.'
    );
  }

  _client = new PrismaClient({
    datasources: { db: { url } },
    log: ['error'],
  }).$extends(withAccelerate());

  return _client;
}

// Proxy so `db.user.findMany()` etc. all work normally
// but the client is only created on the first actual method call
export const db = new Proxy({} as any, {
  get(_target, prop: string) {
    return (getClient() as any)[prop];
  },
});
