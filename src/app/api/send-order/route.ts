import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from "@supabase/supabase-js";
import { createRelationalOrder, getOrder, updateOrderStatus } from '@/lib/serverOrderStore';
import { generateInvoice } from '@/lib/invoice';
import { sendOrderEmail } from '@/lib/email';

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

    // 4. [FINAL FORCE] Fetch full order with items
    console.log("[EMAIL] Fetching full order for verification...");
    const { data: fullOrder, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderData.id)
      .single();

    if (fetchError || !fullOrder) {
      console.error("[DB FETCH ERROR]", fetchError);
      throw fetchError || new Error("Order data retrieval failed");
    }

    // 5. [FINAL FORCE] Send "Order Confirmed" + Invoice
    // This WILL throw if Resend fails, failing the entire API (NO SILENT ERRORS)
    console.log("[EMAIL] Sending confirmed...");
    await sendOrderEmail(fullOrder, "confirmed");
    console.log("[EMAIL] Confirmed sent");

    // 6. [FINAL FORCE] Move status to "Processing"
    // This will trigger the "Processing" email automatically in the store function
    console.log("[STATUS] Moving to processing...");
    await updateOrderStatus(orderData.id, "processing");
    console.log("[STATUS] Moved to processing");

    emailSent = 'YES';

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