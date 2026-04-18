import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const email = body?.shippingDetails?.email

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'InTUIT Market <orders@intuitmarket.store>',
      to: email,
      subject: 'Order Confirmation',
      html: `
        <h2>Order Received</h2>
        <p>Name: ${body.name || 'Customer'}</p>
        <p>Total: ${Number(body.totalAmount || 0).toLocaleString()}</p>
        <p>Status: Processing</p>
      `
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error("EMAIL ERROR:", err)
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }
}