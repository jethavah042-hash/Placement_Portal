import api from './axios';

// ==========================================
// STUDENT ENGLISH API METHODS
// ==========================================

export const getStudentEnglishDashboardRequest = () =>
  api.get('/english/dashboard');

export const getStudentEnglishTopicsRequest = () =>
  api.get('/english/topics');

export const getStudentEnglishTopicBySlugRequest = (slug) =>
  api.get(`/english/topics/${slug}`);

export const getStudentEnglishTopicNotesRequest = (topicSlug) =>
  api.get(`/english/notes/${topicSlug}`);

export const markStudentEnglishNotesCompletedRequest = (topicSlug) =>
  api.post(`/english/notes/${topicSlug}/complete`);

export const getStudentEnglishQuestionsRequest = (params) =>
  api.get('/english/questions', { params });

export const submitStudentEnglishAttemptRequest = (data) =>
  api.post('/english/attempt', data);

export const getStudentEnglishVocabularyRequest = (params) =>
  api.get('/english/vocabulary', { params });

export const toggleStudentEnglishVocabularyLearnedRequest = (id) =>
  api.post(`/english/vocabulary/${id}/toggle-learned`);

export const getStudentEnglishPassagesRequest = (params) =>
  api.get('/english/passages', { params });

export const getStudentEnglishPassageByIdRequest = (id) =>
  api.get(`/english/passages/${id}`);

export const submitStudentEnglishPassageRequest = (id, data) =>
  api.post(`/english/passages/${id}/submit`, data);

export const generateStudentEnglishQuizRequest = (data) =>
  api.post('/english/quiz/generate', data);

export const submitStudentEnglishQuizRequest = (data) =>
  api.post('/english/quiz/submit', data);

export const getStudentEnglishBookmarksRequest = () =>
  api.get('/english/bookmarks');

export const toggleStudentEnglishBookmarkRequest = (data) =>
  api.post('/english/bookmark', data);

export const deleteStudentEnglishBookmarkRequest = (id) =>
  api.delete(`/english/bookmark/${id}`);

export const reportStudentEnglishQuestionRequest = (data) =>
  api.post('/english/report', data);

// ==========================================
// ADMIN ENGLISH API METHODS
// ==========================================

export const getAdminEnglishDashboardRequest = () =>
  api.get('/admin/english/dashboard');

// Topics
export const getAdminEnglishTopicsRequest = () =>
  api.get('/admin/english/topics');

export const createAdminEnglishTopicRequest = (data) =>
  api.post('/admin/english/topics', data);

export const updateAdminEnglishTopicRequest = (id, data) =>
  api.put(`/admin/english/topics/${id}`, data);

export const deleteAdminEnglishTopicRequest = (id) =>
  api.delete(`/admin/english/topics/${id}`);

// Questions
export const getAdminEnglishQuestionsRequest = (params) =>
  api.get('/admin/english/questions', { params });

export const createAdminEnglishQuestionRequest = (data) =>
  api.post('/admin/english/questions', data);

export const updateAdminEnglishQuestionRequest = (id, data) =>
  api.put(`/admin/english/questions/${id}`, data);

export const deleteAdminEnglishQuestionRequest = (id) =>
  api.delete(`/admin/english/questions/${id}`);

export const duplicateAdminEnglishQuestionRequest = (id) =>
  api.post(`/admin/english/questions/${id}/duplicate`);

// Notes / Study Guides
export const getAdminEnglishNotesRequest = () =>
  api.get('/admin/english/notes');

export const createAdminEnglishNoteRequest = (data) =>
  api.post('/admin/english/notes', data);

export const updateAdminEnglishNoteRequest = (id, data) =>
  api.put(`/admin/english/notes/${id}`, data);

export const deleteAdminEnglishNoteRequest = (id) =>
  api.delete(`/admin/english/notes/${id}`);

// Vocabulary
export const getAdminEnglishVocabularyRequest = (params) =>
  api.get('/admin/english/vocabulary', { params });

export const createAdminEnglishVocabularyRequest = (data) =>
  api.post('/admin/english/vocabulary', data);

export const updateAdminEnglishVocabularyRequest = (id, data) =>
  api.put(`/admin/english/vocabulary/${id}`, data);

export const deleteAdminEnglishVocabularyRequest = (id) =>
  api.delete(`/admin/english/vocabulary/${id}`);

// Passages
export const getAdminEnglishPassagesRequest = () =>
  api.get('/admin/english/passages');

export const createAdminEnglishPassageRequest = (data) =>
  api.post('/admin/english/passages', data);

export const updateAdminEnglishPassageRequest = (id, data) =>
  api.put(`/admin/english/passages/${id}`, data);

export const deleteAdminEnglishPassageRequest = (id) =>
  api.delete(`/admin/english/passages/${id}`);

// Reports
export const getAdminEnglishReportsRequest = () =>
  api.get('/admin/english/reports');

export const resolveAdminEnglishReportRequest = (id, data) =>
  api.put(`/admin/english/reports/${id}/resolve`, data);

export const deleteAdminEnglishReportRequest = (id) =>
  api.delete(`/admin/english/reports/${id}`);
