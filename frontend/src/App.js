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
import AuditPage from './pages/AuditPage';
import ErrorBoundary from './components/ErrorBoundary';
import AppLayout from './components/AppLayout';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, tenantChildren }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
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
        loading ? <LoadingScreen /> :
        user ? <Navigate to="/" replace /> : <Login />
      } />
      <Route
        path="/"
        element={
          loading ? <LoadingScreen /> :
          <ProtectedRoute tenantChildren={<TenantDashboard />}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/users" element={<ProtectedPage><UsersPage /></ProtectedPage>} />
      <Route path="/properties" element={<ProtectedPage><PropertiesPage /></ProtectedPage>} />
      <Route path="/audit" element={<ProtectedPage><AuditPage /></ProtectedPage>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
