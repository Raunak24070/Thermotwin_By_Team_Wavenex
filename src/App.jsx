import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyExperimentsPage } from './pages/MyExperimentsPage';
import { ExperimentDetailsPage } from './pages/ExperimentDetailsPage';
import { AppShell } from './components/shell/AppShell';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuthStore } from './store/useAuthStore';
import './app/globals.css';

// Root redirect component
const RootRedirect = () => {
  const { isAuthenticated, checkAuthSession } = useAuthStore();
  const token = typeof window !== 'undefined' ? localStorage.getItem('thermotwin_token') : null;

  useEffect(() => {
    if (token && !isAuthenticated) {
      checkAuthSession();
    }
  }, [token, isAuthenticated, checkAuthSession]);

  if (isAuthenticated && token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
};

function App() {
  const basename = import.meta.env.BASE_URL === '/'
    ? undefined
    : import.meta.env.BASE_URL.replace(/\/$/, '');

  const { checkAuthSession } = useAuthStore();

  // Validate session on app initialization
  useEffect(() => {
    const token = localStorage.getItem('thermotwin_token');
    if (token) {
      checkAuthSession();
    }
  }, [checkAuthSession]);

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Virtual Laboratory Experiment Route */}
        <Route
          path="/lab"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        />

        {/* Protected Saved Experiments History Route */}
        <Route
          path="/experiments"
          element={
            <ProtectedRoute>
              <MyExperimentsPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Experiment Details Route */}
        <Route
          path="/experiments/:id"
          element={
            <ProtectedRoute>
              <ExperimentDetailsPage />
            </ProtectedRoute>
          }
        />

        {/* Root Route: Redirects to /login (or /dashboard if authenticated) */}
        <Route path="/" element={<RootRedirect />} />

        {/* Fallback wildcard */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
