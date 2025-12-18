import { useState, useEffect } from 'react';
import api from '../services/api';
import Swal from 'sweetalert2';

const Users = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => { 
        fetchUsers(); 
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/kasir-list');
            setUsers(res.data);
        } catch (err) {
            console.error("Gagal memuat kasir:", err);
        }
    };

    const handleAddKasir = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Tambah Kasir Baru',
            html:
                '<input id="swal-username" class="swal2-input" placeholder="Username">' +
                '<input id="swal-password" type="password" class="swal2-input" placeholder="Password">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Buat Akun',
            preConfirm: () => {
                const username = document.getElementById('swal-username').value;
                const password = document.getElementById('swal-password').value;
                if (!username || !password) {
                    Swal.showValidationMessage('Harap isi username dan password');
                }
                return { username, password };
            }
        });

        if (formValues) {
            try {
                await api.post('/auth/register-kasir', formValues);
                Swal.fire('Berhasil!', 'Akun kasir telah dibuat.', 'success');
                fetchUsers();
            } catch (err) {
                Swal.fire('Gagal', err.response?.data?.message || 'Gagal membuat akun.', 'error');
            }
        }
    };

    return (
        <div style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <h2 style={{ color: '#1e293b', margin: 0 }}>Manajemen Karyawan</h2>
                <button onClick={handleAddKasir} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    + Kasir Baru
                </button>
            </div>
            
            <div style={{ background: 'white', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                        <tr>
                            <th style={{ padding: '15px', color: '#64748b' }}>USERNAME</th>
                            <th style={{ padding: '15px', color: '#64748b' }}>ROLE</th>
                            <th style={{ padding: '15px', color: '#64748b' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '15px', fontWeight: '600', color: '#1e293b' }}>{user.username}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{ padding: '4px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '15px', color: user.is_active ? '#10b981' : '#ef4444' }}>
                                    {user.is_active ? '● Aktif' : '● Nonaktif'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;