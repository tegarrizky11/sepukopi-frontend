// src/components/Navbar.jsx (VERSI TERBARU)
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <h2>Sepukopi POS</h2>
            </div>
            <ul className="navbar-links">
                <li><Link to="/pos">Kasir (POS)</Link></li>
                <li><Link to="/sales-history">Riwayat Transaksi</Link></li>
                {/* BARIS BARU DI BAWAH INI AGAR DASHBOARD MUNCUL */}
                <li><Link to="/dashboard">Dashboard & Stok</Link></li>
            </ul>
            <div className="navbar-user">
                <span>Halo, <strong>{user?.name || 'Kasir'}</strong></span>
                <button onClick={handleLogout} className="logout-min-btn">Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;