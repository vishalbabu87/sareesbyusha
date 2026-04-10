'use client';

import { useState } from 'react';
import { UserCircle2, LogOut } from 'lucide-react';

export function Header({ userName, userEmail }: { userName: string, userEmail: string }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const signOut = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Use window.location for a full page refresh to clear all state
        window.location.href = '/login';
      } else {
        console.error('Logout failed');
        setIsLoggingOut(false);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      setIsLoggingOut(false);
    }
  };

  const handleSignOutClick = () => {
    setShowMenu(false);
    signOut();
  };

  return (
    <div className="flex items-center gap-3 relative">
      <div className="hidden lg:inline-flex flex-col text-right">
        <span className="font-semibold text-slate-900 text-sm">{userName}</span>
        <span className="text-slate-500 text-xs">{userEmail}</span>
      </div>
      
      {/* Profile Button with Dropdown */}
      <div className="relative">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          disabled={isLoggingOut}
          className="h-10 w-10 bg-white/70 rounded-full border border-slate-200/80 flex items-center justify-center shadow-sm hover:bg-white hover:border-amber-300 transition-all disabled:opacity-50"
        >
          {isLoggingOut ? (
            <svg className="animate-spin h-5 w-5 text-slate-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <UserCircle2 className="h-5 w-5 text-slate-600" />
          )}
        </button>

        {/* Dropdown Menu */}
        {showMenu && !isLoggingOut && (
          <>
            {/* Backdrop to close menu */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowMenu(false)}
            />
            
            <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
              {/* User Info */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <p className="font-semibold text-slate-900 text-sm truncate">{userName}</p>
                <p className="text-slate-500 text-xs truncate">{userEmail}</p>
              </div>
              
              {/* Menu Items */}
              <div className="p-2">
                <button 
                  onClick={handleSignOutClick}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}