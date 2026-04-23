import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * FIXED: Admin client using Service Role Key.
 * Bypasses Row Level Security (RLS) for administrative tasks like user deletion.
 */
export const supabaseAdmin = createClient(
  supabaseUrl,
  serviceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
)
