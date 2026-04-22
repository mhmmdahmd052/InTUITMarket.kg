import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST() {
  try {
    console.log('🔥 [API] delete-account HIT')
    const cookieStore = await cookies()
    
    // Debug: log available cookies (names only)
    const cookieNames = cookieStore.getAll().map(c => c.name)
    console.log('[DEBUG] request cookies:', cookieNames)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {}
          },
          remove(name, options) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {}
          },
        },
      }
    )

    console.log('[DEBUG] getting user...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('[AUTH RESULT] user_id:', user?.id, 'error:', authError)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ 
          error: 'AUTH_FAILED', 
          details: authError,
          cookies_found: cookieNames.length > 0
        }),
        { status: 401 }
      )
    }

    const userId = user.id
    console.log('[DELETE] target user_id:', userId)

    const result = await supabaseAdmin.auth.admin.deleteUser(userId)
    console.log('[SUPABASE RESPONSE]', result)

    if (result.error) {
      return new Response(
        JSON.stringify({
          error: 'DELETE_FAILED',
          details: result.error
        }),
        { status: 500 }
      )
    }

    console.log('✅ USER DELETED SUCCESSFULLY')
    return Response.json({ success: true })
  } catch (err: any) {
    console.error('❌ FATAL API ERROR:', err)
    return new Response(
      JSON.stringify({
        error: 'FATAL',
        message: err.message
      }),
      { status: 500 }
    )
  }
}
