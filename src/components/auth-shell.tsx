'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function AuthShell({ hasUsers }: { hasUsers: boolean }) {
  const [mode, setMode] = useState<'login' | 'register'>(hasUsers ? 'login' : 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError('');
    setLoading(true);

    const response = await fetch(`/api/auth/${mode === 'login' ? 'login' : 'register'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? 'Something went wrong.');
      return;
    }

    window.location.reload();
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--canvas)]">
      <div className="pointer-events-none absolute inset-0 saree-atmosphere" />
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
        <section className="relative overflow-hidden rounded-[40px] border border-white/70 bg-[linear-gradient(145deg,rgba(15,23,42,0.96),rgba(136,19,55,0.94),rgba(14,116,144,0.86))] px-6 py-8 text-white shadow-[0_30px_120px_rgba(15,23,42,0.35)] sm:px-8 lg:px-10">
          <div className="absolute -right-10 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.35),transparent_65%)] blur-2xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.10),transparent_70%)] blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/80">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Sarees by Usha Atelier OS
            </div>
            <div className="relative mt-8 max-w-[340px]">
              {/* Soft white glowing round aura behind logo */}
              <div className="absolute left-1/2 top-1/2 -z-10 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-60 blur-[50px] sm:h-[280px] sm:w-[280px]" />
              <Image
                src="/brand/logo-transparent.png"
                alt="Sarees by Usha"
                width={520}
                height={520}
                priority
                className="relative z-10 h-auto w-full drop-shadow-[0_10px_30px_rgba(15,23,42,0.4)]"
              />
            </div>
            <h1 className="mt-8 max-w-3xl font-display text-5xl leading-none sm:text-6xl lg:text-[5.4rem]">
              Build the saree business like an atelier, not a spreadsheet.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
              Inventory, sourcing, expense drift, bill proof, and realized margin in one premium operating surface for your own label.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ['Inventory memory', 'Every saree tracked individually'],
                ['Margin clarity', 'Profit updates as sales land'],
                ['Bill proof', 'Uploads stay connected to batches'],
              ].map(([title, body]) => (
                <div key={title} className="rounded-[24px] border border-white/16 bg-white/10 p-4 backdrop-blur-md">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[34px] border border-white/70 bg-white/86 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
                <div className="absolute inset-0 -z-10 rounded-full bg-white opacity-80 blur-xl" />
                <Image
                  src="/brand/app-icon.png"
                  alt="Sarees by Usha emblem"
                  width={72}
                  height={72}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                  {hasUsers ? 'Owner sign in' : 'Create owner account'}
                </p>
                <h2 className="mt-1 font-display text-3xl text-slate-950">
                  {hasUsers ? 'Welcome back to Sarees by Usha' : 'Open Sarees by Usha'}
                </h2>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
              Your branded command desk for saree inventory, live margin, sourcing history, and supplier bills.
            </p>

            {hasUsers ? (
              <div className="mt-5 inline-flex rounded-full border border-slate-200 bg-slate-50 p-1 text-sm">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`rounded-full px-4 py-2 ${mode === 'login' ? 'bg-slate-950 text-white' : 'text-slate-600'}`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`rounded-full px-4 py-2 ${mode === 'register' ? 'bg-slate-950 text-white' : 'text-slate-600'}`}
                  disabled
                >
                  Owner locked
                </button>
              </div>
            ) : null}

            <div className="mt-6 grid gap-4">
              {!hasUsers ? (
                <div>
                  <label className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Owner name</label>
                  <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--brand-teal)]" placeholder="Your name" />
                </div>
              ) : null}
              <div>
                <label className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Email</label>
                <input value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--brand-teal)]" placeholder="owner@studio.com" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Password</label>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--brand-teal)]" placeholder="At least 8 characters" />
              </div>
            </div>

            {error ? <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <button type="button" onClick={submit} disabled={loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
              {loading ? 'Working...' : hasUsers ? 'Sign in' : 'Create owner and load demo workspace'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
