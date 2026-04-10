import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

/**
 * WORKER-NATIVE DATABASE CLIENT
 * 
 * In a Cloudflare Worker, the most reliable way to get environment variables 
 * is from the 'env' object passed at request time. 
 * We use a proxy to ensure we always use the latest environment.
 */

export const db = new Proxy({} as any, {
    get(target, prop) {
        // Look for the URL in the global context (Cloudflare Workers)
        const url = (globalThis as any).DATABASE_URL || 
                    (globalThis as any).process?.env?.DATABASE_URL ||
                    (globalThis as any).env?.DATABASE_URL;

        if (!url) {
            throw new Error('DATABASE_URL is missing. Please check your Worker environment variables.');
        }

        const prisma = new PrismaClient({
            datasources: { db: { url } }
        }).$extends(withAccelerate());

        return (prisma as any)[prop];
    }
});
