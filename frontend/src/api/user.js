import api from './axios';

// Student / User profile endpoints
export const getProfileRequest = () => api.get('/users/profile');
export const updateProfileRequest = (data) => api.put('/users/profile', data);
export const changePasswordRequest = (data) => api.put('/users/change-password', data);
