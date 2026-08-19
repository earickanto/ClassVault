import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Mail, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, UserCheck, KeyRound, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { ThemeToggle } from '../components/common/ThemeToggle';

export const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'info'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleLoginValidation = () => {
    const errs = {};
    if (!username.trim()) errs.username = 'Registration Number, Roll Number, or Email is required';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!handleLoginValidation()) return;

    const res = await login(username.trim(), password);
    if (res.success) {
      if (res.user?.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setErrorMsg(res.message || 'Access Denied: Invalid credentials or unknown account');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] flex flex-col justify-between p-4 sm:p-6 transition-colors duration-300 relative overflow-hidden">
      {/* Background Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar Bar */}
      <header className="flex items-center justify-between max-w-7xl w-full mx-auto z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-600/30">
            CV
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-100">
            Class<span className="text-indigo-500">Vault</span>
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Centered Login Card */}
      <main className="flex-1 flex items-center justify-center z-10 py-10">
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none"
        >
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-200/50 dark:border-indigo-800/40">
              <ShieldCheck className="w-3.5 h-3.5" /> Class Project Repository
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {activeTab === 'login' ? 'ClassVault Sign In' : 'Account Guidelines'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeTab === 'login'
                ? 'Sign in using your Registration Number and password'
                : 'Pre-authorized enrollment requirements and guidelines'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('info');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'info'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Student Info
            </button>
          </div>

          {/* Animated Error Box */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-start gap-3 text-xs font-medium"
              >
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                <div>
                  <strong className="block font-bold">Access Denied</strong>
                  <span>{errorMsg}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
              {/* Identifier Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Registration Number / Roll Number
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. REG2026001 or 26A001"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:font-sans placeholder:text-slate-400"
                  />
                </div>
                {errors.username && <p className="text-[11px] text-rose-500 font-medium">{errors.username}</p>}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <span className="text-[10px] text-slate-400">Default: ClassVault@123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                  />
                </div>
                {errors.password && <p className="text-[11px] text-rose-500 font-medium">{errors.password}</p>}
              </div>

              {/* Submit Button */}
              <Button type="submit" isLoading={loading} className="w-full h-11 text-sm font-bold mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/20">
                Sign In <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            /* Student Information Tab */
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  <Info className="w-4 h-4" /> Pre-Authorized Accounts Only
                </div>
                <p className="leading-relaxed">
                  ClassVault is a private class repository for enrolled students. There is no public registration.
                </p>
              </div>

              <div className="space-y-2.5 pl-1">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</div>
                  <p><strong>Login ID:</strong> Use your college <strong>Registration Number</strong> (e.g. <code>REG2026001</code>) or <strong>Roll Number</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</div>
                  <p><strong>Initial Password:</strong> Newly enrolled students have the temporary password <code>ClassVault@123</code>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</div>
                  <p><strong>First Sign-In:</strong> You will be required to set your own secure password upon your first sign-in before accessing class projects.</p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab('login')}
                className="w-full py-2.5 mt-2"
              >
                Back to Sign In
              </Button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 z-10 py-2">
        ClassVault Project Repository • Academic Portal
      </footer>
    </div>
  );
};
