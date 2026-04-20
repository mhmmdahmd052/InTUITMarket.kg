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

  const htmlContent =
    type === "confirmed"
      ? `
        <div style="font-family: sans-serif; max-width: 600px; color: #333;">
          <h2>Order Confirmed</h2>
          <p>Thank you for your order.</p>
          ${invoiceSection}
        </div>
      `
      : `
        <div style="font-family: sans-serif; max-width: 600px; color: #333;">
          <h2>${subjectMap[type]}</h2>
          <p>The status of your order has been updated.</p>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>New Status:</strong> ${subjectMap[type]}</p>
          <hr />
          <p>Visit our tracking page to see real-time updates.</p>
        </div>
      `;

  try {
    await resend.emails.send({
      from: 'InTUIT Market <orders@intuitmarket.store>',
      to: order.email,
      subject: subjectMap[type],
      html: htmlContent
    });
    console.log(`[EMAIL] ${type} email sent successfully`);
  } catch (err) {
    console.error(`[EMAIL] Failed to send ${type} email:`, err);
  }
}
