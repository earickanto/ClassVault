import client from './client';

export const studentApi = {
  getProfile: async () => {
    const res = await client.get('/students/me');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await client.put('/students/me', data);
    return res.data;
  },

  uploadPhoto: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await client.post('/students/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  getLeaderboard: async () => {
    const res = await client.get('/leaderboard');
    return res.data;
  },

  getBookmarkedProjects: async () => {
    const res = await client.get('/bookmarks');
    return res.data;
  },

  getNotifications: async () => {
    const res = await client.get('/notifications');
    return res.data;
  },

  markNotificationsRead: async () => {
    const res = await client.put('/notifications/mark-read');
    return res.data;
  }
};
