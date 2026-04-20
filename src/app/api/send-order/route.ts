import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from "@supabase/supabase-js";
import { createRelationalOrder, getOrder } from '@/lib/serverOrderStore';
import { generateInvoice } from '@/lib/invoice';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Lazy initializer for the Supabase Internal Admin client.
 * Prevents build-time crashes when environment variables are missing.
 */
const getInternalAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase Admin environment variables missing at runtime');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

export async function POST(req: Request) {
  let userId = 'unknown';
  let orderSaved = 'NO';
  let dbCheck = 'FAILED';
  let emailSent = 'NO';
  let lastError = 'None';

  try {
    console.log("[API] HIT");

    const body = await req.json();
    const { items, totalAmount, email, shippingDetails } = body;

    // 1. GET USER FROM HEADER (SUPABASE AUTH SESSION)
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      console.error("[API] Missing auth header");
      throw new Error("Authentication failed: Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Initialize admin client only at runtime
    const supabaseAdmin = getInternalAdmin();

    const {
      data: { user },
      error: authError
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("[API] User verification failed:", authError?.message);
      throw new Error("Authentication failed: User session invalid or expired");
    }

    userId = user.id;
    console.log(`[API] user_id: ${userId}`);

    // 2. Database Insertion (Relational)
    console.log(`[DB] inserting order for verified user: ${userId}`);
    const orderData = {
      id: body.id,
      userId: userId,
      email: email || user.email,
      items: items || [],
      subtotal: body.subtotal || 0,
      tax: body.tax || 0,
      deliveryFee: body.deliveryFee || 0,
      totalAmount: totalAmount || 0,
      status: "Processing" as const,
      createdAt: body.createdAt || new Date().toISOString(),
      shippingDetails: shippingDetails
    };
    
    await createRelationalOrder(orderData, userId);
    console.log('[DB] success: Relational insert completed');
    orderSaved = 'YES';

    // 3. Verify Database Insert
    const verification = await getOrder(body.id);
    if (!verification) {
      console.error('[DB] fetched order: NOT FOUND after insert');
      throw new Error('Persistence verification failed - Order not located in database');
    }
    console.log('[DB] fetched order: VERIFIED');
    dbCheck = 'SUCCESS';

    // 4. Generate Invoice & Send Email
    const invoice = generateInvoice(orderData);
    const targetEmail = orderData.email || email || user.email;

    if (!targetEmail) {
      console.warn('[EMAIL] No target email found for order confirmation');
    } else {
      console.log(`[EMAIL] sending confirmation to ${targetEmail}...`);
      
      const itemsHtml = (orderData.items || []).map((item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name || 'Product'}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity || 1}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${Number(item.price || 0).toLocaleString()} ₸</td>
        </tr>
      `).join('');

      try {
        const resendResponse = await resend.emails.send({
          from: 'InTUIT Market <orders@intuitmarket.store>',
          to: targetEmail,
          subject: 'Order Confirmation – InTUITMarket',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Order Confirmed</h1>
              <p>Thank you for your order, <strong>${shippingDetails?.fullName || 'Customer'}</strong>.</p>
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                 <p><strong>Invoice ID:</strong> ${invoice.invoiceId}</p>
                 <p><strong>Order ID:</strong> ${orderData.id}</p>
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
          console.error('[EMAIL] Resend returned error:', resendResponse.error);
        } else {
          console.log('[EMAIL] sent: SUCCESS');
          emailSent = 'YES';
        }
      } catch (emailErr) {
        console.error('[EMAIL] Exception occurred during sending:', emailErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      debug: { userId, orderSaved, dbCheck, emailSent } 
    });

  } catch (err: any) {
    const errorMsg = err.message || JSON.stringify(err);
    console.error(`[FAIL FAST] ${errorMsg}`);
    
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