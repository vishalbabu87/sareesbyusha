'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, WalletCards, ReceiptText, FileText } from 'lucide-react';

export function AppNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Expenses', href: '/expenses', icon: WalletCards },
    { name: 'Bills', href: '/bills', icon: ReceiptText },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/50 bg-white/50 backdrop-blur-xl h-screen fixed top-0 left-0 z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[linear-gradient(135deg,#0284c7,#0f172a)] text-white flex items-center justify-center">
             <span className="font-bold text-sm tracking-widest text-amber-300">U</span>
          </div>
          <span className="font-display font-semibold text-lg text-slate-900 tracking-wide">Sarees by Usha</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition duration-200 ${
                  isActive 
                    ? 'bg-slate-950 text-white font-medium shadow-md shadow-slate-900/10' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/60">
        <nav className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-16 py-1 transition-all ${
                  isActive ? 'text-slate-950' : 'text-slate-400'
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${isActive ? 'bg-slate-950 text-white' : 'bg-transparent'}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <span className={`text-[9px] mt-0.5 font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
        {/* Safe area padding for iOS */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </>
  );
}