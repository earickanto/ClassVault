import React, { useState } from 'react';
import { Megaphone, Send } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const AdminAnnouncementsPage = () => {
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setLoading(true);
    try {
      const res = await adminApi.createAnnouncement(title, body);
      if (res.success) {
        addToast('Announcement broadcasted to all students!', 'success');
        setTitle('');
        setBody('');
      }
    } catch (e) {
      addToast('Failed to broadcast announcement', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-amber-500" /> Class Announcements
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Broadcast important class deadline alerts or project repo updates to all registered students
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <form onSubmit={handleBroadcast} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Announcement Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Final Project Submission Deadline Extended"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Body / Details *</label>
            <textarea
              rows={4}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Provide complete instructions and submission guidelines..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
            />
          </div>

          <Button type="submit" isLoading={loading} className="w-full">
            <Send className="w-4 h-4" /> Broadcast Announcement to All Students
          </Button>
        </form>
      </Card>
    </div>
  );
};
