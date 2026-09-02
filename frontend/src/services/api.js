// src/services/api.js
//
// Single place where the frontend talks to the backend.
// Base URL is "/api" - Vite's dev server proxy (see vite.config.js)
// forwards that to http://localhost:5000/api automatically.

import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

// ---- Tickets ----
export const getTickets = (filters = {}) => api.get('/tickets', { params: filters });
export const getTicketById = (id) => api.get(`/tickets/${id}`);
export const createTicket = (data) => api.post('/tickets', data);
export const updateTicket = (id, data) => api.put(`/tickets/${id}`, data);
export const closeTicket = (id) => api.put(`/tickets/${id}/close`);
export const addComment = (id, data) => api.post(`/tickets/${id}/comments`, data);

// ---- Lookups ----
export const getCategories = () => api.get('/categories');
export const getUsers = () => api.get('/users');

// ---- Dashboard ----
export const getDashboard = () => api.get('/dashboard');

export default api;
