import api from './axios';

export const scanResumeRequest = (formData) =>
  api.post('/resumes/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const getScanHistoryRequest = () => api.get('/resumes/scans');

export const getScanDetailRequest = (scanId) => api.get(`/resumes/scans/${scanId}`);

export const deleteScanRequest = (scanId) => api.delete(`/resumes/scans/${scanId}`);

export const compareScansRequest = (scanId1, scanId2) =>
  api.post('/resumes/scans/compare', { scanId1, scanId2 });

export const matchCompanyRequest = (scanId, companyId) =>
  api.post(`/resumes/scans/${scanId}/company-match`, { companyId });

export const getAIReviewRequest = (scanId) =>
  api.post(`/resumes/scans/${scanId}/ai-review`);

export const getLatestResumeRequest = () => api.get('/resumes/latest');

export const saveResumeRequest = (data) => api.post('/resumes', data);

export const updateResumeRequest = (id, data) => api.put(`/resumes/${id}`, data);
