import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FolderGit2, Eye, Lock, Clock, HardDrive, UserCheck, Shield, ThumbsUp, Download, CheckCircle2 } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { adminApi } from '../../api/adminApi';
import { Card } from '../../components/common/Card';
import { Skeleton } from '../../components/common/Skeleton';

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await adminApi.getDashboardData();
        if (res.success) {
          setData(res.data);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

  const statCards = [
    { label: 'Total Students', value: data?.totalStudents || 0, icon: Users, color: 'text-indigo-500 bg-indigo-500/10' },
    { label: 'Active Students', value: data?.activeStudents || 0, icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Total Projects', value: data?.totalProjects || 0, icon: FolderGit2, color: 'text-brand-500 bg-brand-500/10' },
    { label: 'Public Repos', value: data?.publicProjects || 0, icon: Eye, color: 'text-sky-500 bg-sky-500/10' },
    { label: 'Private Repos', value: data?.privateProjects || 0, icon: Lock, color: 'text-slate-400 bg-slate-500/10' },
    { label: 'Pending Approval', value: data?.pendingProjects || 0, icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Storage Used', value: data?.storageUsed || '0.00 B', icon: HardDrive, color: 'text-rose-500 bg-rose-500/10' },
    { label: 'Total Views', value: data?.totalViews || 0, icon: Eye, color: 'text-cyan-500 bg-cyan-500/10' },
    { label: 'Downloads', value: data?.totalDownloads || 0, icon: Download, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Likes', value: data?.totalLikes || 0, icon: ThumbsUp, color: 'text-pink-500 bg-pink-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Shield className="w-6 h-6 text-rose-500" /> Admin Command Center
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Real-time system analytics, storage utilization, pending approvals, and technology stack distribution
        </p>
      </div>

      {/* Admin Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading
          ? Array(10)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          : statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} className="p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                    <div className={`p-1.5 rounded-lg ${stat.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <span className="text-base font-black text-slate-900 dark:text-slate-100 mt-2 truncate">{stat.value}</span>
                </Card>
              );
            })}
      </div>

      {/* Top Contributor Callout */}
      {data?.mostActiveStudent && (
        <Card className="p-4 bg-gradient-to-r from-brand-900/30 via-indigo-950/30 to-slate-900 border-brand-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/20 text-brand-400 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-brand-300 uppercase tracking-wider block">Top Class Contributor</span>
              <span className="text-sm font-bold text-slate-100">{data.mostActiveStudent}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Recharts Graphical Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart: Monthly Projects Growth */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Projects Uploaded per Month</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.monthlyProjects || []}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Line type="monotone" dataKey="projects" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart: Technology Stack Distribution */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Technology Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data?.techDistribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {(data?.techDistribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
