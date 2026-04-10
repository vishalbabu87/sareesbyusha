'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { inputClasses, labelClasses, textareaClasses } from './ui';
import { formatCurrency, formatDate, BusinessData } from '@/lib/saree-control';
import { CloudUpload, ReceiptText, Download, ArrowRight, Trash2 } from 'lucide-react';
import { Modal } from './modal';

const today = new Date().toISOString().slice(0, 10);

export function BillsDesk({ data }: { data: BusinessData }) {
  const router = useRouter();
  const [billDraft, setBillDraft] = useState({
    supplierName: '', totalAmount: '', uploadDate: today, notes: '', file: null as File | null
  });
  const [billFileHint, setBillFileHint] = useState('');

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [billToDelete, setBillToDelete] = useState<typeof data.bills[0] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBillFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setBillDraft({ ...billDraft, file });
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

  const handleBillSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!billDraft.supplierName || !billDraft.totalAmount) return;

    const formData = new FormData();
    formData.set('supplierName', billDraft.supplierName.trim());
    formData.set('totalAmount', String(Number(billDraft.totalAmount)));
    formData.set('uploadDate', billDraft.uploadDate);
    formData.set('notes', billDraft.notes.trim());
    if (billDraft.file) {
      formData.set('file', billDraft.file);
    }

    await fetch('/api/bills', {
      method: 'POST',
      body: formData,
    });

    setBillDraft({ supplierName: '', totalAmount: '', uploadDate: today, notes: '', file: null });
    setBillFileHint('');
    router.refresh();
  };

  const confirmDelete = (bill: typeof data.bills[0]) => {
    setBillToDelete(bill);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!billToDelete) return;
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/bills/${billToDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setBillToDelete(null);
        router.refresh();
      } else {
        console.error('Failed to delete bill');
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
      <div className="space-y-6">
        <form onSubmit={handleBillSubmit} className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(239,246,255,0.94),rgba(255,255,255,0.95))] p-5 shadow-sm sticky top-6">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs uppercase tracking-[0.28em] text-slate-500">Bill vault</p><h3 className="mt-2 text-2xl font-semibold text-slate-950">Save a supplier bill</h3></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0284c7,#0f172a)] text-white"><CloudUpload className="h-5 w-5" /></div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div><label className={labelClasses()}>Supplier</label><input required className={inputClasses()} value={billDraft.supplierName} onChange={(e) => setBillDraft({ ...billDraft, supplierName: e.target.value })} placeholder="Bharat Loom House" /></div>
            <div><label className={labelClasses()}>Total amount</label><input required className={inputClasses()} type="number" min="0" value={billDraft.totalAmount} onChange={(e) => setBillDraft({ ...billDraft, totalAmount: e.target.value })} placeholder="6200" /></div>
            <div><label className={labelClasses()}>Upload date</label><input required className={inputClasses()} type="date" value={billDraft.uploadDate} onChange={(e) => setBillDraft({ ...billDraft, uploadDate: e.target.value })} /></div>
            <div>
              <label className={labelClasses()}>Attach image or PDF</label>
              <input className={inputClasses()} type="file" accept="image/*,application/pdf" onChange={handleBillFileChange} />
              {billFileHint && <p className="mt-2 text-xs text-slate-500">{billFileHint}</p>}
            </div>
            <div className="sm:col-span-2"><label className={labelClasses()}>Notes</label><textarea className={textareaClasses()} value={billDraft.notes} onChange={(e) => setBillDraft({ ...billDraft, notes: e.target.value })} placeholder="Supplier details..." /></div>
          </div>
          <button type="submit" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#0284c7,#0f172a)] px-5 py-3 text-sm font-semibold text-white">Save bill<ArrowRight className="h-4 w-4" /></button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Bill Vault</p>
              <h3 className="mt-1 text-2xl font-semibold text-slate-950">Supplier paperwork</h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white"><ReceiptText className="h-5 w-5" /></div>
          </div>
          <p className="text-sm text-slate-600 mb-4">Bills stay linked to batches.</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {data.bills.slice().sort((a, b) => Number(new Date(b.uploadDate)) - Number(new Date(a.uploadDate))).map((bill) => {
              const linkedCount = data.sarees.filter((s) => s.billId === bill.id).length;
              const isImage = bill.fileType?.startsWith('image');
              return (
                <div key={bill.id} className="rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-4 relative">
                  {/* Delete Button */}
                  <button
                    onClick={() => confirmDelete(bill)}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="flex items-start justify-between gap-4 pr-8">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{bill.supplierName}</p>
                      <p className="mt-1 text-sm text-slate-600">{formatCurrency(bill.totalAmount)} - {formatDate(bill.uploadDate)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">{linkedCount} linked</span>
                    {bill.fileName && <span className="rounded-full bg-slate-100 px-3 py-1 truncate max-w-[150px]">{bill.fileName}</span>}
                  </div>
                  {bill.notes && <p className="mt-4 text-sm leading-6 text-slate-600">{bill.notes}</p>}
                  {bill.fileDataUrl && (
                    <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/92 p-3">
                      {isImage ? (
                        <Image src={bill.fileDataUrl} alt={bill.fileName ?? 'Bill'} width={960} height={640} unoptimized className="max-h-48 w-full rounded-xl object-cover" />
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">PDF attached</div>
                      )}
                      <a href={bill.fileDataUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-teal)]"><Download className="h-4 w-4" />Open</a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => !isDeleting && setShowDeleteModal(false)} title="Delete Bill" maxWidth="max-w-sm">
        {billToDelete && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete the bill from <span className="font-semibold text-slate-900">{billToDelete.supplierName}</span>?
            </p>
            <p className="text-xs text-rose-600">
              This will also delete all linked expenses and unlink all sarees from this bill. This action cannot be undone.
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
