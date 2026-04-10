import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

/**
 * EMERGENCY HARDCODED CLIENT
 * We are hardcoding the URL to bypass the Cloudflare Secret issues.
 * This is the 'One True Path' to get your site live RIGHT NOW.
 */

// Your actual Prisma Accelerate URL
const URL = "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19wZC1yLUFzbnNnY2g3cHJ4d1B6d0UiLCJhcGlfa2V5IjoiMDFLTldGMzVOMFdQSFhZUjBBQlA4UEhYV0siLCJ0ZW5hbnRfaWQiOiI4YjEwYzZjOTk0MTk0OWQ4NDhiYjY2YzNiMzY2ODNiMWUzNDQ3YjQxZDUxOTI5MWVhNzU4ZmQwNTgwNGZlMzFjIiwiaW50ZXJuYWxfc2VjcmV0IjoiY2Q2M2YzNzQtZGRiOS00MjQzLWIwMjAtY2QzM2E1MWI1NzBiIn0.E1rWQceVGD8oEXEXV_nuXDCQuN1oooG1YxXlCqk6ulw";

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

// We use the hardcoded URL as the primary source
export const db = globalForPrisma.prisma || new PrismaClient({
  datasources: { db: { url: URL } },
  log: ['error'],
}).$extends(withAccelerate());

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
