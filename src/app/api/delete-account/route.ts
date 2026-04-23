import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendDeleteAccountEmail } from '@/lib/email'

/**
 * FINAL FIX: Email order + Token Auth + Service Role Delete.
 * Sends confirmation email BEFORE deleting user record to ensure email availability.
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

    // Verify user using token via the administrative client
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

    const userId = user.id
    const userEmail = user.email

    // Cleanup related data to avoid foreign key constraints (e.g., orders)
    await supabaseAdmin.from('orders').delete().eq('user_id', userId)

    // 🔴 SEND EMAIL FIRST (while user record exists)
    if (userEmail) {
      try {
        await sendDeleteAccountEmail(userEmail)
        console.log('[EMAIL] delete email sent to:', userEmail)
      } catch (e) {
        console.error('[EMAIL ERROR]', e)
      }
    }

    // 🔴 THEN DELETE USER
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