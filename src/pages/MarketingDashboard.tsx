import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Megaphone,
  Target,
  Users,
  MousePointer2,
  Plus,
  Sparkles,
  Loader2,
  X,
  Calendar,
  DollarSign
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { formatCurrency, calculateROAS, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { analyzeDashboardData } from '../services/gemini';
import Markdown from 'react-markdown';

export default function MarketingDashboard() {
  const { } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSpend: 0,
    totalRevenue: 0,
    totalLeads: 0,
    totalEngagement: 0,
  });
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    campaign_name: '',
    date: new Date().toISOString().split('T')[0],
    ad_spend: 0,
    revenue_generated: 0,
    leads: 0,
    engagement: 0,
  });

  useEffect(() => {
    fetchMarketingData();
  }, []);

  async function fetchMarketingData() {
    try {
      let currentStats = { ...stats };
      let currentCampaigns: any[] = [];

      const { data } = await supabase
        .from('marketing_kpi')
        .select('*')
        .order('date', { ascending: false });

      if (data) {
        currentCampaigns = data;
        setCampaigns(currentCampaigns);
        currentStats = {
          totalSpend: data.reduce((acc, curr) => acc + Number(curr.ad_spend), 0),
          totalRevenue: data.reduce((acc, curr) => acc + Number(curr.revenue_generated), 0),
          totalLeads: data.reduce((acc, curr) => acc + curr.leads, 0),
          totalEngagement: data.reduce((acc, curr) => acc + curr.engagement, 0),
        };
        setStats(currentStats);
      }
    } catch (error) {
      console.error('Error fetching marketing data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function generateAIInsights() {
    setLoadingInsights(true);
    const result = await analyzeDashboardData({ stats, campaigns }, "Marketing Performance");
    setInsights(result || "ไม่พบข้อมูลเชิงลึก");
    setLoadingInsights(false);
  }

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from('marketing_kpi').insert(formData);
    if (!error) {
      fetchMarketingData();
      setIsModalOpen(false);
      setFormData({
        campaign_name: '',
        date: new Date().toISOString().split('T')[0],
        ad_spend: 0,
        revenue_generated: 0,
        leads: 0,
        engagement: 0,
      });
    }
    setSubmitting(false);
  };

  const chartData = campaigns.slice(0, 7).reverse().map(c => ({
    name: c.campaign_name,
    spend: c.ad_spend,
    revenue: c.revenue_generated,
    roas: calculateROAS(c.revenue_generated, c.ad_spend)
  }));

  if (loading) return <div>Loading Marketing...</div>;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-coffee-900">ประสิทธิภาพการตลาด</h1>
          <p className="text-coffee-500">การวิเคราะห์แคมเปญและการติดตาม ROAS</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="coffee-gradient text-white px-6 py-2 rounded-xl font-semibold shadow-md flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          แคมเปญใหม่
        </button>
      </header>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-coffee-100 flex items-center justify-between bg-coffee-50">
                <h3 className="text-xl font-bold text-coffee-900">สร้างแคมเปญใหม่</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-coffee-400 hover:text-coffee-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-800 mb-1">ชื่อแคมเปญ</label>
                  <div className="relative">
                    <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
                    <input
                      required
                      type="text"
                      value={formData.campaign_name}
                      onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-coffee-200 focus:ring-2 focus:ring-coffee-500 outline-none"
                      placeholder="เช่น โปรโมชั่นหน้าร้อน"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-800 mb-1">วันที่</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
                      <input
                        required
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-coffee-200 focus:ring-2 focus:ring-coffee-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-800 mb-1">งบประมาณ (บาท)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-400" />
                      <input
                        required
                        type="number"
                        min="0"
                        value={formData.ad_spend}
                        onChange={(e) => setFormData({ ...formData, ad_spend: Number(e.target.value) })}
                        onFocus={(e) => e.target.select()}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-coffee-200 focus:ring-2 focus:ring-coffee-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-coffee-800 mb-1">รายได้ที่คาดหวัง</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.revenue_generated}
                      onChange={(e) => setFormData({ ...formData, revenue_generated: Number(e.target.value) })}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-4 py-2 rounded-xl border border-coffee-200 focus:ring-2 focus:ring-coffee-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-800 mb-1">จำนวน Lead</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.leads}
                      onChange={(e) => setFormData({ ...formData, leads: Number(e.target.value) })}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-4 py-2 rounded-xl border border-coffee-200 focus:ring-2 focus:ring-coffee-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full coffee-gradient text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'บันทึกแคมเปญ'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Marketing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'งบโฆษณาทั้งหมด', value: formatCurrency(stats.totalSpend), icon: Megaphone, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'รายได้ที่สร้างได้', value: formatCurrency(stats.totalRevenue), icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'จำนวน Lead', value: stats.totalLeads, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'การมีส่วนร่วม', value: stats.totalEngagement, icon: MousePointer2, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
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
            <span>Gemini กำลังวิเคราะห์ข้อมูลการตลาดของคุณ...</span>
          </div>
        ) : insights ? (
          <div className="prose prose-sm max-w-none text-coffee-700">
            <Markdown>{insights}</Markdown>
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-coffee-500 italic mb-4">กดปุ่มเพื่อเริ่มการวิเคราะห์ประสิทธิภาพการตลาดด้วย AI</p>
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

      {/* ROAS Comparison Chart */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-bold text-coffee-900 mb-6">เปรียบเทียบ ROAS ของแคมเปญ</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend />
              <Bar dataKey="spend" name="งบโฆษณา" fill="#bc9673" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" name="รายได้" fill="#8c623f" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaign Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-coffee-100">
          <h3 className="text-lg font-bold text-coffee-900">แคมเปญล่าสุด</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-coffee-50 text-coffee-500 text-xs uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">ชื่อแคมเปญ</th>
                <th className="px-6 py-4">วันที่</th>
                <th className="px-6 py-4">งบประมาณ</th>
                <th className="px-6 py-4">รายได้</th>
                <th className="px-6 py-4">ROAS</th>
                <th className="px-6 py-4">Lead</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-100">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-coffee-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-coffee-900">{c.campaign_name}</td>
                  <td className="px-6 py-4 text-sm text-coffee-500">{new Date(c.date).toLocaleDateString('th-TH')}</td>
                  <td className="px-6 py-4 text-sm font-medium">{formatCurrency(c.ad_spend)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-emerald-600">{formatCurrency(c.revenue_generated)}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-coffee-100 text-coffee-700 rounded-lg text-xs font-bold">
                      {calculateROAS(c.revenue_generated, c.ad_spend)}x
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-coffee-500">{c.leads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
