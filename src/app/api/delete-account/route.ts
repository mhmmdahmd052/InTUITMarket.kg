import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST() {
  console.log("[API] delete-account HIT")
  try {
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
            } catch (error) {
              // Ignore error in Route Handlers
            }
          },
          remove(name, options) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              // Ignore error in Route Handlers
            }
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.log("[AUTH] unauthorized:", error)
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log("[AUTH] user_id:", user.id)
    console.log("[DB] deleting user...")
    
    const supabaseAdmin = getSupabaseAdmin()
    await supabaseAdmin.auth.admin.deleteUser(user.id)
    
    console.log("[DB] user deleted")

    return Response.json({ success: true })
  } catch (err: any) {
    console.error('[API] unexpected error:', err)
    return Response.json({ error: 'Deletion failed' }, { status: 500 })
  }
}
