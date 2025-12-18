import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, setIsOpen }) => { 
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Ambil data user dari localStorage untuk cek Role
    const userData = JSON.parse(localStorage.getItem('user')) || { role: 'kasir' };

    // 2. Filter menuItems berdasarkan Role
    const menuItems = [
        // Menu Dashboard & Produk hanya untuk Admin
        ...(userData.role === 'admin' ? [
            { name: 'Dashboard', path: '/dashboard', icon: '📊' },
            { name: 'Produk (Stok)', path: '/products', icon: '📦' },
            { name: 'Kelola Kasir', path: '/users', icon: '👥' }, // Tambahan menu untuk manajemen user
        ] : []),
        
        // Menu yang bisa diakses semua (Admin & Kasir)
        { name: 'Kasir (POS)', path: '/pos', icon: '☕' },
        { name: 'Riwayat', path: '/sales', icon: '📜' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <>
            <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '✕' : '☰'}
            </button>

            <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-brand">
                    <h2>Sepu<span>kopi</span></h2>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '-5px', letterSpacing: '1px' }}>
                        LOGGED IN AS: {userData.role.toUpperCase()}
                    </div>
                </div>
                
                <nav className="sidebar-menu">
                    {menuItems.map((item) => (
                        <div 
                            key={item.path} 
                            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => {
                                navigate(item.path);
                                if (window.innerWidth < 768) setIsOpen(false); // Close sidebar on mobile after click
                            }}
                        >
                            <span className="menu-icon">{item.icon}</span>
                            <span className="menu-text">{item.name}</span>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;