'use client';

import { useState, useMemo, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { SectionShell, ScopeBadge, inputClasses, labelClasses } from './ui';
import {
  formatCurrency,
  formatDate,
  BusinessData,
  ExpenseScope,
} from '@/lib/saree-control';
import { WalletCards, Plus, X, Trash2 } from 'lucide-react';
import { Modal } from './modal';

const today = new Date().toISOString().slice(0, 10);

interface ExpenseItem {
  id: string;
  title: string;
  category: string;
  amount: string;
  date: string;
  scope: ExpenseScope;
  linkedSareeId: string;
  linkedBillId: string;
}

export function ExpenseDesk({ data }: { data: BusinessData }) {
  const router = useRouter();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<typeof data.expenses[0] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Multiple expenses form state
  const [expenses, setExpenses] = useState<ExpenseItem[]>([{
    id: '1',
    title: '',
    category: '',
    amount: '',
    date: today,
    scope: 'GLOBAL',
    linkedSareeId: '',
    linkedBillId: ''
  }]);

  const totalExpenses = useMemo(() => {
    return data.expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [data.expenses]);

  const addExpenseRow = () => {
    setExpenses([...expenses, {
      id: Date.now().toString(),
      title: '',
      category: '',
      amount: '',
      date: today,
      scope: 'GLOBAL',
      linkedSareeId: '',
      linkedBillId: ''
    }]);
  };

  const removeExpenseRow = (id: string) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const updateExpense = (id: string, field: keyof ExpenseItem, value: string) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const confirmDelete = (expense: typeof data.expenses[0]) => {
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/expenses/${expenseToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setExpenseToDelete(null);
        router.refresh();
      } else {
        console.error('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Filter out incomplete entries
    const validExpenses = expenses.filter(exp => exp.title && exp.amount && exp.category);
    if (validExpenses.length === 0) return;

    // Submit all expenses
    for (const exp of validExpenses) {
      if (exp.scope === 'SAREE' && !exp.linkedSareeId) continue;
      if (exp.scope === 'BILL' && !exp.linkedBillId) continue;

      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: exp.title.trim(),
          category: exp.category.trim(),
          amount: Number(exp.amount),
          date: exp.date,
          scope: exp.scope,
          linkedSareeId: exp.scope === 'SAREE' ? exp.linkedSareeId : undefined,
          linkedBillId: exp.scope === 'BILL' ? exp.linkedBillId : undefined,
        }),
      });
    }

    // Reset and close
    setExpenses([{
      id: '1',
      title: '',
      category: '',
      amount: '',
      date: today,
      scope: 'GLOBAL',
      linkedSareeId: '',
      linkedBillId: ''
    }]);
    setShowAddModal(false);
    router.refresh();
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Total Expense Card */}
      <div className="rounded-[20px] border border-white/80 bg-[linear-gradient(145deg,rgba(190,18,60,0.9),rgba(127,29,29,0.92))] p-4 text-white shadow-[0_12px_40px_rgba(190,18,60,0.25)] relative overflow-hidden">
        <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
        <div className="flex items-center justify-between relative z-10">
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/90 shadow-sm">Total Expenses</span>
          <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-md">
            <WalletCards className="h-4 w-4 text-white" />
          </div>
        </div>
        <p className="mt-3 text-3xl font-bold tracking-tight relative z-10">{formatCurrency(totalExpenses)}</p>
        <p className="mt-1 text-[10px] font-medium text-white/80 relative z-10">{data.expenses.length} expense entries recorded</p>
      </div>

      {/* Add Button */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm font-medium text-slate-600 hover:border-slate-400 hover:text-slate-800 transition"
      >
        <Plus className="h-4 w-4" />
        Add Expenses
      </button>

      {/* Expense List - Compact Cards */}
      <div className="space-y-2">
        {data.expenses.slice().sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date))).map((expense) => (
          <div 
            key={expense.id} 
            className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm relative group"
          >
            {/* Delete Button */}
            <button
              onClick={() => confirmDelete(expense)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 transition opacity-0 group-hover:opacity-100 sm:opacity-100"
            >
              <Trash2 className="h-3 w-3" />
            </button>

            <div className="flex items-center gap-3 min-w-0 pr-8">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-500">{expense.title.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950 truncate">{expense.title}</p>
                <p className="text-[10px] text-slate-500">{expense.category} • {formatDate(expense.date)}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 pl-2">
              <p className="text-sm font-bold text-slate-950">{formatCurrency(expense.amount)}</p>
              <ScopeBadge scope={expense.scope} />
            </div>
          </div>
        ))}
      </div>

      {/* Add Expenses Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Expenses" maxWidth="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">Add one or multiple expenses at once</p>
          
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {expenses.map((expense, index) => (
              <div key={expense.id} className="p-3 bg-slate-50 rounded-xl space-y-3 relative">
                {expenses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExpenseRow(expense.id)}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500">Title *</label>
                    <input 
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      value={expense.title}
                      onChange={(e) => updateExpense(expense.id, 'title', e.target.value)}
                      placeholder="Travel to market"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500">Category *</label>
                    <input 
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      value={expense.category}
                      onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                      placeholder="Custom category"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500">Amount *</label>
                    <input 
                      required
                      type="number"
                      min="0"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      value={expense.amount}
                      onChange={(e) => updateExpense(expense.id, 'amount', e.target.value)}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500">Date *</label>
                    <input 
                      required
                      type="date"
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      value={expense.date}
                      onChange={(e) => updateExpense(expense.id, 'date', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider text-slate-500">Allocation</label>
                  <select 
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    value={expense.scope}
                    onChange={(e) => updateExpense(expense.id, 'scope', e.target.value as ExpenseScope)}
                  >
                    <option value="GLOBAL">Shared (Global)</option>
                    <option value="SAREE">Specific Saree</option>
                    <option value="BILL">Bill/Batch</option>
                  </select>
                </div>

                {expense.scope === 'SAREE' && (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500">Linked Saree *</label>
                    <select 
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      value={expense.linkedSareeId}
                      onChange={(e) => updateExpense(expense.id, 'linkedSareeId', e.target.value)}
                    >
                      <option value="">Select saree</option>
                      {data.sarees.map((s) => <option key={s.id} value={s.id}>{s.name} - {s.sku}</option>)}
                    </select>
                  </div>
                )}

                {expense.scope === 'BILL' && (
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-500">Linked Bill *</label>
                    <select 
                      required
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                      value={expense.linkedBillId}
                      onChange={(e) => updateExpense(expense.id, 'linkedBillId', e.target.value)}
                    >
                      <option value="">Select bill</option>
                      {data.bills.map((b) => <option key={b.id} value={b.id}>{b.supplierName} - {formatCurrency(b.totalAmount)}</option>)}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addExpenseRow}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-2 text-sm font-medium text-slate-600 hover:border-slate-400"
          >
            <Plus className="h-4 w-4" />
            Add Another Expense
          </button>

          <button type="submit" className="w-full rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white">
            Save {expenses.filter(e => e.title && e.amount).length} Expense{expenses.filter(e => e.title && e.amount).length !== 1 ? 's' : ''}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => !isDeleting && setShowDeleteModal(false)} title="Delete Expense" maxWidth="max-w-sm">
        {expenseToDelete && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold text-slate-900">{expenseToDelete.title}</span>?
            </p>
            <p className="text-xs text-rose-600">
              This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-sm font-medium text-white hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
