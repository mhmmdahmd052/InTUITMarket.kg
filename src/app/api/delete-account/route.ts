import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * FIXED: Manual token verification using Authorization Bearer header.
 * This resolves AuthSessionMissingError by verify session via admin client directly.
 */
export async function POST(req: Request) {
  try {
    // 🔴 GET ACCESS TOKEN FROM HEADER
    const authHeader = req.headers.get('authorization')

    if (!authHeader) {
      return NextResponse.json(
        { error: 'NO_TOKEN' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // 🔴 VERIFY USER USING ADMIN CLIENT
    const { data: userData, error: userError } =
      await supabaseAdmin.auth.getUser(token)

    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: 'AUTH_FAILED', details: userError },
        { status: 401 }
      )
    }

    const userId = userData.user.id

    // 🔴 DELETE USER
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