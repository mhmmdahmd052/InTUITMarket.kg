import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * FINAL ROOT FIX — Account Deletion API
 * Standardized using official createServerClient with manual cookie handling for reliability.
 */
export async function POST() {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'AUTH_FAILED', details: authError }),
        { status: 401 }
      )
    }

    const { error: deleteError } =
      await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      return new Response(
        JSON.stringify({ error: 'DELETE_FAILED', details: deleteError }),
        { status: 500 }
      )
    }

    return Response.json({ success: true })
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: 'FATAL', message: err.message }),
      { status: 500 }
    )
  }
}