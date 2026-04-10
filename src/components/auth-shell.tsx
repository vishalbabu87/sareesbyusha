'use client';

import { useState } from 'react';
import { ArrowRight, Store } from 'lucide-react';
import Image from 'next/image';

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
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
    <main className="relative h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      {/* Header with shop logo */}
      <div className="relative z-10 px-4 pt-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <Store className="h-4 w-4 text-white" />
        </div>
      </div>

      {/* Main Content - All fits on one screen */}
      <div className="flex-1 flex flex-col justify-center px-4 py-2 relative z-10">
        <div className="w-full max-w-xs mx-auto">
          {/* Logo - Smaller */}
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 bg-white rounded-xl shadow-lg overflow-hidden">
              <Image
                src="/brand/logo-transparent.png.png"
                alt="Sarees by Usha"
                width={80}
                height={80}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          </div>
          
          {/* Sarees by Usha - Smaller text */}
          <h2 className="text-xl font-light text-white mb-1 tracking-wide text-center">
            <span className="font-normal">Sarees</span>
            <span className="text-amber-400 mx-1">by</span>
            <span className="font-semibold">Usha</span>
          </h2>
          
          {/* Badge - Compact */}
          <div className="flex justify-center mb-3">
            <span className="text-[10px] text-white/60">Inventory Management</span>
          </div>
          
          {/* Login/Register Toggle */}
          {hasUsers && (
            <div className="flex rounded-lg bg-white/10 p-0.5 mb-3">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                  mode === 'login' 
                    ? 'bg-slate-950 text-white' 
                    : 'text-white/70'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                  mode === 'register' 
                    ? 'bg-slate-950 text-white' 
                    : 'text-white/70'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Form - Compact fields */}
          <div className="bg-white rounded-2xl p-4 shadow-xl">
            <div className="space-y-2">
              {mode === 'register' && (
                <div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500"
                    placeholder="Full Name"
                  />
                </div>
              )}
              
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500"
                  placeholder="Email"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-amber-500"
                  placeholder="Password"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200">
                <p className="text-xs text-rose-600 text-center">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={submit}
              disabled={loading}
              className="mt-3 w-full flex items-center justify-center gap-1 rounded-lg bg-slate-950 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-white/30 mt-3">
            © {new Date().getFullYear()} Sarees by Usha
          </p>
        </div>
      </div>
    </main>
  );
}
