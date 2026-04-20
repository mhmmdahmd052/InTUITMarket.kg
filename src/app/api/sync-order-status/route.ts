import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getOrder, updateOrderStatus, OrderStatus } from '@/lib/serverOrderStore';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

const STAGES: OrderStatus[] = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

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

async function sendStatusEmail(orderId: string, status: string, email: string) {
  const subject = SUBJECT_MAP[status] || 'Order Update – InTUITMarket';
  const message = MESSAGE_MAP[status] || 'Your order status has been updated.';

  try {
    const resendResponse = await resend.emails.send({
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

    if (resendResponse.error) {
      console.error(`[SYNC API] Email error for ${status}:`, resendResponse.error);
    } else {
      console.log(`[SYNC API] Email sent for ${status}: SUCCESS`);
    }
  } catch (err) {
    console.error(`[SYNC API] Email exception for ${status}:`, err);
  }
}

export async function POST(req: Request) {
  try {
    const { orderId, email } = await req.json();

    if (!orderId || !email) {
      return NextResponse.json({ error: 'Missing orderId or email' }, { status: 400 });
    }

    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'Delivered') {
      return NextResponse.json({ success: true, status: 'Delivered', message: 'Already delivered' });
    }

    const createdAt = new Date(order.createdAt).getTime();
    const elapsedSeconds = (Date.now() - createdAt) / 1000;

    // Determine target status based on time
    let targetStatus: OrderStatus = 'Processing';
    if (elapsedSeconds > 15) targetStatus = 'Delivered';
    else if (elapsedSeconds > 10) targetStatus = 'Out for Delivery';
    else if (elapsedSeconds > 5) targetStatus = 'Shipped';

    const currentIndex = STAGES.indexOf(order.status);
    const targetIndex = STAGES.indexOf(targetStatus);

    if (targetIndex > currentIndex) {
      console.log(`[SYNC API] Advancing order ${orderId} from ${order.status} to ${targetStatus}`);
      
      // Advance stages sequentially to avoid skipping emails
      for (let i = currentIndex + 1; i <= targetIndex; i++) {
        const stageToProcess = STAGES[i];
        console.log(`[SYNC API] Processing stage: ${stageToProcess}`);
        
        // 1. Update DB
        await updateOrderStatus(orderId, stageToProcess);
        
        // 2. Send Email
        await sendStatusEmail(orderId, stageToProcess, email);
      }

      return NextResponse.json({ success: true, status: targetStatus, advanced: true });
    }

    return NextResponse.json({ success: true, status: order.status, advanced: false });

  } catch (err) {
    console.error("[SYNC API ERR]", err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
