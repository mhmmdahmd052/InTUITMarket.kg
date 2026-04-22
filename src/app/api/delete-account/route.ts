import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * FINAL ROOT FIX — Account Deletion API
 * Standardized using official createRouteHandlerClient for reliable session parsing.
 */
export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: 'AUTH_FAILED',
          details: authError,
        }),
        { status: 401 }
      )
    }

    const { error: deleteError } =
      await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      return new Response(
        JSON.stringify({
          error: 'DELETE_FAILED',
          details: deleteError,
        }),
        { status: 500 }
      )
    }

    return Response.json({ success: true })
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: 'FATAL',
        message: err.message,
      }),
      { status: 500 }
    )
  }
}