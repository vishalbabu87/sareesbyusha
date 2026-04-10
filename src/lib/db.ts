import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

/**
 * DATABASE INITIALIZATION (Cloudflare Edge Optimized)
 * 
 * Research shows that accessing process.env at the top level can be flaky on Cloudflare.
 * We use a Lazy Singleton pattern to ensure the URL is read exactly when needed.
 */

const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof createPrismaClient>;
};

function createPrismaClient() {
    // Robust environment variable lookup
    const url = process.env.DATABASE_URL || 
                (globalThis as any).DATABASE_URL || 
                (globalThis as any).env?.DATABASE_URL;

    if (!url) {
        console.error('CRITICAL: DATABASE_URL is missing in the current environment.');
        throw new Error('DATABASE_URL is missing. Please check your Cloudflare Secrets/Variables.');
    }

    return new PrismaClient({
        datasources: {
            db: { url }
        },
        log: ['error'], 
    }).$extends(withAccelerate());
}

// Singleton prevents exhausting database connections in development
export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = db;
}
