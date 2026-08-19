import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Sparkles, MessageSquare, ThumbsUp, Megaphone, Info } from 'lucide-react';
import { studentApi } from '../../api/studentApi';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await studentApi.getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
        const unread = (res.data || []).filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (e) {
      // Ignore if not logged in
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleToggle = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState && unreadCount > 0) {
      try {
        await studentApi.markNotificationsRead();
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (e) {}
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'PROJECT_LIKE':
        return <ThumbsUp className="w-4 h-4 text-brand-500" />;
      case 'PROJECT_COMMENT':
        return <MessageSquare className="w-4 h-4 text-indigo-500" />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        aria-label={`View notifications, ${unreadCount} unread`}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full text-xs font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                >
                  Close
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">No notifications yet</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 flex gap-3 text-xs transition-colors ${
                        notif.isRead ? 'opacity-70 bg-transparent' : 'bg-brand-50/30 dark:bg-brand-950/20'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 h-fit">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-800 dark:text-slate-200 font-medium leading-snug">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
