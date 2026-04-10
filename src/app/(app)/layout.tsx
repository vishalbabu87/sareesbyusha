export const runtime = 'edge';
import { getHasUsers, getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AppNav } from '@/components/app-nav';
import { Sparkles, UserCircle2 } from 'lucide-react';
import Image from 'next/image';
import { Header } from '@/components/header';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="relative min-h-screen bg-[var(--canvas)] text-slate-950 flex flex-col lg:flex-row">
      <div className="pointer-events-none fixed inset-0 saree-atmosphere z-0" />
      <div className="pointer-events-none fixed inset-0 saree-grid opacity-70 z-0" />

      {/* Navigation Layer */}
      <AppNav />

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 relative z-10 lg:min-h-screen bg-transparent pb-24 lg:pb-12">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden px-4 pt-6 pb-2 flex justify-between items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-xs text-slate-600 shadow-sm">
               <UserCircle2 className="h-4 w-4 text-[var(--brand-teal)]" />
               <span className="font-semibold text-slate-900">{user.name}</span>
            </div>
            <Header userName={user.name} userEmail={user.email} />
        </div>

        {/* Global Desktop Header */}
        <div className="hidden lg:flex px-8 pt-8 justify-between items-center">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-slate-500 bg-white/50 px-4 py-2 rounded-full border border-slate-200/50 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-[var(--brand-saffron)]" />
                Atelier Ledger
            </div>
            <Header userName={user.name} userEmail={user.email} />
        </div>

        <main className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
            {children}
        </main>
      </div>
    </div>
  );
}
