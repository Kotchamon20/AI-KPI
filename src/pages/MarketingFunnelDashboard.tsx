import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Users,
  Eye,
  MousePointer2,
  Ticket,
  UserPlus,
  Repeat,
  Sparkles,
  ArrowDown,
  Filter,
  Calendar,
  TrendingUp,
  Target
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
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
import { motion } from 'framer-motion';
import { cn, formatCurrency } from '../lib/utils';
import { MarketingKPI } from '../types/database';

export default function MarketingFunnelDashboard() {
  const { } = useAuth();
  const [funnelData, setFunnelData] = useState<MarketingKPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchFunnelData();
  }, [selectedMonth]);

  async function fetchFunnelData() {
    setLoading(true);
    try {

      const { data, error } = await supabase
        .from('marketing_kpi')
        .select('*')
        .gte('date', `${selectedMonth}-01`)
        .lte('date', `${selectedMonth}-31`);

      if (data) setFunnelData(data);
    } catch (error) {
      console.error('Error fetching funnel data:', error);
    } finally {
      setLoading(false);
    }
  }

  const totals = funnelData.reduce((acc, curr) => ({
    followers: acc.followers + (curr.followers_gained || 0),
    reach: acc.reach + (curr.reach || 0),
    engagement: acc.engagement + (curr.engagement || 0),
    redemptions: acc.redemptions + (curr.coupon_redemptions || 0),
    signups: acc.signups + (curr.membership_signups || 0),
    repeats: acc.repeats + (curr.repeat_customers || 0),
    revenue: acc.revenue + (curr.revenue_generated || 0),
    spend: acc.spend + (curr.ad_spend || 0),
  }), { followers: 0, reach: 0, engagement: 0, redemptions: 0, signups: 0, repeats: 0, revenue: 0, spend: 0 });

  const funnelStages = [
    { name: 'Awareness (Reach)', value: totals.reach, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Engagement', value: totals.engagement, icon: MousePointer2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Conversion (Coupons)', value: totals.redemptions, icon: Ticket, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Loyalty (Members)', value: totals.signups, icon: UserPlus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-700"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-coffee-900">Marketing Funnel</h1>
          <p className="text-coffee-500">วิเคราะห์ Awareness, Conversion และ Loyalty</p>
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

      {/* Funnel Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {funnelStages.map((stage, i) => (
          <motion.div
            key={stage.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className={cn("p-4 rounded-2xl mb-4", stage.bg)}>
              <stage.icon className={cn("w-8 h-8", stage.color)} />
            </div>
            <p className="text-2xl font-bold text-coffee-900">{stage.value.toLocaleString()}</p>
            <p className="text-sm font-medium text-coffee-500">{stage.name}</p>

            {i < funnelStages.length - 1 && (
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                <ArrowDown className="w-6 h-6 text-coffee-200 -rotate-90" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Awareness & Engagement Trend */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-coffee-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-coffee-700" />
            Awareness Trend (Reach vs Engagement)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={funnelData}>
                <defs>
                  <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="campaign_name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="reach" stroke="#3B82F6" fillOpacity={1} fill="url(#colorReach)" />
                <Area type="monotone" dataKey="engagement" stroke="#6366F1" fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loyalty Metrics */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-coffee-900 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-coffee-700" />
            Loyalty & Retention
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl">
                  <UserPlus className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">New Members</p>
                  <p className="text-2xl font-bold text-emerald-900">{totals.signups}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-emerald-600 font-medium">Conversion Rate</p>
                <p className="text-lg font-bold text-emerald-900">{((totals.signups / (totals.redemptions || 1)) * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl">
                  <Repeat className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Repeat Customers</p>
                  <p className="text-2xl font-bold text-indigo-900">{totals.repeats}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-indigo-600 font-medium">Retention Rate</p>
                <p className="text-lg font-bold text-indigo-900">{((totals.repeats / (totals.redemptions || 1)) * 100).toFixed(1)}%</p>
              </div>
            </div>

            <div className="p-4 bg-coffee-50 rounded-2xl border border-coffee-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-coffee-900">Funnel Efficiency (ROAS)</p>
                <p className="text-sm font-bold text-coffee-900">{(totals.revenue / (totals.spend || 1)).toFixed(2)}x</p>
              </div>
              <div className="w-full bg-coffee-200 rounded-full h-2">
                <div
                  className="bg-coffee-700 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((totals.revenue / (totals.spend || 1)) * 10, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
