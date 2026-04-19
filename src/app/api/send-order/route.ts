import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createOrder } from '@/lib/serverOrderStore';
import { generateInvoice } from '@/lib/invoice';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.shippingDetails?.email || body?.email;

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    // 1. Persist Order in Server Store
    const orderData = {
      id: body.id,
      email: email,
      items: body.items || [],
      total: body.totalAmount || body.total || 0,
      status: "processing" as const,
      createdAt: body.createdAt || new Date().toISOString(),
      shippingDetails: body.shippingDetails
    };
    
    await createOrder(orderData);

    // 2. Generate Invoice
    const invoice = generateInvoice(orderData);

    // 3. Send Professional HTML Email
    const itemsHtml = orderData.items.map((item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${Number(item.price).toLocaleString()} ₸</td>
      </tr>
    `).join('');

    await resend.emails.send({
      from: 'InTUIT Market <orders@intuitmarket.store>',
      to: email,
      subject: 'Order Confirmation – InTUITMarket',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Order Confirmed</h1>
          <p>Thank you for your order, <strong>${orderData.shippingDetails?.fullName || 'Customer'}</strong>.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Invoice ID:</strong> ${invoice.invoiceId}</p>
            <p><strong>Order ID:</strong> ${orderData.id}</p>
            <p><strong>Status:</strong> Processing</p>
            <p><strong>Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="padding: 12px; text-align: left;">Item</th>
                <th style="padding: 12px; text-align: center;">Qty</th>
                <th style="padding: 12px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: right; font-size: 1.25rem; font-weight: bold; margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
            Total: ${Number(orderData.total).toLocaleString()} ₸
          </div>

          <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.8rem; color: #666; text-align: center;">
            <p>&copy; ${new Date().getFullYear()} InTUIT Market. All rights reserved.</p>
          </footer>
        </div>
      `
    });

    return NextResponse.json({ success: true, invoiceId: invoice.invoiceId });

  } catch (err) {
    console.error("ORDER API ERROR:", err);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}