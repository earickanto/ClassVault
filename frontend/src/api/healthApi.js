import client from './client';

export const healthApi = {
  getHealth: async () => {
    const res = await client.get('/health');
    return res.data;
  }
};
