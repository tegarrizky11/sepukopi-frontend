// src/pages/Login.jsx

import React, { useState } from 'react';
import api from '../services/api'; 
import { useNavigate } from 'react-router-dom'; 
import Swal from 'sweetalert2'; // Tambahkan ini biar notifikasi lebih keren
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Tampilkan loading sejenak
        Swal.fire({
            title: 'Mohon Tunggu...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        try {
            // Panggil API Login
            const response = await api.post('/auth/login', { username, password });
            
            // 1. Bersihkan data lama untuk menghindari bug role tertukar
            localStorage.clear();

            // 2. Ambil dan Simpan Token & User
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user)); 

            // 3. Notifikasi Sukses sesuai Role
            Swal.fire({
                icon: 'success',
                title: 'Login Berhasil!',
                text: `Selamat datang, ${user.username}. Anda masuk sebagai ${user.role.toUpperCase()}.`,
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                // 4. Arahkan berdasarkan Role
                if (user.role === 'admin') {
                    navigate('/dashboard'); // Admin langsung ke laporan
                } else {
                    navigate('/pos'); // Kasir langsung ke mesin kasir
                }
            });

        } catch (err) {
            Swal.close();
            console.error('Login error:', err);
            const msg = err.response?.data?.message || 'Login gagal. Periksa koneksi atau akun Anda.';
            setError(msg);
            Swal.fire({
                icon: 'error',
                title: 'Gagal Masuk',
                text: msg
            });
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="login-header">
                    <h2>☕ Sepukopi POS</h2>
                    <p>Silakan login untuk mengelola warung</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="Masukkan username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <div className="error-alert">{error}</div>}
                    <button type="submit" className="login-btn">MASUK SEKARANG</button>
                </form>
            </div>
        </div>
    );
};

export default Login;