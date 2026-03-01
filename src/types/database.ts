export type UserRole = 'admin' | 'marketing' | 'staff';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  branch: string;
  created_at: string;
}

export interface DailySales {
  id: string;
  date: string;
  total_sales: number;
  total_orders: number;
  branch: string;
  created_by: string;
}

export interface ProductSales {
  id: string;
  date: string;
  product_name: string;
  category: string;
  quantity: number;
  revenue: number;
}

export interface MarketingKPI {
  id: string;
  date: string;
  campaign_name: string;
  ad_spend: number;
  revenue_generated: number;
  leads: number;
  engagement: number;
  // New Funnel Metrics
  followers_gained?: number;
  reach?: number;
  coupon_redemptions?: number;
  membership_signups?: number;
  repeat_customers?: number;
}

export interface StaffKPI {
  id: string;
  date: string;
  staff_id: string;
  upsell_count: number;
  recommended_menu_count: number;
  review_request_count: number;
  // New Advanced Metrics
  recommendation_count: number;
  recommendation_success_count: number;
  promo_recommendation_count: number;
  promo_success_count: number;
  addon_sales_value: number;
}

export interface BranchKPI {
  id: string;
  date: string;
  branch_name: string;
  total_revenue: number;
  total_orders: number;
  peak_hour_orders: number;
  peak_hour_capacity: number;
  night_revenue: number; // 17:00-23:00
  square_meters: number;
}
