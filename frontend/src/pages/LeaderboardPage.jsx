import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Medal, FolderGit2, ThumbsUp, Download, Eye, Sparkles } from 'lucide-react';
import { leaderboardApi } from '../api/leaderboardApi';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';

export const LeaderboardPage = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRankEntry, setMyRankEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await leaderboardApi.getLeaderboard();
      if (res.success) {
        setLeaderboard(res.data || []);
        if (user?.id) {
          const myEntry = (res.data || []).find((e) => e.studentId === user.id);
          setMyRankEntry(myEntry || null);
        }
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-300" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-700" />;
    return <span className="font-mono font-bold text-xs text-slate-400">#{rank}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" /> Class Leaderboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Weighted score calculation: Projects (10pts) + Likes (5pts) + Downloads (3pts) + Views (1pt)
          </p>
        </div>

        {myRankEntry && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white flex items-center gap-4 shadow-lg shrink-0">
            <div>
              <span className="text-[10px] font-bold text-brand-200 uppercase tracking-wider block">Your Rank</span>
              <span className="font-black text-xl">#{myRankEntry.rank}</span>
            </div>
            <div className="pl-4 border-l border-white/20">
              <span className="text-[10px] font-bold text-brand-200 uppercase tracking-wider block">Score</span>
              <span className="font-black text-xl">{myRankEntry.score} pts</span>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard Table Container */}
      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6 text-center">Rank</th>
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-6 text-center">Projects</th>
                <th className="py-4 px-6 text-center">Likes</th>
                <th className="py-4 px-6 text-center">Downloads</th>
                <th className="py-4 px-6 text-center">Views</th>
                <th className="py-4 px-6 text-right">Total Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="p-4">
                        <Skeleton className="h-10 w-full rounded-xl" />
                      </td>
                    </tr>
                  ))
              ) : leaderboard.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No leaderboard snapshot computed yet.
                  </td>
                </tr>
              ) : (
                leaderboard.map((entry) => {
                  const isCurrentUser = user?.id === entry.studentId;
                  return (
                    <motion.tr
                      key={entry.studentId}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`transition-colors ${
                        isCurrentUser
                          ? 'bg-brand-50/80 dark:bg-brand-950/40 font-bold border-l-4 border-l-brand-500'
                          : 'hover:bg-slate-50/50 dark:hover:bg-slate-900/30'
                      }`}
                    >
                      {/* Rank Icon */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center">{getRankBadge(entry.rank)}</div>
                      </td>

                      {/* Student Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                            alt={entry.name}
                            className="w-8 h-8 rounded-xl object-cover"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              {entry.name}
                              {isCurrentUser && <Badge variant="brand" className="text-[9px] py-0">YOU</Badge>}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 block">{entry.rollNumber} • {entry.department}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center font-mono font-semibold">{entry.projectCount}</td>
                      <td className="py-4 px-6 text-center font-mono text-rose-500 font-semibold">{entry.likesCount}</td>
                      <td className="py-4 px-6 text-center font-mono text-amber-500 font-semibold">{entry.downloadsCount}</td>
                      <td className="py-4 px-6 text-center font-mono text-slate-400">{entry.viewsCount}</td>

                      <td className="py-4 px-6 text-right font-black text-sm text-brand-600 dark:text-brand-400 font-mono">
                        {entry.score} pts
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
