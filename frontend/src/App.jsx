import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { BookOpen, Settings, LogOut, ShieldAlert, Sun, CloudRain } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import SettingsPage from './pages/Settings';
import Admin from './pages/Admin';

// Context for auth
export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function AppContent() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login';

  return (
    <div className="app-container">
      {user && !isAuthPage && (
        <nav className="navbar glass">
          <Link to="/" className="nav-logo">
            <BookOpen size={24} />
            <span>Journal Space</span>
          </Link>
          <div className="nav-links">
            <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
              <BookOpen size={18} /> Dashboard
            </Link>
            {user.roles && user.roles.includes('ADMIN') && (
              <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
                <ShieldAlert size={18} /> Admin
              </Link>
            )}
            <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}>
              <Settings size={18} /> Settings
            </Link>
          </div>
          <div className="nav-user">
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
              Logged in as: <strong>{user.username}</strong>
            </span>
            <button className="btn btn-secondary" onClick={logout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </nav>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/editor" 
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/editor/:id" 
            element={
              <ProtectedRoute>
                <Editor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly={true}>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

// Protected Route Guard
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10%' }}>Loading sessions...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && (!user.roles || !user.roles.includes('ADMIN'))) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Decode JWT to extract username and roles
  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        // Find user details (roles, username)
        const username = decoded.sub;
        // Since backend JWT token stores claims, let's extract them.
        // We will default to a standard user. Admin route access can be confirmed from roles array.
        // Let's retrieve role information from local storage or decode.
        // Wait, standard user details or roles can be fetched or stored during login.
        const storedRoles = localStorage.getItem('roles');
        setUser({
          username,
          roles: storedRoles ? JSON.parse(storedRoles) : ['USER'],
        });
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, username) => {
    localStorage.setItem('token', token);
    // Decode roles from JWT if possible, or perform check.
    // For now, let's parse JWT payload
    const decoded = parseJwt(token);
    // Usually spring security authorities is stored in claim 'roles' or 'authorities' or similar
    // Let's check if there are standard roles. We will write login endpoint to store username.
    // Wait, the AdminController permits GET /admin/all-users only for ADMIN role.
    // To know if the user is ADMIN, we can check if username matches "admin" or has roles.
    // Let's check roles in decoded token claims if available, else we can inspect them.
    // Typically in standard spring security JWT implementation, roles can be passed in JWT or roles are set in local storage.
    // Let's decode roles. In our SpringBoot codebase, let's check `JwtUtil.java` to see what is inside the token.
    // Let's check JwtUtil.java to make sure we parse roles correctly!
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading, parseJwt }}>
      <Router>
        <AppContent />
      </Router>
    </AuthContext.Provider>
  );
}
