import client from './client';

// ---- Tickets ----
export const ticketsApi = {
  list: (params) => client.get('/tickets', { params }).then((r) => r.data.data),
  get: (id) => client.get(`/tickets/${id}`).then((r) => r.data.data),
  create: (payload) => client.post('/tickets', payload).then((r) => r.data.data),
  update: (id, payload) => client.put(`/tickets/${id}`, payload).then((r) => r.data.data),
  assign: (id, assignedTo) => client.put(`/tickets/${id}/assign`, { assignedTo }).then((r) => r.data.data),
  close: (id, resolutionNote) => client.put(`/tickets/${id}/close`, { resolutionNote }).then((r) => r.data.data),
  addComment: (id, payload) => client.post(`/tickets/${id}/comments`, payload).then((r) => r.data.data),
};

// ---- Categories ----
export const categoriesApi = {
  list: () => client.get('/categories').then((r) => r.data.data),
};

// ---- Users ----
export const usersApi = {
  list: (role) => client.get('/users', { params: role ? { role } : {} }).then((r) => r.data.data),
};

// ---- Dashboard ----
export const dashboardApi = {
  summary: () => client.get('/dashboard').then((r) => r.data.data),
};
