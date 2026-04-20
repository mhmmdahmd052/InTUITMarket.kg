import { createClient } from '@supabase/supabase-js';

let supabaseAdminClient: any = null;

/**
 * Lazy initializer for the Supabase Admin client.
 * This prevents build-time crashes when environment variables are missing.
 */
export const getSupabaseAdmin = () => {
  if (supabaseAdminClient) return supabaseAdminClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('[Supabase Admin] Missing URL or Service Key at runtime');
  }

  supabaseAdminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return supabaseAdminClient;
};
