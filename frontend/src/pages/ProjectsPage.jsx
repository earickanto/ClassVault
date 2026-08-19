import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderGit2, Eye, ThumbsUp, Filter, Sparkles, ArrowUpDown, ChevronDown } from 'lucide-react';
import { projectApi } from '../api/projectApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [semesterFilter, setSemesterFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await projectApi.getProjects({
        query: debouncedQuery,
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        semester: semesterFilter ? parseInt(semesterFilter) : undefined,
        sortBy,
        direction: 'desc',
        page,
        size: 9,
      });
      if (res.success && res.data) {
        setProjects(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (e) {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [debouncedQuery, categoryFilter, semesterFilter, sortBy, page]);

  const categories = ['ALL', 'Web Application', 'Machine Learning', 'Mobile App', 'Systems & Cloud', 'IoT & Embedded'];

  return (
    <div className="space-y-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Explore College Projects
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search projects across student name, roll number, technology, or category
          </p>
        </div>

        {/* Search Bar & Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={query}
              aria-label="Search projects"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by tech, student, or title..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-44">
            <select
              value={sortBy}
              aria-label="Sort projects"
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm cursor-pointer"
            >
              <option value="createdAt">✨ Most Recent</option>
              <option value="viewsCount">👁️ Most Viewed</option>
              <option value="likesCount">❤️ Most Liked</option>
            </select>
          </div>

          {/* Semester Filter */}
          <div className="relative w-full sm:w-36">
            <select
              value={semesterFilter}
              aria-label="Filter by semester"
              onChange={(e) => {
                setSemesterFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-3 py-2.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm cursor-pointer"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategoryFilter(cat);
              setPage(0);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
              categoryFilter === cat
                ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/20'
                : 'bg-white dark:bg-dark-card text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="p-12 text-center space-y-4 max-w-md mx-auto">
          <Sparkles className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Projects Found</h3>
          <p className="text-xs text-slate-400">
            No projects matched your criteria. Try adjusting your query or filters.
          </p>
          <Button
            onClick={() => {
              setQuery('');
              setCategoryFilter('ALL');
              setSemesterFilter('');
              setSortBy('createdAt');
            }}
            variant="secondary"
            size="sm"
          >
            Clear Search & Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {projects.map((p, index) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="h-full flex flex-col justify-between cursor-pointer group hover:border-brand-500/50 transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="brand">{p.category}</Badge>
                      <span className="text-[11px] font-mono font-semibold text-slate-400">Sem {p.semester}</span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-brand-500 transition-colors line-clamp-1">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                    {/* Tech Stack Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {p.technologyUsed?.split(',').map((tech, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
                          {tech.trim()}
                        </span>
                      ))}
                    </div>

                    {/* Owner & Engagement Footer */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={p.ownerPhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                          alt={p.ownerName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[110px]">
                          {p.ownerName}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5 text-rose-500" /> {p.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 text-brand-500" /> {p.viewsCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
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
    </div>
  );
};
