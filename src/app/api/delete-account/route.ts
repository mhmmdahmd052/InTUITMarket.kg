import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  console.log("[API] delete-account HIT")
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      console.log("[AUTH] unauthorized")
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log("[AUTH] user_id:", user.id)
    console.log("[DB] deleting user...")
    
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    await supabaseAdmin.auth.admin.deleteUser(user.id)
    
    console.log("[DB] user deleted")

    return Response.json({ success: true })
  } catch (err: any) {
    console.error('[API] unexpected error:', err)
    return Response.json({ error: 'Deletion failed' }, { status: 500 })
  }
}
