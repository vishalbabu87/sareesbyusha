'use client';

import Image from 'next/image';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BadgeIndianRupee,
  Boxes,
  CalendarDays,
  Cloud,
  CloudUpload,
  Download,
  Filter,
  PackageCheck,
  PackagePlus,
  ReceiptText,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShieldEllipsis,
  Sparkles,
  Store,
  SwatchBook,
  TrendingUp,
  UserCircle2,
  WalletCards,
  Warehouse,
} from 'lucide-react';
import {
  defaultExpenseCategories,
  expenseScopeOptions,
  formatCurrency,
  formatDate,
  getAllocatedExpenseForSaree,
  getBusinessPulse,
  getDashboardSummary,
  getExpenseBreakdown,
  getMonthlyPerformance,
  getSareeSnapshot,
  getTopSarees,
  paymentMethodOptions,
  statusOptions,
} from '@/lib/saree-control';
import type {
  BillRecord,
  BusinessData,
  ExpenseRecord,
  ExpenseScope,
  PaymentMethod,
  SaleRecord,
  SareeRecord,
  SareeStatus,
} from '@/lib/saree-control';

const today = new Date().toISOString().slice(0, 10);

type SareeDraft = {
  name: string;
  collection: string;
  fabric: string;
  color: string;
  sourceMarket: string;
  purchasePrice: string;
  expectedSellingPrice: string;
  purchaseDate: string;
  notes: string;
  billId: string;
};

type ExpenseDraft = {
  title: string;
  category: string;
  amount: string;
  date: string;
  scope: ExpenseScope;
  linkedSareeId: string;
  linkedBillId: string;
  notes: string;
};

type BillDraft = {
  supplierName: string;
  totalAmount: string;
  uploadDate: string;
  notes: string;
  file: File | null;
};

type SaleDraft = {
  sareeId: string;
  sellingPrice: string;
  date: string;
  customerName: string;
  paymentMethod: PaymentMethod;
};

const emptySareeDraft: SareeDraft = {
  name: '',
  collection: '',
  fabric: '',
  color: '',
  sourceMarket: '',
  purchasePrice: '',
  expectedSellingPrice: '',
  purchaseDate: today,
  notes: '',
  billId: '',
};

const emptyExpenseDraft: ExpenseDraft = {
  title: '',
  category: defaultExpenseCategories[0],
  amount: '',
  date: today,
  scope: 'GLOBAL',
  linkedSareeId: '',
  linkedBillId: '',
  notes: '',
};

const emptyBillDraft: BillDraft = {
  supplierName: '',
  totalAmount: '',
  uploadDate: today,
  notes: '',
  file: null,
};

function createDefaultSaleDraft(data: BusinessData): SaleDraft {
  const nextSaree = data.sarees.find((saree) => saree.status !== 'SOLD');

  return {
    sareeId: nextSaree?.id ?? '',
    sellingPrice: nextSaree ? String(nextSaree.expectedSellingPrice) : '',
    date: today,
    customerName: '',
    paymentMethod: 'UPI',
  };
}

function shellCard(extra = '') {
  return `rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl ${extra}`;
}

function inputClasses() {
  return 'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[color:rgba(14,116,144,0.10)]';
}

function textareaClasses() {
  return `${inputClasses()} min-h-[110px] resize-none`;
}

function labelClasses() {
  return 'text-[11px] uppercase tracking-[0.28em] text-slate-500';
}

function createSku(name: string, count: number) {
  const base = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 3).toUpperCase())
    .join('');

  return `${base || 'SAR'}-${String(100 + count).slice(-3)}`;
}

function parseNumber(value: string) {
  return Number(value || 0);
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

function MetricCard({
  label,
  value,
  detail,
  accent,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  accent: string;
  icon: ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-[0_24px_80px_rgba(31,41,55,0.10)] backdrop-blur-xl transition duration-300 hover:-translate-y-1">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{label}</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{value}</p>
          <p className="mt-2 max-w-[24ch] text-sm leading-6 text-slate-600">{detail}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ${accent}`}>{icon}</div>
      </div>
    </div>
  );
}

function SectionShell({
  id,
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className={shellCard()}>
      <div className="flex flex-col gap-3 border-b border-slate-200/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-slate-500">{eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl text-slate-950 sm:text-[2.1rem]">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p>
        </div>
        {action}
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}

function StatusBadge({ status }: { status: SareeStatus }) {
  const styles: Record<SareeStatus, string> = {
    UNSOLD: 'bg-amber-100 text-amber-900 border-amber-200',
    RESERVED: 'bg-sky-100 text-sky-900 border-sky-200',
    SOLD: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  };

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.22em] ${styles[status]}`}>{status}</span>;
}

function ScopeBadge({ scope }: { scope: ExpenseScope }) {
  const labels: Record<ExpenseScope, string> = {
    GLOBAL: 'Shared',
    SAREE: 'Item',
    BILL: 'Batch',
  };

  return <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">{labels[scope]}</span>;
}

type SareeStudioAppProps = {
  initialData: BusinessData;
  userName: string;
  userEmail: string;
};

async function readError(response: Response) {
  try {
    const payload = await response.json();
    return payload.error ?? 'Something went wrong.';
  } catch {
    return 'Something went wrong.';
  }
}

export function SareeStudioApp({ initialData, userName, userEmail }: SareeStudioAppProps) {
  const [data, setData] = useState<BusinessData>(initialData);
  const [announcement, setAnnouncement] = useState('');
  const [inventoryQuery, setInventoryQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>('ALL');
  const [sareeDraft, setSareeDraft] = useState<SareeDraft>(emptySareeDraft);
  const [expenseDraft, setExpenseDraft] = useState<ExpenseDraft>(emptyExpenseDraft);
  const [billDraft, setBillDraft] = useState<BillDraft>(emptyBillDraft);
  const [saleDraft, setSaleDraft] = useState<SaleDraft>(createDefaultSaleDraft(initialData));
  const [billFileHint, setBillFileHint] = useState('');
  const saleDeskRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    setData(initialData);
    setSaleDraft(createDefaultSaleDraft(initialData));
  }, [initialData]);

  useEffect(() => {
    if (!announcement) {
      return undefined;
    }

    const timer = window.setTimeout(() => setAnnouncement(''), 3200);
    return () => window.clearTimeout(timer);
  }, [announcement]);

  const summary = useMemo(() => getDashboardSummary(data), [data]);
  const monthlyPerformance = useMemo(() => getMonthlyPerformance(data), [data]);
  const expenseBreakdown = useMemo(() => getExpenseBreakdown(data), [data]);
  const topSarees = useMemo(() => getTopSarees(data), [data]);
  const pulse = useMemo(() => getBusinessPulse(summary), [summary]);
  const categoryOptions = useMemo(
    () => Array.from(new Set([...defaultExpenseCategories, ...data.expenses.map((expense) => expense.category)])).sort(),
    [data.expenses],
  );

  const filteredSarees = useMemo(() => {
    return data.sarees
      .filter((saree) => {
        const haystack = `${saree.name} ${saree.collection} ${saree.fabric} ${saree.color} ${saree.sku}`.toLowerCase();
        const matchesQuery = haystack.includes(inventoryQuery.toLowerCase().trim());
        const matchesStatus = statusFilter === 'ALL' ? true : saree.status === statusFilter;
        return matchesQuery && matchesStatus;
      })
      .sort((left, right) => Number(new Date(right.purchaseDate)) - Number(new Date(left.purchaseDate)));
  }, [data.sarees, inventoryQuery, statusFilter]);

  const availableForSale = useMemo(() => data.sarees.filter((saree) => saree.status !== 'SOLD'), [data.sarees]);

  const maxChartValue = useMemo(() => {
    const values = monthlyPerformance.flatMap((row) => [row.revenue, row.investment, row.expenses]);
    return Math.max(...values, 1);
  }, [monthlyPerformance]);

  const quickSell = (saree: SareeRecord) => {
    setSaleDraft({
      sareeId: saree.id,
      sellingPrice: String(saree.expectedSellingPrice),
      date: today,
      customerName: '',
      paymentMethod: 'UPI',
    });
    saleDeskRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setAnnouncement(`Sale desk loaded with ${saree.name}.`);
  };

  const toggleReserve = async (sareeId: string) => {
    const response = await fetch(`/api/sarees/${sareeId}/reserve`, {
      method: 'POST',
    });

    if (!response.ok) {
      setAnnouncement(await readError(response));
      return;
    }

    const payload = await response.json();
    setData((current) => ({
      ...current,
      lastUpdated: new Date().toISOString(),
      sarees: current.sarees.map((saree) => (saree.id === sareeId ? { ...saree, status: payload.status } : saree)),
    }));
    setAnnouncement('Inventory status updated.');
  };

  const handleSareeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!sareeDraft.name || !sareeDraft.purchasePrice || !sareeDraft.expectedSellingPrice) {
      setAnnouncement('Add the saree name, purchase price, and expected selling price.');
      return;
    }

    const response = await fetch('/api/sarees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sku: createSku(sareeDraft.name, data.sarees.length + 1),
        name: sareeDraft.name.trim(),
        collection: sareeDraft.collection.trim() || 'Fresh Edit',
        fabric: sareeDraft.fabric.trim() || 'Mixed fabric',
        color: sareeDraft.color.trim() || 'Not specified',
        sourceMarket: sareeDraft.sourceMarket.trim() || 'Direct sourcing',
        purchasePrice: parseNumber(sareeDraft.purchasePrice),
        expectedSellingPrice: parseNumber(sareeDraft.expectedSellingPrice),
        purchaseDate: sareeDraft.purchaseDate,
        notes: sareeDraft.notes.trim(),
        billId: sareeDraft.billId || undefined,
      }),
    });

    if (!response.ok) {
      setAnnouncement(await readError(response));
      return;
    }

    const nextRecord: SareeRecord = await response.json();
    const nextData = {
      ...data,
      lastUpdated: new Date().toISOString(),
      sarees: [nextRecord, ...data.sarees],
    };

    setData(nextData);
    setSareeDraft(emptySareeDraft);
    setAnnouncement(`${nextRecord.name} has been added to inventory.`);
    setSaleDraft((current) => (current.sareeId ? current : createDefaultSaleDraft(nextData)));
  };

  const handleExpenseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!expenseDraft.title || !expenseDraft.amount) {
      setAnnouncement('Give the expense a title and amount before saving it.');
      return;
    }

    if (expenseDraft.scope === 'SAREE' && !expenseDraft.linkedSareeId) {
      setAnnouncement('Choose the saree for this expense.');
      return;
    }

    if (expenseDraft.scope === 'BILL' && !expenseDraft.linkedBillId) {
      setAnnouncement('Choose the bill batch for this expense.');
      return;
    }

    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: expenseDraft.title.trim(),
        category: expenseDraft.category.trim(),
        amount: parseNumber(expenseDraft.amount),
        date: expenseDraft.date,
        scope: expenseDraft.scope,
        linkedSareeId: expenseDraft.scope === 'SAREE' ? expenseDraft.linkedSareeId : undefined,
        linkedBillId: expenseDraft.scope === 'BILL' ? expenseDraft.linkedBillId : undefined,
        notes: expenseDraft.notes.trim() || undefined,
      }),
    });

    if (!response.ok) {
      setAnnouncement(await readError(response));
      return;
    }

    const nextExpense: ExpenseRecord = await response.json();
    setData((current) => ({ ...current, lastUpdated: new Date().toISOString(), expenses: [nextExpense, ...current.expenses] }));
    setExpenseDraft(emptyExpenseDraft);
    setAnnouncement('Expense captured and included in profit calculation.');
  };

  const handleBillFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setBillDraft((current) => ({ ...current, file }));

    if (!file) {
      setBillFileHint('');
      return;
    }

    if (file.size > 1_600_000) {
      setBillFileHint('Large files will save metadata only in this MVP.');
      return;
    }

    setBillFileHint(`${file.name} is ready to attach.`);
  };

  const handleBillSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!billDraft.supplierName || !billDraft.totalAmount) {
      setAnnouncement('Add the supplier and bill total before saving the bill.');
      return;
    }

    const formData = new FormData();
    formData.set('supplierName', billDraft.supplierName.trim());
    formData.set('totalAmount', String(parseNumber(billDraft.totalAmount)));
    formData.set('uploadDate', billDraft.uploadDate);
    formData.set('notes', billDraft.notes.trim());
    if (billDraft.file) {
      formData.set('file', billDraft.file);
    }

    const response = await fetch('/api/bills', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      setAnnouncement(await readError(response));
      return;
    }

    const nextBill: BillRecord = await response.json();
    setData((current) => ({ ...current, lastUpdated: new Date().toISOString(), bills: [nextBill, ...current.bills] }));
    setBillDraft(emptyBillDraft);
    setBillFileHint('');
    setAnnouncement('Bill saved and ready to link with new stock.');
  };

  const handleSaleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!saleDraft.sareeId || !saleDraft.sellingPrice) {
      setAnnouncement('Choose a saree and selling price before recording the sale.');
      return;
    }

    const currentSaree = data.sarees.find((saree) => saree.id === saleDraft.sareeId);
    if (!currentSaree) {
      setAnnouncement('That saree is no longer available in the desk.');
      return;
    }

    const response = await fetch('/api/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sareeId: saleDraft.sareeId,
        sellingPrice: parseNumber(saleDraft.sellingPrice),
        date: saleDraft.date,
        customerName: saleDraft.customerName.trim() || undefined,
        paymentMethod: saleDraft.paymentMethod,
      }),
    });

    if (!response.ok) {
      setAnnouncement(await readError(response));
      return;
    }

    const nextSale: SaleRecord = await response.json();
    const nextData: BusinessData = {
      ...data,
      lastUpdated: new Date().toISOString(),
      sales: [nextSale, ...data.sales.filter((sale) => sale.sareeId !== saleDraft.sareeId)],
      sarees: data.sarees.map((saree) => (saree.id === saleDraft.sareeId ? { ...saree, status: 'SOLD', soldDate: saleDraft.date } : saree)),
    };

    setData(nextData);
    setSaleDraft(createDefaultSaleDraft(nextData));
    setAnnouncement(`${currentSaree.name} moved to sold and profit was refreshed.`);
  };

  const clearViewState = () => {
    setSareeDraft(emptySareeDraft);
    setExpenseDraft(emptyExpenseDraft);
    setBillDraft(emptyBillDraft);
    setBillFileHint('');
    setInventoryQuery('');
    setStatusFilter('ALL');
    setSaleDraft(createDefaultSaleDraft(data));
    setAnnouncement('Filters and drafts cleared.');
  };

  const signOut = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--canvas)] text-slate-950">
      <div className="pointer-events-none absolute inset-0 saree-atmosphere" />
      <div className="pointer-events-none absolute inset-0 saree-grid opacity-70" />

      <main className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className="relative overflow-hidden rounded-[34px] border border-white/70 bg-white/78 px-5 py-6 shadow-[0_30px_110px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-7 sm:py-7 lg:px-9 lg:py-8">
          <div className="absolute -left-16 top-8 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.20),transparent_65%)] blur-2xl" />
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(14,116,144,0.18),transparent_68%)] blur-2xl" />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-col gap-4">
                <div className="inline-flex w-fit items-center gap-4 rounded-full border border-slate-200/80 bg-white/82 p-2 pr-6 shadow-sm backdrop-blur-md">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-white/60 bg-white/95 p-3 shadow-xl sm:h-28 sm:w-28 sm:p-4">
                    <Image
                      src="/brand/logo-transparent.svg"
                      alt="Sarees by Usha"
                      width={560}
                      height={260}
                      priority
                      className="h-auto w-full drop-shadow-md"
                    />
                  </div>
                  <div className="hidden sm:block">
                    <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-slate-500">
                      <Sparkles className="h-4 w-4 text-[var(--brand-saffron)]" />
                      Atelier Ledger
                    </p>
                    <p className="mt-2 max-w-[18rem] text-sm leading-6 text-slate-600">
                      Inventory, profit, and sourcing decisions anchored under one brand mark.
                    </p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-xs text-slate-600 shadow-sm">
                  <UserCircle2 className="h-4 w-4 text-[var(--brand-teal)]" />
                  <span className="font-semibold text-slate-900">{userName}</span>
                  <span className="text-slate-400">{userEmail}</span>
                </div>
              </div>
              <h1 className="mt-5 max-w-4xl font-display text-5xl leading-none text-slate-950 sm:text-6xl lg:text-[5.3rem]">
                A couture operating system for every saree, every rupee, and every sourcing decision.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                Premium enough for the front-of-house, practical enough for the backend. Your live inventory, spend,
                bill proof, and realized margin now sit behind a real signed-in workspace.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#inventory" className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]">
                  Open inventory desk
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#forms" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-500">
                  Add today&apos;s activity
                </a>
                <button type="button" onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-500">
                  Sign out
                </button>
              </div>
            </div>

            <div className="grid w-full gap-4 sm:grid-cols-2 lg:max-w-md lg:grid-cols-1 xl:max-w-lg xl:grid-cols-2">
              <div className="rounded-[30px] border border-white/80 bg-[linear-gradient(135deg,rgba(14,116,144,0.95),rgba(15,23,42,0.92))] p-5 text-white shadow-[0_20px_70px_rgba(14,116,144,0.25)]">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/14 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-white/75">Cash Profit</span>
                  <BadgeIndianRupee className="h-5 w-5 text-white/70" />
                </div>
                <p className="mt-5 text-4xl font-semibold">{formatCurrency(summary.realizedProfit)}</p>
                <p className="mt-2 text-sm leading-6 text-white/75">Realized after purchase cost and the currently allocated expenses.</p>
              </div>
              <div className="rounded-[30px] border border-white/80 bg-[linear-gradient(145deg,rgba(245,158,11,0.92),rgba(194,65,12,0.90))] p-5 text-white shadow-[0_20px_70px_rgba(194,65,12,0.20)]">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/14 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-white/75">Protected Studio</span>
                  <ShieldEllipsis className="h-5 w-5 text-white/75" />
                </div>
                <p className="mt-5 text-2xl font-semibold">Your logo, workspace auth, uploads, and API routes are live</p>
                <p className="mt-2 text-sm leading-6 text-white/75">Cloudflare still fits best later, but this standalone build is now a real app, not only a visual shell.</p>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-4">
            <MetricCard label="Inventory" value={`${summary.totalCount} pieces`} detail={`${summary.soldCount} sold, ${summary.reservedCount} reserved, and the rest ready to move.`} accent="bg-[linear-gradient(135deg,#0f766e,#115e59)]" icon={<Boxes className="h-5 w-5" />} />
            <MetricCard label="Revenue" value={formatCurrency(summary.totalRevenue)} detail={`Average ticket size is ${formatCurrency(summary.averageTicket)} across closed sales.`} accent="bg-[linear-gradient(135deg,#be123c,#7f1d1d)]" icon={<TrendingUp className="h-5 w-5" />} />
            <MetricCard label="Open Stock" value={formatCurrency(summary.unsoldStockValue)} detail={`${formatCurrency(summary.projectedUnsoldRevenue)} is the current projected return from unsold pieces.`} accent="bg-[linear-gradient(135deg,#d97706,#b45309)]" icon={<Warehouse className="h-5 w-5" />} />
            <MetricCard label="Expense Drift" value={formatCurrency(summary.totalExpenses)} detail={`Largest cost bucket right now is ${summary.topExpenseCategory}.`} accent="bg-[linear-gradient(135deg,#0284c7,#0f172a)]" icon={<WalletCards className="h-5 w-5" />} />
          </div>
        </section>

        {announcement ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm font-medium text-emerald-900 shadow-sm">{announcement}</div> : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.48fr_minmax(360px,0.92fr)]">
          <div className="space-y-6">
            <SectionShell eyebrow="Business Health" title="Profit pulse, not guesswork" description="This board shows the shape of the business right now: what you have invested, what has returned, and which months created lift or drag.">
              <div className="grid gap-5 lg:grid-cols-[1.25fr_0.95fr]">
                <div className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.88))] p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div><p className="text-xs uppercase tracking-[0.28em] text-slate-500">Performance runway</p><h3 className="mt-2 text-2xl font-semibold text-slate-950">Last 6 months</h3></div>
                    <p className="max-w-sm text-sm leading-6 text-slate-600">Revenue, buying, and expense bars move together so you can see the cash pressure each month created.</p>
                  </div>
                  <div className="mt-6 space-y-4">
                    {monthlyPerformance.map((row) => (
                      <div key={row.key} className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-slate-900">{row.label}</p><p className={`mt-1 text-xs font-medium ${row.net >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>Net {formatCurrency(row.net)}</p></div><div className="grid min-w-[168px] gap-2 text-[11px] text-slate-500 sm:grid-cols-3"><span>Revenue {formatCurrency(row.revenue)}</span><span>Buy {formatCurrency(row.investment)}</span><span>Expense {formatCurrency(row.expenses)}</span></div></div>
                        <div className="mt-4 grid gap-2">
                          {[{ label: 'Revenue', value: row.revenue, color: 'bg-[linear-gradient(90deg,#0f766e,#14b8a6)]' }, { label: 'Purchases', value: row.investment, color: 'bg-[linear-gradient(90deg,#f59e0b,#f97316)]' }, { label: 'Expenses', value: row.expenses, color: 'bg-[linear-gradient(90deg,#c2410c,#7f1d1d)]' }].map((bar) => (
                            <div key={bar.label}><div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-[0.24em] text-slate-500"><span>{bar.label}</span><span>{Math.round((bar.value / maxChartValue) * 100)}%</span></div><div className="h-3 rounded-full bg-slate-100"><div className={`h-full rounded-full ${bar.color}`} style={{ width: `${(bar.value / maxChartValue) * 100}%` }} /></div></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(14,116,144,0.06),rgba(255,255,255,0.95))] p-5">
                    <div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.28em] text-slate-500">Sell through</p><p className="mt-3 text-4xl font-semibold text-slate-950">{Math.round(summary.sellThrough * 100)}%</p></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white"><PackageCheck className="h-5 w-5" /></div></div>
                    <p className="mt-4 text-sm leading-6 text-slate-600">{pulse}</p>
                  </div>
                  <div className="rounded-[28px] border border-slate-200/80 bg-white/92 p-5"><p className="text-xs uppercase tracking-[0.28em] text-slate-500">Expense map</p><div className="mt-4 space-y-4">{expenseBreakdown.map((row) => <div key={row.category}><div className="mb-2 flex items-center justify-between gap-4 text-sm"><span className="font-medium text-slate-800">{row.category}</span><span className="text-slate-500">{formatCurrency(row.total)}</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-[linear-gradient(90deg,#0f766e,#14b8a6)]" style={{ width: `${Math.max(row.share * 100, 8)}%` }} /></div></div>)}</div></div>
                  <div className="rounded-[28px] border border-slate-200/80 bg-slate-950 p-5 text-white"><p className="text-xs uppercase tracking-[0.28em] text-white/60">Allocation rule</p><p className="mt-3 text-lg font-semibold">Global expenses are spread evenly across all pieces.</p><p className="mt-2 text-sm leading-6 text-white/70">It keeps profit honest today, and can evolve later into weighted allocation when you connect a real database.</p></div>
                </div>
              </div>
            </SectionShell>

            <SectionShell id="inventory" eyebrow="Inventory Desk" title="Every saree, visible at once" description="Search the rack, filter by selling state, and jump straight into the sale desk or reserve flow when a customer asks for something specific." action={<div className="flex flex-wrap items-center gap-2 text-xs text-slate-500"><Filter className="h-4 w-4" />{filteredSarees.length} matching pieces</div>}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="relative max-w-xl flex-1"><Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" /><input value={inventoryQuery} onChange={(event) => setInventoryQuery(event.target.value)} placeholder="Search by name, collection, color, or SKU" className="w-full rounded-2xl border border-slate-200 bg-white/92 py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400" /></div><div className="flex flex-wrap gap-2">{statusOptions.map((option) => <button key={option} type="button" onClick={() => setStatusFilter(option)} className={`rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.22em] transition ${statusFilter === option ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}>{option}</button>)}</div></div>
              <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90"><div className="hidden grid-cols-[1.8fr_0.9fr_0.9fr_0.95fr_0.9fr_1fr] gap-4 border-b border-slate-200/80 bg-slate-50/80 px-5 py-4 text-[11px] uppercase tracking-[0.26em] text-slate-500 lg:grid"><span>Piece</span><span>Buy</span><span>Expected</span><span>Allocated</span><span>Profit</span><span>Status</span></div><div className="divide-y divide-slate-200/80">{filteredSarees.map((saree) => { const snapshot = getSareeSnapshot(saree, data); const bill = data.bills.find((item) => item.id === saree.billId); const profit = snapshot.realizedProfit ?? snapshot.projectedProfit; return <div key={saree.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[1.8fr_0.9fr_0.9fr_0.95fr_0.9fr_1fr] lg:items-center"><div><div className="flex flex-wrap items-center gap-3"><h3 className="text-lg font-semibold text-slate-950">{saree.name}</h3><StatusBadge status={saree.status} /></div><p className="mt-1 text-sm text-slate-600">{saree.collection} - {saree.fabric} - {saree.color}</p><div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500"><span className="rounded-full bg-slate-100 px-3 py-1">{saree.sku}</span><span className="rounded-full bg-slate-100 px-3 py-1">{saree.sourceMarket}</span>{bill ? <span className="rounded-full bg-slate-100 px-3 py-1">{bill.supplierName}</span> : null}</div>{saree.notes ? <p className="mt-3 text-sm leading-6 text-slate-500">{saree.notes}</p> : null}<div className="mt-4 flex flex-wrap gap-2">{saree.status !== 'SOLD' ? <button type="button" onClick={() => quickSell(saree)} className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-white">Sell now<ArrowRight className="h-4 w-4" /></button> : null}{saree.status !== 'SOLD' ? <button type="button" onClick={() => toggleReserve(saree.id)} className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold tracking-[0.16em] text-slate-700">{saree.status === 'RESERVED' ? 'Release reserve' : 'Reserve'}</button> : null}</div></div><div className="text-sm text-slate-700"><span className="block text-[11px] uppercase tracking-[0.26em] text-slate-400 lg:hidden">Buy</span><p className="font-semibold">{formatCurrency(saree.purchasePrice)}</p><p className="mt-1 text-xs text-slate-500">{formatDate(saree.purchaseDate)}</p></div><div className="text-sm text-slate-700"><span className="block text-[11px] uppercase tracking-[0.26em] text-slate-400 lg:hidden">Expected</span><p className="font-semibold">{formatCurrency(saree.expectedSellingPrice)}</p><p className="mt-1 text-xs text-slate-500">{snapshot.sale ? `Sold at ${formatCurrency(snapshot.sale.sellingPrice)}` : 'Projected price'}</p></div><div className="text-sm text-slate-700"><span className="block text-[11px] uppercase tracking-[0.26em] text-slate-400 lg:hidden">Allocated</span><p className="font-semibold">{formatCurrency(getAllocatedExpenseForSaree(saree, data))}</p><p className="mt-1 text-xs text-slate-500">Shared plus direct costs</p></div><div className="text-sm"><span className="block text-[11px] uppercase tracking-[0.26em] text-slate-400 lg:hidden">Profit</span><p className={`font-semibold ${profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(profit)}</p><p className="mt-1 text-xs text-slate-500">{snapshot.sale ? 'Realized margin' : 'Projected margin'}</p></div><div className="text-sm text-slate-700"><span className="block text-[11px] uppercase tracking-[0.26em] text-slate-400 lg:hidden">Status</span><div className="flex flex-col gap-2"><StatusBadge status={saree.status} /><p className="text-xs text-slate-500">{saree.soldDate ? `Closed ${formatDate(saree.soldDate)}` : 'Live in stock'}</p></div></div></div>; })}</div></div>
            </SectionShell>
          </div>

          <div className="space-y-6" id="forms">
            <SectionShell eyebrow="Command Rail" title="Capture today's business" description="Fast forms for new stock, sales, expenses, and supplier bills. Everything writes into the same profit engine." action={<button type="button" onClick={clearViewState} className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/90 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-slate-700"><RefreshCcw className="h-4 w-4" />Clear drafts</button>}>
              <div className="space-y-5">
                <form onSubmit={handleSareeSubmit} className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,247,237,0.86))] p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.28em] text-slate-500">Inventory intake</p><h3 className="mt-2 text-2xl font-semibold text-slate-950">Add a saree</h3></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white"><PackagePlus className="h-5 w-5" /></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><label className={labelClasses()}>Saree name</label><input className={inputClasses()} value={sareeDraft.name} onChange={(event) => setSareeDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Banarasi zari buta" /></div><div><label className={labelClasses()}>Collection</label><input className={inputClasses()} value={sareeDraft.collection} onChange={(event) => setSareeDraft((current) => ({ ...current, collection: event.target.value }))} placeholder="Bridal Reserve" /></div><div><label className={labelClasses()}>Fabric</label><input className={inputClasses()} value={sareeDraft.fabric} onChange={(event) => setSareeDraft((current) => ({ ...current, fabric: event.target.value }))} placeholder="Katan Silk" /></div><div><label className={labelClasses()}>Color story</label><input className={inputClasses()} value={sareeDraft.color} onChange={(event) => setSareeDraft((current) => ({ ...current, color: event.target.value }))} placeholder="Wine and antique gold" /></div><div><label className={labelClasses()}>Source market</label><input className={inputClasses()} value={sareeDraft.sourceMarket} onChange={(event) => setSareeDraft((current) => ({ ...current, sourceMarket: event.target.value }))} placeholder="Varanasi" /></div><div><label className={labelClasses()}>Purchase price</label><input className={inputClasses()} type="number" min="0" value={sareeDraft.purchasePrice} onChange={(event) => setSareeDraft((current) => ({ ...current, purchasePrice: event.target.value }))} placeholder="6200" /></div><div><label className={labelClasses()}>Expected selling price</label><input className={inputClasses()} type="number" min="0" value={sareeDraft.expectedSellingPrice} onChange={(event) => setSareeDraft((current) => ({ ...current, expectedSellingPrice: event.target.value }))} placeholder="9400" /></div><div><label className={labelClasses()}>Purchase date</label><input className={inputClasses()} type="date" value={sareeDraft.purchaseDate} onChange={(event) => setSareeDraft((current) => ({ ...current, purchaseDate: event.target.value }))} /></div><div><label className={labelClasses()}>Linked bill</label><select className={inputClasses()} value={sareeDraft.billId} onChange={(event) => setSareeDraft((current) => ({ ...current, billId: event.target.value }))}><option value="">No bill yet</option>{data.bills.map((bill) => <option key={bill.id} value={bill.id}>{bill.supplierName} - {formatCurrency(bill.totalAmount)}</option>)}</select></div><div className="sm:col-span-2"><label className={labelClasses()}>Notes</label><textarea className={textareaClasses()} value={sareeDraft.notes} onChange={(event) => setSareeDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="Add pallu detail, blouse status, or what makes it easier to pitch." /></div></div><button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Save saree<ArrowRight className="h-4 w-4" /></button></form>
                <form ref={saleDeskRef} onSubmit={handleSaleSubmit} className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(240,253,250,0.95),rgba(255,255,255,0.94))] p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.28em] text-slate-500">Cash desk</p><h3 className="mt-2 text-2xl font-semibold text-slate-950">Record a sale</h3></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-teal)] text-white"><BadgeIndianRupee className="h-5 w-5" /></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><label className={labelClasses()}>Saree</label><select className={inputClasses()} value={saleDraft.sareeId} onChange={(event) => { const selected = data.sarees.find((saree) => saree.id === event.target.value); setSaleDraft((current) => ({ ...current, sareeId: event.target.value, sellingPrice: selected ? String(selected.expectedSellingPrice) : current.sellingPrice })); }}><option value="">Choose from open stock</option>{availableForSale.map((saree) => <option key={saree.id} value={saree.id}>{saree.name} - {saree.sku}</option>)}</select></div><div><label className={labelClasses()}>Selling price</label><input className={inputClasses()} type="number" min="0" value={saleDraft.sellingPrice} onChange={(event) => setSaleDraft((current) => ({ ...current, sellingPrice: event.target.value }))} placeholder="9550" /></div><div><label className={labelClasses()}>Sale date</label><input className={inputClasses()} type="date" value={saleDraft.date} onChange={(event) => setSaleDraft((current) => ({ ...current, date: event.target.value }))} /></div><div><label className={labelClasses()}>Customer</label><input className={inputClasses()} value={saleDraft.customerName} onChange={(event) => setSaleDraft((current) => ({ ...current, customerName: event.target.value }))} placeholder="Customer name or lead source" /></div><div><label className={labelClasses()}>Payment method</label><select className={inputClasses()} value={saleDraft.paymentMethod} onChange={(event) => setSaleDraft((current) => ({ ...current, paymentMethod: event.target.value as PaymentMethod }))}>{paymentMethodOptions.map((method) => <option key={method} value={method}>{method}</option>)}</select></div></div><button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--brand-teal)] px-5 py-3 text-sm font-semibold text-white">Close sale<ArrowRight className="h-4 w-4" /></button></form>
                <form onSubmit={handleExpenseSubmit} className="rounded-[28px] border border-slate-200/80 bg-white/94 p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.28em] text-slate-500">Expense ledger</p><h3 className="mt-2 text-2xl font-semibold text-slate-950">Add an expense</h3></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#be123c,#9f1239)] text-white"><WalletCards className="h-5 w-5" /></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><label className={labelClasses()}>Title</label><input className={inputClasses()} value={expenseDraft.title} onChange={(event) => setExpenseDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Travel to market" /></div><div><label className={labelClasses()}>Category</label><input list="expense-categories" className={inputClasses()} value={expenseDraft.category} onChange={(event) => setExpenseDraft((current) => ({ ...current, category: event.target.value }))} /><datalist id="expense-categories">{categoryOptions.map((category) => <option key={category} value={category} />)}</datalist></div><div><label className={labelClasses()}>Amount</label><input className={inputClasses()} type="number" min="0" value={expenseDraft.amount} onChange={(event) => setExpenseDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="980" /></div><div><label className={labelClasses()}>Date</label><input className={inputClasses()} type="date" value={expenseDraft.date} onChange={(event) => setExpenseDraft((current) => ({ ...current, date: event.target.value }))} /></div><div><label className={labelClasses()}>Allocation</label><select className={inputClasses()} value={expenseDraft.scope} onChange={(event) => setExpenseDraft((current) => ({ ...current, scope: event.target.value as ExpenseScope }))}>{expenseScopeOptions.map((scope) => <option key={scope} value={scope}>{scope}</option>)}</select></div>{expenseDraft.scope === 'SAREE' ? <div className="sm:col-span-2"><label className={labelClasses()}>Linked saree</label><select className={inputClasses()} value={expenseDraft.linkedSareeId} onChange={(event) => setExpenseDraft((current) => ({ ...current, linkedSareeId: event.target.value }))}><option value="">Choose a saree</option>{data.sarees.map((saree) => <option key={saree.id} value={saree.id}>{saree.name} - {saree.sku}</option>)}</select></div> : null}{expenseDraft.scope === 'BILL' ? <div className="sm:col-span-2"><label className={labelClasses()}>Linked bill batch</label><select className={inputClasses()} value={expenseDraft.linkedBillId} onChange={(event) => setExpenseDraft((current) => ({ ...current, linkedBillId: event.target.value }))}><option value="">Choose a bill</option>{data.bills.map((bill) => <option key={bill.id} value={bill.id}>{bill.supplierName} - {formatCurrency(bill.totalAmount)}</option>)}</select></div> : null}<div className="sm:col-span-2"><label className={labelClasses()}>Notes</label><textarea className={textareaClasses()} value={expenseDraft.notes} onChange={(event) => setExpenseDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="Anything useful about how or why this cost happened." /></div></div><button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Save expense<ArrowRight className="h-4 w-4" /></button></form>
                <form onSubmit={handleBillSubmit} className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.94),rgba(255,255,255,0.95))] p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.28em] text-slate-500">Bill vault</p><h3 className="mt-2 text-2xl font-semibold text-slate-950">Save a supplier bill</h3></div><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0284c7,#0f172a)] text-white"><CloudUpload className="h-5 w-5" /></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label className={labelClasses()}>Supplier</label><input className={inputClasses()} value={billDraft.supplierName} onChange={(event) => setBillDraft((current) => ({ ...current, supplierName: event.target.value }))} placeholder="Bharat Loom House" /></div><div><label className={labelClasses()}>Total amount</label><input className={inputClasses()} type="number" min="0" value={billDraft.totalAmount} onChange={(event) => setBillDraft((current) => ({ ...current, totalAmount: event.target.value }))} placeholder="6200" /></div><div><label className={labelClasses()}>Upload date</label><input className={inputClasses()} type="date" value={billDraft.uploadDate} onChange={(event) => setBillDraft((current) => ({ ...current, uploadDate: event.target.value }))} /></div><div><label className={labelClasses()}>Attach image or PDF</label><input className={inputClasses()} type="file" accept="image/*,application/pdf" onChange={handleBillFileChange} />{billFileHint ? <p className="mt-2 text-xs text-slate-500">{billFileHint}</p> : null}</div><div className="sm:col-span-2"><label className={labelClasses()}>Notes</label><textarea className={textareaClasses()} value={billDraft.notes} onChange={(event) => setBillDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="Supplier details, negotiation notes, or batch comments." /></div></div><button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#0284c7,#0f172a)] px-5 py-3 text-sm font-semibold text-white">Save bill<ArrowRight className="h-4 w-4" /></button></form>
              </div>
            </SectionShell>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <SectionShell eyebrow="Expense Feed" title="Recent spending" description="Keep one eye on where the money leaks."><div className="space-y-4">{data.expenses.slice().sort((left, right) => Number(new Date(right.date)) - Number(new Date(left.date))).map((expense) => { const linkedSaree = data.sarees.find((saree) => saree.id === expense.linkedSareeId); const linkedBill = data.bills.find((bill) => bill.id === expense.linkedBillId); return <div key={expense.id} className="rounded-[24px] border border-slate-200/80 bg-white/92 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-3"><p className="text-lg font-semibold text-slate-950">{expense.title}</p><ScopeBadge scope={expense.scope} /></div><p className="mt-1 text-sm text-slate-600">{expense.category} - {formatDate(expense.date)}</p>{linkedSaree ? <p className="mt-2 text-sm text-slate-500">Linked to {linkedSaree.name}</p> : null}{linkedBill ? <p className="mt-2 text-sm text-slate-500">Batch from {linkedBill.supplierName}</p> : null}{expense.notes ? <p className="mt-2 text-sm leading-6 text-slate-500">{expense.notes}</p> : null}</div><div className="text-right"><p className="text-lg font-semibold text-slate-950">{formatCurrency(expense.amount)}</p></div></div></div>; })}</div></SectionShell>
          <SectionShell eyebrow="Bill Vault" title="Supplier paperwork in one place" description="Bills stay linked to batches."><div className="grid gap-4 md:grid-cols-2">{data.bills.slice().sort((left, right) => Number(new Date(right.uploadDate)) - Number(new Date(left.uploadDate))).map((bill) => { const linkedCount = data.sarees.filter((saree) => saree.billId === bill.id).length; const isImage = bill.fileType?.startsWith('image'); return <div key={bill.id} className="rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-lg font-semibold text-slate-950">{bill.supplierName}</p><p className="mt-1 text-sm text-slate-600">{formatCurrency(bill.totalAmount)} - {formatDate(bill.uploadDate)}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white"><ReceiptText className="h-5 w-5" /></div></div><div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500"><span className="rounded-full bg-slate-100 px-3 py-1">{linkedCount} linked sarees</span>{bill.fileName ? <span className="rounded-full bg-slate-100 px-3 py-1">{bill.fileName}</span> : null}</div>{bill.notes ? <p className="mt-4 text-sm leading-6 text-slate-600">{bill.notes}</p> : null}{bill.fileDataUrl ? <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/92 p-3">{isImage ? <Image src={bill.fileDataUrl} alt={bill.fileName ?? 'Supplier bill preview'} width={960} height={640} unoptimized className="max-h-48 w-full rounded-xl object-cover" /> : <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">PDF attached locally</div>}<a href={bill.fileDataUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-teal)]"><Download className="h-4 w-4" />Open attachment</a></div> : null}</div>; })}</div></SectionShell>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <SectionShell eyebrow="Reports Board" title="What is performing right now" description="A fast reading of the best margin drivers plus the expense logic influencing them."><div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]"><div className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.28em] text-slate-500">Top margin pieces</p><h3 className="mt-2 text-2xl font-semibold text-slate-950">Best performers</h3></div><SwatchBook className="h-5 w-5 text-slate-400" /></div><div className="mt-5 space-y-4">{topSarees.map((snapshot, index) => <div key={snapshot.saree.id} className="rounded-2xl border border-slate-200/80 bg-white/92 p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.24em] text-slate-500">Rank {index + 1}</p><p className="mt-1 text-lg font-semibold text-slate-950">{snapshot.saree.name}</p><p className="mt-1 text-sm text-slate-600">{snapshot.saree.collection} - {snapshot.saree.color}</p></div><div className="text-right"><p className={`text-lg font-semibold ${snapshot.projectedProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{formatCurrency(snapshot.projectedProfit)}</p><p className="mt-1 text-xs text-slate-500">{snapshot.sale ? 'Realized or locked' : 'Still open'}</p></div></div></div>)}</div></div><div className="space-y-5"><div className="rounded-[28px] border border-slate-200/80 bg-white/92 p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.28em] text-slate-500">Control note</p><h3 className="mt-2 text-xl font-semibold text-slate-950">Deployment fit</h3></div><ShieldCheck className="h-5 w-5 text-[var(--brand-teal)]" /></div><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600"><li>Cloudflare is the better fit for the current Next.js 16.1.1 app and future edge path.</li><li>Firebase is still workable later, but this project aligns more naturally with Cloudflare.</li><li>This MVP is local-first now, so either platform can host it once dependencies are installed.</li></ul></div><div className="rounded-[28px] border border-slate-200/80 bg-slate-950 p-5 text-white"><p className="text-xs uppercase tracking-[0.28em] text-white/60">Projected runway</p><p className="mt-4 text-3xl font-semibold">{formatCurrency(summary.projectedProfit)}</p><p className="mt-3 text-sm leading-6 text-white/70">This includes unsold stock at expected pricing, minus shared and direct costs.</p></div></div></div></SectionShell>
          <footer className={shellCard('h-full')}><div className="grid gap-6 lg:grid-cols-1"><div><p className="text-xs uppercase tracking-[0.28em] text-slate-500">Current build</p><h2 className="mt-2 font-display text-3xl text-slate-950">Standalone, authenticated, and database-backed.</h2><p className="mt-3 text-sm leading-7 text-slate-600">This workspace now persists through Prisma + SQLite, signs the owner in with a real session cookie, and stores uploaded bill files on the server for local review.</p></div><div className="rounded-[24px] border border-slate-200/80 bg-white/92 p-4"><div className="flex items-center gap-3 text-slate-950"><Store className="h-5 w-5 text-[var(--brand-clay)]" /><p className="font-semibold">What this version already does</p></div><ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600"><li>Add inventory with batch links</li><li>Track expenses with allocation rules</li><li>Record sales and update live profit</li><li>Store bill files and metadata on the server</li></ul></div><div className="rounded-[24px] border border-slate-200/80 bg-slate-950 p-4 text-white"><div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-white/70" /><p className="font-semibold">Workspace state</p></div><ul className="mt-4 space-y-2 text-sm leading-6 text-white/70"><li>Owner session is active for {userName}.</li><li>Last sync point: {formatDate(data.lastUpdated.slice(0, 10))}</li><li>Working only inside the standalone saree folder.</li></ul></div></div></footer>
        </div>
      </main>
    </div>
  );
}
