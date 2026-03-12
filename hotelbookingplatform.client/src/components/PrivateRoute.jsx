import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

/**
 * PrivateRoute — wraps a component and only renders it if the user is authenticated.
 * Redirects to /login with a `next` query param so the user can be redirected back after login.
 * 
 * Usage:
 *   <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
 * 
 * @param {string} [role] - Optional: restrict to a specific role (e.g. 'Admin')
 */
const PrivateRoute = ({ children, role }) => {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect to login, remembering where the user was trying to go
        return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
    }

    if (role && user?.role?.toLowerCase() !== role.toLowerCase()) {
        // User is authenticated but doesn't have the required role
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;
