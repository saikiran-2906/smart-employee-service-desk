import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
const STORAGE_KEY = 'service-desk.currentUser';

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attaches the signed-in user's id so the backend can enforce role-based
// visibility (Support: own assigned tickets, Employee: own tickets, Admin: all).
client.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const user = raw ? JSON.parse(raw) : null;
    if (user?.user_id) {
      config.headers['X-User-Id'] = user.user_id;
    }
  } catch {
    // ignore malformed storage
  }
  return config;
});

// Normalizes error messages coming from the backend's error envelope.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiMessage = error.response?.data?.error?.message;
    const details = error.response?.data?.error?.details;
    const message = apiMessage || error.message || 'Something went wrong';
    return Promise.reject({ message, details, status: error.response?.status });
  }
);

export default client;
