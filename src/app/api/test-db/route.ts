export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';

export async function GET() {
  // Hardcoded for a 1-time connection test to confirm if the issue is Variable Mapping
  const TEST_URL = "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19uZzhuOFF3c2RkX25DWDdEakE5R0wiLCJhcGlfa2V5IjoiMDFLTldDMTkwN1lDTUE1NUtXOUJIQUtUVjYiLCJ0ZW5hbnRfaWQiOiI4YjEwYzZjOTk0MTk0OWQ4NDhiYjY2YzNiMzY2ODNiMWUzNDQ3YjQxZDUxOTI5MWVhNzU4ZmQwNTgwNGZlMzFjIiwiaW50ZXJuYWxfc2VjcmV0IjoiY2Q2M2YzNzQtZGRiOS00MjQzLWIwMjAtY2QzM2E1MWI1NzBiIn0.U2pCu_Y4tnRh_1_jHVopPXx9Ulwj5s1cWJ9xHIQAqE4";

  try {
    console.log('Force-connecting to DB...');
    const prisma = new PrismaClient({
      datasources: { db: { url: TEST_URL } }
    }).$extends(withAccelerate());

    const count = await (prisma as any).saree.count();
    
    return NextResponse.json({
      status: 'success',
      message: 'Direct connection works!',
      saree_count: count,
      connection: 'hardcoded'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error?.message || 'Database connection failed',
      details: error,
      url_length: TEST_URL.length
    }, { status: 500 });
  }
}
