import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createRelationalOrder, getOrder } from '@/lib/serverOrderStore';
import { generateInvoice } from '@/lib/invoice';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  let userId = 'unknown';
  let orderSaved = 'NO';
  let dbCheck = 'FAILED';
  let emailSent = 'NO';
  let lastError = 'None';

  try {
    const body = await req.json();
    
    // 1. Identify User (ENFORCE AUTH)
    console.log('[API] Attempting to identify user...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('[API] user_id identification failed - Unauthenticated');
      throw new Error('Authentication required: You must be logged in to place an order.');
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
      status: "Processing" as const,
      createdAt: body.createdAt || new Date().toISOString(),
      shippingDetails: body.shippingDetails
    };
    
    await createRelationalOrder(orderData, userId);
    console.log('[DB] success: Relational insert completed');
    orderSaved = 'YES';

    // 3. Verify Database Insert
    console.log(`[DB] Verifying insert for ID: ${body.id}`);
    const verification = await getOrder(body.id);
    if (!verification) {
      console.error('[DB] fetched order: NOT FOUND after insert');
      throw new Error('Persistence verification failed - Order was not stored correctly.');
    }
    console.log('[DB] fetched order: VERIFIED in Supabase');
    dbCheck = 'SUCCESS';

    // 4. Generate Invoice & Send Email (AFTER DB SUCCESS)
    const invoice = generateInvoice(orderData);
    console.log('[EMAIL] preparing send...');
    
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
      console.error('[EMAIL] error:', resendResponse.error);
      throw new Error(`Email delivery failed: ${resendResponse.error.message}`);
    }
    console.log('[EMAIL] sent: SUCCESS');
    emailSent = 'YES';

    return NextResponse.json({ 
      success: true, 
      debug: { userId, orderSaved, dbCheck, emailSent } 
    });

  } catch (err: any) {
    const errorMsg = err.message || JSON.stringify(err);
    console.error(`[FAIL] ${errorMsg}`);
    
    // Final Log Output for Debugging
    console.log(`
[DEBUG RESULT]
user_id: ${userId}
order_saved: ${orderSaved}
db_check: ${dbCheck}
email_sent: ${emailSent}
error: ${errorMsg}
    `);

    return NextResponse.json({ 
      error: errorMsg,
      debug: { userId, orderSaved, dbCheck, emailSent } 
    }, { status: 500 });
  }
}