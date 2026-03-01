import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import MarketingDashboard from './pages/MarketingDashboard';
import BranchDashboard from './pages/BranchDashboard';
import MarketingFunnelDashboard from './pages/MarketingFunnelDashboard';
import { AlertCircle, Coffee } from 'lucide-react';



function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles?: string[] }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-coffee-50">กำลังโหลด...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && profile && !roles.includes(profile.role)) return <Navigate to="/" />;

  return <DashboardLayout>{children}</DashboardLayout>;
}

function HomeRedirect() {
  const { profile, loading } = useAuth();

  if (loading) return null;
  if (profile?.role === 'admin') return <AdminDashboard />;
  if (profile?.role === 'marketing') return <MarketingDashboard />;
  return <StaffDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute>
              <HomeRedirect />
            </ProtectedRoute>
          } />

          <Route path="/marketing" element={
            <ProtectedRoute roles={['admin', 'marketing']}>
              <MarketingDashboard />
            </ProtectedRoute>
          } />

          <Route path="/funnel" element={
            <ProtectedRoute roles={['admin', 'marketing']}>
              <MarketingFunnelDashboard />
            </ProtectedRoute>
          } />

          <Route path="/branches" element={
            <ProtectedRoute roles={['admin']}>
              <BranchDashboard />
            </ProtectedRoute>
          } />

          <Route path="/staff" element={
            <ProtectedRoute roles={['admin', 'staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={
            <ProtectedRoute roles={['admin', 'marketing']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
