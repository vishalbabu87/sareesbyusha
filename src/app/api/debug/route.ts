export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    const dbUrlStatus = dbUrl ? `PRESENT (Length: ${dbUrl.length})` : 'MISSING';
    
    // Attempt a light query
    const userCount = await db.user.count();
    
    return NextResponse.json({
      status: 'success',
      database_url: dbUrlStatus,
      user_count: userCount,
      runtime: 'edge',
      time: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      database_url: process.env.DATABASE_URL ? 'PRESENT' : 'MISSING',
      error: error?.message || 'Unknown error',
      stack: error?.stack,
    }, { status: 500 });
  }
}
