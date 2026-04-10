export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { requireSessionUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireSessionUser();
    const { id } = await params;

    // Check if saree exists and belongs to user
    const saree = await db.saree.findFirst({
      where: { id, ownerId: user.id },
    });

    if (!saree) {
      return NextResponse.json({ error: 'Saree not found' }, { status: 404 });
    }

    // Delete related records first
    await db.sale.deleteMany({
      where: { sareeId: id },
    });

    await db.expense.deleteMany({
      where: { linkedSareeId: id },
    });

    // Delete the saree
    await db.saree.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting saree:', error);
    return NextResponse.json({ error: 'Failed to delete saree' }, { status: 500 });
  }
}
