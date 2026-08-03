import nodemailer from 'nodemailer';

/**
 * Shared mailer — Brevo SMTP (recommended) or any SMTP.
 *
 * Env (Brevo):
 *   SMTP_HOST=smtp-relay.brevo.com
 *   SMTP_PORT=587
 *   SMTP_SECURE=false
 *   SMTP_USER=<Login from Brevo SMTP tab — usually xxx@smtp-brevo.com>
 *   SMTP_PASS=<SMTP key starting with xsmtpsib->
 *   SMTP_FROM="Storify" <verified-sender@yourdomain.com>
 *
 * Do NOT use your Brevo account password or REST API key (xkeysib-) as SMTP_PASS.
 */

let cachedTransporter = null;
let cachedKey = '';

function getSmtpConfig() {
  const provider = String(process.env.SMTP_PROVIDER || '').toLowerCase();
  const useBrevoDefaults = provider === 'brevo' || !process.env.SMTP_HOST;

  const host = process.env.SMTP_HOST
    || (useBrevoDefaults ? 'smtp-relay.brevo.com' : '');
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.SMTP_FROM || '"Storify" <noreply@storify.com>';

  return { host, port, secure, user, pass, from, provider };
}

async function getTransporter() {
  const cfg = getSmtpConfig();
  const key = `${cfg.host}|${cfg.port}|${cfg.user}|${cfg.secure}`;

  if (cachedTransporter && cachedKey === key) {
    return { transporter: cachedTransporter, cfg, isEthereal: false };
  }

  if (cfg.host && cfg.user && cfg.pass) {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: {
        user: cfg.user,
        pass: cfg.pass
      }
    });
    cachedTransporter = transporter;
    cachedKey = key;
    const label = cfg.host.includes('brevo') ? 'Brevo SMTP' : `SMTP (${cfg.host})`;
    console.log(`[mail] Using ${label}`);
    return { transporter, cfg, isEthereal: false };
  }

  // Brevo/SMTP explicitly requested but credentials missing — fail clearly
  if (cfg.provider === 'brevo' || (cfg.host && cfg.host.includes('brevo'))) {
    throw Object.assign(
      new Error(
        'Brevo SMTP is not configured. Set SMTP_USER and SMTP_PASS in auth-service/.env (Brevo → SMTP & API → SMTP key).'
      ),
      { code: 'EMAIL_SEND_FAILED' }
    );
  }

  // Dev fallback only when no SMTP provider forced
  console.warn('[mail] SMTP not configured (set SMTP_USER + SMTP_PASS). Using Ethereal test account.');
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  return { transporter, cfg: { ...cfg, from: cfg.from }, isEthereal: true };
}

/**
 * @param {{ to: string, subject: string, text?: string, html?: string, throwOnError?: boolean }} options
 */
export const sendEmail = async ({ to, subject, text, html, throwOnError = true }) => {
  try {
    if (!to) {
      throw new Error('Email recipient (to) is required');
    }

    const { transporter, cfg, isEthereal } = await getTransporter();

    const info = await transporter.sendMail({
      from: cfg.from,
      to,
      subject,
      text,
      html
    });

    console.log(`[mail] Sent to ${to}: ${info.messageId}`);
    if (isEthereal) {
      console.log(`[mail] Ethereal preview: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    console.error('[mail] Error sending email:', error?.message || error);
    if (throwOnError) {
      throw Object.assign(
        new Error(error?.message || 'Failed to send email. Check SMTP / Brevo settings.'),
        { code: 'EMAIL_SEND_FAILED', cause: error }
      );
    }
    return null;
  }
};

export default sendEmail;
