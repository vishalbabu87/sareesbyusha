export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { fileToDataUrl } from '@/lib/base64';

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();

    // Parse FormData
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const collection = formData.get('collection') as string;
    const fabric = formData.get('fabric') as string;
    const color = formData.get('color') as string;
    const sourceMarket = formData.get('sourceMarket') as string;
    const purchasePrice = Number(formData.get('purchasePrice'));
    const expectedSellingPrice = Number(formData.get('expectedSellingPrice'));
    const purchaseDate = formData.get('purchaseDate') as string;
    const notes = formData.get('notes') as string;
    const billId = formData.get('billId') as string;
    const sku = formData.get('sku') as string;
    const lotNumber = formData.get('lotNumber') as string;
    const imageFile = formData.get('image') as File | null;

    // Validate required fields
    if (!name || !sku || isNaN(purchasePrice) || isNaN(expectedSellingPrice)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Process image if present
    let imageUrl: string | null = null;
    if (imageFile && imageFile.size > 0) {
      // Limit size to ~1.5MB for data URL storage
      if (imageFile.size > 1_600_000) {
        return NextResponse.json({ error: 'Image too large. Max 1.5MB allowed.' }, { status: 400 });
      }
      imageUrl = await fileToDataUrl(imageFile, 'image/jpeg');
    }

    const saree = await db.saree.create({
      data: {
        ownerId: user.id,
        sku: sku.trim(),
        name: name.trim(),
        collection: collection?.trim() || 'General',
        fabric: fabric?.trim() || 'Mixed',
        color: color?.trim() || 'Not specified',
        sourceMarket: sourceMarket?.trim() || 'Direct',
        purchasePrice: Math.round(purchasePrice),
        expectedSellingPrice: Math.round(expectedSellingPrice),
        purchaseDate: new Date(purchaseDate),
        notes: notes?.trim() ?? '',
        billId: billId || null,
        status: 'UNSOLD',
        imageUrl: imageUrl,
        lotNumber: lotNumber?.trim() || null,
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
      imageUrl: saree.imageUrl ?? undefined,
      lotNumber: saree.lotNumber ?? undefined,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating saree:', error);
    return NextResponse.json({ error: 'Unable to save the saree right now.' }, { status: 500 });
  }
}
