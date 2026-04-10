export type SareeStatus = "UNSOLD" | "RESERVED" | "SOLD";
export type ExpenseScope = "GLOBAL" | "SAREE" | "BILL";
export type PaymentMethod = "UPI" | "CASH" | "BANK_TRANSFER" | "CARD";

export interface BillRecord {
  id: string;
  supplierName: string;
  totalAmount: number;
  uploadDate: string;
  notes: string;
  fileName?: string;
  fileType?: string;
  fileDataUrl?: string;
}

export interface SareeRecord {
  id: string;
  sku: string;
  name: string;
  collection: string;
  fabric: string;
  color: string;
  sourceMarket: string;
  purchasePrice: number;
  expectedSellingPrice: number;
  status: SareeStatus;
  purchaseDate: string;
  soldDate?: string;
  notes: string;
  billId?: string;
  imageUrl?: string;
  lotNumber?: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  scope: ExpenseScope;
  linkedSareeId?: string;
  linkedBillId?: string;
  notes?: string;
}

export interface SaleRecord {
  id: string;
  sareeId: string;
  sellingPrice: number;
  date: string;
  customerName?: string;
  paymentMethod: PaymentMethod;
}

export interface BusinessData {
  sarees: SareeRecord[];
  expenses: ExpenseRecord[];
  bills: BillRecord[];
  sales: SaleRecord[];
  lastUpdated: string;
}

export interface SareeSnapshot {
  saree: SareeRecord;
  sale?: SaleRecord;
  allocatedExpense: number;
  realizedProfit: number | null;
  projectedProfit: number;
}

export interface DashboardSummary {
  totalInvestment: number;
  totalRevenue: number;
  totalExpenses: number;
  realizedProfit: number;
  projectedProfit: number;
  unsoldStockValue: number;
  projectedUnsoldRevenue: number;
  totalCount: number;
  soldCount: number;
  reservedCount: number;
  sellThrough: number;
  averageTicket: number;
  topExpenseCategory: string;
}

export interface MonthlyPerformanceRow {
  key: string;
  label: string;
  investment: number;
  revenue: number;
  expenses: number;
  net: number;
}

export interface ExpenseBreakdownRow {
  category: string;
  total: number;
  share: number;
}

const now = new Date();
const year = now.getFullYear();

export const expenseScopeOptions: ExpenseScope[] = ["GLOBAL", "SAREE", "BILL"];
export const paymentMethodOptions: PaymentMethod[] = ["UPI", "CASH", "BANK_TRANSFER", "CARD"];
export const statusOptions: Array<SareeStatus | "ALL"> = ["ALL", "UNSOLD", "RESERVED", "SOLD"];
export const defaultExpenseCategories = ["Travel", "Packaging", "Food", "Parking", "Marketing", "Helpers"];

export const demoData: BusinessData = {
  sarees: [
    {
      id: "saree-1",
      sku: "BAN-101",
      name: "Midnight Teal Banarasi",
      collection: "Wedding Loom",
      fabric: "Katan Silk",
      color: "Teal and antique gold",
      sourceMarket: "Varanasi",
      purchasePrice: 6200,
      expectedSellingPrice: 9400,
      status: "SOLD",
      purchaseDate: `${year}-01-14`,
      soldDate: `${year}-02-01`,
      notes: "Heavy pallu and zari border.",
      billId: "bill-1",
    },
    {
      id: "saree-2",
      sku: "ORG-204",
      name: "Rose Copper Organza",
      collection: "Festive Edit",
      fabric: "Organza",
      color: "Rose copper",
      sourceMarket: "Surat",
      purchasePrice: 2800,
      expectedSellingPrice: 4600,
      status: "RESERVED",
      purchaseDate: `${year}-02-03`,
      notes: "Client wants blouse embroidery added.",
      billId: "bill-2",
    },
    {
      id: "saree-3",
      sku: "LIN-117",
      name: "Handloom Linen Story",
      collection: "Daily Grace",
      fabric: "Linen",
      color: "Oatmeal and rust",
      sourceMarket: "Phulia",
      purchasePrice: 2100,
      expectedSellingPrice: 3700,
      status: "UNSOLD",
      purchaseDate: `${year}-02-16`,
      notes: "Easy drape. Good for repeat customers.",
      billId: "bill-2",
    },
    {
      id: "saree-4",
      sku: "KNC-306",
      name: "Temple Border Kanchi",
      collection: "Bridal Reserve",
      fabric: "Silk Blend",
      color: "Vermilion and brass",
      sourceMarket: "Kanchipuram",
      purchasePrice: 7400,
      expectedSellingPrice: 11200,
      status: "SOLD",
      purchaseDate: `${year}-03-05`,
      soldDate: `${year}-03-25`,
      notes: "Fast mover during festive live sale.",
      billId: "bill-3",
    },
    {
      id: "saree-5",
      sku: "COT-412",
      name: "Mango Border Cotton",
      collection: "Summer Rack",
      fabric: "Mercerized Cotton",
      color: "Ivory and mango",
      sourceMarket: "Kolkata",
      purchasePrice: 1650,
      expectedSellingPrice: 2850,
      status: "UNSOLD",
      purchaseDate: `${year}-03-28`,
      notes: "Great for combo offers.",
      billId: "bill-4",
    },
    {
      id: "saree-6",
      sku: "TIS-509",
      name: "Moonstone Tissue Drape",
      collection: "Reception Capsule",
      fabric: "Tissue Silk",
      color: "Silver taupe",
      sourceMarket: "Bengaluru",
      purchasePrice: 5300,
      expectedSellingPrice: 8100,
      status: "SOLD",
      purchaseDate: `${year}-04-02`,
      soldDate: `${year}-04-06`,
      notes: "Sold after private WhatsApp preview.",
      billId: "bill-4",
    },
  ],
  expenses: [
    {
      id: "expense-1",
      title: "Ahmedabad sourcing cab",
      category: "Travel",
      amount: 1800,
      date: `${year}-01-15`,
      scope: "GLOBAL",
      notes: "Airport pickup and market hopping.",
    },
    {
      id: "expense-2",
      title: "Luxury blouse finishing",
      category: "Helpers",
      amount: 450,
      date: `${year}-02-05`,
      scope: "SAREE",
      linkedSareeId: "saree-2",
      notes: "Custom tassels for reserved client.",
    },
    {
      id: "expense-3",
      title: "Warehouse packaging set",
      category: "Packaging",
      amount: 980,
      date: `${year}-03-05`,
      scope: "BILL",
      linkedBillId: "bill-3",
      notes: "Boxes and tissue wraps.",
    },
    {
      id: "expense-4",
      title: "Festival launch reel ads",
      category: "Marketing",
      amount: 2200,
      date: `${year}-03-18`,
      scope: "GLOBAL",
      notes: "Instagram boost for festive drop.",
    },
  ],
  bills: [
    {
      id: "bill-1",
      supplierName: "Bharat Loom House",
      totalAmount: 6200,
      uploadDate: `${year}-01-14`,
      notes: "One premium Banarasi pickup.",
    },
    {
      id: "bill-2",
      supplierName: "Surat Edit Studio",
      totalAmount: 4900,
      uploadDate: `${year}-02-16`,
      notes: "Organza and linen mix bill.",
    },
    {
      id: "bill-3",
      supplierName: "South Silk Junction",
      totalAmount: 7400,
      uploadDate: `${year}-03-05`,
      notes: "Bridal reserve purchase.",
    },
    {
      id: "bill-4",
      supplierName: "Curated Textile Yard",
      totalAmount: 6950,
      uploadDate: `${year}-04-02`,
      notes: "Summer cotton plus tissue silk.",
    },
  ],
  sales: [
    {
      id: "sale-1",
      sareeId: "saree-1",
      sellingPrice: 9550,
      date: `${year}-02-01`,
      customerName: "Asha Nair",
      paymentMethod: "UPI",
    },
    {
      id: "sale-2",
      sareeId: "saree-4",
      sellingPrice: 11800,
      date: `${year}-03-25`,
      customerName: "Ritika Shah",
      paymentMethod: "BANK_TRANSFER",
    },
    {
      id: "sale-3",
      sareeId: "saree-6",
      sellingPrice: 8350,
      date: `${year}-04-06`,
      customerName: "Private preview client",
      paymentMethod: "CARD",
    },
  ],
  lastUpdated: now.toISOString(),
};

export function createId(prefix: string) {
  const token =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `${prefix}-${token}`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

export function normalizeData(input: Partial<BusinessData> | null | undefined): BusinessData {
  return {
    sarees: input?.sarees ?? demoData.sarees,
    expenses: input?.expenses ?? demoData.expenses,
    bills: input?.bills ?? demoData.bills,
    sales: input?.sales ?? demoData.sales,
    lastUpdated: input?.lastUpdated ?? demoData.lastUpdated,
  };
}

export function getAllocatedExpenseForSaree(saree: SareeRecord, data: BusinessData) {
  const direct = data.expenses
    .filter((expense) => expense.scope === "SAREE" && expense.linkedSareeId === saree.id)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const relatedBillExpenses = saree.billId
    ? data.expenses.filter((expense) => expense.scope === "BILL" && expense.linkedBillId === saree.billId)
    : [];

  const batchCount = saree.billId
    ? data.sarees.filter((item) => item.billId === saree.billId).length || 1
    : 1;

  const batchShare = relatedBillExpenses.reduce((sum, expense) => sum + expense.amount, 0) / batchCount;

  const globalExpenses = data.expenses
    .filter((expense) => expense.scope === "GLOBAL")
    .reduce((sum, expense) => sum + expense.amount, 0);

  const globalShare = data.sarees.length ? globalExpenses / data.sarees.length : 0;

  return direct + batchShare + globalShare;
}

export function getSareeSnapshot(saree: SareeRecord, data: BusinessData): SareeSnapshot {
  const sale = data.sales.find((entry) => entry.sareeId === saree.id);
  const allocatedExpense = getAllocatedExpenseForSaree(saree, data);
  const realizedProfit = sale ? sale.sellingPrice - saree.purchasePrice - allocatedExpense : null;
  const projectedRevenue = sale ? sale.sellingPrice : saree.expectedSellingPrice;

  return {
    saree,
    sale,
    allocatedExpense,
    realizedProfit,
    projectedProfit: projectedRevenue - saree.purchasePrice - allocatedExpense,
  };
}

export function getDashboardSummary(data: BusinessData): DashboardSummary {
  const snapshots = data.sarees.map((saree) => getSareeSnapshot(saree, data));
  const soldCount = data.sarees.filter((saree) => saree.status === "SOLD").length;
  const reservedCount = data.sarees.filter((saree) => saree.status === "RESERVED").length;
  const totalInvestment = data.sarees.reduce((sum, saree) => sum + saree.purchasePrice, 0);
  const totalRevenue = data.sales.reduce((sum, sale) => sum + sale.sellingPrice, 0);
  const totalExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const realizedProfit = snapshots.reduce((sum, snapshot) => sum + (snapshot.realizedProfit ?? 0), 0);
  const projectedProfit = snapshots.reduce((sum, snapshot) => sum + snapshot.projectedProfit, 0);
  const unsold = data.sarees.filter((saree) => saree.status !== "SOLD");
  const unsoldStockValue = unsold.reduce((sum, saree) => sum + saree.purchasePrice, 0);
  const projectedUnsoldRevenue = unsold.reduce((sum, saree) => sum + saree.expectedSellingPrice, 0);
  const expenseBuckets = getExpenseBreakdown(data);

  return {
    totalInvestment,
    totalRevenue,
    totalExpenses,
    realizedProfit,
    projectedProfit,
    unsoldStockValue,
    projectedUnsoldRevenue,
    totalCount: data.sarees.length,
    soldCount,
    reservedCount,
    sellThrough: data.sarees.length ? soldCount / data.sarees.length : 0,
    averageTicket: data.sales.length ? totalRevenue / data.sales.length : 0,
    topExpenseCategory: expenseBuckets[0]?.category ?? "No expense data",
  };
}

function getMonthKey(value: string) {
  return new Date(value).toISOString().slice(0, 7);
}

export function getMonthlyPerformance(data: BusinessData, monthsBack = 6): MonthlyPerformanceRow[] {
  const rows: MonthlyPerformanceRow[] = [];
  const cursor = new Date(now.getFullYear(), now.getMonth(), 1);

  for (let index = monthsBack - 1; index >= 0; index -= 1) {
    const monthDate = new Date(cursor.getFullYear(), cursor.getMonth() - index, 1);
    const key = monthDate.toISOString().slice(0, 7);
    const label = monthDate.toLocaleString("en-IN", { month: "short" });

    const investment = data.sarees
      .filter((saree) => getMonthKey(saree.purchaseDate) === key)
      .reduce((sum, saree) => sum + saree.purchasePrice, 0);

    const revenue = data.sales
      .filter((sale) => getMonthKey(sale.date) === key)
      .reduce((sum, sale) => sum + sale.sellingPrice, 0);

    const expenses = data.expenses
      .filter((expense) => getMonthKey(expense.date) === key)
      .reduce((sum, expense) => sum + expense.amount, 0);

    rows.push({
      key,
      label,
      investment,
      revenue,
      expenses,
      net: revenue - investment - expenses,
    });
  }

  return rows;
}

export function getExpenseBreakdown(data: BusinessData): ExpenseBreakdownRow[] {
  const totalExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = new Map<string, number>();

  data.expenses.forEach((expense) => {
    categoryTotals.set(expense.category, (categoryTotals.get(expense.category) ?? 0) + expense.amount);
  });

  return Array.from(categoryTotals.entries())
    .map(([category, total]) => ({
      category,
      total,
      share: totalExpenses ? total / totalExpenses : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function getTopSarees(data: BusinessData, limit = 3) {
  return data.sarees
    .map((saree) => getSareeSnapshot(saree, data))
    .sort((left, right) => right.projectedProfit - left.projectedProfit)
    .slice(0, limit);
}

export function getBusinessPulse(summary: DashboardSummary) {
  if (summary.realizedProfit < 0) {
    return "Your cash profit is still negative. Prioritize selling reserved stock before sourcing a new batch.";
  }

  if (summary.sellThrough >= 0.55) {
    return "Sell-through is healthy. This is a good week to test a premium edit or pre-book the next drop.";
  }

  return "Inventory is building up. Push one live sale or WhatsApp preview to unlock cash from existing stock.";
}
