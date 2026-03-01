import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dprrmfibzpwqjbendxcx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_061lZSfFSDG71ldAnRzJ5Q_P9HqfpVM';

const isValidUrl = (url: string | undefined): url is string => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder';

export const isSupabaseConfigured = isValidUrl(supabaseUrl) && !!supabaseAnonKey;

export const supabase = createClient(finalUrl, finalKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase credentials missing or invalid. Please check your environment variables.');
}
