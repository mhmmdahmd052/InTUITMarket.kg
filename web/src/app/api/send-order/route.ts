import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const customerEmail = body?.shippingDetails?.email
    const adminEmail = process.env.ADMIN_EMAIL

    if (!customerEmail) {
      return NextResponse.json({ error: 'Missing customer email' }, { status: 400 })
    }

    await resend.emails.send({
      from: 'InTUITMarket <your_verified_email@gmail.com>',
      to: adminEmail ? [customerEmail, adminEmail] : [customerEmail],
      subject: 'Order Confirmation - InTUITMarket',
      html: `
        <h2>Order Confirmed</h2>
        <p><strong>Name:</strong> ${body.name || 'Customer'}</p>
        <p><strong>Total:</strong> ${Number(body.totalAmount || 0).toLocaleString()}</p>
        <p>Status: Processing</p>
      `
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('EMAIL ERROR:', err)
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }
}