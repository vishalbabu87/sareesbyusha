import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// Cache for the database instance
let prismaInstance: any = null;

export const db = new Proxy({} as any, {
  get(target, prop) {
    if (!prismaInstance) {
      console.log('Initializing Prisma Client for Edge...');
      
      // Try multiple ways to find the DATABASE_URL
      const url = process.env.DATABASE_URL || 
                  (globalThis as any).DATABASE_URL || 
                  (globalThis as any).env?.DATABASE_URL;

      if (!url) {
        throw new Error('DATABASE_URL is missing. Please check your Cloudflare Pages Variables.');
      }
      
      prismaInstance = new PrismaClient({
        datasources: {
          db: { url }
        },
        log: ['error'], 
      }).$extends(withAccelerate());
    }
    return prismaInstance[prop];
  }
});
