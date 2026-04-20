import { createClient } from '@supabase/supabase-js';

let internalClient: any = null;

/**
 * Lazy-initialized Supabase Client Proxy.
 * Prevents build-time crashes by deferring createClient until actual runtime use.
 */
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (!internalClient) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        // Warning instead of throw to allow build to continue if imported but not used
        console.warn('[Supabase Server] Accessing client without environment variables');
        return undefined;
      }

      internalClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    }
    return internalClient[prop];
  }
});
