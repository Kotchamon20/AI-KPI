import { UserProfile, DailySales, ProductSales, MarketingKPI, StaffKPI, BranchKPI } from '../types/database';

export const MOCK_USER: UserProfile = {
  id: 'demo-user-id',
  name: 'Demo Admin',
  role: 'admin',
  branch: 'Main Street',
  created_at: new Date().toISOString(),
};

export const MOCK_SALES: DailySales[] = Array.from({ length: 30 }).map((_, i) => ({
  id: `sale-${i}`,
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  total_sales: 800 + Math.random() * 1000,
  total_orders: 40 + Math.floor(Math.random() * 60),
  branch: 'Main Street',
  created_by: 'demo-user-id',
}));

export const MOCK_PRODUCTS: ProductSales[] = [
  { id: 'p1', date: new Date().toISOString(), product_name: 'Espresso', category: 'Coffee', quantity: 150, revenue: 450 },
  { id: 'p2', date: new Date().toISOString(), product_name: 'Latte', category: 'Coffee', quantity: 200, revenue: 900 },
  { id: 'p3', date: new Date().toISOString(), product_name: 'Cappuccino', category: 'Coffee', quantity: 120, revenue: 540 },
  { id: 'p4', date: new Date().toISOString(), product_name: 'Croissant', category: 'Pastry', quantity: 80, revenue: 320 },
  { id: 'p5', date: new Date().toISOString(), product_name: 'Muffin', category: 'Pastry', quantity: 60, revenue: 240 },
];

export const MOCK_MARKETING: MarketingKPI[] = [
  { 
    id: 'm1', 
    date: new Date().toISOString(), 
    campaign_name: 'Spring Special', 
    ad_spend: 500, 
    revenue_generated: 2500, 
    leads: 120, 
    engagement: 5000,
    followers_gained: 450,
    reach: 15000,
    coupon_redemptions: 85,
    membership_signups: 40,
    repeat_customers: 15
  },
  { 
    id: 'm2', 
    date: new Date().toISOString(), 
    campaign_name: 'Social Media Blast', 
    ad_spend: 300, 
    revenue_generated: 1200, 
    leads: 80, 
    engagement: 8000,
    followers_gained: 1200,
    reach: 45000,
    coupon_redemptions: 120,
    membership_signups: 65,
    repeat_customers: 25
  },
];

export const MOCK_STAFF_KPI: StaffKPI[] = [
  { 
    id: 's1', 
    date: new Date().toISOString(), 
    staff_id: 'demo-user-id', 
    upsell_count: 12, 
    recommended_menu_count: 25, 
    review_request_count: 8,
    recommendation_count: 40,
    recommendation_success_count: 15,
    promo_recommendation_count: 30,
    promo_success_count: 12,
    addon_sales_value: 1250
  },
  { 
    id: 's2', 
    date: new Date().toISOString(), 
    staff_id: 'staff-2', 
    upsell_count: 8, 
    recommended_menu_count: 15, 
    review_request_count: 5,
    recommendation_count: 35,
    recommendation_success_count: 10,
    promo_recommendation_count: 25,
    promo_success_count: 8,
    addon_sales_value: 850
  },
];

export const MOCK_BRANCH_KPI: BranchKPI[] = [
  {
    id: 'b1',
    date: new Date().toISOString(),
    branch_name: 'Na Jomtien',
    total_revenue: 45000,
    total_orders: 150,
    peak_hour_orders: 45,
    peak_hour_capacity: 50,
    night_revenue: 18000,
    square_meters: 120
  },
  {
    id: 'b2',
    date: new Date().toISOString(),
    branch_name: 'Main Street',
    total_revenue: 32000,
    total_orders: 210,
    peak_hour_orders: 30,
    peak_hour_capacity: 40,
    night_revenue: 5000,
    square_meters: 80
  }
];
