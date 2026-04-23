import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/authEmail'

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await sendWelcomeEmail(email, name || 'Customer')

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[SIGNUP_EMAIL_ERROR]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
