import React, { useState, useEffect, useRef } from 'react';
import type { UserProfile } from '../utils/auth';

interface AuthWidgetProps {
  isLoggedIn: boolean;
  userProfile: UserProfile | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const AuthWidget: React.FC<AuthWidgetProps> = ({
  isLoggedIn,
  userProfile,
  onOpenAuthModal,
  onLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    onLogout();
  };

  // Extract initials and first name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getFirstName = (name: string) => {
    return name.split(' ')[0];
  };

  return (
    <div ref={dropdownRef} className="fixed top-4 right-6 z-40">
      {!isLoggedIn ? (
        <button
          onClick={onOpenAuthModal}
          className="backdrop-blur-md bg-slate-950/70 border border-slate-800/80 hover:border-violet-500/50 hover:bg-slate-900/80 px-5 py-2.5 rounded-full flex items-center gap-2 text-xs md:text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group"
        >
          <svg
            className="w-4 h-4 text-violet-400 group-hover:text-violet-300 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          Entrar / Cadastrar
        </button>
      ) : (
        <div className="relative">
          {/* User Badge Button */}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="backdrop-blur-md bg-slate-950/70 border border-slate-800/80 hover:border-violet-500/50 hover:bg-slate-900/80 px-3 py-1.5 rounded-full flex items-center gap-2.5 shadow-lg transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-[11px] font-extrabold text-white shadow-md shadow-violet-600/20">
              {userProfile ? getInitials(userProfile.nome) : 'U'}
            </div>
            
            <div className="flex flex-col items-start text-left pr-1">
              <span className="text-xs font-bold text-white leading-tight">
                {userProfile ? getFirstName(userProfile.nome) : 'Usuário'}
              </span>
              <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5 mt-0.5">
                ⭐ {userProfile ? Number(userProfile.reputacao).toFixed(1) : '5.0'}
              </span>
            </div>

            <svg
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* User Details Dropdown */}
          {dropdownOpen && (
            <div className="backdrop-blur-lg bg-slate-950/95 border border-slate-800/80 rounded-2xl p-4 shadow-2xl absolute right-0 top-13 w-64 flex flex-col gap-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header profile info */}
              <div className="border-b border-slate-800/60 pb-3 flex flex-col">
                <span className="text-sm font-bold text-white">
                  {userProfile ? userProfile.nome : 'Usuário'}
                </span>
                <span className="text-[11px] text-slate-400 truncate mt-0.5">
                  {userProfile ? userProfile.email : ''}
                </span>
              </div>

              {/* System privileges and states */}
              {userProfile && (
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-medium">Acesso:</span>
                    <span className="px-2 py-0.5 bg-violet-650/20 text-violet-300 font-bold rounded-md">
                      {userProfile.acessoSistema}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-medium">Limite Empréstimos:</span>
                    <span className="text-white font-bold">
                      {userProfile.limiteLivros}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400 font-medium">Status Multas:</span>
                    <span
                      className={`px-2 py-0.5 font-bold rounded-md ${
                        userProfile.statusMultas === 'REGULAR'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-rose-500/10 text-rose-400'
                      }`}
                    >
                      {userProfile.statusMultas}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleLogoutClick}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-rose-950/25 border border-slate-850 hover:border-rose-900/40 text-slate-300 hover:text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Sair da Conta
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
