import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  ExternalLink,
  ThumbsUp,
  Bookmark,
  Eye,
  Download,
  MessageSquare,
  ArrowLeft,
  FileText,
  FileCode,
  Video,
  Send,
  Sparkles,
  BookOpen,
  Clock,
  Code2
} from 'lucide-react';
import { projectApi } from '../api/projectApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { formatDate, formatBytes } from '../lib/utils';

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const res = await projectApi.getProjectById(id);
        if (res.success && res.data) {
          setProject(res.data);
          setIsLiked(res.data.isLikedByCurrentUser || false);
          setLikesCount(res.data.likesCount || 0);
          setIsBookmarked(res.data.isBookmarkedByCurrentUser || false);
          projectApi.recordView(id).catch(() => {});
        }
      } catch (e) {
        addToast('Failed to load project details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  // Optimistic Like Toggle
  const handleToggleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await projectApi.toggleLike(id);
      if (res.success) {
        addToast(res.data?.liked ? 'Liked project!' : 'Unliked project', 'info');
      }
    } catch (e) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      addToast('Failed to update like status', 'error');
    }
  };

  // Optimistic Bookmark Toggle
  const handleToggleBookmark = async () => {
    const prev = isBookmarked;
    setIsBookmarked(!prev);
    try {
      const res = await projectApi.toggleBookmark(id);
      addToast(res.data?.bookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks', 'info');
    } catch (e) {
      setIsBookmarked(prev);
      addToast('Failed to update bookmark', 'error');
    }
  };

  // Optimistic Comment Submission
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const text = newComment.trim();
    setNewComment('');

    const optimisticComment = {
      id: Date.now(),
      studentName: user?.name || 'You',
      studentRollNumber: user?.rollNumber || '',
      studentPhotoUrl: user?.profilePhotoUrl,
      content: text,
      createdAt: new Date().toISOString(),
    };

    setProject((prev) => ({
      ...prev,
      comments: [...(prev?.comments || []), optimisticComment],
    }));

    setSubmittingComment(true);
    try {
      const res = await projectApi.addComment(id, text);
      if (res.success) {
        addToast('Comment posted', 'success');
      }
    } catch (e) {
      addToast('Failed to post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <Card className="p-12 text-center space-y-4 max-w-md mx-auto">
        <h3 className="text-lg font-bold">Project Not Found</h3>
        <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
      </Card>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back Button */}
      <Button onClick={() => navigate(-1)} variant="ghost" size="sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      {/* Header Banner & Titles */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="brand">{project.category}</Badge>
          <span className="text-xs font-mono font-semibold text-slate-400">Semester {project.semester}</span>
          <Badge variant={project.visibility === 'PUBLIC' ? 'success' : 'neutral'}>{project.visibility}</Badge>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          {project.title}
        </h1>

        {/* Owner Info & Action Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <img
              src={project.ownerPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={project.ownerName}
              className="w-10 h-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
            />
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{project.ownerName}</h4>
              <p className="text-xs font-mono text-slate-400">Roll: {project.ownerRollNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* GitHub Repo Button */}
            {project.githubRepoUrl && (
              <a href={project.githubRepoUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <Github className="w-4 h-4" /> GitHub Repo
                </Button>
              </a>
            )}

            {/* Live Demo Button */}
            {project.liveDemoUrl && (
              <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md">
                  <ExternalLink className="w-4 h-4" /> Live Demo
                </Button>
              </a>
            )}

            {/* Optimistic Like Button with Burst Animation */}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={handleToggleLike}
              aria-label="Like project"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                isLiked
                  ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount}</span>
            </motion.button>

            {/* Bookmark Save Button */}
            <button
              onClick={handleToggleBookmark}
              aria-label="Save for later bookmark"
              className={`p-2.5 rounded-xl border transition-colors ${
                isBookmarked
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Tech Stack Pills */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technologies Used</h4>
        <div className="flex flex-wrap gap-2">
          {project.technologyUsed?.split(',').map((tech, i) => (
            <span key={i} className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40 text-xs font-mono font-semibold">
              {tech.trim()}
            </span>
          ))}
        </div>
      </div>

      {/* Overview Card */}
      {project.description && (
        <Card className="p-6 space-y-2 border-l-4 border-l-indigo-500">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400">Project Abstract</h3>
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
            {project.description}
          </p>
        </Card>
      )}

      {/* Project Documentation (README.md) */}
      <Card className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" /> README.md Documentation
          </h3>
          <span className="text-xs font-mono text-slate-400">Markdown Format</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
          <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {project.readmeContent || `# ${project.title}\n\n## Overview\n${project.description || 'No README documentation provided for this project.'}\n\n## Technologies\n${project.technologyUsed || 'N/A'}`}
          </pre>
        </div>
      </Card>

      {/* File Attachments (Coming in V2) Notice Card */}
      <Card className="p-6 space-y-3 bg-gradient-to-br from-slate-50 to-indigo-50/20 dark:from-slate-900 dark:to-indigo-950/20 border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Project Files & Attachments</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Direct file downloads (ZIP archives, presentation slides, report PDFs, demo videos) are scheduled for V2.</p>
          </div>
        </div>
      </Card>

      {/* Comments Thread Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" /> Discussion ({project.comments?.length || 0})
        </h3>

        {/* Comment Input Box */}
        <Card className="p-4">
          <form onSubmit={handleAddComment} className="flex gap-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a constructive peer comment or question..."
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button type="submit" isLoading={submittingComment} disabled={!newComment.trim()} className="bg-indigo-600 hover:bg-indigo-500">
              <Send className="w-4 h-4" /> Post
            </Button>
          </form>
        </Card>

        {/* Flat Comment Thread */}
        <div className="space-y-3">
          {project.comments?.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No comments yet. Be the first to comment!</p>
          ) : (
            project.comments.map((comment) => (
              <Card key={comment.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={comment.studentPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={comment.studentName}
                      className="w-7 h-7 rounded-xl object-cover"
                    />
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{comment.studentName}</span>
                    <span className="text-[10px] font-mono text-slate-400">({comment.studentRollNumber})</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-9">{comment.content}</p>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
