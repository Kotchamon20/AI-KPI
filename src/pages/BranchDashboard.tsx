import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Building2,
  TrendingUp,
  Users,
  Moon,
  Maximize,
  ArrowRight,
  BarChart3,
  PieChart as PieChartIcon,
  MapPin,
  Calendar,
  Filter
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion } from 'framer-motion';
import { cn, formatCurrency } from '../lib/utils';
import { BranchKPI } from '../types/database';

export default function BranchDashboard() {
  const { } = useAuth();
  const [branches, setBranches] = useState<BranchKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchBranchData();
  }, [selectedMonth]);

  async function fetchBranchData() {
    setLoading(true);
    try {

      const { data, error } = await supabase
        .from('branch_kpi')
        .select('*')
        .gte('date', `${selectedMonth}-01`)
        .lte('date', `${selectedMonth}-31`);

      if (data) setBranches(data);
    } catch (error) {
      console.error('Error fetching branch data:', error);
    } finally {
      setLoading(false);
    }
  }

  const flagship = branches.find(b => b.branch_name === 'Na Jomtien');

  const comparisonData = branches.map(b => ({
    name: b.branch_name,
    aov: b.total_revenue / (b.total_orders || 1),
    nightRatio: (b.night_revenue / (b.total_revenue || 1)) * 100,
    revPerSqm: b.total_revenue / (b.square_meters || 1),
    turnover: (b.peak_hour_orders / (b.peak_hour_capacity || 1)) * 100
  }));

  const COLORS = ['#7C2D12', '#92400E', '#B45309', '#D97706'];

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-700"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-coffee-900">เปรียบเทียบสาขา</h1>
          <p className="text-coffee-500">วิเคราะห์ประสิทธิภาพรายสาขาและ Flagship Metrics</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-coffee-100">
          <Filter className="w-4 h-4 text-coffee-400 ml-2" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="outline-none text-sm font-medium text-coffee-700 bg-transparent"
          />
        </div>
      </header>

      {/* Flagship Highlight (Na Jomtien) */}
      {flagship && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-coffee-700" />
            <h2 className="text-xl font-bold text-coffee-900">Flagship Branch: {flagship.branch_name}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                label: 'Average Order Value',
                value: formatCurrency(flagship.total_revenue / flagship.total_orders),
                icon: TrendingUp,
                desc: 'ยอดขายเฉลี่ยต่อบิล'
              },
              {
                label: 'Peak Turnover Rate',
                value: `${((flagship.peak_hour_orders / flagship.peak_hour_capacity) * 100).toFixed(1)}%`,
                icon: Users,
                desc: 'อัตราหมุนเวียนโต๊ะช่วง Peak'
              },
              {
                label: 'Night-time Revenue',
                value: `${((flagship.night_revenue / flagship.total_revenue) * 100).toFixed(1)}%`,
                icon: Moon,
                desc: 'สัดส่วนรายได้ 17:00-23:00'
              },
              {
                label: 'Rev per Sq. Meter',
                value: formatCurrency(flagship.total_revenue / flagship.square_meters),
                icon: Maximize,
                desc: 'รายได้ต่อตารางเมตร'
              },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 border-t-4 border-coffee-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <metric.icon className="w-5 h-5 text-coffee-400" />
                  <span className="text-[10px] font-bold text-coffee-300 uppercase tracking-widest">Flagship</span>
                </div>
                <p className="text-2xl font-bold text-coffee-900">{metric.value}</p>
                <p className="text-sm font-medium text-coffee-700">{metric.label}</p>
                <p className="text-xs text-coffee-400 mt-1">{metric.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AOV Comparison */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-coffee-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-coffee-700" />
              Average Order Value (AOV)
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="aov" radius={[4, 4, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Night Revenue Ratio */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-coffee-900 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-coffee-700" />
              Night Revenue Ratio (%)
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={comparisonData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="nightRatio"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rev per Sqm */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-coffee-900 flex items-center gap-2">
              <Maximize className="w-5 h-5 text-coffee-700" />
              Revenue per Square Meter
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revPerSqm" radius={[0, 4, 4, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
