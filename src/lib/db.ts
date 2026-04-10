import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// Cache for the database instance
let prismaInstance: any = null;

export const db = new Proxy({} as any, {
  get(target, prop) {
    if (!prismaInstance) {
      console.log('Initializing Prisma Client...');
      prismaInstance = new PrismaClient({
        log: ['error'], // Keep it quiet on production
      }).$extends(withAccelerate());
    }
    return prismaInstance[prop];
  }
});
