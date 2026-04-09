import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

const schema = z.object({
  name: z.string().min(2),
  collection: z.string().min(1),
  fabric: z.string().min(1),
  color: z.string().min(1),
  sourceMarket: z.string().min(1),
  purchasePrice: z.coerce.number().nonnegative(),
  expectedSellingPrice: z.coerce.number().nonnegative(),
  purchaseDate: z.string().min(1),
  notes: z.string().optional(),
  billId: z.string().optional(),
  sku: z.string().min(3),
});

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const payload = schema.parse(await request.json());

    const saree = await db.saree.create({
      data: {
        ownerId: user.id,
        sku: payload.sku,
        name: payload.name.trim(),
        collection: payload.collection.trim(),
        fabric: payload.fabric.trim(),
        color: payload.color.trim(),
        sourceMarket: payload.sourceMarket.trim(),
        purchasePrice: Math.round(payload.purchasePrice),
        expectedSellingPrice: Math.round(payload.expectedSellingPrice),
        purchaseDate: new Date(payload.purchaseDate),
        notes: payload.notes?.trim() ?? '',
        billId: payload.billId || null,
        status: 'UNSOLD',
      },
    });

    return NextResponse.json({
      id: saree.id,
      sku: saree.sku,
      name: saree.name,
      collection: saree.collection,
      fabric: saree.fabric,
      color: saree.color,
      sourceMarket: saree.sourceMarket,
      purchasePrice: saree.purchasePrice,
      expectedSellingPrice: saree.expectedSellingPrice,
      status: saree.status,
      purchaseDate: saree.purchaseDate.toISOString().slice(0, 10),
      soldDate: undefined,
      notes: saree.notes,
      billId: saree.billId ?? undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Unable to save the saree right now.' }, { status: 500 });
  }
}
