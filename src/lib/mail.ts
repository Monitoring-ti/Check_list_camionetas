import nodemailer from 'nodemailer';
import { SUPPORT_EMAIL } from '@/lib/version';

export function getMailFrom(): string {
  const from = process.env.MAIL_FROM?.trim();
  if (from) return from;
  const user = process.env.SMTP_USER?.trim();
  if (user) return `Check <${user}>`;
  return `Check <no-reply@monitoring.lat>`;
}

export function isSmtpConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST?.trim() &&
    process.env.SMTP_USER?.trim() &&
    process.env.SMTP_PASS?.trim()
  );
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<void> {
  if (!isSmtpConfigured()) {
    throw new Error('SMTP no configurado (SMTP_HOST, SMTP_USER, SMTP_PASS)');
  }

  const port = Number(process.env.SMTP_PORT?.trim() || '465');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!.trim(),
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER!.trim(),
      pass: process.env.SMTP_PASS!.trim(),
    },
  });

  await transporter.sendMail({
    from: getMailFrom(),
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    replyTo: options.replyTo ?? SUPPORT_EMAIL,
  });
}
