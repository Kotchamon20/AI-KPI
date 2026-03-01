import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  Coffee,
  Menu,
  X,
  TrendingUp,
  Filter,
  Building2,
  Target
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, signOut, isDemo } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: 'แดชบอร์ด', href: '/', icon: LayoutDashboard, roles: ['admin', 'marketing', 'staff'] },
    { name: 'การตลาด', href: '/marketing', icon: TrendingUp, roles: ['admin', 'marketing'] },
    { name: 'Marketing Funnel', href: '/funnel', icon: Target, roles: ['admin', 'marketing'] },
    { name: 'KPI พนักงาน', href: '/staff', icon: Users, roles: ['admin', 'staff'] },
    { name: 'เปรียบเทียบสาขา', href: '/branches', icon: Building2, roles: ['admin'] },
    { name: 'วิเคราะห์ข้อมูล', href: '/analytics', icon: BarChart3, roles: ['admin', 'marketing'] },
  ].filter(item => item.roles.includes(profile?.role || ''));

  return (
    <div className="min-h-screen bg-coffee-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-coffee-200">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 coffee-gradient rounded-xl flex items-center justify-center shadow-md">
              <Coffee className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-serif font-bold text-coffee-900">BrewMetrics</span>
          </div>
          {isDemo && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase tracking-wider">Demo</span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive 
                    ? "bg-coffee-100 text-coffee-900 shadow-sm" 
                    : "text-coffee-500 hover:bg-coffee-50 hover:text-coffee-700"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-coffee-700" : "text-coffee-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-coffee-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-coffee-200 flex items-center justify-center text-coffee-700 font-bold text-xs">
              {profile?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-coffee-900 truncate">{profile?.name}</p>
              <p className="text-xs text-coffee-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden bg-white border-b border-coffee-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coffee className="text-coffee-700 w-6 h-6" />
            <span className="font-serif font-bold text-coffee-900">BrewMetrics</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-coffee-600"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="fixed inset-0 z-50 md:hidden bg-white p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Coffee className="text-coffee-700 w-6 h-6" />
                  <span className="font-serif font-bold text-coffee-900">BrewMetrics</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                  <X />
                </button>
              </div>
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 p-4 rounded-2xl text-lg font-medium text-coffee-700 hover:bg-coffee-50"
                  >
                    <item.icon className="w-6 h-6" />
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="absolute bottom-8 left-6 right-6 pt-6 border-t border-coffee-100">
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-4 p-4 text-lg font-medium text-red-600"
                >
                  <LogOut className="w-6 h-6" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
