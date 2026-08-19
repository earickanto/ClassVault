import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { UploadModal } from './pages/UploadModal';
import { ForceChangePasswordModal } from './components/auth/ForceChangePasswordModal';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { MyProjectsPage } from './pages/MyProjectsPage';
import { ProfilePage } from './pages/ProfilePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { BookmarksPage } from './pages/BookmarksPage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage';
import { AdminLeaderboardPage } from './pages/admin/AdminLeaderboardPage';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  if (isLoginPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      <Navbar onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

      <div className="flex flex-1">
        <Sidebar
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            {/* Student Routes */}
            <Route path="/dashboard" element={<ProtectedRoute requiredRole="ROLE_STUDENT"><DashboardPage onOpenUploadModal={() => setIsUploadModalOpen(true)} /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute requiredRole="ROLE_STUDENT"><ProjectsPage /></ProtectedRoute>} />
            <Route path="/projects/:id" element={<ProtectedRoute requiredRole="ROLE_STUDENT"><ProjectDetailPage /></ProtectedRoute>} />
            <Route path="/my-projects" element={<ProtectedRoute requiredRole="ROLE_STUDENT"><MyProjectsPage onOpenUploadModal={() => setIsUploadModalOpen(true)} /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute requiredRole="ROLE_STUDENT"><ProfilePage /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute requiredRole="ROLE_STUDENT"><LeaderboardPage /></ProtectedRoute>} />
            <Route path="/bookmarks" element={<ProtectedRoute requiredRole="ROLE_STUDENT"><BookmarksPage /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="ROLE_ADMIN"><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute requiredRole="ROLE_ADMIN"><AdminStudentsPage /></ProtectedRoute>} />
            <Route path="/admin/projects" element={<ProtectedRoute requiredRole="ROLE_ADMIN"><AdminProjectsPage /></ProtectedRoute>} />
            <Route path="/admin/announcements" element={<ProtectedRoute requiredRole="ROLE_ADMIN"><AdminAnnouncementsPage /></ProtectedRoute>} />
            <Route path="/admin/leaderboard" element={<ProtectedRoute requiredRole="ROLE_ADMIN"><AdminLeaderboardPage /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      <ForceChangePasswordModal />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
