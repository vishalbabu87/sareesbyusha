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

    // Check if bill exists and belongs to user
    const bill = await db.bill.findFirst({
      where: { id, ownerId: user.id },
    });

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }

    // Delete related expenses first
    await db.expense.deleteMany({
      where: { linkedBillId: id },
    });

    // Update sarees to remove bill link
    await db.saree.updateMany({
      where: { billId: id },
      data: { billId: null },
    });

    // Delete the bill
    await db.bill.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bill:', error);
    return NextResponse.json({ error: 'Failed to delete bill' }, { status: 500 });
  }
}
