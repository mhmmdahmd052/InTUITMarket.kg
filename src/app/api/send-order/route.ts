import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createRelationalOrder, getOrder } from '@/lib/serverOrderStore';
import { generateInvoice } from '@/lib/invoice';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  console.log("🔥 API HIT: send-order");
  return Response.json({
    debug: "API WORKING"
  });
  let orderSaved = 'NO';
  let dbCheck = 'FAILED';
  let emailSent = 'NO';
  let lastError = 'None';

  try {
    const body = await req.json();
    
    // 1. Identify User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[API] user_id identification failed');
      throw new Error('Authentication failed - user not detected');
    }
    userId = user.id;
    console.log(`[API] user_id: ${userId}`);

    const email = user.email || body?.shippingDetails?.email || body?.email;

    // 2. Database Insertion (Relational)
    console.log(`[DB] inserting order: ${body.id}`);
    const orderData = {
      id: body.id,
      userId: userId,
      email: email,
      items: body.items || [],
      subtotal: body.subtotal || 0,
      tax: body.tax || body.vat || 0,
      deliveryFee: body.deliveryFee || 0,
      totalAmount: body.totalAmount || body.total || 0,
      status: "Processing" as const, // Start case 'Processing' match frontend types
      createdAt: body.createdAt || new Date().toISOString(),
      shippingDetails: body.shippingDetails
    };
    
    await createRelationalOrder(orderData, userId);
    console.log('[DB] insert result: SUCCESS');
    orderSaved = 'YES';

    // 3. Verify Insert Success (Refetch)
    const verification = await getOrder(body.id);
    if (!verification) {
      console.error('[DB] fetched order after insert: NOT FOUND');
      throw new Error('Database verification failed - order not found after insert');
    }
    console.log('[DB] fetched order after insert: VERIFIED');
    dbCheck = 'SUCCESS';

    // 4. Generate Invoice
    const invoice = generateInvoice(orderData);

    // 5. Send Professional HTML Email
    console.log('[EMAIL] sending');
    const itemsHtml = orderData.items.map((item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${Number(item.price).toLocaleString()} ₸</td>
      </tr>
    `).join('');

    const resendResponse = await resend.emails.send({
      from: 'InTUIT Market <orders@intuitmarket.store>',
      to: email,
      subject: 'Order Confirmation – InTUITMarket',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Order Confirmed</h1>
          <p>Thank you for your order, <strong>${orderData.shippingDetails?.fullName || 'Customer'}</strong>.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
             <p><strong>Invoice ID:</strong> ${invoice.invoiceId}</p>
             <p><strong>Order ID:</strong> ${orderData.id}</p>
             <p><strong>Status:</strong> Processing</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            ${itemsHtml}
          </table>
          <div style="text-align: right; font-weight: bold; font-size: 1.25rem;">
            Total: ${Number(orderData.totalAmount).toLocaleString()} ₸
          </div>
        </div>
      `
    });

    if (resendResponse.error) {
      console.error('[EMAIL] response:', resendResponse.error);
      throw new Error(`Email failed: ${resendResponse.error.message}`);
    }
    console.log('[EMAIL] response: SUCCESS');
    emailSent = 'YES';

    return NextResponse.json({ 
      success: true, 
      debug: { userId, orderSaved, dbCheck, emailSent } 
    });

  } catch (err: any) {
    lastError = err.message || JSON.stringify(err);
    console.error(`[FAIL FAST] ${lastError}`);
    
    console.log(`
[DEBUG RESULT]
user_id: ${userId}
order_saved: ${orderSaved}
db_check: ${dbCheck}
email_sent: ${emailSent}
error: ${lastError}
    `);

    return NextResponse.json({ 
      error: lastError,
      debug: { userId, orderSaved, dbCheck, emailSent } 
    }, { status: 500 });
  }
}