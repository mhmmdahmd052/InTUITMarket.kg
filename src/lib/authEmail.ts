import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * 🔴 AUTH EMAIL UTILITIES
 * Used to send branded authentication related emails via Resend.
 */

export async function sendWelcomeEmail(email: string, name: string) {
  console.log(`[AUTH_EMAIL] Sending welcome to ${email}`);

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background: #f6f6f6; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <!-- HEADER -->
        <div style="background: #000; color: #fff; padding: 30px; text-align: center;">
          <img src="https://intuitmarket.store/logo.png" alt="InTUITMarket" width="120" style="margin-bottom: 20px;" />
          <h2 style="margin: 0; letter-spacing: 2px;">InTUITMarket</h2>
        </div>
        <!-- BODY -->
        <div style="padding: 30px;">
          <h1 style="color: #000; margin-top: 0; text-align: center;">Welcome, ${name}!</h1>
          <p style="font-size: 1.1rem; line-height: 1.6; text-align: center;">Thank you for joining the premium digital marketplace.</p>
          <div style="padding: 20px; background: #f8fafc; border-radius: 12px; margin: 30px 0; border: 1px solid #e2e8f0;">
             <p style="margin: 0; color: #075985; font-weight: 600;">Account Activated</p>
             <p style="margin: 10px 0 0 0; font-size: 0.9rem; color: #64748b;">Your account has been successfully created. You can now access your profile and track orders.</p>
          </div>
          <div style="text-align: center; margin-top: 40px;">
            <a href="https://intuitmarket.store" style="background: #000; color: #fff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Start Browsing</a>
          </div>
        </div>
        <!-- FOOTER -->
        <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 11px; color: #888;">
          <p>© ${new Date().getFullYear()} InTUITMarket. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  return resend.emails.send({
    from: 'InTUITMarket <auth@intuitmarket.store>',
    to: email,
    subject: 'Welcome to InTUITMarket!',
    html: htmlContent
  });
}
