# BrewMetrics KPI Management System

A production-ready KPI dashboard for coffee shop businesses.

## Features
- **Role-Based Access**: Admin, Marketing, and Staff dashboards.
- **Real-time Analytics**: Sales, orders, and average bill tracking.
- **Marketing ROI**: Campaign performance and ROAS calculations.
- **Staff Performance**: Upsell tracking and KPI logging.
- **Modern UI**: Coffee-themed aesthetic with responsive design.

## Setup Instructions

### 1. Supabase Configuration
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** and run the contents of `supabase_schema.sql`.
3. (Optional) Run `supabase_seed.sql` to populate initial data.
4. Go to **Project Settings > API** and copy your `URL` and `anon key`.

### 2. Environment Variables
Create a `.env` file in the root directory (or update your secrets in AI Studio):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Authentication Setup
1. In Supabase, go to **Authentication > Providers** and ensure Email is enabled.
2. Go to **Authentication > Users** to create your first user.
3. **Important**: When creating a user, add the following to the "User Metadata" JSON:
   ```json
   {
     "name": "Admin User",
     "role": "admin",
     "branch": "Main Street"
   }
   ```
   *Roles can be: `admin`, `marketing`, or `staff`.*

## Deployment
This app is ready to be deployed on Vercel or any static hosting provider.
1. Connect your GitHub repository.
2. Set the environment variables in the provider's dashboard.
3. Build command: `npm run build`.
4. Output directory: `dist`.
