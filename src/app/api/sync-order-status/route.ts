import { NextResponse } from 'next/server';
import { getOrder, updateOrderStatus, OrderStatus } from '@/lib/serverOrderStore';

export const dynamic = 'force-dynamic';

const STAGES: OrderStatus[] = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
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
      console.log(`[SYNC API] Sequential advancement for ${orderId}`);
      
      // Advance stages sequentially.
      // updateOrderStatus now automatically sends the correct email for each step.
      for (let i = currentIndex + 1; i <= targetIndex; i++) {
        const stageToProcess = STAGES[i];
        console.log(`[SYNC API] Advancing to: ${stageToProcess}`);
        await updateOrderStatus(orderId, stageToProcess);
      }

      return NextResponse.json({ success: true, status: targetStatus, advanced: true });
    }

    return NextResponse.json({ success: true, status: order.status, advanced: false });

  } catch (err) {
    console.error("[SYNC API ERR]", err);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
