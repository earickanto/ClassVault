import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, FolderGit2, ArrowRight } from 'lucide-react';
import { studentApi } from '../api/studentApi';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';

export const BookmarksPage = () => {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const res = await studentApi.getBookmarkedProjects();
        if (res.success) {
          setBookmarks(res.data || []);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-amber-500" /> Saved Projects
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your bookmarked projects saved for reference and inspiration
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : bookmarks.length === 0 ? (
        <Card className="p-12 text-center space-y-4 max-w-md mx-auto">
          <Bookmark className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Saved Projects</h3>
          <p className="text-xs text-slate-400">You haven't bookmarked any projects yet. Click the bookmark icon on any project page to save it here.</p>
          <Button onClick={() => navigate('/projects')} size="sm">
            Explore Projects
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((p) => (
            <Card key={p.id} onClick={() => navigate(`/projects/${p.id}`)} className="cursor-pointer space-y-3">
              <Badge variant="brand">{p.category}</Badge>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 line-clamp-1">{p.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{p.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
                <span>By {p.ownerName}</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
