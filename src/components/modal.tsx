import { ReactNode } from 'react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }: { isOpen: boolean; onClose: () => void; title: string; children: ReactNode; maxWidth?: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-end justify-center sm:items-center">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity z-0" 
        onClick={onClose} 
      />
      <div className={`relative z-50 w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-[32px] border border-white/40 bg-white/95 p-6 shadow-2xl animate-in slide-in-from-bottom-5`}>
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 mb-4">
          <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
          <button onClick={onClose} className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}