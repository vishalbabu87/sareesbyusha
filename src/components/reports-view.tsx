'use client';

import { 
  getMonthlyPerformance, 
  getExpenseBreakdown, 
  getDashboardSummary,
  getBusinessPulse,
  formatCurrency,
  formatDate,
  BusinessData 
} from '@/lib/saree-control';
import { useMemo, useState } from 'react';
import { Download, FileText, ChevronDown, Receipt, TrendingUp, PieChart, Calendar } from 'lucide-react';
import { Modal } from './modal';

type ReportType = '1M' | '3M' | '6M' | '12M' | 'CUSTOM' | 'PL' | 'PURCHASE' | 'SALES' | 'EXPENSES' | 'BILLS';

const today = new Date().toISOString().slice(0, 10);

export function ReportsView({ data }: { data: BusinessData }) {
  const summary = useMemo(() => getDashboardSummary(data), [data]);
  const monthlyPerformance6M = useMemo(() => getMonthlyPerformance(data, 6), [data]);
  const monthlyPerformance12M = useMemo(() => getMonthlyPerformance(data, 12), [data]);
  const expenseBreakdown = useMemo(() => getExpenseBreakdown(data), [data]);
  const pulse = useMemo(() => getBusinessPulse(summary), [summary]);

  const [activeReport, setActiveReport] = useState<ReportType>('1M');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBillsDropdown, setShowBillsDropdown] = useState(false);
  
  // Custom date range
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [customEndDate, setCustomEndDate] = useState(today);

  const getCurrentPerformance = () => {
    if (activeReport === '12M') return monthlyPerformance12M;
    return monthlyPerformance6M;
  };

  const maxChartValue = useMemo(() => {
    const performance = getCurrentPerformance();
    const values = performance.flatMap((row) => [row.revenue, row.investment, row.expenses]);
    return Math.max(...values, 1);
  }, [monthlyPerformance6M, monthlyPerformance12M, activeReport]);

  const getReportTitle = (type: ReportType) => {
    const titles: Record<ReportType, string> = {
      '1M': 'Monthly Overview',
      '3M': '3 Month Report',
      '6M': '6 Month Report',
      '12M': '12 Month Report',
      'CUSTOM': 'Custom Date Report',
      'PL': 'Profit & Loss Statement',
      'PURCHASE': 'Purchase History',
      'SALES': 'Sales Ledger',
      'EXPENSES': 'Expense Report',
      'BILLS': 'Uploaded Bills',
    };
    return titles[type];
  };

  // Filter data for custom date range
  const getCustomRangeData = () => {
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    end.setHours(23, 59, 59, 999);

    return {
      sarees: data.sarees.filter(s => {
        const d = new Date(s.purchaseDate);
        return d >= start && d <= end;
      }),
      sales: data.sales.filter(s => {
        const d = new Date(s.date);
        return d >= start && d <= end;
      }),
      expenses: data.expenses.filter(e => {
        const d = new Date(e.date);
        return d >= start && d <= end;
      }),
      bills: data.bills.filter(b => {
        const d = new Date(b.uploadDate);
        return d >= start && d <= end;
      }),
    };
  };

  const generateReportData = () => {
    switch (activeReport) {
      case '1M':
        return monthlyPerformance6M.slice(0, 1);
      case '3M':
        return monthlyPerformance6M.slice(0, 3);
      case '6M':
        return monthlyPerformance6M;
      case '12M':
        return monthlyPerformance12M;
      case 'CUSTOM':
        return getCustomRangeData();
      case 'PL':
        return {
          revenue: summary.totalRevenue,
          investment: summary.totalInvestment,
          expenses: summary.totalExpenses,
          profit: summary.realizedProfit,
          projected: summary.projectedProfit,
        };
      case 'PURCHASE':
        return data.sarees.sort((a, b) => Number(new Date(b.purchaseDate)) - Number(new Date(a.purchaseDate)));
      case 'SALES':
        return data.sales.sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));
      case 'EXPENSES':
        return data.expenses.sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));
      case 'BILLS':
        return data.bills.sort((a, b) => Number(new Date(b.uploadDate)) - Number(new Date(a.uploadDate)));
      default:
        return [];
    }
  };

  const downloadReport = () => {
    const reportData = generateReportData();
    const reportTitle = getReportTitle(activeReport);
    const timestamp = new Date().toISOString().slice(0, 10);
    
    let csvContent = '';
    
    if (activeReport === 'PL') {
      csvContent = `Profit & Loss Report\nGenerated: ${timestamp}\n\n`;
      csvContent += `Total Revenue,${summary.totalRevenue}\n`;
      csvContent += `Total Investment,${summary.totalInvestment}\n`;
      csvContent += `Total Expenses,${summary.totalExpenses}\n`;
      csvContent += `Realized Profit,${summary.realizedProfit}\n`;
      csvContent += `Projected Profit,${summary.projectedProfit}\n`;
    } else if (['1M', '3M', '6M', '12M'].includes(activeReport)) {
      const performance = activeReport === '12M' ? monthlyPerformance12M : monthlyPerformance6M;
      const sliceCount = activeReport === '1M' ? 1 : activeReport === '3M' ? 3 : activeReport === '6M' ? 6 : 12;
      csvContent = `${reportTitle}\nGenerated: ${timestamp}\n\n`;
      csvContent += 'Month,Revenue,Investment,Expenses,Net\n';
      performance.slice(0, sliceCount).forEach((row: any) => {
        csvContent += `${row.label},${row.revenue},${row.investment},${row.expenses},${row.net}\n`;
      });
    } else if (activeReport === 'CUSTOM') {
      const customData = getCustomRangeData();
      csvContent = `Custom Report\nPeriod: ${formatDate(customStartDate)} to ${formatDate(customEndDate)}\n\n`;
      csvContent += 'SUMMARY\n';
      csvContent += `Purchases,${customData.sarees.length},${formatCurrency(customData.sarees.reduce((s, i) => s + i.purchasePrice, 0))}\n`;
      csvContent += `Sales,${customData.sales.length},${formatCurrency(customData.sales.reduce((s, i) => s + i.sellingPrice, 0))}\n`;
      csvContent += `Expenses,${customData.expenses.length},${formatCurrency(customData.expenses.reduce((s, i) => s + i.amount, 0))}\n\n`;
      csvContent += 'PURCHASES\nDate,Name,SKU,Price\n';
      customData.sarees.forEach((s: any) => {
        csvContent += `${s.purchaseDate},${s.name},${s.sku},${s.purchasePrice}\n`;
      });
    } else if (activeReport === 'PURCHASE') {
      csvContent = `Purchase Report\nGenerated: ${timestamp}\n\n`;
      csvContent += 'Date,Name,SKU,Fabric,Color,Purchase Price,Status\n';
      (reportData as any[]).forEach((saree: any) => {
        csvContent += `${saree.purchaseDate},${saree.name},${saree.sku},${saree.fabric},${saree.color},${saree.purchasePrice},${saree.status}\n`;
      });
    } else if (activeReport === 'SALES') {
      csvContent = `Sales Report\nGenerated: ${timestamp}\n\n`;
      csvContent += 'Date,Saree,Selling Price,Customer,Payment Method\n';
      (reportData as any[]).forEach((sale: any) => {
        const saree = data.sarees.find(s => s.id === sale.sareeId);
        csvContent += `${sale.date},${saree?.name || 'Unknown'},${sale.sellingPrice},${sale.customerName || 'N/A'},${sale.paymentMethod}\n`;
      });
    } else if (activeReport === 'EXPENSES') {
      csvContent = `Expense Report\nGenerated: ${timestamp}\n\n`;
      csvContent += 'Date,Title,Category,Amount,Scope\n';
      (reportData as any[]).forEach((exp: any) => {
        csvContent += `${exp.date},${exp.title},${exp.category},${exp.amount},${exp.scope}\n`;
      });
    } else if (activeReport === 'BILLS') {
      csvContent = `Bills Report\nGenerated: ${timestamp}\n\n`;
      csvContent += 'Upload Date,Supplier,Total Amount,Linked Sarees\n';
      (reportData as any[]).forEach((bill: any) => {
        const linkedCount = data.sarees.filter(s => s.billId === bill.id).length;
        csvContent += `${bill.uploadDate},${bill.supplierName},${bill.totalAmount},${linkedCount}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `saree-report-${activeReport}-${timestamp}.csv`;
    link.click();
  };

  const renderReportContent = () => {
    switch (activeReport) {
      case 'PL':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <p className="text-[10px] uppercase tracking-wider text-emerald-600">Revenue</p>
                <p className="text-lg font-bold text-emerald-900">{formatCurrency(summary.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <p className="text-[10px] uppercase tracking-wider text-amber-600">Investment</p>
                <p className="text-lg font-bold text-amber-900">{formatCurrency(summary.totalInvestment)}</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl">
                <p className="text-[10px] uppercase tracking-wider text-rose-600">Expenses</p>
                <p className="text-lg font-bold text-rose-900">{formatCurrency(summary.totalExpenses)}</p>
              </div>
              <div className={`p-3 rounded-xl ${summary.realizedProfit >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <p className={`text-[10px] uppercase tracking-wider ${summary.realizedProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Net Profit</p>
                <p className={`text-lg font-bold ${summary.realizedProfit >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>{formatCurrency(summary.realizedProfit)}</p>
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-600">{pulse}</p>
            </div>
          </div>
        );
      
      case 'EXPENSES':
        return (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {expenseBreakdown.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{cat.category}</p>
                  <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-1">
                    <div className="h-full bg-slate-600 rounded-full" style={{ width: `${cat.share * 100}%` }} />
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-900">{formatCurrency(cat.total)}</p>
              </div>
            ))}
          </div>
        );

      case 'BILLS':
        return (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {data.bills.sort((a, b) => Number(new Date(b.uploadDate)) - Number(new Date(a.uploadDate))).map((bill) => {
              const linkedCount = data.sarees.filter(s => s.billId === bill.id).length;
              return (
                <div key={bill.id} className="p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">{bill.supplierName}</p>
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(bill.totalAmount)}</p>
                  </div>
                  <p className="text-[10px] text-slate-500">{formatDate(bill.uploadDate)} • {linkedCount} linked sarees</p>
                </div>
              );
            })}
          </div>
        );

      case 'CUSTOM':
        const customData = getCustomRangeData();
        const customRevenue = customData.sales.reduce((s, i) => s + i.sellingPrice, 0);
        const customInvestment = customData.sarees.reduce((s, i) => s + i.purchasePrice, 0);
        const customExpenses = customData.expenses.reduce((s, i) => s + i.amount, 0);
        const customProfit = customRevenue - customInvestment - customExpenses;
        return (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl">
              <p className="text-[10px] uppercase tracking-wider text-amber-600">Period</p>
              <p className="text-sm font-bold text-amber-900">{formatDate(customStartDate)} - {formatDate(customEndDate)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <p className="text-[10px] uppercase tracking-wider text-emerald-600">Revenue</p>
                <p className="text-lg font-bold text-emerald-900">{formatCurrency(customRevenue)}</p>
                <p className="text-[10px] text-emerald-600">{customData.sales.length} sales</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl">
                <p className="text-[10px] uppercase tracking-wider text-amber-600">Purchases</p>
                <p className="text-lg font-bold text-amber-900">{formatCurrency(customInvestment)}</p>
                <p className="text-[10px] text-amber-600">{customData.sarees.length} items</p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl">
                <p className="text-[10px] uppercase tracking-wider text-rose-600">Expenses</p>
                <p className="text-lg font-bold text-rose-900">{formatCurrency(customExpenses)}</p>
                <p className="text-[10px] text-rose-600">{customData.expenses.length} entries</p>
              </div>
              <div className={`p-3 rounded-xl ${customProfit >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <p className={`text-[10px] uppercase tracking-wider ${customProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>Net</p>
                <p className={`text-lg font-bold ${customProfit >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>{formatCurrency(customProfit)}</p>
              </div>
            </div>
          </div>
        );

      default:
        const performance = activeReport === '12M' ? monthlyPerformance12M : monthlyPerformance6M;
        const sliceCount = activeReport === '1M' ? 1 : activeReport === '3M' ? 3 : activeReport === '6M' ? 6 : 12;
        return (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {performance.slice(0, sliceCount).map((row) => (
              <div key={row.key} className="p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-900">{row.label}</p>
                  <p className={`text-xs font-bold ${row.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    Net {formatCurrency(row.net)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-16 text-slate-500">Revenue</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(row.revenue / maxChartValue) * 100}%` }} />
                    </div>
                    <span className="text-[10px] w-14 text-right">{formatCurrency(row.revenue)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-16 text-slate-500">Purchase</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(row.investment / maxChartValue) * 100}%` }} />
                    </div>
                    <span className="text-[10px] w-14 text-right">{formatCurrency(row.investment)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] w-16 text-slate-500">Expenses</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(row.expenses / maxChartValue) * 100}%` }} />
                    </div>
                    <span className="text-[10px] w-14 text-right">{formatCurrency(row.expenses)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Reports</p>
          <h2 className="text-xl font-bold text-slate-950">Business Analysis</h2>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="relative">
        <select 
          value={activeReport} 
          onChange={(e) => setActiveReport(e.target.value as ReportType)}
          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-semibold text-slate-900 shadow-sm outline-none focus:border-slate-400"
        >
          <optgroup label="Time Period Reports">
            <option value="1M">📅 Monthly Overview</option>
            <option value="3M">📊 3 Month Report</option>
            <option value="6M">📈 6 Month Report</option>
            <option value="12M">📆 12 Month Report</option>
            <option value="CUSTOM">🗓️ Custom Date Range</option>
          </optgroup>
          <optgroup label="Financial Reports">
            <option value="PL">💰 Profit & Loss</option>
            <option value="EXPENSES">💸 Expense Report</option>
          </optgroup>
          <optgroup label="Transaction Reports">
            <option value="PURCHASE">🛒 Purchase History</option>
            <option value="SALES">💵 Sales Ledger</option>
            <option value="BILLS">📄 Uploaded Bills</option>
          </optgroup>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-3.5 h-4 w-4 text-slate-400" />
      </div>

      {/* Custom Date Range Selector */}
      {activeReport === 'CUSTOM' && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-900">Select Date Range</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-amber-700">From</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full mt-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-amber-700">To</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full mt-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => setShowReportModal(true)}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white"
        >
          <FileText className="h-4 w-4" />
          View Report
        </button>
        <button 
          onClick={downloadReport}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Sell Through</span>
          </div>
          <p className="text-xl font-bold text-slate-950">{Math.round(summary.sellThrough * 100)}%</p>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <PieChart className="h-4 w-4 text-amber-600" />
            <span className="text-[10px] uppercase tracking-wider text-slate-500">Total Items</span>
          </div>
          <p className="text-xl font-bold text-slate-950">{summary.totalCount}</p>
        </div>
      </div>

      {/* Bills Dropdown */}
      <div className="border border-slate-200/80 bg-white rounded-xl overflow-hidden">
        <button 
          onClick={() => setShowBillsDropdown(!showBillsDropdown)}
          className="w-full flex items-center justify-between p-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Uploaded Bills</p>
              <p className="text-[10px] text-slate-500">{data.bills.length} bills saved</p>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition ${showBillsDropdown ? 'rotate-180' : ''}`} />
        </button>
        
        {showBillsDropdown && (
          <div className="border-t border-slate-100 px-4 pb-4">
            <div className="space-y-2 mt-3 max-h-[200px] overflow-y-auto">
              {data.bills.sort((a, b) => Number(new Date(b.uploadDate)) - Number(new Date(a.uploadDate))).map((bill) => {
                const linkedCount = data.sarees.filter(s => s.billId === bill.id).length;
                return (
                  <div key={bill.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div>
                      <p className="text-xs font-medium text-slate-900">{bill.supplierName}</p>
                      <p className="text-[9px] text-slate-500">{formatDate(bill.uploadDate)} • {linkedCount} items</p>
                    </div>
                    <p className="text-xs font-semibold text-slate-900">{formatCurrency(bill.totalAmount)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* View Report Modal */}
      <Modal 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        title={getReportTitle(activeReport)}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {renderReportContent()}
          <button 
            onClick={downloadReport}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white"
          >
            <Download className="h-4 w-4" />
            Download CSV
          </button>
        </div>
      </Modal>
    </div>
  );
}