import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * FINAL HARD FIX: Token-based authentication ONLY.
 * Explicitly avoids cookies and auth-helpers to resolve session parsing issues.
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json({ error: 'NO_TOKEN' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')

    // Verify user using the administrative client + the raw JWT token
    const { data, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !data?.user) {
      return NextResponse.json(
        { error: 'AUTH_FAILED', details: error },
        { status: 401 }
      )
    }

    const userId = data.user.id

    // Administrative user deletion bypassing RLS
    const { error: deleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      return NextResponse.json(
        { error: 'DELETE_FAILED', details: deleteError },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'FATAL', message: err.message },
      { status: 500 }
    )
  }
}