import api from './axios';

// Student API: Get published & active announcements
export const getPublishedAnnouncementsRequest = () =>
  api.get('/announcements/published');

// Get Single announcement by ID
export const getAnnouncementByIdRequest = (id) =>
  api.get(`/announcements/${id}`);

// Admin APIs: CRUD & Status management
export const getAllAnnouncementsRequest = (params) =>
  api.get('/announcements', { params });

export const createAnnouncementRequest = (data) =>
  api.post('/announcements', data);

export const updateAnnouncementRequest = (id, data) =>
  api.put(`/announcements/${id}`, data);

export const deleteAnnouncementRequest = (id) =>
  api.delete(`/announcements/${id}`);

export const updateAnnouncementStatusRequest = (id, status) =>
  api.patch(`/announcements/${id}/status`, { status });
