import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendDeleteAccountEmail } from '@/lib/email'

/**
 * FINAL CRITICAL FIX: Email order + Token Auth + Service Role Delete.
 * IMPLEMENTS STRICT ORDER:
 * 1) GET USER FROM TOKEN
 * 2) EXTRACT EMAIL
 * 3) SEND EMAIL
 * 4) DELETE USER
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'NO_TOKEN' }),
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]

    // 1) Verify user using token via the administrative client
    const {
      data: { user },
      error: userError
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'INVALID_TOKEN', details: userError }),
        { status: 401 }
      )
    }

    // 2) Extract Email
    const userId = user.id
    const userEmail = user.email

    // Cleanup related data to avoid foreign key constraints (e.g., orders)
    await supabaseAdmin.from('orders').delete().eq('user_id', userId)

    // 3) SEND EMAIL FIRST (while user record exists)
    if (userEmail) {
      try {
        await sendDeleteAccountEmail(userEmail)
        console.log('[EMAIL] delete email sent to:', userEmail)
      } catch (e) {
        console.error('[EMAIL ERROR]', e)
      }
    }

    // 4) THEN DELETE USER
    const { error: deleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId)

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