import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import { sendDeleteAccountEmail } from '@/lib/email'

export async function POST() {
  try {
    const supabase = createServerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin.auth.admin.deleteUser(user.id)
    await sendDeleteAccountEmail(user.email!)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: 'Deletion failed' }, { status: 500 })
  }
}
