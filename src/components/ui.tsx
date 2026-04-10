import type { ReactNode } from 'react';

export function shellCard(extra = '') {
  return `rounded-[30px] border border-white/70 bg-white/82 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl ${extra}`;
}

export function inputClasses() {
  return 'w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-[var(--brand-teal)] focus:ring-4 focus:ring-[color:rgba(14,116,144,0.10)]';
}

export function textareaClasses() {
  return `${inputClasses()} min-h-[110px] resize-none`;
}

export function labelClasses() {
  return 'text-[11px] uppercase tracking-[0.28em] text-slate-500';
}

export function MetricCard({
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
    <div className="group relative overflow-hidden rounded-[16px] border border-white/60 bg-white/85 p-2.5 shadow-[0_4px_20px_rgba(31,41,55,0.06)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5">
      <div className={`absolute inset-x-0 top-0 h-0.5 ${accent}`} />
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-[8px] uppercase font-bold tracking-[0.15em] text-slate-500">{label}</p>
          <div className={`flex h-5 w-5 items-center justify-center rounded-lg text-white shadow-sm ${accent}`}>{icon}</div>
        </div>
        <div>
          <p className="text-base font-bold tracking-tight text-slate-950">{value}</p>
          <p className="text-[9px] leading-3 text-slate-500 truncate">{detail}</p>
        </div>
      </div>
    </div>
  );
}

export function SectionShell({
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

export function StatusBadge({ status }: { status: 'UNSOLD' | 'RESERVED' | 'SOLD' }) {
  const styles: Record<string, string> = {
    UNSOLD: 'bg-amber-100 text-amber-900 border-amber-200',
    RESERVED: 'bg-sky-100 text-sky-900 border-sky-200',
    SOLD: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  };

  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold tracking-[0.15em] ${styles[status]}`}>{status}</span>;
}

export function ScopeBadge({ scope }: { scope: 'GLOBAL' | 'SAREE' | 'BILL' }) {
  const labels: Record<string, string> = {
    GLOBAL: 'Shared',
    SAREE: 'Item',
    BILL: 'Batch',
  };

  return <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-medium text-slate-600">{labels[scope]}</span>;
}