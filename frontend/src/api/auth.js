import api from './axios';

export const loginRequest = (data) => api.post('/auth/login', data);
export const verifyOtpRequest = (data) => api.post('/auth/verify-otp', data);
export const resendOtpRequest = (data) => api.post('/auth/resend-otp', data);
export const registerRequest = (data) => api.post('/auth/register', data);
export const logoutRequest = () => api.post('/auth/logout');
export const meRequest = () => api.get('/auth/me');
export const forgotPasswordRequest = (data) => api.post('/auth/forgot-password', data);
export const resetPasswordRequest = (data) => api.post('/auth/reset-password', data);

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
const normalizedBaseUrl = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;

export const googleLoginUrl = `${normalizedBaseUrl}/auth/google`;
export const githubLoginUrl = `${normalizedBaseUrl}/auth/github`;
