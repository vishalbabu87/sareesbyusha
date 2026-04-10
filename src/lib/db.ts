import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// Standard Prisma Edge pattern: Global instance with explicit Accelerate config
const createPrismaClient = () => {
    // Try multiple ways to find the DATABASE_URL (Cloudflare can be tricky)
    const url = process.env.DATABASE_URL || 
                (globalThis as any).DATABASE_URL || 
                (globalThis as any).env?.DATABASE_URL;

    if (!url) {
        // We throw a helpful error that our debug endpoints can catch
        throw new Error('DATABASE_URL is missing. Please check your Cloudflare Variables.');
    }

    return new PrismaClient({
        datasources: {
            db: { url }
        },
        log: ['error'], 
    }).$extends(withAccelerate());
};

// Use globalThis to cache the instance in production (Edge compatible)
const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof createPrismaClient>;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = db;
}
