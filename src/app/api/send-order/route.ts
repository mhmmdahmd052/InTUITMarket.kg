import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function generateOrderHTML(order: any, status: string) {
  const items = order.items?.map((item: any) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${item.price}</td>
    </tr>
  `).join('') || ''

  return `
    <h2>Order Update: ${status}</h2>

    <p><strong>Order ID:</strong> ${order.id || 'N/A'}</p>
    <p><strong>Name:</strong> ${order.name}</p>
    <p><strong>Email:</strong> ${order.shippingDetails?.email}</p>

    <h3>Items</h3>
    <table border="1" cellpadding="6" cellspacing="0">
      <tr>
        <th>Product</th>
        <th>Qty</th>
        <th>Price</th>
      </tr>
      ${items}
    </table>

    <h3>Total: $${Number(order.totalAmount || 0).toLocaleString()}</h3>

    <p>Status: <strong>${status}</strong></p>
  `
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const customerEmail = body.shippingDetails?.email
    const adminEmail = process.env.ADMIN_EMAIL

    if (!customerEmail) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    const status = body.status || "Processing"

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [customerEmail, adminEmail].filter(Boolean) as string[],
      subject: `Order ${status} - InTUITMarket`,
      html: generateOrderHTML(body, status)
    })

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }
}