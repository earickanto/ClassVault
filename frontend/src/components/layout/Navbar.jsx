import React from 'react';
import { Menu, LogOut, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { NotificationDropdown } from '../common/NotificationDropdown';
import { Badge } from '../common/Badge';

export const Navbar = ({ onOpenMobileMenu }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
      <div className="flex items-center justify-between px-4 sm:px-8 h-16">
        {/* Left Side: Mobile Hamburger Menu & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open mobile navigation drawer"
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-brand-600/20">
              CV
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-slate-100">
                Class<span className="text-brand-500">Vault</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                v1.0 SaaS
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Theme Toggle, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          {user && user.role !== 'ROLE_ADMIN' && <NotificationDropdown />}

          {user && (
            <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden sm:flex flex-col items-end text-right">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                  {user.name}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge variant={user.role === 'ROLE_ADMIN' ? 'danger' : 'brand'} className="text-[10px] py-0 px-1.5">
                    {user.role === 'ROLE_ADMIN' ? (
                      <>
                        <Shield className="w-3 h-3" /> ADMIN
                      </>
                    ) : (
                      user.rollNumber || 'STUDENT'
                    )}
                  </Badge>
                </div>
              </div>

              <img
                src={user.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={user.name}
                className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
              />

              <button
                onClick={logout}
                aria-label="Logout"
                title="Logout"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
