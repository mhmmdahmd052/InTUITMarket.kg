import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST() {
  try {
    console.log('🔥 DELETE API HIT')
    const cookieStore = await cookies()
    
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

    const { data, error } = await supabase.auth.getUser()
    console.log('[AUTH RESULT]', data, error)

    if (error || !data?.user) {
      return new Response(
        JSON.stringify({ error: 'AUTH_FAILED', details: error }),
        { status: 401 }
      )
    }

    const userId = data.user.id
    console.log('[DELETE] user_id:', userId)

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

    console.log('✅ USER DELETED')
    return Response.json({ success: true })
  } catch (err: any) {
    console.error('❌ FATAL:', err)
    return new Response(
      JSON.stringify({
        error: 'FATAL',
        message: err.message
      }),
      { status: 500 }
    )
  }
}
