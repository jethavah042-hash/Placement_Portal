import api from './axios';

export const getMyNotificationsRequest = () => api.get('/notifications/my');
export const markNotificationReadRequest = (id) => api.put(`/notifications/${id}/read`);
