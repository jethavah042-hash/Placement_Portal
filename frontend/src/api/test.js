import api from './axios';

export const getAllTestsRequest = (params = {}) => api.get('/tests', { params });
export const getTestDetailRequest = (testId) => api.get(`/tests/${testId}`);
export const submitTestRequest = (testId, data) => api.post(`/tests/${testId}/submit`, data);
export const getTestLeaderboardRequest = (testId) => api.get(`/tests/${testId}/leaderboard`);
export const getMyTestAttemptsRequest = () => api.get('/tests/my/attempts');
