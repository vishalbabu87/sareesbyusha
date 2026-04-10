import 'server-only';

import { PaymentMethod, SareeStatus, type ExpenseScope } from '@prisma/client';
import { demoData } from '@/lib/saree-control';
import type { BusinessData } from '@/lib/saree-control';
import { db } from '@/lib/db';

export async function getBusinessData(ownerId: string): Promise<BusinessData> {
  const [sarees, expenses, bills, sales] = await Promise.all([
    db.saree.findMany({
      where: { ownerId },
      orderBy: { purchaseDate: 'desc' },
    }),
    db.expense.findMany({
      where: { ownerId },
      orderBy: { date: 'desc' },
    }),
    db.bill.findMany({
      where: { ownerId },
      orderBy: { uploadDate: 'desc' },
    }),
    db.sale.findMany({
      where: { ownerId },
      orderBy: { date: 'desc' },
    }),
  ]);

  return {
    sarees: sarees.map((item: any) => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      collection: item.collection,
      fabric: item.fabric,
      color: item.color,
      sourceMarket: item.sourceMarket,
      purchasePrice: item.purchasePrice,
      expectedSellingPrice: item.expectedSellingPrice,
      status: item.status,
      purchaseDate: item.purchaseDate.toISOString().slice(0, 10),
      soldDate: item.soldDate?.toISOString().slice(0, 10),
      notes: item.notes,
      billId: item.billId ?? undefined,
      imageUrl: item.imageUrl ?? undefined,
      lotNumber: item.lotNumber ?? undefined,
    })),
    expenses: expenses.map((item: any) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      amount: item.amount,
      date: item.date.toISOString().slice(0, 10),
      scope: item.scope,
      linkedSareeId: item.linkedSareeId ?? undefined,
      linkedBillId: item.linkedBillId ?? undefined,
      notes: item.notes ?? undefined,
    })),
    bills: bills.map((item: any) => ({
      id: item.id,
      supplierName: item.supplierName,
      totalAmount: item.totalAmount,
      uploadDate: item.uploadDate.toISOString().slice(0, 10),
      notes: item.notes,
      fileName: item.fileName ?? undefined,
      fileType: item.fileType ?? undefined,
      fileDataUrl: item.fileUrl ?? undefined,
    })),
    sales: sales.map((item: any) => ({
      id: item.id,
      sareeId: item.sareeId,
      sellingPrice: item.sellingPrice,
      date: item.date.toISOString().slice(0, 10),
      customerName: item.customerName ?? undefined,
      paymentMethod: item.paymentMethod,
    })),
    lastUpdated: new Date().toISOString(),
  };
}

export async function seedDemoWorkspace(ownerId: string) {
  const existing = await db.saree.count({ where: { ownerId } });
  if (existing > 0) {
    return;
  }

  await db.$transaction(async (tx: any) => {
    for (const bill of demoData.bills) {
      await tx.bill.create({
        data: {
          id: bill.id,
          ownerId,
          supplierName: bill.supplierName,
          totalAmount: bill.totalAmount,
          uploadDate: new Date(bill.uploadDate),
          notes: bill.notes,
          fileName: bill.fileName,
          fileType: bill.fileType,
          fileUrl: bill.fileDataUrl,
        },
      });
    }

    for (const saree of demoData.sarees) {
      await tx.saree.create({
        data: {
          id: saree.id,
          ownerId,
          sku: saree.sku,
          name: saree.name,
          collection: saree.collection,
          fabric: saree.fabric,
          color: saree.color,
          sourceMarket: saree.sourceMarket,
          purchasePrice: saree.purchasePrice,
          expectedSellingPrice: saree.expectedSellingPrice,
          status: saree.status as SareeStatus,
          purchaseDate: new Date(saree.purchaseDate),
          soldDate: saree.soldDate ? new Date(saree.soldDate) : undefined,
          notes: saree.notes,
          billId: saree.billId,
        },
      });
    }

    for (const expense of demoData.expenses) {
      await tx.expense.create({
        data: {
          id: expense.id,
          ownerId,
          title: expense.title,
          category: expense.category,
          amount: expense.amount,
          date: new Date(expense.date),
          scope: expense.scope as ExpenseScope,
          linkedSareeId: expense.linkedSareeId,
          linkedBillId: expense.linkedBillId,
          notes: expense.notes,
        },
      });
    }

    for (const sale of demoData.sales) {
      await tx.sale.create({
        data: {
          id: sale.id,
          ownerId,
          sareeId: sale.sareeId,
          sellingPrice: sale.sellingPrice,
          date: new Date(sale.date),
          customerName: sale.customerName,
          paymentMethod: sale.paymentMethod as PaymentMethod,
        },
      });
    }
  });
}
