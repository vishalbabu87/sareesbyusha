export const runtime = 'edge';
import { NextResponse } from 'next/server';

// Zero-Prisma debug endpoint - just checks environment variables
export async function GET() {
  const dbUrl = process.env.DATABASE_URL || '';
  
  return NextResponse.json({
    status: 'env-check',
    database_url_present: !!dbUrl,
    database_url_length: dbUrl.length,
    database_url_prefix: dbUrl.substring(0, 20) || 'EMPTY',
    node_env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
