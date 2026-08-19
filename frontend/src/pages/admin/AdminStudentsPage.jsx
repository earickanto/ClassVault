import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Search,
  Edit2,
  Trash2,
  KeyRound,
  FolderGit2,
  ShieldAlert,
  UserCheck,
  UserX,
  Eye,
  Github,
  Linkedin,
  Globe,
  Code2,
  Filter,
  GraduationCap,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';

export const AdminStudentsPage = () => {
  const { addToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [query, setQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [editModal, setEditModal] = useState({ isOpen: false, student: null });
  const [passwordModal, setPasswordModal] = useState({ isOpen: false, student: null });
  const [projectsModal, setProjectsModal] = useState({ isOpen: false, student: null, projects: [], loading: false });
  const [viewProfileModal, setViewProfileModal] = useState({ isOpen: false, student: null });

  // New Student Form
  const [form, setForm] = useState({
    name: '',
    rollNumber: '',
    registerNumber: '',
    department: 'Artificial Intelligence & Data Science',
    year: 2,
    section: 'A',
    email: '',
    password: '',
  });

  // Edit Form
  const [editForm, setEditForm] = useState({
    name: '',
    department: '',
    year: 3,
    section: '',
    email: '',
  });

  // Password reset state
  const [newPassword, setNewPassword] = useState('');

  // CSV 2-Step Workflow State
  const [csvFile, setCsvFile] = useState(null);
  const [csvStep, setCsvStep] = useState(1); // 1 = Upload/Preview, 2 = Confirmed/Done
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState(null);
  const [finalImportResult, setFinalImportResult] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await adminApi.getDashboardData();
      if (res.success) {
        setDashboardStats(res.data);
      }
    } catch (e) {
      // stats error fallback
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getStudents({
        query: query.trim() || undefined,
        department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
        year: yearFilter ? parseInt(yearFilter) : undefined,
        section: sectionFilter !== 'ALL' ? sectionFilter : undefined,
        page,
        size: 15,
      });
      if (res.success && res.data) {
        setStudents(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (e) {
      addToast('Failed to load student directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [query, departmentFilter, yearFilter, sectionFilter, page]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await adminApi.createStudent(form);
      if (res.success) {
        addToast(`Created student account for ${res.data.name}`, 'success');
        setIsAddModalOpen(false);
        setForm({
          name: '',
          rollNumber: '',
          registerNumber: '',
          department: 'Computer Science',
          year: 3,
          section: 'A',
          email: '',
          password: '',
        });
        fetchStudents();
        fetchStats();
      }
    } catch (e) {
      const msg = e.response?.data?.message || 'Failed to create student account';
      addToast(msg, 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModal.student) return;

    try {
      const res = await adminApi.updateStudent(editModal.student.id, editForm);
      if (res.success) {
        addToast('Student details updated successfully', 'success');
        setEditModal({ isOpen: false, student: null });
        fetchStudents();
        fetchStats();
      }
    } catch (e) {
      addToast('Failed to update student', 'error');
    }
  };

  const handleToggleStatus = async (student) => {
    const nextStatus = !student.accountEnabled;
    try {
      const res = await adminApi.toggleStudentStatus(student.id, nextStatus);
      if (res.success) {
        addToast(`Account ${nextStatus ? 'enabled' : 'disabled'} for ${student.name}`, 'info');
        setStudents((prev) =>
          prev.map((s) => (s.id === student.id ? { ...s, accountEnabled: nextStatus } : s))
        );
        fetchStats();
      }
    } catch (e) {
      addToast('Failed to update account status', 'error');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordModal.student || !newPassword) return;

    try {
      const res = await adminApi.resetStudentPassword(passwordModal.student.id, newPassword);
      if (res.success) {
        addToast(`Password reset for ${passwordModal.student.name}`, 'success');
        setPasswordModal({ isOpen: false, student: null });
        setNewPassword('');
        fetchStudents();
        fetchStats();
      }
    } catch (e) {
      addToast('Failed to reset password', 'error');
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${student.name} (${student.rollNumber})?`)) return;

    try {
      const res = await adminApi.deleteStudent(student.id);
      if (res.success) {
        addToast('Student account deleted', 'info');
        setStudents((prev) => prev.filter((s) => s.id !== student.id));
        fetchStats();
      }
    } catch (e) {
      addToast('Failed to delete student', 'error');
    }
  };

  const handleOpenProjects = async (student) => {
    setProjectsModal({ isOpen: true, student, projects: [], loading: true });
    try {
      const res = await adminApi.getStudentProjects(student.id);
      if (res.success) {
        setProjectsModal({ isOpen: true, student, projects: res.data || [], loading: false });
      }
    } catch (e) {
      setProjectsModal((p) => ({ ...p, loading: false }));
    }
  };

  // Step 1: Preview CSV
  const handlePreviewCsv = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    setPreviewLoading(true);
    try {
      const res = await adminApi.previewBulkImportStudents(csvFile);
      if (res.success) {
        setPreviewResult(res.data);
        addToast(`CSV validated: ${res.data.validCount} valid, ${res.data.errors.length} errors/duplicates found`, 'info');
      }
    } catch (e) {
      addToast('Failed to preview and validate CSV file', 'error');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Step 2: Confirm and Import Valid Rows
  const handleConfirmImport = async () => {
    if (!previewResult || !previewResult.validRows || previewResult.validRows.length === 0) return;

    setConfirmLoading(true);
    try {
      const res = await adminApi.confirmBulkImportStudents(previewResult.validRows);
      if (res.success) {
        setFinalImportResult(res.data);
        setCsvStep(2);
        addToast(`Successfully imported ${res.data.importedCount} student accounts!`, 'success');
        fetchStudents();
        fetchStats();
      }
    } catch (e) {
      addToast('Failed to confirm and import students', 'error');
    } finally {
      setConfirmLoading(false);
    }
  };

  const resetCsvWizard = () => {
    setCsvFile(null);
    setCsvStep(1);
    setPreviewResult(null);
    setFinalImportResult(null);
    setIsCsvModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Manage Student Accounts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create single student credentials, manage accounts, or perform 2-step verified CSV bulk import
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => { setIsCsvModalOpen(true); setCsvStep(1); setPreviewResult(null); }} variant="secondary" size="sm">
            <FileSpreadsheet className="w-4 h-4" /> Bulk CSV Import
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} size="sm">
            <UserPlus className="w-4 h-4" /> Add Student
          </Button>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Students</span>
            <span className="text-lg font-black text-slate-900 dark:text-slate-100">
              {dashboardStats?.totalStudents ?? (students?.length || 0)}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Active Students</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {dashboardStats?.activeStudents ?? (students.filter((s) => s.accountEnabled).length || 0)}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">First Login Pending</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
              {dashboardStats?.firstLoginPendingStudents ?? (students.filter((s) => s.firstLogin).length || 0)}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Disabled Students</span>
            <span className="text-lg font-black text-rose-600 dark:text-rose-400">
              {dashboardStats?.inactiveStudents ?? (students.filter((s) => !s.accountEnabled).length || 0)}
            </span>
          </div>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search by name, roll, reg..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>

        {/* Department Filter */}
        <div className="relative">
          <select
            value={departmentFilter}
            aria-label="Filter by Department"
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm cursor-pointer"
          >
            <option value="ALL">All Departments</option>
            <option value="Artificial Intelligence & Data Science">AI & Data Science (AI&DS)</option>
            <option value="Computer Science & Engineering">Computer Science (CSE)</option>
            <option value="Information Technology">Information Tech (IT)</option>
          </select>
        </div>

        {/* Year Filter */}
        <div className="relative">
          <select
            value={yearFilter}
            aria-label="Filter by Year"
            onChange={(e) => {
              setYearFilter(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm cursor-pointer"
          >
            <option value="">All Academic Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

        {/* Section Filter */}
        <div className="relative">
          <select
            value={sectionFilter}
            aria-label="Filter by Section"
            onChange={(e) => {
              setSectionFilter(e.target.value);
              setPage(0);
            }}
            className="w-full px-3 py-2.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm cursor-pointer"
          >
            <option value="ALL">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>
      </div>

      {/* Students Directory Table */}
      <Card className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Student</th>
                <th className="py-3.5 px-5">Roll / Reg No</th>
                <th className="py-3.5 px-5">Dept & Year</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-center">Source</th>
                <th className="py-3.5 px-5 text-center">Projects</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
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
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No student records found.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt={s.name}
                          className="w-8 h-8 rounded-xl object-cover"
                        />
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">{s.name}</span>
                          <span className="text-[10px] text-slate-400">{s.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Roll & Reg */}
                    <td className="py-3.5 px-5 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <div>{s.rollNumber}</div>
                      <div className="text-[10px] text-slate-400">{s.registerNumber}</div>
                    </td>

                    {/* Dept & Year */}
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-400">
                      <div>{s.department}</div>
                      <div className="text-[10px]">Year {s.year} • Sec {s.section}</div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => handleToggleStatus(s)}
                        title={s.accountEnabled ? 'Click to disable account' : 'Click to enable account'}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                          s.accountEnabled
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20'
                            : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20'
                        }`}
                      >
                        {s.accountEnabled ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {s.accountEnabled ? 'Active' : 'Disabled'}
                      </button>
                    </td>

                    {/* Data Source Badge */}
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                        s.dataSource === 'DEMO'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {s.dataSource || 'IMPORTED'}
                      </span>
                    </td>

                    {/* Project Count */}
                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => handleOpenProjects(s)}
                        className="font-mono font-bold text-xs text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
                      >
                        <FolderGit2 className="w-3.5 h-3.5" />
                        {s.projectCount || 0}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewProfileModal({ isOpen: true, student: s })}
                          title="View Full Student Profile"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditModal({ isOpen: true, student: s });
                            setEditForm({
                              name: s.name || '',
                              department: s.department || '',
                              year: s.year || 3,
                              section: s.section || '',
                              email: s.email || '',
                            });
                          }}
                          title="Edit Student Info"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setPasswordModal({ isOpen: true, student: s });
                            setNewPassword('');
                          }}
                          title="Reset Password"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(s)}
                          title="Delete Student"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
            <span className="text-slate-400">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Single Student Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Student Account" maxWidth="max-w-md">
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Roll Number *</label>
              <input
                type="text"
                required
                value={form.rollNumber}
                onChange={(e) => setForm((p) => ({ ...p, rollNumber: e.target.value }))}
                placeholder="e.g. 26A001"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Register Number *</label>
              <input
                type="text"
                required
                value={form.registerNumber}
                onChange={(e) => setForm((p) => ({ ...p, registerNumber: e.target.value }))}
                placeholder="e.g. REG2026001"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department *</label>
            <input
              type="text"
              required
              value={form.department}
              onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
              placeholder="Artificial Intelligence & Data Science"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Year *</label>
              <input
                type="number"
                min={1}
                max={4}
                required
                value={form.year}
                onChange={(e) => setForm((p) => ({ ...p, year: parseInt(e.target.value) || 1 }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section *</label>
              <input
                type="text"
                required
                value={form.section}
                onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))}
                placeholder="A"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Initial Password (Optional)</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              placeholder="Default: ClassVault@123"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" className="w-full">
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={editModal.isOpen} onClose={() => setEditModal({ isOpen: false, student: null })} title="Edit Student Profile" maxWidth="max-w-md">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Student Name</label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department</label>
            <input
              type="text"
              required
              value={editForm.department}
              onChange={(e) => setEditForm((p) => ({ ...p, department: e.target.value }))}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Year</label>
              <input
                type="number"
                min={1}
                max={4}
                required
                value={editForm.year}
                onChange={(e) => setEditForm((p) => ({ ...p, year: parseInt(e.target.value) || 1 }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Section</label>
              <input
                type="text"
                required
                value={editForm.section}
                onChange={(e) => setEditForm((p) => ({ ...p, section: e.target.value }))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </Modal>

      {/* Password Reset Modal */}
      <Modal isOpen={passwordModal.isOpen} onClose={() => setPasswordModal({ isOpen: false, student: null })} title="Reset Student Password" maxWidth="max-w-sm">
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <p className="text-xs text-slate-400">
            Set a new temporary password for <strong className="text-slate-200">{passwordModal.student?.name}</strong>. The student will be prompted to change it on their next login.
          </p>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">New Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="e.g. ClassVault@123"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>
          <Button type="submit" variant="brand" className="w-full">
            Update Password
          </Button>
        </form>
      </Modal>

      {/* Student Projects Viewer Modal */}
      <Modal isOpen={projectsModal.isOpen} onClose={() => setProjectsModal({ isOpen: false, student: null, projects: [], loading: false })} title={`Projects by ${projectsModal.student?.name || 'Student'}`} maxWidth="max-w-2xl">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {projectsModal.loading ? (
            <Skeleton className="h-20 rounded-xl" />
          ) : projectsModal.projects.length === 0 ? (
            <p className="text-xs text-slate-400 p-4 text-center">This student has not uploaded any projects yet.</p>
          ) : (
            projectsModal.projects.map((p) => (
              <div key={p.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{p.title}</h4>
                    <Badge variant={p.status === 'APPROVED' ? 'success' : p.status === 'PENDING' ? 'warning' : 'danger'}>
                      {p.status}
                    </Badge>
                    <Badge variant={p.visibility === 'PUBLIC' ? 'brand' : 'neutral'}>
                      {p.visibility}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{p.description}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{p.technologyUsed}</span>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Bulk CSV Import Two-Step Modal */}
      <Modal isOpen={isCsvModalOpen} onClose={resetCsvWizard} title="Two-Step Bulk Student CSV Import" maxWidth="max-w-3xl">
        <div className="space-y-5">
          {/* Step Indicator */}
          <div className="flex items-center justify-between px-2 text-xs font-bold border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className={`flex items-center gap-2 ${csvStep === 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center text-[10px]">1</span>
              <span>Upload & Validate Preview</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className={`flex items-center gap-2 ${csvStep === 2 ? 'text-emerald-500' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${csvStep === 2 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-400'}`}>2</span>
              <span>Confirmed Import Summary</span>
            </div>
          </div>

          {/* Standard Schema Helper */}
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <p className="font-bold text-indigo-600 dark:text-indigo-400">Strict 6-Column Standard CSV Format:</p>
            <p className="font-mono text-[11px] text-slate-900 dark:text-slate-100 bg-white/50 dark:bg-slate-900/50 p-1.5 rounded-lg">
              name,register_number,roll_number,department,year,section
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              * Temporary password is set to <strong className="text-slate-700 dark:text-slate-200">ClassVault@123</strong> with mandatory first-login password change.
            </p>
          </div>

          {csvStep === 1 && (
            <div className="space-y-4">
              <form onSubmit={handlePreviewCsv} className="space-y-3">
                <div className="p-5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center space-y-2">
                  <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
                  <input
                    type="file"
                    accept=".csv"
                    required
                    onChange={(e) => {
                      setCsvFile(e.target.files[0]);
                      setPreviewResult(null);
                    }}
                    className="text-xs text-slate-400"
                  />
                  {csvFile && <p className="text-xs font-semibold text-indigo-400">Selected: {csvFile.name}</p>}
                </div>

                <Button type="submit" disabled={previewLoading || !csvFile} className="w-full bg-indigo-600 hover:bg-indigo-500">
                  {previewLoading ? 'Parsing & Validating CSV...' : 'Preview & Validate CSV'}
                </Button>
              </form>

              {/* Preview Diagnostic Breakdown */}
              {previewResult && (
                <div className="space-y-4 pt-2">
                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Rows</span>
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">{previewResult.totalRows}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block uppercase">Valid Rows</span>
                      <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{previewResult.validCount}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block uppercase">Duplicates</span>
                      <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">{previewResult.duplicateCount}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block uppercase">Invalid Rows</span>
                      <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">{previewResult.invalidCount}</span>
                    </div>
                  </div>

                  {/* Confirmation Action Box */}
                  {previewResult.validCount > 0 && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-emerald-500">
                          Ready to import {previewResult.validCount} valid student record{previewResult.validCount > 1 ? 's' : ''}?
                        </h4>
                        <p className="text-xs text-slate-400">
                          Click confirm to commit these records into the ClassVault database.
                        </p>
                      </div>
                      <Button
                        onClick={handleConfirmImport}
                        disabled={confirmLoading}
                        className="bg-emerald-600 hover:bg-emerald-500 font-bold text-xs shrink-0"
                      >
                        {confirmLoading ? 'Importing...' : `Import ${previewResult.validCount} Students`}
                      </Button>
                    </div>
                  )}

                  {/* Valid Students Preview Table */}
                  {previewResult.validRows?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Valid Records Preview ({previewResult.validRows.length})
                      </span>
                      <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-900 text-slate-400 font-bold uppercase">
                            <tr>
                              <th className="p-2">Name</th>
                              <th className="p-2">Register No</th>
                              <th className="p-2">Roll No</th>
                              <th className="p-2">Department</th>
                              <th className="p-2">Class</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                            {previewResult.validRows.slice(0, 10).map((r, i) => (
                              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                                <td className="p-2 font-sans font-semibold text-slate-200">{r.name}</td>
                                <td className="p-2 text-indigo-400">{r.registerNumber}</td>
                                <td className="p-2 text-slate-300">{r.rollNumber}</td>
                                <td className="p-2 font-sans text-slate-400">{r.department}</td>
                                <td className="p-2 font-sans text-slate-400">Y{r.year}-{r.section}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Errors / Duplicate Diagnostics Table */}
                  {previewResult.errors?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">
                        Row Errors & Conflicts Detected ({previewResult.errors.length})
                      </span>
                      <div className="max-h-40 overflow-y-auto border border-rose-500/20 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-rose-500/10 text-rose-400 font-bold uppercase">
                            <tr>
                              <th className="p-2">Row</th>
                              <th className="p-2">Field</th>
                              <th className="p-2">Type</th>
                              <th className="p-2">Diagnostic Message</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-rose-500/10 font-mono">
                            {previewResult.errors.map((err, i) => (
                              <tr key={i} className="text-rose-400 bg-rose-500/5">
                                <td className="p-2">Row {err.row}</td>
                                <td className="p-2 font-bold">{err.field}</td>
                                <td className="p-2">
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300">
                                    {err.errorType || 'INVALID'}
                                  </span>
                                </td>
                                <td className="p-2">{err.message}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Completed Import Summary */}
          {csvStep === 2 && finalImportResult && (
            <div className="space-y-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-100">Batch Import Successfully Completed!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Imported <strong className="text-emerald-400 font-bold">{finalImportResult.importedCount}</strong> new students into ClassVault.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-w-sm mx-auto text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Valid Processed:</span>
                  <span className="font-bold text-slate-200">{finalImportResult.totalRows}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Successfully Stored:</span>
                  <span className="font-bold text-emerald-400">{finalImportResult.importedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Failed / Skipped:</span>
                  <span className="font-bold text-rose-400">{finalImportResult.failedCount}</span>
                </div>
              </div>

              <Button onClick={resetCsvWizard} className="bg-indigo-600 hover:bg-indigo-500">
                Done & Return to Student Directory
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* View Student Profile Full Modal */}
      <Modal
        isOpen={viewProfileModal.isOpen}
        onClose={() => setViewProfileModal({ isOpen: false, student: null })}
        title="Student Academic & Developer Profile"
        maxWidth="max-w-xl"
      >
        {viewProfileModal.student && (
          <div className="space-y-6 text-xs">
            {/* Header / Avatar & Identity */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <img
                src={viewProfileModal.student.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={viewProfileModal.student.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40"
              />
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{viewProfileModal.student.name}</h3>
                <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {viewProfileModal.student.registerNumber} • {viewProfileModal.student.rollNumber}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Badge variant={viewProfileModal.student.accountEnabled ? 'success' : 'danger'}>
                    {viewProfileModal.student.accountEnabled ? 'Active Account' : 'Account Disabled'}
                  </Badge>
                  {viewProfileModal.student.firstLogin && (
                    <Badge variant="warning">First Login Pending</Badge>
                  )}
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {viewProfileModal.student.dataSource || 'IMPORTED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Academic Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Department</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{viewProfileModal.student.department}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Class & Sec</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Year {viewProfileModal.student.year} • Sec {viewProfileModal.student.section}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Profile Score</span>
                <span className="font-bold text-emerald-500">{viewProfileModal.student.completionPercentage || 40}% Complete</span>
              </div>
            </div>

            {/* Bio & Skills */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bio & Overview</span>
              <p className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed">
                {viewProfileModal.student.bio || 'No bio provided yet.'}
              </p>
            </div>

            {/* Skills */}
            {viewProfileModal.student.skills && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Technical Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {viewProfileModal.student.skills.split(',').map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] font-semibold border border-indigo-200/50 dark:border-indigo-800/40">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Developer Profiles & Socials */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Developer Links</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {viewProfileModal.student.githubUrl && (
                  <a href={viewProfileModal.student.githubUrl} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:text-indigo-500 flex items-center gap-2">
                    <Github className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">GitHub</span>
                  </a>
                )}
                {viewProfileModal.student.linkedinUrl && (
                  <a href={viewProfileModal.student.linkedinUrl} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:text-indigo-500 flex items-center gap-2">
                    <Linkedin className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">LinkedIn</span>
                  </a>
                )}
                {viewProfileModal.student.leetcodeUrl && (
                  <a href={viewProfileModal.student.leetcodeUrl} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:text-indigo-500 flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">LeetCode</span>
                  </a>
                )}
                {viewProfileModal.student.portfolioUrl && (
                  <a href={viewProfileModal.student.portfolioUrl} target="_blank" rel="noreferrer" className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:text-indigo-500 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Portfolio</span>
                  </a>
                )}
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                onClick={() => setViewProfileModal({ isOpen: false, student: null })}
                className="w-full"
              >
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
