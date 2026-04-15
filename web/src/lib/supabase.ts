import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://kxkvanzkzhmtlkxfeldt.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Hr3QcGSVU31XYB4vdBzAHg_q70vDhjK";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[InTUITMarket] CRITICAL: Supabase credentials missing.\n' +
    'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
