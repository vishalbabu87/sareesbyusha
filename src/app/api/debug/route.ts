export const runtime = 'edge';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Force a simple query to test connection
    const userCount = await (db as any).user.count();
    
    return NextResponse.json({
      status: 'success',
      runtime: 'edge',
      database_url: process.env.DATABASE_URL ? 'PRESENT' : 'MISSING',
      user_count: userCount
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error?.message || 'Unknown database error',
      stack: error?.stack,
      env: {
          DATABASE_URL: process.env.DATABASE_URL ? 'PRESENT' : 'MISSING'
      }
    }, { status: 500 });
  }
}
