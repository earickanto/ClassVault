import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Github, Linkedin, Globe, Code2, Plus, X, Upload, CheckCircle2, Shield, Lock, ShieldCheck, Sparkles, Trophy, Award } from 'lucide-react';
import { studentApi } from '../api/studentApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { DigitalIdCard } from '../components/common/DigitalIdCard';

export const ProfilePage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [newSkillTag, setNewSkillTag] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const [formData, setFormData] = useState({
    bio: '',
    githubUrl: '',
    leetcodeUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    skills: '',
  });

  const checkCelebration = (profile) => {
    if (profile && profile.completionPercentage >= 100) {
      const key = `profile_celebrated_${profile.id || user?.id}`;
      if (!localStorage.getItem(key)) {
        setShowCelebration(true);
        localStorage.setItem(key, 'true');
      }
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getProfile();
      if (res.success && res.data) {
        setStudent(res.data);
        setFormData({
          bio: res.data.bio || '',
          githubUrl: res.data.githubUrl || '',
          leetcodeUrl: res.data.leetcodeUrl || '',
          linkedinUrl: res.data.linkedinUrl || '',
          portfolioUrl: res.data.portfolioUrl || '',
          skills: res.data.skills || '',
        });
        checkCelebration(res.data);
      }
    } catch (e) {
      addToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await studentApi.updateProfile(formData);
      if (res.success) {
        addToast('Profile updated successfully', 'success');
        setStudent(res.data);
        checkCelebration(res.data);
      }
    } catch (e) {
      addToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const res = await studentApi.uploadPhoto(file);
      if (res.success) {
        addToast('Profile photo updated', 'success');
        setStudent(res.data);
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to upload photo';
      addToast(msg, 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const addSkill = () => {
    if (!newSkillTag.trim()) return;
    const current = formData.skills ? formData.skills.split(',').map((s) => s.trim()) : [];
    if (!current.includes(newSkillTag.trim())) {
      const updated = [...current, newSkillTag.trim()].join(',');
      setFormData((prev) => ({ ...prev, skills: updated }));
    }
    setNewSkillTag('');
  };

  const removeSkill = (skillToRemove) => {
    const current = formData.skills ? formData.skills.split(',').map((s) => s.trim()) : [];
    const updated = current.filter((s) => s !== skillToRemove).join(',');
    setFormData((prev) => ({ ...prev, skills: updated }));
  };

  const skillsList = formData.skills ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const completion = student?.completionPercentage || 40;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Student Profile & Class Identity
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your bio, professional developer links, and technical skill tags
        </p>
      </div>

      {/* Completion Progress Bar */}
      <Card className={`p-6 space-y-3 transition-all ${
        completion === 100
          ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border-emerald-500/30'
          : 'bg-gradient-to-r from-indigo-900/40 via-violet-950/40 to-slate-900 border-indigo-500/20'
      } text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">
              {completion === 100 ? 'Profile Complete ✓' : 'Profile Completion Level'}
            </h3>
            {completion === 100 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                Profile Ready
              </span>
            )}
          </div>
          <span className="font-black text-lg text-emerald-400">{completion}%</span>
        </div>

        {/* Animated Fill Bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-400 to-emerald-400 rounded-full shadow-lg"
          />
        </div>
        <p className="text-xs text-slate-300">
          {completion === 100
            ? 'All verified! Your developer profile, bio, skills, and links are 100% complete.'
            : 'Complete bio, technical skills, and social links to reach 100% profile score.'}
        </p>
      </Card>

      {/* Main Grid: Profile Form (Left) & Digital ID Badge (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Editor Form (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Read-Only Official Academic Identity Card */}
          <Card className="p-6 space-y-4 border-l-4 border-l-indigo-600 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" /> Official Academic Identity
              </h3>
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Admin-Managed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Full Name</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{student?.name || '—'}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Registration No</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{student?.registerNumber || '—'}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Roll Number</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{student?.rollNumber || '—'}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student?.department || '—'}</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Class & Sec</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Year {student?.year || 3} - Sec {student?.section || 'A'}</span>
              </div>
            </div>
          </Card>

          {/* Editable Student Details Form */}
          <Card className="p-6 space-y-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Personal & Developer Info</h3>

            {/* Avatar & Photo Upload */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={student?.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={student?.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-md"
                />
                <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl cursor-pointer shadow-lg transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>

              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{student?.name}</h4>
                <p className="text-xs text-slate-400 font-mono">{student?.registerNumber} • {student?.email}</p>
                <p className="text-[11px] text-emerald-500 font-semibold mt-1">
                  ✓ Verified Enrolled Student
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Bio Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">About Me / Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Share a short bio about your engineering interests and tech stack..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                />
              </div>

              {/* Skills Tag Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Skills & Tech Stack</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillTag}
                    onChange={(e) => setNewSkillTag(e.target.value)}
                    placeholder="e.g. React, Spring Boot, Docker"
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                  <Button type="button" onClick={addSkill} variant="secondary" size="sm">
                    <Plus className="w-4 h-4" /> Add Tag
                  </Button>
                </div>

                {/* Animated Skill Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {skillsList.map((skill) => (
                    <motion.span
                      key={skill}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40 text-xs font-mono font-semibold"
                    >
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-rose-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </div>

              {/* Developer Links */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Developer & Social Profiles</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold flex items-center gap-1.5"><Github className="w-4 h-4" /> GitHub</span>
                    <input
                      type="url"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData((p) => ({ ...p, githubUrl: e.target.value }))}
                      placeholder="https://github.com/username"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold flex items-center gap-1.5"><Code2 className="w-4 h-4" /> LeetCode</span>
                    <input
                      type="url"
                      value={formData.leetcodeUrl}
                      onChange={(e) => setFormData((p) => ({ ...p, leetcodeUrl: e.target.value }))}
                      placeholder="https://leetcode.com/username"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold flex items-center gap-1.5"><Linkedin className="w-4 h-4" /> LinkedIn</span>
                    <input
                      type="url"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData((p) => ({ ...p, linkedinUrl: e.target.value }))}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold flex items-center gap-1.5"><Globe className="w-4 h-4" /> Portfolio</span>
                    <input
                      type="url"
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData((p) => ({ ...p, portfolioUrl: e.target.value }))}
                      placeholder="https://myportfolio.dev"
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" isLoading={saving} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500">
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Digital Student ID Badge Column (1 col) */}
        <div className="space-y-4 flex flex-col items-center">
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 self-start">Digital Student ID Badge</h3>
          {student && <DigitalIdCard student={student} />}
        </div>
      </div>

      {/* 100% Profile Complete Celebration Modal */}
      <Modal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        title=""
        maxWidth="max-w-md"
      >
        <div className="text-center p-6 space-y-5">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200/50 dark:border-emerald-800/40">
              <Sparkles className="w-3.5 h-3.5" /> Milestone Achieved
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              🎉 Profile Complete!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your ClassVault profile is now <strong className="text-emerald-500 font-bold">100% complete</strong>. Your academic identity and technical portfolio are now fully visible across the class directory and leaderboard!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
              <span>Class Rank Eligibility</span>
              <span className="text-emerald-500 font-bold">✓ Active</span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300 font-medium">
              <span>Portfolio Showcase</span>
              <span className="text-emerald-500 font-bold">✓ Enabled</span>
            </div>
          </div>

          <Button
            onClick={() => setShowCelebration(false)}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 shadow-lg shadow-emerald-600/20"
          >
            Awesome, Let's Go! 🚀
          </Button>
        </div>
      </Modal>
    </div>
  );
};
