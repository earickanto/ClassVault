import client from './client';

export const authApi = {
  login: async (username, password) => {
    const res = await client.post('/auth/login', { username, password });
    return res.data;
  },

  changePassword: async (changeData) => {
    const res = await client.post('/auth/change-password', changeData);
    return res.data;
  },

  activateAccount: async (activateData) => {
    const res = await client.post('/auth/activate', activateData);
    return res.data;
  },

  refreshToken: async (refreshToken) => {
    const res = await client.post('/auth/refresh', { refreshToken });
    return res.data;
  }
};
