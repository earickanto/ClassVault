import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  Lock,
  Star,
  Search,
  Filter,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';

export const AdminProjectsPage = () => {
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Rejection Modal state
  const [rejectModal, setRejectModal] = useState({ isOpen: false, projectId: null });
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchAllProjects = async () => {
    setLoading(true);
    try {
      const statusParam = ['PENDING', 'APPROVED', 'REJECTED'].includes(statusFilter) ? statusFilter : undefined;
      const visParam = ['PUBLIC', 'PRIVATE'].includes(statusFilter) ? statusFilter : undefined;

      const res = await adminApi.getProjects({
        query: query.trim() || undefined,
        status: statusParam,
        visibility: visParam,
        page,
        size: 15,
      });
      if (res.success && res.data) {
        setProjects(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (e) {
      addToast('Failed to load project repository', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProjects();
  }, [query, statusFilter, page]);

  const handleApprove = async (id) => {
    try {
      const res = await adminApi.updateProjectStatus(id, 'APPROVED');
      if (res.success) {
        addToast('Project approved!', 'success');
        setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'APPROVED' } : p)));
      }
    } catch (e) {
      addToast('Failed to approve project', 'error');
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModal.projectId) return;

    try {
      const res = await adminApi.updateProjectStatus(rejectModal.projectId, 'REJECTED', rejectionReason);
      if (res.success) {
        addToast('Project rejected and student notified', 'info');
        setProjects((prev) => prev.map((p) => (p.id === rejectModal.projectId ? { ...p, status: 'REJECTED' } : p)));
        setRejectModal({ isOpen: false, projectId: null });
        setRejectionReason('');
      }
    } catch (e) {
      addToast('Failed to reject project', 'error');
    }
  };

  const handleToggleFeature = async (id) => {
    try {
      const res = await adminApi.toggleFeatured(id);
      if (res.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p))
        );
        addToast('Featured status updated', 'success');
      }
    } catch (e) {
      addToast('Failed to update featured status', 'error');
    }
  };

  const handleToggleVisibility = async (p) => {
    const nextVis = p.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';
    try {
      const res = await adminApi.updateVisibility(p.id, nextVis);
      if (res.success) {
        setProjects((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, visibility: nextVis } : item))
        );
        addToast(`Visibility set to ${nextVis}`, 'success');
      }
    } catch (e) {
      addToast('Failed to change visibility', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this project?')) return;
    try {
      const res = await adminApi.deleteProject(id);
      if (res.success) {
        addToast('Project deleted', 'info');
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      addToast('Failed to delete project', 'error');
    }
  };

  const filterTabs = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLIC', 'PRIVATE'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Manage & Moderate Projects
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Approve pending submissions, send rejection feedback, toggle featured status, or override visibility
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setStatusFilter(tab);
                setPage(0);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                statusFilter === tab
                  ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20'
                  : 'bg-white dark:bg-dark-card text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder="Search projects..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">No projects found matching the filter.</Card>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <Card key={p.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{p.title}</h3>
                  <Badge variant={p.status === 'APPROVED' ? 'success' : p.status === 'PENDING' ? 'warning' : 'danger'}>
                    {p.status}
                  </Badge>
                  <Badge variant={p.visibility === 'PUBLIC' ? 'brand' : 'neutral'}>
                    {p.visibility === 'PUBLIC' ? <Eye className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {p.visibility}
                  </Badge>
                  {p.featured && (
                    <Badge variant="warning" className="gap-1">
                      <Star className="w-3 h-3 fill-amber-400" /> Featured
                    </Badge>
                  )}
                  <span className="text-xs text-slate-400 font-mono">By {p.ownerName}</span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{p.description}</p>

                <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-400 pt-1">
                  <span>{p.technologyUsed}</span>
                  <span>•</span>
                  <span>Sem {p.semester}</span>
                  <span>•</span>
                  <span>{p.likesCount} Likes</span>
                  <span>•</span>
                  <span>{p.viewsCount} Views</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Approve Button */}
                {p.status !== 'APPROVED' && (
                  <Button onClick={() => handleApprove(p.id)} size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </Button>
                )}

                {/* Reject Button */}
                {p.status !== 'REJECTED' && (
                  <Button onClick={() => setRejectModal({ isOpen: true, projectId: p.id })} variant="danger" size="sm" className="text-xs">
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                )}

                {/* Feature Toggle */}
                <Button
                  onClick={() => handleToggleFeature(p.id)}
                  variant="secondary"
                  size="sm"
                  title="Toggle Featured status"
                  className={p.featured ? 'text-amber-500' : 'text-slate-400'}
                >
                  <Star className={`w-3.5 h-3.5 ${p.featured ? 'fill-amber-400' : ''}`} />
                </Button>

                {/* Visibility Toggle */}
                <Button
                  onClick={() => handleToggleVisibility(p)}
                  variant="outline"
                  size="sm"
                  title="Override Visibility"
                  className="text-xs"
                >
                  {p.visibility === 'PUBLIC' ? <Lock className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </Button>

                {/* Delete */}
                <Button onClick={() => handleDelete(p.id)} variant="danger" size="icon" title="Delete Project">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          <Button disabled={page === 0} onClick={() => setPage((p) => p - 1)} variant="secondary" size="sm">
            Previous
          </Button>
          <span className="px-4 py-2 text-xs font-bold text-slate-500 self-center">
            Page {page + 1} of {totalPages}
          </span>
          <Button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} variant="secondary" size="sm">
            Next
          </Button>
        </div>
      )}

      {/* Reject Modal */}
      <Modal isOpen={rejectModal.isOpen} onClose={() => setRejectModal({ isOpen: false, projectId: null })} title="Reject Project Submission" maxWidth="max-w-md">
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Rejection Reason / Feedback *</label>
            <textarea
              rows={3}
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide clear feedback on what needs revision..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
            />
          </div>
          <Button type="submit" variant="danger" className="w-full">
            Confirm Rejection & Notify Student
          </Button>
        </form>
      </Modal>
    </div>
  );
};
