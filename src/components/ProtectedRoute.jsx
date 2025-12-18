import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component }) => {
    const token = localStorage.getItem('token');

    // Jika ada token, tampilkan komponen. Jika tidak, lempar ke Login (/)
    return token ? <Component /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;