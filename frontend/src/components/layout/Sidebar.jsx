import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderGit2,
  Trophy,
  User,
  Bookmark,
  PlusCircle,
  Shield,
  Users,
  Megaphone,
  Award,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

export const Sidebar = ({ isMobileOpen, onCloseMobile, onOpenUploadModal }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Explore Projects', icon: FolderGit2 },
    { to: '/my-projects', label: 'My Projects', icon: FolderGit2 },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/bookmarks', label: 'Saved Projects', icon: Bookmark },
    { to: '/profile', label: 'My Profile & ID', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Manage Students', icon: Users },
    { to: '/admin/projects', label: 'Manage Projects', icon: FolderGit2 },
    { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    { to: '/admin/leaderboard', label: 'Badges & Rankings', icon: Award },
  ];

  const navContent = (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="space-y-6">
        {/* Upload Action Button */}
        {!isAdmin && (
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onOpenUploadModal();
            }}
            aria-label="Upload New Project"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-brand-600/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <PlusCircle className="w-5 h-5" /> Upload Project
          </button>
        )}

        {/* Navigation Sections */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            {isAdmin ? 'Admin Portal' : 'Student Portal'}
          </p>

          {(isAdmin ? adminLinks : studentLinks).map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200',
                    isActive
                      ? isAdmin
                        ? 'bg-rose-500/10 text-rose-500 font-bold border border-rose-500/20'
                        : 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold border border-brand-200/50 dark:border-brand-800/40'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  )
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer Info Card */}
      <div className={cn(
        'p-3.5 rounded-2xl border text-xs space-y-1',
        isAdmin
          ? 'bg-rose-950/30 border-rose-800/40 text-rose-300'
          : 'bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
      )}>
        <div className="flex items-center gap-1.5 font-bold">
          {isAdmin ? <Shield className="w-4 h-4 text-rose-400" /> : <FolderGit2 className="w-4 h-4 text-brand-400" />}
          <span>{isAdmin ? 'Admin Mode Active' : 'ClassVault Repository'}</span>
        </div>
        <p className="text-[11px] leading-tight">Private college project platform.</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:block w-64 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#090d16] shrink-0 min-h-[calc(100vh-4rem)] transition-colors duration-300">
        {navContent}
      </aside>

      {/* Mobile Slide-Out Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#090d16] border-r border-slate-200 dark:border-slate-800 z-50 shadow-2xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">Navigation Menu</span>
                <button
                  onClick={onCloseMobile}
                  aria-label="Close navigation drawer"
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grow overflow-y-auto">{navContent}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
