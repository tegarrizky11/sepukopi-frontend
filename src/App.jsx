import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Pos from './pages/Pos';
import ProtectedRoute from "./components/ProtectedRoute"; 
import SalesHistory from './pages/SalesHistory'; 
import Dashboard from './pages/Dashboard';
import Receipt from './pages/Receipt';
import Products from './pages/Products'; 
import Users from './pages/Users'; // 1. TAMBAHKAN IMPORT INI
import Sidebar from './components/Sidebar';
import AdminRoute from './routes/AdminRoute';

function App() {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';

    const showSidebar = location.pathname !== '/' && location.pathname !== '/receipt';

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="app-layout" style={{ display: 'flex', overflowX: 'hidden', width: '100vw' }}>
            {showSidebar && (
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            )}
            
            <main className="content" style={{ 
                flex: 1, 
                display: 'flex',
                flexDirection: 'column',
                height: '100vh', 
                overflow: 'hidden',
                marginLeft: showSidebar && isSidebarOpen && window.innerWidth > 768 ? '260px' : '0', 
                backgroundColor: '#f1f5f9',
                paddingTop: showSidebar && window.innerWidth <= 768 ? '60px' : '0' 
            }}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    
                    {/* RUTE ADMIN */}
                    <Route 
                        path="/dashboard" 
                        element={<ProtectedRoute element={isAdmin ? Dashboard : Pos} />} 
                    />
                    <Route 
                        path="/products" 
                        element={<ProtectedRoute element={isAdmin ? Products : Pos} />} 
                    />
                    {/* 2. TAMBAHKAN RUTE USERS DI SINI */}
                    <Route 
                        path="/users" 
                        element={<ProtectedRoute element={isAdmin ? Users : Pos} />} 
                    />

                    {/* RUTE UMUM */}
                    <Route path="/pos" element={<ProtectedRoute element={Pos} />} />
                    <Route path="/sales" element={<ProtectedRoute element={SalesHistory} />} />
                    <Route path="/receipt" element={<Receipt />} />
                    
                    {/* REDIRECT JIKA RUTE TIDAK ADA */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;