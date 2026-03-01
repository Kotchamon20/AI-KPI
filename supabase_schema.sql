-- BrewMetrics KPI Database Schema

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'marketing', 'staff');

-- Create users table (extends Supabase Auth)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'staff',
    branch TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create daily_sales table
CREATE TABLE public.daily_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_sales NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_orders INTEGER NOT NULL DEFAULT 0,
    branch TEXT NOT NULL,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create product_sales table
CREATE TABLE public.product_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create marketing_kpi table
CREATE TABLE public.marketing_kpi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    campaign_name TEXT NOT NULL,
    ad_spend NUMERIC(12, 2) NOT NULL DEFAULT 0,
    revenue_generated NUMERIC(12, 2) NOT NULL DEFAULT 0,
    leads INTEGER NOT NULL DEFAULT 0,
    engagement INTEGER NOT NULL DEFAULT 0,
    followers_gained INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    coupon_redemptions INTEGER DEFAULT 0,
    membership_signups INTEGER DEFAULT 0,
    repeat_customers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create staff_kpi table
CREATE TABLE public.staff_kpi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    staff_id UUID REFERENCES public.users(id) NOT NULL,
    upsell_count INTEGER NOT NULL DEFAULT 0,
    recommended_menu_count INTEGER NOT NULL DEFAULT 0,
    review_request_count INTEGER NOT NULL DEFAULT 0,
    recommendation_count INTEGER NOT NULL DEFAULT 0,
    recommendation_success_count INTEGER NOT NULL DEFAULT 0,
    promo_recommendation_count INTEGER NOT NULL DEFAULT 0,
    promo_success_count INTEGER NOT NULL DEFAULT 0,
    addon_sales_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create branch_kpi table
CREATE TABLE public.branch_kpi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    branch_name TEXT NOT NULL,
    total_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_orders INTEGER NOT NULL DEFAULT 0,
    peak_hour_orders INTEGER NOT NULL DEFAULT 0,
    peak_hour_capacity INTEGER NOT NULL DEFAULT 0,
    night_revenue NUMERIC(12, 2) NOT NULL DEFAULT 0,
    square_meters NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Policies

-- Users: Admins can see all, users can see themselves
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);

-- Daily Sales: Admins/Marketing see all, Staff see their branch
CREATE POLICY "Admins/Marketing view all sales" ON public.daily_sales FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'marketing'))
);
CREATE POLICY "Staff view branch sales" ON public.daily_sales FOR SELECT USING (
    branch = (SELECT branch FROM public.users WHERE id = auth.uid())
);
CREATE POLICY "Staff can insert sales" ON public.daily_sales FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Product Sales: Admins/Marketing see all
CREATE POLICY "Admins/Marketing view product sales" ON public.product_sales FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'marketing'))
);

-- Marketing KPI: Admins/Marketing see all
CREATE POLICY "Admins/Marketing view marketing kpi" ON public.marketing_kpi FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'marketing'))
);
CREATE POLICY "Marketing can insert kpi" ON public.marketing_kpi FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'marketing')
);

-- Staff KPI: Admins see all, Staff see own
CREATE POLICY "Admins view all staff kpi" ON public.staff_kpi FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Staff view own kpi" ON public.staff_kpi FOR SELECT USING (auth.uid() = staff_id);
CREATE POLICY "Staff can insert own kpi" ON public.staff_kpi FOR INSERT WITH CHECK (auth.uid() = staff_id);

-- Branch KPI: Admins see all
CREATE POLICY "Admins view all branch kpi" ON public.branch_kpi FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Functions & Triggers for User Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, role, branch)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name', (NEW.raw_user_meta_data->>'role')::user_role, NEW.raw_user_meta_data->>'branch');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
