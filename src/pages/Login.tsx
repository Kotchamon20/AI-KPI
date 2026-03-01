import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Coffee, Loader2, Play, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Please use Demo Mode or set up environment variables.');
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-coffee-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-card p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 coffee-gradient rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Coffee className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-coffee-900">BrewMetrics</h1>
          <p className="text-coffee-600 mt-2">ระบบจัดการ KPI ร้านกาแฟ</p>
        </div>



        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-coffee-800 mb-1">อีเมล</label>
            <input
              type="email"
              required
              disabled={!isSupabaseConfigured}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-coffee-200 focus:ring-2 focus:ring-coffee-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:bg-coffee-50"
              placeholder="name@coffeeshop.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-coffee-800 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              required
              disabled={!isSupabaseConfigured}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-coffee-200 focus:ring-2 focus:ring-coffee-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:bg-coffee-50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured}
            className="w-full coffee-gradient text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'เข้าสู่ระบบ'}
          </button>
        </form>


        <div className="mt-8 text-center text-sm text-coffee-500">
          <p>ติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์เข้าใช้งาน</p>
        </div>
      </motion.div>
    </div>
  );
}
