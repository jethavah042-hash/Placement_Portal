import api from './axios';

export const getBookmarksRequest = () => api.get('/bookmarks');
export const addBookmarkRequest = (data) => api.post('/bookmarks', data);
export const removeBookmarkRequest = (id) => api.delete(`/bookmarks/${id}`);
