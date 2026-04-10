export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

const schema = z.object({
  sareeId: z.string().min(1),
  sellingPrice: z.coerce.number().positive(),
  date: z.string().min(1),
  customerName: z.string().optional(),
  paymentMethod: z.enum(['UPI', 'CASH', 'BANK_TRANSFER', 'CARD']),
});

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const payload = schema.parse(await request.json());

    const saree = await db.saree.findFirst({
      where: {
        id: payload.sareeId,
        ownerId: user.id,
      },
    });

    if (!saree) {
      return NextResponse.json({ error: 'Saree not found.' }, { status: 404 });
    }

    const [sale] = await db.$transaction([
      db.sale.upsert({
        where: {
          sareeId: payload.sareeId,
        },
        update: {
          sellingPrice: Math.round(payload.sellingPrice),
          date: new Date(payload.date),
          customerName: payload.customerName?.trim() || null,
          paymentMethod: payload.paymentMethod,
        },
        create: {
          ownerId: user.id,
          sareeId: payload.sareeId,
          sellingPrice: Math.round(payload.sellingPrice),
          date: new Date(payload.date),
          customerName: payload.customerName?.trim() || null,
          paymentMethod: payload.paymentMethod,
        },
      }),
      db.saree.update({
        where: { id: payload.sareeId },
        data: {
          status: 'SOLD',
          soldDate: new Date(payload.date),
        },
      }),
    ]);

    return NextResponse.json({
      id: sale.id,
      sareeId: sale.sareeId,
      sellingPrice: sale.sellingPrice,
      date: sale.date.toISOString().slice(0, 10),
      customerName: sale.customerName ?? undefined,
      paymentMethod: sale.paymentMethod,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Unable to record the sale.' }, { status: 500 });
  }
}
