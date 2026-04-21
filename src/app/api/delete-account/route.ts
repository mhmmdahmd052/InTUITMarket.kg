import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { sendDeleteAccountEmail } from '@/lib/email'

export async function POST() {
  console.log("[API] delete-account HIT")
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => cookieStore.get(name)?.value,
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.log("[AUTH] unauthorized")
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log("[AUTH] user_id:", user.id)
    console.log("[DB] deleting user...")
    
    const supabaseAdmin = getSupabaseAdmin()
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
    
    if (deleteError) {
      console.error("[DB] delete error:", deleteError)
      throw deleteError
    }

    console.log("[EMAIL] sending delete email")
    await sendDeleteAccountEmail(user.email!)
    console.log("[EMAIL] sent")

    return Response.json({ success: true })
  } catch (err: any) {
    console.error('[API] unexpected error:', err)
    return Response.json({ error: 'Deletion failed' }, { status: 500 })
  }
}
