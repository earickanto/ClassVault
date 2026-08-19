import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderGit2,
  Eye,
  Lock,
  ThumbsUp,
  Download,
  Trophy,
  PlusCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  User,
  ShieldCheck,
  CheckCircle2,
  Award,
  ArrowRight,
  Percent,
} from 'lucide-react';
import { projectApi } from '../api/projectApi';
import { studentApi } from '../api/studentApi';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';

export const DashboardPage = ({ onOpenUploadModal }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [leaderboardRank, setLeaderboardRank] = useState(1);
  const [percentileAhead, setPercentileAhead] = useState(100);
  const [totalStudents, setTotalStudents] = useState(0);
  const [stats, setStats] = useState({
    totalProjects: 0,
    publicProjects: 0,
    privateProjects: 0,
    totalLikes: 0,
    totalDownloads: 0,
    totalViews: 0,
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, profileRes] = await Promise.all([
          projectApi.getMyProjects(),
          studentApi.getProfile().catch(() => ({ data: {} })),
        ]);

        const list = projRes.data || [];
        setProjects(list);

        const pub = list.filter((p) => p.visibility === 'PUBLIC').length;
        const priv = list.filter((p) => p.visibility === 'PRIVATE').length;
        const likes = list.reduce((sum, p) => sum + (p.likesCount || 0), 0);
        const downloads = list.reduce((sum, p) => sum + (p.downloadsCount || 0), 0);
        const views = list.reduce((sum, p) => sum + (p.viewsCount || 0), 0);

        setStats({
          totalProjects: list.length,
          publicProjects: pub,
          privateProjects: priv,
          totalLikes: likes,
          totalDownloads: downloads,
          totalViews: views,
        });

        if (profileRes.data) {
          setStudentProfile(profileRes.data);
          if (profileRes.data.leaderboardRank) {
            setLeaderboardRank(profileRes.data.leaderboardRank);
          }
          if (profileRes.data.percentileAhead !== undefined) {
            setPercentileAhead(profileRes.data.percentileAhead);
          }
          if (profileRes.data.totalClassStudents) {
            setTotalStudents(profileRes.data.totalClassStudents);
          }
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const completion = studentProfile?.completionPercentage || 40;

  const statCards = [
    { title: 'Total Projects', value: stats.totalProjects, icon: FolderGit2, color: 'text-brand-500 bg-brand-500/10' },
    { title: 'Public Repos', value: stats.publicProjects, icon: Eye, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Private Repos', value: stats.privateProjects, icon: Lock, color: 'text-indigo-500 bg-indigo-500/10' },
    { title: 'Total Views', value: stats.totalViews, icon: Eye, color: 'text-sky-500 bg-sky-500/10' },
    { title: 'Total Likes', value: stats.totalLikes, icon: ThumbsUp, color: 'text-rose-500 bg-rose-500/10' },
    { title: 'Leaderboard Rank', value: `#${leaderboardRank}`, icon: Trophy, color: 'text-purple-500 bg-purple-500/10' },
    { title: 'Class Percentile', value: `${percentileAhead}%`, icon: Percent, color: 'text-amber-500 bg-amber-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner & Greeting */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-indigo-600 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-brand-200 text-xs font-semibold">
            <Clock className="w-4 h-4" /> {getGreeting()}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, {user?.name || studentProfile?.name || 'Student'}! 👋
          </h1>
          <p className="text-sm text-brand-100/90 max-w-2xl leading-relaxed">
            Welcome to your ClassVault repository. Manage your college class projects, view analytics, and climb the leaderboard!
          </p>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button
              onClick={onOpenUploadModal}
              className="bg-white text-brand-700 hover:bg-slate-100 border-none font-bold text-xs"
            >
              <PlusCircle className="w-4 h-4" /> Upload Project
            </Button>
            <Button
              onClick={() => navigate('/my-projects')}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
            >
              My Projects
            </Button>
            <Button
              onClick={() => navigate('/leaderboard')}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
            >
              Leaderboard
            </Button>
          </div>
        </div>
      </div>

      {/* Dynamic Profile Completion Status Banner */}
      <Card className={`p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
        completion === 100
          ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-emerald-500/30'
          : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/30'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${
            completion === 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
          }`}>
            {completion === 100 ? <CheckCircle2 className="w-6 h-6" /> : <Award className="w-6 h-6" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-100">
                {completion === 100 ? 'Your profile is complete ✓' : 'Profile Completion Status'}
              </h3>
              {completion === 100 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                  Profile Ready
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {completion}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {completion === 100
                ? 'Great job! Your academic identity, skills, bio, and developer profiles are 100% verified.'
                : 'Add your developer profile links, skills, and bio to reach 100% and unlock the Profile Ready milestone.'}
            </p>
          </div>
        </div>

        <div>
          {completion < 100 ? (
            <Button
              onClick={() => navigate('/profile')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5"
            >
              Complete your profile <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/profile')}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold shrink-0"
            >
              View Verified Profile
            </Button>
          )}
        </div>
      </Card>

      {/* Dynamic Rank & Class Standing Banner */}
      <Card className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-brand-500/20 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">
              Class Standing: <span className="text-amber-400 font-extrabold">Rank #{leaderboardRank}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              You are currently ahead of <span className="text-emerald-400 font-bold">{percentileAhead}%</span> of your class
              {totalStudents > 0 ? ` (${totalStudents} students total)` : ''}.
            </p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/leaderboard')}
          variant="secondary"
          size="sm"
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 shrink-0 text-xs font-bold"
        >
          <TrendingUp className="w-4 h-4" /> View Full Leaderboard
        </Button>
      </Card>

      {/* Animated Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {loading
          ? Array(7)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          : statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                >
                  <Card className="p-3.5 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {stat.title}
                      </span>
                      <div className={`p-1.5 rounded-xl ${stat.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                        {stat.value}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
      </div>

      {/* Recent Projects & Quick Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Uploads Showcase (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-brand-500" /> Recent Uploads
            </h3>
            <Button onClick={() => navigate('/my-projects')} variant="ghost" size="sm">
              View All <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            Array(3)
              .fill(0)
              .map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : projects.length === 0 ? (
            <Card className="p-12 text-center space-y-4 border-dashed border-2">
              <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-500 flex items-center justify-center mx-auto">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">No projects uploaded yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Showcase your academic coding assignments, semester projects, and mini-apps to your class.
                </p>
              </div>
              <Button onClick={onOpenUploadModal} size="sm">
                <PlusCircle className="w-4 h-4" /> Upload First Project
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 4).map((project) => (
                <Card
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="p-4 hover:border-brand-500/40 transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-brand-500 transition-colors">
                        {project.title}
                      </h4>
                      <Badge
                        variant={
                          project.status === 'APPROVED'
                            ? 'success'
                            : project.status === 'PENDING'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {project.status}
                      </Badge>
                      <Badge variant={project.visibility === 'PUBLIC' ? 'brand' : 'neutral'}>
                        {project.visibility}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-lg">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.technologyUsed &&
                        project.technologyUsed.split(',').map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-mono rounded-md text-slate-600 dark:text-slate-400"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 text-xs font-mono shrink-0">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-sky-400" /> {project.viewsCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-rose-400" /> {project.likesCount || 0}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Profile Quick Card */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white border-brand-500/20">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-500/20 text-brand-400 rounded-2xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-100">Academic Identity</h4>
                <p className="text-xs text-brand-300">Verified Class Student</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 font-mono divide-y divide-slate-700/50">
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Roll Number:</span>
                <span className="font-bold text-slate-200">{user?.rollNumber || studentProfile?.rollNumber || '—'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Register No:</span>
                <span className="font-bold text-indigo-400">{user?.registerNumber || studentProfile?.registerNumber || '—'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Department:</span>
                <span className="font-bold text-slate-200 truncate max-w-[160px]">{studentProfile?.department || user?.department || '—'}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Class & Sec:</span>
                <span className="font-bold text-slate-200">
                  Year {studentProfile?.year || 3} • Sec {studentProfile?.section || 'A'}
                </span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/profile')}
              variant="secondary"
              size="sm"
              className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold"
            >
              <User className="w-4 h-4" /> Manage Developer Profile
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
