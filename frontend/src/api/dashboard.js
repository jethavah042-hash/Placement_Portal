import api from './axios';

export const getDashboardSummaryRequest = () => api.get('/dashboard/summary');
export const getProgressHistoryRequest = (days = 30) => api.get(`/dashboard/progress?days=${days}`);
export const getSubjectProgressRequest = () => api.get('/dashboard/subjects');
export const getRecentActivityRequest = () => api.get('/dashboard/recent-activity');
export const getUpcomingTestsRequest = () => api.get('/dashboard/upcoming-tests');
export const getRecommendationsRequest = () => api.get('/dashboard/recommendations');
export const getStreakRequest = () => api.get('/dashboard/streak');
export const getTimeSpentRequest = () => api.get('/dashboard/time-spent');
export const getQuickStatsRequest = () => api.get('/dashboard/quick-stats');
export const getCalendarActivityRequest = () => api.get('/dashboard/calendar');
