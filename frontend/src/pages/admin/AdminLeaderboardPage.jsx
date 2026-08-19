import React, { useState } from 'react';
import { Award, ShieldCheck } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const AdminLeaderboardPage = () => {
  const { addToast } = useToast();
  const [studentId, setStudentId] = useState('');
  const [badgeId, setBadgeId] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAwardBadge = async (e) => {
    e.preventDefault();
    if (!studentId) return;

    setLoading(true);
    try {
      const res = await adminApi.awardBadge(parseInt(studentId), parseInt(badgeId));
      if (res.success) {
        addToast('Custom badge awarded to student!', 'success');
        setStudentId('');
      }
    } catch (e) {
      addToast('Failed to award badge', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-500" /> Award Badges & Manage Rankings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Recognize outstanding student achievements with special honor badges
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <form onSubmit={handleAwardBadge} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Student ID *</label>
            <input
              type="number"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. 1"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Badge *</label>
            <select
              value={badgeId}
              onChange={(e) => setBadgeId(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
            >
              <option value={1}>🌟 Top Contributor Badge</option>
              <option value={2}>💻 Full Stack Pioneer Badge</option>
              <option value={3}>🔥 Most Liked Project Badge</option>
            </select>
          </div>

          <Button type="submit" isLoading={loading} className="w-full">
            <Award className="w-4 h-4" /> Award Badge
          </Button>
        </form>
      </Card>
    </div>
  );
};
