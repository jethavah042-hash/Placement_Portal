import api from './axios';

// ============================================================================
// STUDENT REASONING APIs
// ============================================================================
export const getStudentReasoningDashboardRequest = () => api.get('/reasoning/dashboard');
export const getStudentReasoningTopicsRequest = () => api.get('/reasoning/topics');
export const getStudentReasoningTopicBySlugRequest = (slug) => api.get(`/reasoning/topics/${slug}`);
export const getStudentReasoningNotesRequest = (slug) => api.get(`/reasoning/notes/${slug}`);
export const markStudentReasoningNotesCompletedRequest = (slug) => api.post(`/reasoning/notes/${slug}/complete`);
export const getStudentReasoningQuestionsRequest = (params) => api.get('/reasoning/questions', { params });
export const submitStudentReasoningAttemptRequest = (data) => api.post('/reasoning/attempt', data);
export const generateStudentReasoningQuizRequest = (data) => api.post('/reasoning/quiz/generate', data);
export const submitStudentReasoningQuizRequest = (data) => api.post('/reasoning/quiz/submit', data);
export const getStudentReasoningBookmarksRequest = () => api.get('/reasoning/bookmarks');
export const toggleStudentReasoningBookmarkRequest = (data) => api.post('/reasoning/bookmark', data);
export const deleteStudentReasoningBookmarkRequest = (id) => api.delete(`/reasoning/bookmark/${id}`);
export const reportStudentReasoningQuestionRequest = (data) => api.post('/reasoning/report', data);

// ============================================================================
// ADMIN REASONING APIs
// ============================================================================
export const getAdminReasoningDashboardRequest = () => api.get('/admin/reasoning/dashboard');
export const getAdminReasoningAnalyticsRequest = () => api.get('/admin/reasoning/analytics');

// Admin Topics
export const getAdminReasoningTopicsRequest = (params) => api.get('/admin/reasoning/topics', { params });
export const createAdminReasoningTopicRequest = (data) => api.post('/admin/reasoning/topics', data);
export const updateAdminReasoningTopicRequest = (id, data) => api.put(`/admin/reasoning/topics/${id}`, data);
export const deleteAdminReasoningTopicRequest = (id) => api.delete(`/admin/reasoning/topics/${id}`);
export const reorderAdminReasoningTopicsRequest = (data) => api.post('/admin/reasoning/topics/reorder', data);

// Admin Question Bank
export const getAdminReasoningQuestionsRequest = (params) => api.get('/admin/reasoning/questions', { params });
export const createAdminReasoningQuestionRequest = (data) => api.post('/admin/reasoning/questions', data);
export const updateAdminReasoningQuestionRequest = (id, data) => api.put(`/admin/reasoning/questions/${id}`, data);
export const deleteAdminReasoningQuestionRequest = (id) => api.delete(`/admin/reasoning/questions/${id}`);
export const duplicateAdminReasoningQuestionRequest = (id) => api.post(`/admin/reasoning/questions/${id}/duplicate`);

// Admin Study Notes
export const getAdminReasoningNotesRequest = (params) => api.get('/admin/reasoning/notes', { params });
export const createAdminReasoningNoteRequest = (data) => api.post('/admin/reasoning/notes', data);
export const updateAdminReasoningNoteRequest = (id, data) => api.put(`/admin/reasoning/notes/${id}`, data);
export const deleteAdminReasoningNoteRequest = (id) => api.delete(`/admin/reasoning/notes/${id}`);

// Admin Question Reports
export const getAdminReasoningReportsRequest = (params) => api.get('/admin/reasoning/reports', { params });
export const resolveAdminReasoningReportRequest = (id, data) => api.put(`/admin/reasoning/reports/${id}/resolve`, data);
export const deleteAdminReasoningReportRequest = (id) => api.delete(`/admin/reasoning/reports/${id}`);
