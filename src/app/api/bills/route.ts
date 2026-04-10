export const runtime = 'edge';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { requireSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

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
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'bills');
      await mkdir(uploadsDir, { recursive: true });
      const ext = path.extname(file.name) || '.bin';
      const safeName = `${randomUUID()}${ext}`;
      const filePath = path.join(uploadsDir, safeName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);
      fileUrl = `/uploads/bills/${safeName}`;
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
