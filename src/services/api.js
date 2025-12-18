// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // PASTIKAN PORT BACKEND ANDA 5000
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor untuk menambahkan token ke header (Otomatis)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;