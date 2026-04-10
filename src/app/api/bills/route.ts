export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { requireSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

async function fileToDataUrl(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');
  const mimeType = file.type || 'application/octet-stream';
  return `data:${mimeType};base64,${base64}`;
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser();
    const formData = await request.formData();

    const supplierName = String(formData.get('supplierName') ?? '').trim();
    const totalAmount = Number(formData.get('totalAmount') ?? 0);
    const uploadDate = String(formData.get('uploadDate') ?? '');
    const notes = String(formData.get('notes') ?? '').trim();
    const file = formData.get('file');

    if (!supplierName || !totalAmount || !uploadDate) {
      return NextResponse.json({ error: 'Supplier, amount, and upload date are required.' }, { status: 400 });
    }

    let fileName: string | undefined;
    let fileType: string | undefined;
    let fileUrl: string | undefined;

    if (file instanceof File && file.size > 0) {
      fileName = file.name;
      fileType = file.type;
      // Limit size to ~1.5MB for database storage
      if (file.size > 1_600_000) {
        return NextResponse.json({ error: 'File too large. Max 1.5MB allowed.' }, { status: 400 });
      }
      fileUrl = await fileToDataUrl(file);
    }

    const bill = await db.bill.create({
      data: {
        ownerId: user.id,
        supplierName,
        totalAmount: Math.round(totalAmount),
        uploadDate: new Date(uploadDate),
        notes,
        fileName,
        fileType,
        fileUrl,
      },
    });

    return NextResponse.json({
      id: bill.id,
      supplierName: bill.supplierName,
      totalAmount: bill.totalAmount,
      uploadDate: bill.uploadDate.toISOString().slice(0, 10),
      notes: bill.notes,
      fileName: bill.fileName ?? undefined,
      fileType: bill.fileType ?? undefined,
      fileDataUrl: bill.fileUrl ?? undefined,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Unable to save the bill.' }, { status: 500 });
  }
}
