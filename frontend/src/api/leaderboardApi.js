import client from './client';

export const leaderboardApi = {
  getLeaderboard: async () => {
    const res = await client.get('/leaderboard');
    return res.data;
  },
  getStudentRank: async (studentId) => {
    const res = await client.get(`/leaderboard/student/${studentId}`);
    return res.data;
  },
};
