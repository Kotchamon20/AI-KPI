import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  PlusCircle,
  CheckCircle2,
  Trophy,
  Target,
  Star,
  MessageSquare,
  Sparkles,
  Loader2,
  History,
  Megaphone,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { analyzeDashboardData } from '../services/gemini';
import Markdown from 'react-markdown';

export default function StaffDashboard() {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    upsell_count: 0,
    recommended_menu_count: 0,
    review_request_count: 0,
    recommendation_count: 0,
    recommendation_success_count: 0,
    promo_recommendation_count: 0,
    promo_success_count: 0,
    addon_sales_value: 0,
  });
  const [personalStats, setPersonalStats] = useState({
    totalUpsells: 0,
    totalRecommendations: 0,
    totalReviews: 0,
    totalRecommendationAttempts: 0,
    totalRecommendationSuccess: 0,
    totalPromoAttempts: 0,
    totalPromoSuccess: 0,
    totalAddonValue: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [coaching, setCoaching] = useState<string | null>(null);
  const [loadingCoaching, setLoadingCoaching] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchPersonalStats();
  }, [selectedMonth]);

  async function fetchPersonalStats() {
    try {
      let currentStats = { ...personalStats };
      let logs: any[] = [];

      if (!profile?.id) return;

      const { data } = await supabase
        .from('staff_kpi')
        .select('*')
        .eq('staff_id', profile.id)
        .gte('date', `${selectedMonth}-01`)
        .lte('date', `${selectedMonth}-31`)
        .order('date', { ascending: false });

      if (data) {
        currentStats = {
          totalUpsells: data.reduce((acc, curr) => acc + (curr.upsell_count || 0), 0),
          totalRecommendations: data.reduce((acc, curr) => acc + (curr.recommended_menu_count || 0), 0),
          totalReviews: data.reduce((acc, curr) => acc + (curr.review_request_count || 0), 0),
          totalRecommendationAttempts: data.reduce((acc, curr) => acc + (curr.recommendation_count || 0), 0),
          totalRecommendationSuccess: data.reduce((acc, curr) => acc + (curr.recommendation_success_count || 0), 0),
          totalPromoAttempts: data.reduce((acc, curr) => acc + (curr.promo_recommendation_count || 0), 0),
          totalPromoSuccess: data.reduce((acc, curr) => acc + (curr.promo_success_count || 0), 0),
          totalAddonValue: data.reduce((acc, curr) => acc + (Number(curr.addon_sales_value) || 0), 0),
        };
        setPersonalStats(currentStats);
        setRecentLogs(data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching staff stats:', error);
    }
  }

  async function generateAICoaching() {
    setLoadingCoaching(true);
    const result = await analyzeDashboardData(personalStats, "Staff Performance Coaching");
    setCoaching(result || "สู้ๆ นะครับ! ทำดีแล้ว");
    setLoadingCoaching(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from('staff_kpi').insert({
      staff_id: profile?.id,
      ...formData,
      date: new Date().toISOString().split('T')[0]
    });

    if (!error) {
      setSuccess(true);
      setFormData({
        upsell_count: 0,
        recommended_menu_count: 0,
        review_request_count: 0,
        recommendation_count: 0,
        recommendation_success_count: 0,
        promo_recommendation_count: 0,
        promo_success_count: 0,
        addon_sales_value: 0,
      });
      fetchPersonalStats();
      setTimeout(() => setSuccess(false), 3000);
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-coffee-900">ยินดีต้อนรับ, {profile?.name}</h1>
          <p className="text-coffee-500">ติดตามผลการปฏิบัติงานและ KPI ประจำวันของคุณ</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="hidden md:flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full border border-yellow-100">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">อันดับ #4 ในสัปดาห์นี้</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-coffee-100 shadow-sm">
            <Calendar className="w-4 h-4 text-coffee-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold text-coffee-700 outline-none bg-transparent"
            />
          </div>
        </div>
      </header>

      {/* Personal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'ยอด Upsell รวม', value: personalStats.totalUpsells, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'การแนะนำเมนู', value: personalStats.totalRecommendations, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'การขอรีวิว', value: personalStats.totalReviews, icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex items-center gap-4"
          >
            <div className={cn("p-3 rounded-xl", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-sm text-coffee-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-coffee-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Advanced Calculated Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'Recommendation Rate',
            value: `${((personalStats.totalRecommendationSuccess / (personalStats.totalRecommendationAttempts || 1)) * 100).toFixed(1)}%`,
            sub: `${personalStats.totalRecommendationSuccess}/${personalStats.totalRecommendationAttempts}`,
            color: 'text-purple-600', bg: 'bg-purple-50'
          },
          {
            label: 'Promo Conversion',
            value: `${((personalStats.totalPromoSuccess / (personalStats.totalPromoAttempts || 1)) * 100).toFixed(1)}%`,
            sub: `${personalStats.totalPromoSuccess}/${personalStats.totalPromoAttempts}`,
            color: 'text-rose-600', bg: 'bg-rose-50'
          },
          {
            label: 'Upsell Revenue Impact',
            value: `฿${personalStats.totalAddonValue.toLocaleString()}`,
            sub: 'รายได้เสริมสะสม',
            color: 'text-emerald-600', bg: 'bg-emerald-50'
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="glass-card p-6 border-b-2 border-transparent hover:border-coffee-200 transition-all"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm text-coffee-500 font-medium">{stat.label}</p>
              <div className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider", stat.bg, stat.color)}>
                Auto-Calc
              </div>
            </div>
            <p className="text-2xl font-bold text-coffee-900">{stat.value}</p>
            <p className="text-xs text-coffee-400 mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* AI Coaching Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border-l-4 border-coffee-700"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-coffee-700" />
            <h3 className="text-lg font-bold text-coffee-900">การโค้ชชิ่งจาก AI (Gemini)</h3>
          </div>
          {!coaching && !loadingCoaching && (
            <button
              onClick={generateAICoaching}
              className="text-xs font-bold text-coffee-700 hover:text-coffee-900 flex items-center gap-1 bg-coffee-50 px-3 py-1.5 rounded-lg border border-coffee-100 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              ขอคำแนะนำ
            </button>
          )}
          {coaching && !loadingCoaching && (
            <button
              onClick={generateAICoaching}
              className="text-xs font-medium text-coffee-400 hover:text-coffee-600"
            >
              ขอคำแนะนำใหม่
            </button>
          )}
        </div>

        {loadingCoaching ? (
          <div className="flex items-center gap-3 text-coffee-500 py-4">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Gemini กำลังวิเคราะห์ผลงานของคุณ...</span>
          </div>
        ) : coaching ? (
          <div className="prose prose-sm max-w-none text-coffee-700">
            <Markdown>{coaching}</Markdown>
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-coffee-500 italic mb-4">กดปุ่มเพื่อรับคำแนะนำและเทคนิคการเพิ่มยอดขายจาก AI</p>
            <button
              onClick={generateAICoaching}
              className="coffee-gradient text-white px-6 py-2 rounded-xl font-semibold shadow-md inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              รับคำแนะนำ
            </button>
          </div>
        )}
      </motion.div>

      {/* KPI Entry Form */}
      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="text-coffee-700 w-6 h-6" />
          <h2 className="text-xl font-bold text-coffee-900">บันทึก KPI ประจำวัน</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-coffee-800 mb-2">จำนวน Upsell</label>
              <input
                type="number"
                min="0"
                value={formData.upsell_count}
                onChange={(e) => setFormData({ ...formData, upsell_count: parseInt(e.target.value) || 0 })}
                onFocus={(e) => e.target.select()}
                className="w-full px-4 py-3 rounded-xl border border-coffee-200 focus:ring-2 focus:ring-coffee-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-coffee-800 mb-2">การแนะนำเมนู</label>
              <input
                type="number"
                min="0"
                value={formData.recommended_menu_count}
                onChange={(e) => setFormData({ ...formData, recommended_menu_count: parseInt(e.target.value) || 0 })}
                onFocus={(e) => e.target.select()}
                className="w-full px-4 py-3 rounded-xl border border-coffee-200 focus:ring-2 focus:ring-coffee-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-coffee-800 mb-2">การขอรีวิว</label>
              <input
                type="number"
                min="0"
                value={formData.review_request_count}
                onChange={(e) => setFormData({ ...formData, review_request_count: parseInt(e.target.value) || 0 })}
                onFocus={(e) => e.target.select()}
                className="w-full px-4 py-3 rounded-xl border border-coffee-200 focus:ring-2 focus:ring-coffee-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-coffee-50 rounded-2xl border border-coffee-100">
            <div className="space-y-4">
              <h4 className="font-bold text-coffee-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                การแนะนำเมนู (Recommendation)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-coffee-600 mb-1">จำนวนที่แนะนำ</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.recommendation_count}
                    onChange={(e) => setFormData({ ...formData, recommendation_count: parseInt(e.target.value) || 0 })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 rounded-lg border border-coffee-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-coffee-600 mb-1">สำเร็จ (Success)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.recommendation_success_count}
                    onChange={(e) => setFormData({ ...formData, recommendation_success_count: parseInt(e.target.value) || 0 })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 rounded-lg border border-coffee-200 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-coffee-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-blue-500" />
                โปรโมชั่น (Promotion)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-coffee-600 mb-1">จำนวนที่แนะนำโปร</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.promo_recommendation_count}
                    onChange={(e) => setFormData({ ...formData, promo_recommendation_count: parseInt(e.target.value) || 0 })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 rounded-lg border border-coffee-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-coffee-600 mb-1">สำเร็จ (Success)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.promo_success_count}
                    onChange={(e) => setFormData({ ...formData, promo_success_count: parseInt(e.target.value) || 0 })}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-2 rounded-lg border border-coffee-200 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-coffee-800 mb-2">มูลค่าการขายเสริม (Add-on Sales Value - ฿)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.addon_sales_value}
                onChange={(e) => setFormData({ ...formData, addon_sales_value: parseFloat(e.target.value) || 0 })}
                onFocus={(e) => e.target.select()}
                className="w-full px-4 py-3 rounded-xl border border-coffee-200 focus:ring-2 focus:ring-coffee-500 outline-none"
                placeholder="ระบุยอดเงินบาทที่ขายเพิ่มได้"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-coffee-500 italic">ข้อมูลจะถูกบันทึกสำหรับวันนี้: {new Date().toLocaleDateString('th-TH')}</p>
            <button
              type="submit"
              disabled={submitting}
              className="coffee-gradient text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              {submitting ? 'กำลังบันทึก...' : success ? <><CheckCircle2 className="w-5 h-5" /> บันทึกแล้ว!</> : 'ส่งข้อมูล KPI'}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <History className="text-coffee-700 w-6 h-6" />
          <h3 className="text-lg font-bold text-coffee-900">ประวัติการบันทึกล่าสุด</h3>
        </div>

        {recentLogs.length > 0 ? (
          <div className="space-y-3">
            {recentLogs.map((log, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-coffee-50 rounded-xl border border-coffee-100">
                <div className="text-sm text-coffee-600">
                  {new Date(log.date).toLocaleDateString('th-TH')}
                </div>
                <div className="flex gap-4 text-sm font-semibold text-coffee-900">
                  <span>Upsell: {log.upsell_count}</span>
                  <span>แนะนำ: {log.recommended_menu_count}</span>
                  <span>รีวิว: {log.review_request_count}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-coffee-400">
            <p>ประวัติกิจกรรมจะปรากฏที่นี่เมื่อคุณเริ่มบันทึกข้อมูล</p>
          </div>
        )}
      </div>
    </div>
  );
}
