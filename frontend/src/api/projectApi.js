import client from './client';

export const projectApi = {
  getProjects: async (params = {}) => {
    const res = await client.get('/projects', { params });
    return res.data;
  },

  getMyProjects: async () => {
    const res = await client.get('/projects/my-projects');
    return res.data;
  },

  getProjectById: async (id) => {
    const res = await client.get(`/projects/${id}`);
    return res.data;
  },

  createProject: async (projectData) => {
    const res = await client.post('/projects', projectData);
    return res.data;
  },

  updateProject: async (id, projectData) => {
    const res = await client.put(`/projects/${id}`, projectData);
    return res.data;
  },

  uploadFile: async (id, fileType, file) => {
    const formData = new FormData();
    formData.append('fileType', fileType);
    formData.append('file', file);
    const res = await client.post(`/projects/${id}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  recordView: async (id) => {
    const res = await client.post(`/projects/${id}/view`);
    return res.data;
  },

  recordDownload: async (id, fileId) => {
    const res = await client.post(`/projects/${id}/download/${fileId}`);
    return res.data;
  },

  toggleLike: async (id) => {
    const res = await client.post(`/projects/${id}/like`);
    return res.data;
  },

  toggleBookmark: async (id) => {
    const res = await client.post(`/bookmarks/toggle/${id}`);
    return res.data;
  },

  getBookmarks: async () => {
    const res = await client.get('/bookmarks');
    return res.data;
  },

  addComment: async (id, content) => {
    const res = await client.post(`/projects/${id}/comments`, { content });
    return res.data;
  },

  deleteProject: async (id) => {
    const res = await client.delete(`/projects/${id}`);
    return res.data;
  }
};
