export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

export async function GET() {
  const testUrl = process.env.DATABASE_URL;

  if (!testUrl) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'DATABASE_URL is missing',
      },
      { status: 500 }
    );
  }

  try {
    console.log('Testing DB connection from env...');
    const prisma = new PrismaClient({
      datasources: { db: { url: testUrl } },
      log: ['error'],
    }).$extends(withAccelerate());

    const count = await (prisma as any).saree.count();

    return NextResponse.json({
      status: 'success',
      message: 'DB connection works!',
      saree_count: count,
      connection: 'environment-variable'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error?.message || 'Database connection failed',
      details: error
    }, { status: 500 });
  }
}
