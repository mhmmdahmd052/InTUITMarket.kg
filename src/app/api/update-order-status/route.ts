import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Assuming NEXT_PUBLIC_BASE_URL is set in environment
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!res.ok) {
        throw new Error('Failed to send order email via inner API')
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Status update error:', err)
    return NextResponse.json({ error: 'Status update failed' }, { status: 500 })
  }
}
