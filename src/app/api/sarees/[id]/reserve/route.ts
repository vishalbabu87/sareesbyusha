export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { requireSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;

    const current = await db.saree.findFirst({
      where: {
        id,
        ownerId: user.id,
      },
    });

    if (!current) {
      return NextResponse.json({ error: 'Saree not found.' }, { status: 404 });
    }

    if (current.status === 'SOLD') {
      return NextResponse.json({ error: 'Sold pieces cannot be changed.' }, { status: 400 });
    }

    const updated = await db.saree.update({
      where: { id },
      data: {
        status: current.status === 'RESERVED' ? 'UNSOLD' : 'RESERVED',
      },
    });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Unable to update this piece.' }, { status: 500 });
  }
}
