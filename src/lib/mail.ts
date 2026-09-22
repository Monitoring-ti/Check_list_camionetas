import nodemailer from 'nodemailer';
import { SUPPORT_EMAIL } from '@/lib/version';

export function getMailFrom(): string {
  const display = 'Check Flota Monitoring';
  const from = process.env.MAIL_FROM?.trim();
  if (from) {
    const angled = from.match(/<([^>]+)>/);
    if (angled) return `${display} <${angled[1]}>`;
    if (from.includes('@')) return `${display} <${from}>`;
  }
  const user = process.env.SMTP_USER?.trim();
  if (user) return `${display} <${user}>`;
  return `${display} <no-reply@monitoring.lat>`;
}

export function isSmtpConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST?.trim() &&
    process.env.SMTP_USER?.trim() &&
    process.env.SMTP_PASS?.trim()
  );
}

function smtpPorts(): number[] {
  const preferred = Number(process.env.SMTP_PORT?.trim() || '465');
  const fallback = preferred === 465 ? 587 : 465;
  return preferred === fallback ? [preferred] : [preferred, fallback];
}

function createTransport(host: string, port: number) {
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    connectionTimeout: 12_000,
    greetingTimeout: 12_000,
    socketTimeout: 20_000,
    auth: {
      user: process.env.SMTP_USER!.trim(),
      pass: process.env.SMTP_PASS!.trim(),
    },
  });
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

  const host = process.env.SMTP_HOST!.trim();
  const message = {
    from: getMailFrom(),
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    replyTo: options.replyTo ?? SUPPORT_EMAIL,
    headers: {
      'List-Unsubscribe': `<mailto:${SUPPORT_EMAIL}?subject=baja-correo-check>`,
    },
  };

  let lastError: unknown;
  for (const port of smtpPorts()) {
    try {
      await createTransport(host, port).sendMail(message);
      console.info(`[mail] enviado host=${host} port=${port}`);
      return;
    } catch (e) {
      lastError = e;
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[mail] fallo host=${host} port=${port}: ${msg}`);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
