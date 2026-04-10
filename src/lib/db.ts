import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

// Cache for the database instance
let prismaInstance: any = null;

export const db = new Proxy({} as any, {
  get(target, prop) {
    if (!prismaInstance) {
      console.log('Initializing Prisma Client...');
      const url = process.env.DATABASE_URL;
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
