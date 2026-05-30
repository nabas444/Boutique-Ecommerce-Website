import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `Boutique <${process.env.SMTP_USER || 'noreply@boutique.com'}>`;

// ─── Templates ────────────────────────────────────────────────────────────────

function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f9f9f7; margin: 0; padding: 0; color: #1c1917; }
        .wrapper { max-width: 520px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; border: 1px solid #e7e5e4; }
        .header { background: #1c1917; padding: 28px 40px; }
        .header h1 { color: white; margin: 0; font-size: 22px; font-family: Georgia, serif; letter-spacing: -0.5px; }
        .body { padding: 36px 40px; }
        .footer { background: #f9f9f7; padding: 20px 40px; text-align: center; border-top: 1px solid #e7e5e4; }
        .footer p { color: #a8a29e; font-size: 12px; margin: 0; }
        .btn { display: inline-block; background: #1c1917; color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 14px; margin: 20px 0; }
        .divider { border: none; border-top: 1px solid #e7e5e4; margin: 24px 0; }
        .label { font-size: 12px; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.05em; }
        .value { font-size: 15px; color: #1c1917; font-weight: 600; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 8px 0; vertical-align: top; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header"><h1>Boutique</h1></div>
        <div class="body">${content}</div>
        <div class="footer"><p>© ${new Date().getFullYear()} Boutique · All rights reserved</p></div>
      </div>
    </body>
    </html>
  `;
}

// ─── Email senders ─────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, firstName: string): Promise<void> {
  const html = baseTemplate(`
    <h2 style="margin-top:0">Welcome, ${firstName}! 🎉</h2>
    <p style="color:#57534e;line-height:1.6">
      Thanks for joining Boutique. You now have access to our full collection of premium fashion.
    </p>
    <p style="color:#57534e;line-height:1.6">
      Use code <strong>WELCOME10</strong> at checkout for 10% off your first order.
    </p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" class="btn">Start Shopping</a>
  `);

  await transporter.sendMail({ from: FROM, to, subject: 'Welcome to Boutique 🎉', html });
}

export async function sendOrderConfirmationEmail(
  to: string,
  firstName: string,
  orderId: string,
  items: { name: string; quantity: number; price: number }[],
  total: number
): Promise<void> {
  const itemsHtml = items
    .map(
      (i) => `
      <tr>
        <td style="padding:8px 0;color:#57534e">${i.name} ×${i.quantity}</td>
        <td style="padding:8px 0;text-align:right;font-weight:600">$${(i.price * i.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const html = baseTemplate(`
    <h2 style="margin-top:0">Order Confirmed ✅</h2>
    <p style="color:#57534e;line-height:1.6">Hi ${firstName}, your order has been confirmed and is being processed.</p>
    <hr class="divider" />
    <p class="label">Order ID</p>
    <p class="value" style="font-family:monospace">#${orderId.slice(0, 8).toUpperCase()}</p>
    <hr class="divider" />
    <table>
      ${itemsHtml}
      <tr>
        <td colspan="2"><hr class="divider" /></td>
      </tr>
      <tr>
        <td style="font-weight:700;font-size:16px">Total</td>
        <td style="text-align:right;font-weight:700;font-size:16px">$${total.toFixed(2)}</td>
      </tr>
    </table>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${orderId}" class="btn">Track Your Order</a>
  `);

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Order Confirmed — #${orderId.slice(0, 8).toUpperCase()}`,
    html,
  });
}

export async function sendShippingEmail(
  to: string,
  firstName: string,
  orderId: string,
  trackingNumber: string
): Promise<void> {
  const html = baseTemplate(`
    <h2 style="margin-top:0">Your Order Has Shipped 📦</h2>
    <p style="color:#57534e;line-height:1.6">Hi ${firstName}, great news — your order is on its way!</p>
    <hr class="divider" />
    <p class="label">Tracking Number</p>
    <p class="value" style="font-family:monospace;font-size:18px;letter-spacing:0.05em">${trackingNumber}</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${orderId}" class="btn">View Order</a>
  `);

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Your order has shipped 📦 — #${orderId.slice(0, 8).toUpperCase()}`,
    html,
  });
}

export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  const html = baseTemplate(`
    <h2 style="margin-top:0">Reset Your Password</h2>
    <p style="color:#57534e;line-height:1.6">Click the button below to reset your password. This link expires in 1 hour.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p style="color:#a8a29e;font-size:12px;margin-top:16px">If you didn't request this, you can safely ignore this email.</p>
  `);

  await transporter.sendMail({ from: FROM, to, subject: 'Reset your Boutique password', html });
}
