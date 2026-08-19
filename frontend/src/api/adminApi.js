import client from './client';

export const adminApi = {
  getDashboardData: async () => {
    const res = await client.get('/admin/dashboard');
    return res.data;
  },

  getStudents: async (params = {}) => {
    const res = await client.get('/admin/students', { params });
    return res.data;
  },

  getStudentById: async (id) => {
    const res = await client.get(`/admin/students/${id}`);
    return res.data;
  },

  createStudent: async (studentData) => {
    const res = await client.post('/admin/students', studentData);
    return res.data;
  },

  updateStudent: async (id, studentData) => {
    const res = await client.put(`/admin/students/${id}`, studentData);
    return res.data;
  },

  toggleStudentStatus: async (id, enabled) => {
    const res = await client.put(`/admin/students/${id}/status`, { enabled });
    return res.data;
  },

  resetStudentPassword: async (id, newPassword) => {
    const res = await client.put(`/admin/students/${id}/reset-password`, { newPassword });
    return res.data;
  },

  deleteStudent: async (id) => {
    const res = await client.delete(`/admin/students/${id}`);
    return res.data;
  },

  getStudentProjects: async (id) => {
    const res = await client.get(`/admin/students/${id}/projects`);
    return res.data;
  },

  previewBulkImportStudents: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/admin/students/csv/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  confirmBulkImportStudents: async (validRows) => {
    const res = await client.post('/admin/students/csv/confirm', validRows);
    return res.data;
  },

  bulkImportStudents: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/admin/students/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getProjects: async (params = {}) => {
    const res = await client.get('/admin/projects', { params });
    return res.data;
  },

  updateProjectStatus: async (projectId, status, reason = '') => {
    const res = await client.put(`/admin/projects/${projectId}/status`, { status, reason });
    return res.data;
  },

  toggleFeatured: async (projectId) => {
    const res = await client.put(`/admin/projects/${projectId}/feature`);
    return res.data;
  },

  updateVisibility: async (projectId, visibility) => {
    const res = await client.put(`/admin/projects/${projectId}/visibility`, { visibility });
    return res.data;
  },

  deleteProject: async (projectId) => {
    const res = await client.delete(`/admin/projects/${projectId}`);
    return res.data;
  },

  createAnnouncement: async (title, body) => {
    const res = await client.post('/admin/announcements', { title, body });
    return res.data;
  },

  awardBadge: async (studentId, badgeId) => {
    const res = await client.post('/admin/badges/award', { studentId, badgeId });
    return res.data;
  },
};
