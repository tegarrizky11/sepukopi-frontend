// src/services/api.js
import axios from 'axios';

const api = axios.create({
    // Menggunakan Environment Variable dari Vercel untuk produksi
    // Jika sedang di laptop (lokal), otomatis balik ke localhost
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
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