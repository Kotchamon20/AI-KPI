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

function ConfigWarning({ onTryDemo }: { onTryDemo: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-coffee-100 p-4">
      <div className="max-w-md w-full glass-card p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="text-amber-600 w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-coffee-900 mb-4">จำเป็นต้องตั้งค่าระบบ</h1>
        <p className="text-coffee-600 mb-6">
          เพื่อใช้งาน BrewMetrics ด้วยข้อมูลของคุณเอง คุณต้องเชื่อมต่อโปรเจกต์ Supabase
        </p>
        
        <div className="space-y-3 text-left bg-coffee-50 p-4 rounded-xl border border-coffee-200 font-mono text-sm mb-6">
          <p className="text-coffee-800">VITE_SUPABASE_URL</p>
          <p className="text-coffee-800">VITE_SUPABASE_ANON_KEY</p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onTryDemo}
            className="w-full coffee-gradient text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
          >
            ทดลองใช้งาน (Demo Mode)
          </button>
          <p className="text-xs text-coffee-500">
            ตั้งค่าตัวแปรเหล่านี้ในแผง Secrets เพื่อใช้งานข้อมูลจริง
          </p>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, roles }: { children: React.ReactNode, roles?: string[] }) {
  const { user, profile, loading, isDemo } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-coffee-50">กำลังโหลด...</div>;
  if (!user && !isDemo) return <Navigate to="/login" />;
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
  const isConfigured = 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_URL.startsWith('http') &&
    import.meta.env.VITE_SUPABASE_ANON_KEY;

  const [showConfig, setShowConfig] = React.useState(!isConfigured);

  // Check if we are already in demo mode
  React.useEffect(() => {
    if (localStorage.getItem('brewmetrics_demo') === 'true') {
      setShowConfig(false);
    }
  }, []);

  return (
    <AuthProvider>
      {showConfig ? (
        <ConfigWarning onTryDemo={() => setShowConfig(false)} />
      ) : (
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
      )}
    </AuthProvider>
  );
}
