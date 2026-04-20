import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/serverOrderStore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // This function now internally fetches the order and sends the email (as per SPEC)
    const order = await updateOrderStatus(orderId, status);
    
    return NextResponse.json({ success: true, newStatus: order.status });

  } catch (err) {
    console.error("STATUS UPDATE API ERROR:", err);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
