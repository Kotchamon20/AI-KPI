import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { formatCurrency, calculateAvgBill, cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { analyzeDashboardData } from '../services/gemini';
import { Sparkles, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';

export default function AdminDashboard() {
  const { } = useAuth();
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    totalOrders: 0,
    avgBill: 0,
    roas: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [staffRanking, setStaffRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      let currentStats = { ...stats };
      let currentCategoryData: any[] = [];
      let currentStaffRanking: any[] = [];

      // Fetch daily sales for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: salesData } = await supabase
        .from('daily_sales')
        .select('*')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (salesData) {
        const totalRev = salesData.reduce((acc, curr) => acc + Number(curr.total_sales), 0);
        const totalOrd = salesData.reduce((acc, curr) => acc + curr.total_orders, 0);
        currentStats = {
          ...currentStats,
          monthlyRevenue: totalRev,
          totalOrders: totalOrd,
          avgBill: Number(calculateAvgBill(totalRev, totalOrd)),
        };
        setStats(currentStats);
        setChartData(salesData.map(d => ({
          date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: d.total_sales,
          orders: d.total_orders
        })));
      }

      // Fetch product sales for categories
      const { data: prodData } = await supabase
        .from('product_sales')
        .select('category, revenue')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (prodData) {
        const cats: Record<string, number> = {};
        prodData.forEach(p => {
          cats[p.category] = (cats[p.category] || 0) + Number(p.revenue);
        });
        currentCategoryData = Object.entries(cats).map(([name, value]) => ({ name, value }));
        setCategoryData(currentCategoryData);
      }

      // Fetch staff ranking
      const { data: staffData } = await supabase
        .from('staff_kpi')
        .select('upsell_count, users(name)')
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (staffData) {
        const ranking: Record<string, number> = {};
        staffData.forEach(s => {
          const name = (s.users as any)?.name || 'Unknown';
          ranking[name] = (ranking[name] || 0) + s.upsell_count;
        });
        currentStaffRanking = Object.entries(ranking)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setStaffRanking(currentStaffRanking);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function generateAIInsights() {
    setLoadingInsights(true);
    const result = await analyzeDashboardData({ stats, categories: categoryData, staff: staffRanking }, "Admin/Sales Overview");
    setInsights(result || "ไม่พบข้อมูลเชิงลึก");
    setLoadingInsights(false);
  }

  const COLORS = ['#8c623f', '#bc9673', '#d6bc9f', '#eadbc9', '#f7f0e8'];

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading Dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-serif font-bold text-coffee-900">ภาพรวมผู้ดูแลระบบ</h1>
        <p className="text-coffee-500">ตัวชี้วัดประสิทธิภาพในช่วง 30 วันที่ผ่านมา</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'รายได้รายเดือน', value: formatCurrency(stats.monthlyRevenue), icon: DollarSign, trend: '+12.5%', up: true },
          { label: 'จำนวนคำสั่งซื้อ', value: stats.totalOrders, icon: ShoppingBag, trend: '+5.2%', up: true },
          { label: 'ยอดเฉลี่ยต่อบิล', value: formatCurrency(stats.avgBill), icon: TrendingUp, trend: '-2.1%', up: false },
          { label: 'ประสิทธิภาพพนักงาน', value: 'สูง', icon: Users, trend: '+8.4%', up: true },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-coffee-100 rounded-lg">
                <stat.icon className="w-6 h-6 text-coffee-700" />
              </div>
              <div className={cn(
                "flex items-center text-xs font-semibold px-2 py-1 rounded-full",
                stat.up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}>
                {stat.up ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {stat.trend}
              </div>
            </div>
            <p className="text-sm text-coffee-500 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-coffee-900 mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Insights Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border-l-4 border-coffee-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-coffee-700" />
            <h3 className="text-lg font-bold text-coffee-900">ข้อมูลเชิงลึกจาก AI (Gemini)</h3>
          </div>
          {!insights && !loadingInsights && (
            <button
              onClick={generateAIInsights}
              className="text-xs font-bold text-coffee-700 hover:text-coffee-900 flex items-center gap-1 bg-coffee-50 px-3 py-1.5 rounded-lg border border-coffee-100 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              วิเคราะห์ข้อมูล
            </button>
          )}
          {insights && !loadingInsights && (
            <button
              onClick={generateAIInsights}
              className="text-xs font-medium text-coffee-400 hover:text-coffee-600"
            >
              วิเคราะห์ใหม่อีกครั้ง
            </button>
          )}
        </div>

        {loadingInsights ? (
          <div className="flex items-center gap-3 text-coffee-500 py-4">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Gemini กำลังวิเคราะห์ข้อมูลของคุณ...</span>
          </div>
        ) : insights ? (
          <div className="prose prose-sm max-w-none text-coffee-700">
            <Markdown>{insights}</Markdown>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-coffee-500 italic mb-4">กดปุ่มเพื่อเริ่มการวิเคราะห์ข้อมูลเชิงลึกด้วย AI</p>
            <button
              onClick={generateAIInsights}
              className="coffee-gradient text-white px-6 py-2 rounded-xl font-semibold shadow-md inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              เริ่มการวิเคราะห์
            </button>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-lg font-bold text-coffee-900 mb-6">รายได้รายวัน</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8c623f"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-coffee-900 mb-6">ยอดขายตามหมวดหมู่</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} width={80} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Staff Ranking */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-coffee-900 mb-6">อันดับพนักงาน (ยอด Upsell)</h3>
        <div className="space-y-4">
          {staffRanking.map((staff, i) => (
            <div key={staff.name} className="flex items-center justify-between p-4 bg-coffee-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full coffee-gradient text-white flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <span className="font-medium text-coffee-900">{staff.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-coffee-500">Upsells:</span>
                <span className="font-bold text-coffee-700">{staff.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
