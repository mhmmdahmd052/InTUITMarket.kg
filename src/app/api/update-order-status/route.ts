import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getOrder, updateOrderStatus, OrderStatus } from '@/lib/serverOrderStore';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

const SUBJECT_MAP: Record<string, string> = {
  Processing: "Order Received – InTUITMarket",
  Shipped: "Your Order Has Shipped – InTUITMarket",
  "Out for Delivery": "Out for Delivery – InTUITMarket",
  Delivered: "Order Delivered – InTUITMarket"
};

const MESSAGE_MAP: Record<string, string> = {
  Processing: "Your order is being processed by our warehouse ensemble.",
  Shipped: "Your order has been dispatched and is on its way to you.",
  "Out for Delivery": "Your order is with the courier and will arrive shortly.",
  Delivered: "Your order has been successfully delivered. Thank you for choosing InTUIT Market."
};

export async function POST(req: Request) {
  try {
    const { orderId, status, email } = await req.json();

    if (!orderId || !status || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Update status in Supabase (Service Role)
    await updateOrderStatus(orderId, status as OrderStatus);

    // 2. Fetch updated order from DB
    const order = await getOrder(orderId);
    
    if (!order) {
      return NextResponse.json({ error: 'Order not found in Supabase' }, { status: 404 });
    }

    // 3. Send Status Update Email
    const subject = SUBJECT_MAP[status as OrderStatus] || 'Order Update – InTUITMarket';
    const message = MESSAGE_MAP[status as OrderStatus] || 'Your order status has been updated.';

    await resend.emails.send({
      from: 'InTUIT Market <orders@intuitmarket.store>',
      to: email,
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <h1 style="color: #2563eb;">Order Status Update</h1>
          <p>Hello,</p>
          <p>The status of your order <strong>#${orderId}</strong> has changed.</p>
          
          <div style="background: #f1f5f9; padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
            <p style="text-transform: uppercase; letter-spacing: 0.1em; font-weight: bold; color: #64748b; margin-bottom: 10px;">New Status</p>
            <p style="font-size: 1.5rem; font-weight: 900; color: #0f172a; margin: 0;">${status}</p>
          </div>

          <p style="font-size: 1.1rem;">${message}</p>

          <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.8rem; color: #666; text-align: center;">
            <p>&copy; ${new Date().getFullYear()} InTUIT Market. Real-time Status System.</p>
          </footer>
        </div>
      `
    });

    return NextResponse.json({ success: true, newStatus: status });

  } catch (err) {
    console.error("STATUS UPDATE API ERROR:", err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
