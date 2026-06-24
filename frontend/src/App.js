import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TenantDashboard from './pages/TenantDashboard';
import PublicRequestForm from './pages/PublicRequestForm';
import UsersPage from './pages/UsersPage';
import PropertiesPage from './pages/PropertiesPage';
import AppLayout from './components/AppLayout';

function ProtectedRoute({ children, tenantChildren }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'TENANT' && tenantChildren) return tenantChildren;
  return children;
}

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  return (
    <Routes>
      <Route path="/request" element={<PublicRequestForm />} />
      <Route path="/login" element={
        loading ? <div className="min-h-screen flex items-center justify-center">Loading...</div> :
        user ? <Navigate to="/" replace /> : <Login />
      } />
      <Route
        path="/"
        element={
          loading ? <div className="min-h-screen flex items-center justify-center">Loading...</div> :
          <ProtectedRoute tenantChildren={<TenantDashboard />}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/users" element={<ProtectedPage><UsersPage /></ProtectedPage>} />
      <Route path="/properties" element={<ProtectedPage><PropertiesPage /></ProtectedPage>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
