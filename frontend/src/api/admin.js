import api from './axios';

// Dashboard
export const getAdminDashboardStatsRequest = () => api.get('/admin/dashboard');

// Students
export const getAdminStudentsRequest = (params = {}) => api.get('/admin/students', { params });
export const getAdminStudentDetailRequest = (id) => api.get(`/admin/students/${id}`);
export const toggleBlockStudentRequest = (id, data = {}) => api.post(`/admin/students/${id}/toggle-block`, data);
export const deleteStudentRequest = (id) => api.delete(`/admin/students/${id}`);

// Coding Problems & Notes
export const getAdminCodingProblemsRequest = (params = {}) => api.get('/admin/coding/problems', { params });
export const createAdminCodingProblemRequest = (data) => api.post('/admin/coding/problems', data);
export const updateAdminCodingProblemRequest = (id, data) => api.put(`/admin/coding/problems/${id}`, data);
export const deleteAdminCodingProblemRequest = (id) => api.delete(`/admin/coding/problems/${id}`);

export const getAdminCodingNotesRequest = (params = {}) => api.get('/admin/coding/notes', { params });
export const createAdminCodingNoteRequest = (data) => api.post('/admin/coding/notes', data);
export const updateAdminCodingNoteRequest = (id, data) => api.put(`/admin/coding/notes/${id}`, data);
export const deleteAdminCodingNoteRequest = (id) => api.delete(`/admin/coding/notes/${id}`);

export const getAdminInterviewQuestionsRequest = (params = {}) => api.get('/admin/coding/interview-questions', { params });
export const createAdminInterviewQuestionRequest = (data) => api.post('/admin/coding/interview-questions', data);
export const updateAdminInterviewQuestionRequest = (id, data) => api.put(`/admin/coding/interview-questions/${id}`, data);
export const deleteAdminInterviewQuestionRequest = (id) => api.delete(`/admin/coding/interview-questions/${id}`);

// Questions (Aptitude, Reasoning, English)
export const getAdminQuestionsRequest = (params = {}) => api.get('/admin/questions', { params });
export const createAdminQuestionRequest = (data) => api.post('/admin/questions', data);
export const updateAdminQuestionRequest = (id, data) => api.put(`/admin/questions/${id}`, data);
export const deleteAdminQuestionRequest = (id) => api.delete(`/admin/questions/${id}`);

export const getAdminTopicNotesRequest = (params = {}) => api.get('/admin/topic-notes', { params });
export const createAdminTopicNoteRequest = (data) => api.post('/admin/topic-notes', data);
export const updateAdminTopicNoteRequest = (id, data) => api.put(`/admin/topic-notes/${id}`, data);
export const deleteAdminTopicNoteRequest = (id) => api.delete(`/admin/topic-notes/${id}`);

// Companies
export const getAdminCompaniesRequest = (params = {}) => api.get('/admin/companies', { params });
export const getAdminCompanyDetailRequest = (id) => api.get(`/admin/companies/${id}`);
export const createAdminCompanyRequest = (data) => api.post('/admin/companies', data);
export const updateAdminCompanyRequest = (id, data) => api.put(`/admin/companies/${id}`, data);
export const deleteAdminCompanyRequest = (id) => api.delete(`/admin/companies/${id}`);

// Mock Tests
export const getAdminMockTestsRequest = (params = {}) => api.get('/admin/mock-tests', { params });
export const createAdminMockTestRequest = (data) => api.post('/admin/mock-tests', data);
export const updateAdminMockTestRequest = (id, data) => api.put(`/admin/mock-tests/${id}`, data);
export const deleteAdminMockTestRequest = (id) => api.delete(`/admin/mock-tests/${id}`);

// Results & Submissions
export const getAdminResultsRequest = (params = {}) => api.get('/admin/results', { params });
export const getAdminCodingSubmissionsRequest = (params = {}) => api.get('/admin/coding/submissions', { params });

// Resume Scanner
export const getAdminResumeStatsRequest = () => api.get('/admin/resumes/stats');

// Notifications
export const getAdminNotificationsRequest = () => api.get('/admin/notifications');
export const createAdminNotificationRequest = (data) => api.post('/admin/notifications', data);
export const deleteAdminNotificationRequest = (id) => api.delete(`/admin/notifications/${id}`);

// Reports & Audit Logs
export const getAdminReportsRequest = (params = {}) => api.get('/admin/reports', { params });
export const getAdminActivityLogsRequest = (params = {}) => api.get('/admin/activity-logs', { params });

// Profile & Settings
export const getAdminProfileRequest = () => api.get('/admin/profile');
export const updateAdminProfileRequest = (data) => api.put('/admin/profile', data);
export const changeAdminPasswordRequest = (data) => api.post('/admin/change-password', data);
