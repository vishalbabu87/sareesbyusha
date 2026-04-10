'use client';

import { 
  getDashboardSummary, 
  getMonthlyPerformance, 
  formatCurrency, 
  BusinessData 
} from '@/lib/saree-control';
import { MetricCard } from './ui';
import {
  BadgeIndianRupee,
  Boxes,
  TrendingUp,
  WalletCards,
  Warehouse,
} from 'lucide-react';
import { useMemo } from 'react';

export function DashboardView({ data }: { data: BusinessData }) {
  const summary = useMemo(() => getDashboardSummary(data), [data]);
  const monthlyPerformance = useMemo(() => getMonthlyPerformance(data), [data]);

  const latestMonth = monthlyPerformance[0];

  return (
    <div className="space-y-3 pb-20">
      {/* 1. Cash Card - Orange color like the removed profit card, slightly bigger */}
      <div className="rounded-[20px] border border-white/80 bg-[linear-gradient(145deg,rgba(245,158,11,0.92),rgba(194,65,12,0.90))] p-4 text-white shadow-[0_12px_40px_rgba(194,65,12,0.25)] relative overflow-hidden">
        <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
        <div className="flex items-center justify-between relative z-10">
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/90 shadow-sm">Cash in Hand</span>
          <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-md">
            <BadgeIndianRupee className="h-4 w-4 text-white" />
          </div>
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight relative z-10">{formatCurrency(summary.realizedProfit)}</p>
        <p className="mt-1 text-[10px] font-medium text-white/80 relative z-10">Realized cash after purchases & expenses</p>
      </div>

      {/* 2. 2x2 Metric Grid - Compact for mobile */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard label="Inventory" value={`${summary.totalCount}`} detail={`${summary.soldCount} sold`} accent="bg-[linear-gradient(135deg,#0f766e,#115e59)]" icon={<Boxes className="h-3 w-3" />} />
        <MetricCard label="Revenue" value={formatCurrency(summary.totalRevenue)} detail={`Total landed`} accent="bg-[linear-gradient(135deg,#be123c,#7f1d1d)]" icon={<TrendingUp className="h-3 w-3" />} />
        <MetricCard label="Stock Value" value={formatCurrency(summary.unsoldStockValue)} detail={`Buy phase`} accent="bg-[linear-gradient(135deg,#d97706,#b45309)]" icon={<Warehouse className="h-3 w-3" />} />
        <MetricCard label="Expenses" value={formatCurrency(summary.totalExpenses)} detail={`Burn drift`} accent="bg-[linear-gradient(135deg,#0284c7,#0f172a)]" icon={<WalletCards className="h-3 w-3" />} />
      </div>

      {/* 3. Horizontal Unified Stat Card - All graphs and stats */}
      {latestMonth && (
        <div className="rounded-[16px] border border-slate-200/80 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Pulse: {latestMonth.label}</p>
            <span className={`text-[10px] font-bold ${latestMonth.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Net {formatCurrency(latestMonth.net)}</span>
          </div>
          
          {/* Visual bar */}
          <div className="flex w-full h-6 rounded-xl overflow-hidden bg-slate-100 divide-x divide-white">
            <div className="bg-emerald-500 flex items-center justify-center text-[9px] text-white font-bold" style={{ width: `${Math.max(20, (latestMonth.revenue / (latestMonth.revenue + latestMonth.investment + latestMonth.expenses || 1)) * 100)}%` }}>IN</div>
            <div className="bg-amber-500 flex items-center justify-center text-[9px] text-white font-bold" style={{ width: `${Math.max(20, (latestMonth.investment / (latestMonth.revenue + latestMonth.investment + latestMonth.expenses || 1)) * 100)}%` }}>BUY</div>
            <div className="bg-rose-500 flex items-center justify-center text-[9px] text-white font-bold" style={{ width: `${Math.max(20, (latestMonth.expenses / (latestMonth.revenue + latestMonth.investment + latestMonth.expenses || 1)) * 100)}%` }}>BURN</div>
          </div>
          
          {/* Stats row */}
          <div className="flex justify-between mt-2 text-[9px] font-semibold text-slate-500 px-1">
            <div className="flex flex-col items-center"><span className="text-emerald-700">{formatCurrency(latestMonth.revenue)}</span></div>
            <div className="flex flex-col items-center"><span className="text-amber-700">{formatCurrency(latestMonth.investment)}</span></div>
            <div className="flex flex-col items-center"><span className="text-rose-700">{formatCurrency(latestMonth.expenses)}</span></div>
          </div>

          {/* Additional quick stats */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100">
            <div className="text-center">
              <p className="text-[8px] uppercase tracking-[0.1em] text-slate-400">Sell Through</p>
              <p className="text-sm font-bold text-slate-800">{Math.round(summary.sellThrough * 100)}%</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] uppercase tracking-[0.1em] text-slate-400">Stock Items</p>
              <p className="text-sm font-bold text-slate-800">{summary.totalCount - summary.soldCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] uppercase tracking-[0.1em] text-slate-400">Avg Ticket</p>
              <p className="text-sm font-bold text-slate-800">{formatCurrency(summary.averageTicket)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}