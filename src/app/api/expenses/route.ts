export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

const schema = z.object({
  title: z.string().min(2),
  category: z.string().min(2),
  amount: z.coerce.number().positive(),
  date: z.string().min(1),
  scope: z.enum(['GLOBAL', 'SAREE', 'BILL']),
  linkedSareeId: z.string().optional(),
  linkedBillId: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const payload = schema.parse(await request.json());

    const expense = await db.expense.create({
      data: {
        ownerId: user.id,
        title: payload.title.trim(),
        category: payload.category.trim(),
        amount: Math.round(payload.amount),
        date: new Date(payload.date),
        scope: payload.scope,
        linkedSareeId: payload.linkedSareeId || null,
        linkedBillId: payload.linkedBillId || null,
        notes: payload.notes?.trim(),
      },
    });

    return NextResponse.json({
      id: expense.id,
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      date: expense.date.toISOString().slice(0, 10),
      scope: expense.scope,
      linkedSareeId: expense.linkedSareeId ?? undefined,
      linkedBillId: expense.linkedBillId ?? undefined,
      notes: expense.notes ?? undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Unable to save the expense.' }, { status: 500 });
  }
}
