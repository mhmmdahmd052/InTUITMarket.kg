import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderEmail(order: any, type: string) {
  console.log(`[EMAIL] Attempting to send ${type} email for order ${order.id}`);
  
  const subjectMap: any = {
    confirmed: "Order Confirmed",
    processing: "Order Processing",
    shipped: "Order Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Order Delivered"
  };

  const itemsHtml = (order.order_items || order.items || [])
    .map((item: any) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${Number(item.price || 0).toLocaleString()} KGS</td>
      </tr>
    `)
    .join("");

  const invoiceSection = `
    <h3>Invoice</h3>
    <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background-color: #f8fafc;">
          <th style="text-align: left;">Item</th>
          <th>Qty</th>
          <th style="text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <p><strong>Total:</strong> ${Number(order.total_amount || order.totalAmount || 0).toLocaleString()} KGS</p>
    <p><strong>Order ID:</strong> ${order.id}</p>
  `;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background: #f6f6f6; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- HEADER -->
        <div style="background: #000; color: #fff; padding: 30px; text-align: center;">
          <img src="https://intuitmarket.store/logo.png" alt="InTUITMarket Logo" style="height: 50px; margin-bottom: 10px;" />
          <h2 style="margin: 0; letter-spacing: 2px;">InTUITMarket</h2>
        </div>

        <!-- BODY -->
        <div style="padding: 30px;">
          <h3 style="color: #000; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px; margin-top: 0;">${subjectMap[type]}</h3>
          <p style="font-size: 0.9rem;"><strong>Order ID:</strong> ${order.id}</p>

          ${
            type === "confirmed"
              ? `
          <div style="margin-top: 25px;">
            <h4 style="margin-bottom: 15px; text-transform: uppercase; font-size: 0.8rem; color: #666;">Invoice Details</h4>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f8f8f8; border-bottom: 1px solid #ddd;">
                  <th style="padding: 12px; text-align: left; font-size: 0.85rem;">Item</th>
                  <th style="padding: 12px; text-align: center; font-size: 0.85rem;">Qty</th>
                  <th style="padding: 12px; text-align: right; font-size: 0.85rem;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${(order.order_items || order.items || [])
                  .map(
                    (item: any) => `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px; font-size: 0.9rem;">${item.name}</td>
                    <td style="padding: 12px; text-align: center; font-size: 0.9rem;">${item.quantity}</td>
                    <td style="padding: 12px; text-align: right; font-size: 0.9rem; font-weight: bold;">${Number(item.price || 0).toLocaleString()} KGS</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div style="margin-top: 25px; text-align: right; border-top: 2px solid #000; padding-top: 15px; margin-bottom: 30px;">
              <p style="font-size: 1.25rem; font-weight: bold; margin: 0;">
                Total: ${Number(order.total_amount || order.totalAmount || 0).toLocaleString()} KGS
              </p>
            </div>

            <!-- Customer & Delivery Information Block -->
            <div style="margin-top: 24px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff;">
              <h3 style="font-size: 18px; margin-bottom: 12px; font-weight: 600; margin-top: 0;">Customer & Delivery Information</h3>
              <p style="margin: 4px 0; font-size: 0.95rem;"><strong>Name:</strong> ${order.shipping_details?.fullName || ""}</p>
              <p style="margin: 4px 0; font-size: 0.95rem;"><strong>Email:</strong> ${order.email || ""}</p>
              <p style="margin: 4px 0; font-size: 0.95rem;"><strong>Phone:</strong> ${order.shipping_details?.phone || ""}</p>
              <p style="margin: 4px 0; font-size: 0.95rem;"><strong>Address:</strong> ${order.shipping_details?.address || ""}</p>
              <p style="margin: 4px 0; font-size: 0.95rem;"><strong>City:</strong> ${order.shipping_details?.city || ""}</p>
              ${order.shipping_details?.notes ? `<p style="margin-top: 8px; font-size: 0.95rem; background: #f9fafb; padding: 10px; border-radius: 6px;"><strong>Notes:</strong> ${order.shipping_details.notes}</p>` : ""}
            </div>
          </div>
          `
              : `
          <div style="background: #f9f9f9; border-left: 4px solid #000; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; font-size: 1.1rem;">Status Update: <strong>${subjectMap[type]}</strong></p>
          </div>
          <p style="font-size: 0.9rem; color: #666;">Visit our tracking page to see real-time updates on your shipment.</p>
          `
          }
        </div>

        <!-- FOOTER -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 11px; color: #888;">
          <p>© ${new Date().getFullYear()} InTUITMarket. Premium Digital Marketplace.</p>
          <p>This is an automated notification. Please do not reply directly to this email.</p>
        </div>
      </div>
    </div>
  `;

  console.log("[EMAIL PAYLOAD]", {
    to: order.email,
    subject: subjectMap[type]
  });

  try {
    const response = await resend.emails.send({
      from: 'InTUITMarket <orders@intuitmarket.store>',
      to: order.email,
      subject: subjectMap[type],
      html: htmlContent
    });

    console.log("[EMAIL RESPONSE]", response);

    if (!response || response.error) {
      console.error("[EMAIL FAILED]", response?.error);
      throw new Error("Email failed");
    }
  } catch (err: any) {
    console.error("[EMAIL EXCEPTION]", err.message);
    throw err;
  }
}
