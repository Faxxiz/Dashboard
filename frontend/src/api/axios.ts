import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite proxy will forward to backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
