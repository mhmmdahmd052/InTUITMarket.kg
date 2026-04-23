import { supabaseAdmin } from '@/lib/supabaseAdmin'

/**
 * FINAL HARD FIX: Token-based authentication + Service Role Delete.
 * Resolves session parsing errors and ensures data cleanup.
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

    // Cleanup related data to avoid foreign key constraints (e.g., orders)
    await supabaseAdmin.from('orders').delete().eq('user_id', userId)

    // Administrative user deletion
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