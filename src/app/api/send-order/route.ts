import { supabase } from "@/lib/supabaseServer";
import { Resend } from "resend";

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    console.log("[API] HIT");

    const body = await req.json();
    const { user, items, totalAmount, email } = body;

    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    console.log("[API] user_id:", user.id);

    // INSERT ORDER
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        email: email,
        total_amount: totalAmount,
        status: "Processing"
      })
      .select()
      .single();

    if (error) {
      console.error("[DB ERROR] Order insertion failed:", error);
      throw error;
    }

    console.log("[DB] order inserted:", order.id);

    // INSERT ITEMS
    const itemsPayload = items.map((item: any) => ({
      order_id: order.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(itemsPayload);

    if (itemsError) {
      console.error("[DB ERROR] Items insertion failed:", itemsError);
      throw itemsError;
    }

    console.log("[DB] items inserted");

    // SEND EMAIL (Resend)
    const resendResponse = await resend.emails.send({
      from: "InTUIT Market <orders@intuitmarket.store>",
      to: email,
      subject: "Order Confirmation – InTUITMarket",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Order Confirmed</h2>
          <p>Thank you for your order! We are processing it now.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Total:</strong> ${totalAmount.toLocaleString()} ₸</p>
          </div>
        </div>
      `
    });

    if (resendResponse.error) {
      console.error("[EMAIL ERROR] Resend failure:", resendResponse.error);
    } else {
      console.log("[EMAIL] sent");
    }

    return Response.json({ success: true, orderId: order.id });

  } catch (err: any) {
    console.error("[ERROR]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}