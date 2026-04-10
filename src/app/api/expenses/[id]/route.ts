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

    // Check if expense exists and belongs to user
    const expense = await db.expense.findFirst({
      where: { id, ownerId: user.id },
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    // Delete the expense
    await db.expense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
