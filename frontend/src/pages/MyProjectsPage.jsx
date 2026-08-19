import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FolderGit2, PlusCircle, Lock, Eye, Trash2, AlertTriangle, ExternalLink, Filter } from 'lucide-react';
import { projectApi } from '../api/projectApi';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Skeleton } from '../components/common/Skeleton';

export const MyProjectsPage = ({ onOpenUploadModal }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal for confirmation when switching to PRIVATE
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, project: null });

  const fetchMyProjects = async () => {
    setLoading(true);
    try {
      const res = await projectApi.getMyProjects();
      if (res.success) {
        setProjects(res.data || []);
      }
    } catch (e) {
      addToast('Failed to load your projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, []);

  const handleToggleVisibility = async (project) => {
    const nextVis = project.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC';

    // If currently public and has likes/comments, show confirmation warning modal
    if (project.visibility === 'PUBLIC' && ((project.likesCount || 0) > 0 || (project.comments?.length || 0) > 0)) {
      setConfirmModal({ isOpen: true, project });
      return;
    }

    executeVisibilityToggle(project.id, nextVis);
  };

  const executeVisibilityToggle = async (projectId, nextVis) => {
    try {
      const res = await projectApi.updateProject(projectId, { visibility: nextVis });
      if (res.success) {
        addToast(`Visibility set to ${nextVis}`, 'success');
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, visibility: nextVis } : p))
        );
      }
    } catch (e) {
      addToast('Failed to change visibility', 'error');
    } finally {
      setConfirmModal({ isOpen: false, project: null });
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await projectApi.deleteProject(id);
      if (res.success) {
        addToast('Project deleted', 'info');
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e) {
      addToast('Failed to delete project', 'error');
    }
  };

  const filterTabs = ['ALL', 'APPROVED', 'PENDING', 'DRAFT', 'REJECTED', 'PUBLIC', 'PRIVATE'];

  const filteredProjects = projects.filter((p) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PUBLIC') return p.visibility === 'PUBLIC';
    if (statusFilter === 'PRIVATE') return p.visibility === 'PRIVATE';
    return p.status === statusFilter;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            My College Projects
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your project drafts, approval statuses, and visibility settings
          </p>
        </div>
        <Button onClick={onOpenUploadModal} className="shrink-0">
          <PlusCircle className="w-4 h-4" /> Upload New Project
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
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

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="p-12 text-center space-y-4 max-w-md mx-auto">
          <FolderGit2 className="w-12 h-12 text-brand-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Projects Found</h3>
          <p className="text-xs text-slate-400">
            {projects.length === 0
              ? "You haven't uploaded any projects yet. Click below to add your first work!"
              : `No projects match the "${statusFilter}" filter.`}
          </p>
          {projects.length === 0 && (
            <Button onClick={onOpenUploadModal} size="sm">
              <PlusCircle className="w-4 h-4" /> Upload First Project
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((p) => (
            <Card key={p.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">{p.title}</h3>
                  <Badge variant={p.status === 'APPROVED' ? 'success' : p.status === 'PENDING' ? 'warning' : p.status === 'DRAFT' ? 'neutral' : 'danger'}>
                    {p.status}
                  </Badge>
                  <Badge variant={p.visibility === 'PUBLIC' ? 'brand' : 'neutral'}>
                    {p.visibility === 'PUBLIC' ? <Eye className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {p.visibility}
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{p.description}</p>

                <div className="flex flex-wrap gap-2 text-xs font-mono text-slate-400 pt-1">
                  <span>{p.technologyUsed}</span>
                  <span>•</span>
                  <span>{p.likesCount} Likes</span>
                  <span>•</span>
                  <span>{p.viewsCount} Views</span>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Visibility Toggle Switch */}
                <Button
                  onClick={() => handleToggleVisibility(p)}
                  variant="outline"
                  size="sm"
                  title="Toggle Public / Private visibility"
                >
                  {p.visibility === 'PUBLIC' ? <Lock className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                  Make {p.visibility === 'PUBLIC' ? 'Private' : 'Public'}
                </Button>

                <Button onClick={() => navigate(`/projects/${p.id}`)} variant="secondary" size="sm">
                  <ExternalLink className="w-4 h-4" /> View
                </Button>

                <Button onClick={() => handleDeleteProject(p.id)} variant="danger" size="icon" title="Delete Project">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Modal when switching PUBLIC -> PRIVATE */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, project: null })}
        title="Confirm Visibility Switch"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <div>
              <strong className="block font-bold">Making Project Private</strong>
              <p className="mt-1 leading-relaxed">
                This project currently has public engagement ({confirmModal.project?.likesCount || 0} likes). Making it private will hide it from classmates and search results.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={() => setConfirmModal({ isOpen: false, project: null })} variant="secondary" size="sm">
              Cancel
            </Button>
            <Button
              onClick={() => executeVisibilityToggle(confirmModal.project.id, 'PRIVATE')}
              variant="danger"
              size="sm"
            >
              Confirm Make Private
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
