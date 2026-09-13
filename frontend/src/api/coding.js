import api from './axios';

// Topics & Overview
export const getCodingTopicsRequest = () => api.get('/coding/topics');
export const getCodingTopicDetailsRequest = (topicSlug) => api.get(`/coding/topics/${topicSlug}`);
export const getCodingTopicNotesRequest = (topicSlug) => api.get(`/coding/topics/${topicSlug}/notes`);

// Interview Questions
export const getCodingInterviewQuestionsRequest = (params = {}) => api.get('/coding/interview', { params });
export const getTopicInterviewQuestionsRequest = (topicSlug, params = {}) => 
  api.get(`/coding/topics/${topicSlug}/interview`, { params });

// Coding Problems Catalog & Detail
export const getCodingProblemsRequest = (params = {}) => api.get('/coding/problems', { params });
export const getCodingProblemDetailRequest = (id) => api.get(`/coding/problems/${id}`);
export const getCodingProblemHintsRequest = (id) => api.get(`/coding/problems/${id}/hints`);

// Execution & Submissions
export const runCodingProblemRequest = (id, data) => api.post(`/coding/problems/${id}/run`, data);
export const submitCodingProblemRequest = (id, data) => api.post(`/coding/problems/${id}/submit`, data);
export const toggleCodingBookmarkRequest = (id) => api.post(`/coding/problems/${id}/bookmark`);

// Submissions, Progress & Result Analysis
export const getCodingSubmissionsRequest = (params = {}) => api.get('/coding/submissions', { params });
export const getCodingSubmissionDetailRequest = (id) => api.get(`/coding/submissions/${id}`);
export const getCodingProgressRequest = () => api.get('/coding/progress');
export const getCodingAnalyticsRequest = () => api.get('/coding/analytics');
