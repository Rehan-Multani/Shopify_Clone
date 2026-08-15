/**
 * Merchant transactional emails via multi-tenant email stack.
 *
 * Platform SaaS emails (signup, billing, support, portal OTP) use platform SMTP only.
 * Store/customer/order emails use merchant or vendor SMTP only — no cross-tenant fallback.
 */

import { emitEmail } from './emailService.js';

export const MERCHANT_EMAIL_EVENTS = [
  { id: 'signup_welcome', label: 'Signup / account welcome + temp password', service: 'merchant-admin-service' },
  { id: 'store_created', label: 'Store created confirmation', service: 'store-service' },
  { id: 'payment_success', label: 'Plan subscription payment success', service: 'billing-service' },
  { id: 'store_payment_success', label: 'Store + plan payment success', service: 'billing-service' },
  { id: 'theme_purchase_success', label: 'Paid theme purchase confirmation', service: 'billing-service' },
  { id: 'password_changed', label: 'Password changed confirmation', service: 'auth-service' },
  { id: 'support_admin_reply', label: 'Support ticket admin reply', service: 'merchant-admin-service' },
  { id: 'forgot_password_otp', label: 'Forgot password OTP', service: 'auth-service' }
];

const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5174';

function wrap({ title, name, bodyHtml, footerNote }) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
    <h2 style="color: #0d9488; text-align: center;">${title}</h2>
    <p>Hello <strong>${name || 'there'}</strong>,</p>
    ${bodyHtml}
    ${footerNote ? `<p style="color:#6b7280;font-size:13px;">${footerNote}</p>` : ''}
    <p>Regards,<br/><strong>Storify Team</strong></p>
  </div>`;
}

/**
 * Fire-and-forget — never block API success on mail failure.
 * Platform SaaS emails omit merchantId/vendorId and use platform SMTP only.
 * No env/Ethereal fallback (owner-only / platform-only policy).
 */
export async function sendMerchantMail(payload) {
  const { merchantId = null, vendorId = null, event = 'signup_welcome', ...mail } = payload || {};
  const result = emitEmail({
    event,
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    merchantId,
    vendorId,
  });
  if (result?.skipped) {
    console.warn('[merchant-mail] skipped:', result.reason || event, mail.to || '');
  }
}

export function signupWelcomeEmail({ name, email, password }) {
  const login = `${frontendUrl()}/admin/login`;
  return {
    to: email,
    subject: 'Welcome to Storify — Your merchant account',
    text: `Hello ${name},\n\nYour Storify merchant account is ready.\nLogin: ${login}\nEmail: ${email}\nPassword: ${password}\n\nRegards,\nStorify Team`,
    html: wrap({
      title: 'Welcome to Storify!',
      name,
      bodyHtml: `
        <p>Your merchant account has been created successfully.</p>
        <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0;">
          <p style="margin:5px 0;"><strong>Login:</strong> <a href="${login}">${login}</a></p>
          <p style="margin:5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin:5px 0;"><strong>Temporary password:</strong>
            <code style="background:#e5e7eb;padding:2px 6px;border-radius:4px;font-weight:bold;">${password}</code>
          </p>
        </div>
        <p>Please log in and change your password from profile settings.</p>`
    })
  };
}

export function storeCreatedEmail({ name, email, storeName, storeId }) {
  const dash = `${frontendUrl()}/dashboard`;
  return {
    to: email,
    subject: `Store created: ${storeName}`,
    text: `Hello ${name},\n\nYour store "${storeName}" is live on Storify.\nDashboard: ${dash}\n\nRegards,\nStorify Team`,
    html: wrap({
      title: 'Your store is ready',
      name,
      bodyHtml: `
        <p>Your store <strong>${storeName}</strong> has been created successfully.</p>
        <p><a href="${dash}" style="color:#0d9488;">Open merchant dashboard</a></p>
        ${storeId ? `<p style="color:#6b7280;font-size:12px;">Store ID: ${storeId}</p>` : ''}`
    })
  };
}

export function paymentSuccessEmail({ name, email, planName, amount, paymentId }) {
  return {
    to: email,
    subject: `Payment successful — ${planName || 'Storify plan'}`,
    text: `Hello ${name},\n\nPayment of ₹${amount} for ${planName} was successful.\nPayment ID: ${paymentId || 'N/A'}\n\nRegards,\nStorify Team`,
    html: wrap({
      title: 'Payment successful',
      name,
      bodyHtml: `
        <p>We received your payment for <strong>${planName || 'your plan'}</strong>.</p>
        <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0;">
          <p style="margin:5px 0;"><strong>Amount:</strong> ₹${Number(amount || 0).toLocaleString('en-IN')}</p>
          ${paymentId ? `<p style="margin:5px 0;"><strong>Payment ID:</strong> ${paymentId}</p>` : ''}
        </div>
        <p>Your subscription is now active.</p>`
    })
  };
}

export function storePaymentSuccessEmail({ name, email, storeName, planName, amount, paymentId }) {
  const dash = `${frontendUrl()}/dashboard`;
  return {
    to: email,
    subject: `Store live + payment confirmed — ${storeName}`,
    text: `Hello ${name},\n\nStore "${storeName}" created. Plan: ${planName}. Paid ₹${amount}.\nDashboard: ${dash}\n\nRegards,\nStorify Team`,
    html: wrap({
      title: 'Store created & payment confirmed',
      name,
      bodyHtml: `
        <p>Your store <strong>${storeName}</strong> is ready and payment was successful.</p>
        <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0;">
          <p style="margin:5px 0;"><strong>Plan:</strong> ${planName || '—'}</p>
          <p style="margin:5px 0;"><strong>Amount:</strong> ₹${Number(amount || 0).toLocaleString('en-IN')}</p>
          ${paymentId ? `<p style="margin:5px 0;"><strong>Payment ID:</strong> ${paymentId}</p>` : ''}
        </div>
        <p><a href="${dash}" style="color:#0d9488;">Go to dashboard</a></p>`
    })
  };
}

export function themePurchaseEmail({ name, email, themeName, amount, paymentId }) {
  return {
    to: email,
    subject: `Theme unlocked — ${themeName}`,
    text: `Hello ${name},\n\nTheme "${themeName}" purchased for ₹${amount}.\nPayment ID: ${paymentId || 'N/A'}\n\nRegards,\nStorify Team`,
    html: wrap({
      title: 'Theme purchase confirmed',
      name,
      bodyHtml: `
        <p>You successfully unlocked <strong>${themeName || 'your theme'}</strong>.</p>
        <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0;">
          <p style="margin:5px 0;"><strong>Amount:</strong> ₹${Number(amount || 0).toLocaleString('en-IN')}</p>
          ${paymentId ? `<p style="margin:5px 0;"><strong>Payment ID:</strong> ${paymentId}</p>` : ''}
        </div>
        <p>You can now apply this theme from your store theme library.</p>`
    })
  };
}

export function passwordChangedEmail({ name, email }) {
  const login = `${frontendUrl()}/admin/login`;
  return {
    to: email,
    subject: 'Your Storify password was changed',
    text: `Hello ${name},\n\nYour merchant password was changed. If this wasn't you, reset it at ${login}\n\nRegards,\nStorify Team`,
    html: wrap({
      title: 'Password updated',
      name,
      bodyHtml: `
        <p>Your merchant account password was changed successfully.</p>
        <p>If you did not make this change, please <a href="${frontendUrl()}/forgot-password" style="color:#0d9488;">reset your password</a> immediately.</p>`,
      footerNote: `Login: ${login}`
    })
  };
}

export function supportAdminReplyEmail({ name, email, ticketTitle, messagePreview, ticketId }) {
  const dash = `${frontendUrl()}/dashboard/support`;
  return {
    to: email,
    subject: `Support reply: ${ticketTitle}`,
    text: `Hello ${name},\n\nNew reply on "${ticketTitle}":\n${messagePreview}\n\nOpen: ${dash}\n\nRegards,\nStorify Team`,
    html: wrap({
      title: 'New support reply',
      name,
      bodyHtml: `
        <p>Our team replied to your ticket <strong>${ticketTitle}</strong>.</p>
        <div style="background:#f3f4f6;padding:15px;border-radius:8px;margin:20px 0;white-space:pre-wrap;">${String(messagePreview || '').slice(0, 800)}</div>
        <p><a href="${dash}" style="color:#0d9488;">View ticket</a></p>
        ${ticketId ? `<p style="color:#6b7280;font-size:12px;">Ticket ID: ${ticketId}</p>` : ''}`
    })
  };
}
