-- Seed Data for BrewMetrics KPI

-- Note: You need to have users in auth.users first for the triggers to work.
-- These inserts assume the triggers or manual user creation in public.users.

-- Insert some dummy product sales
INSERT INTO public.product_sales (date, product_name, category, quantity, revenue) VALUES
(CURRENT_DATE - INTERVAL '1 day', 'Espresso', 'Coffee', 45, 135.00),
(CURRENT_DATE - INTERVAL '1 day', 'Latte', 'Coffee', 60, 270.00),
(CURRENT_DATE - INTERVAL '1 day', 'Croissant', 'Pastry', 30, 120.00),
(CURRENT_DATE - INTERVAL '2 days', 'Espresso', 'Coffee', 50, 150.00),
(CURRENT_DATE - INTERVAL '2 days', 'Latte', 'Coffee', 55, 247.50),
(CURRENT_DATE - INTERVAL '2 days', 'Muffin', 'Pastry', 25, 100.00);

-- Insert some dummy marketing data
INSERT INTO public.marketing_kpi (date, campaign_name, ad_spend, revenue_generated, leads, engagement, followers_gained, reach, coupon_redemptions, membership_signups, repeat_customers) VALUES
(CURRENT_DATE - INTERVAL '5 days', 'Spring Special', 200.00, 1200.00, 45, 1200, 50, 5000, 25, 15, 10),
(CURRENT_DATE - INTERVAL '10 days', 'Instagram Ads', 150.00, 850.00, 30, 2500, 80, 12000, 40, 25, 15),
(CURRENT_DATE - INTERVAL '15 days', 'Local SEO', 100.00, 400.00, 15, 500, 10, 1500, 5, 5, 2);

-- Insert some dummy branch kpi data
INSERT INTO public.branch_kpi (date, branch_name, total_revenue, total_orders, peak_hour_orders, peak_hour_capacity, night_revenue, square_meters) VALUES
(CURRENT_DATE - INTERVAL '1 day', 'Na Jomtien', 5500.00, 120, 45, 50, 2200.00, 150.00),
(CURRENT_DATE - INTERVAL '1 day', 'Main Street', 3200.00, 85, 30, 40, 800.00, 80.00),
(CURRENT_DATE - INTERVAL '2 days', 'Na Jomtien', 4800.00, 105, 38, 50, 1900.00, 150.00),
(CURRENT_DATE - INTERVAL '2 days', 'Main Street', 2900.00, 75, 25, 40, 700.00, 80.00);

-- Insert some dummy daily sales
INSERT INTO public.daily_sales (date, total_sales, total_orders, branch) VALUES
(CURRENT_DATE - INTERVAL '1 day', 1250.50, 85, 'Main Street'),
(CURRENT_DATE - INTERVAL '2 days', 1100.00, 72, 'Main Street'),
(CURRENT_DATE - INTERVAL '3 days', 1400.25, 95, 'Main Street'),
(CURRENT_DATE - INTERVAL '4 days', 950.00, 60, 'Main Street'),
(CURRENT_DATE - INTERVAL '5 days', 1300.00, 88, 'Main Street');
