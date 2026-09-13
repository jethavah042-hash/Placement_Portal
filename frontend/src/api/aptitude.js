import api from './axios';

// Topics & Overview
export const getAptitudeTopicsRequest = () => api.get('/aptitude/topics');
export const getAptitudeTopicDetailsRequest = (topicSlug) => api.get(`/aptitude/topics/${topicSlug}`);
export const getAptitudeTopicNotesRequest = (topicSlug) => api.get(`/aptitude/topics/${topicSlug}/notes`);
export const getAptitudeTopicQuestionsRequest = (topicSlug, params = {}) => 
  api.get(`/aptitude/topics/${topicSlug}/questions`, { params });

// Topic Quiz
export const getAptitudeTopicQuizRequest = (topicSlug) => api.get(`/aptitude/topics/${topicSlug}/quiz`);
export const submitAptitudeQuizRequest = (data) => api.post('/aptitude/quiz/submit', data);

// 30-Question Full Mock Test
export const getAptitudeMockTestRequest = () => api.get('/aptitude/mock-test');
export const submitAptitudeMockTestRequest = (data) => api.post('/aptitude/mock-test/submit', data);

// Results & Progress & Bookmarks
export const getAptitudeResultsRequest = () => api.get('/aptitude/results');
export const getAptitudeResultByIdRequest = (resultId) => api.get(`/aptitude/results/${resultId}`);
export const getAptitudeProgressRequest = () => api.get('/aptitude/progress');
export const toggleAptitudeBookmarkRequest = (data) => api.post('/aptitude/bookmark', data);
