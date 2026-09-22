import { NOREPLY_EMAIL, SUPPORT_EMAIL } from '@/lib/version';

export function getResendFrom(): string {
  return (process.env.RESEND_FROM ?? `Check <${NOREPLY_EMAIL}>`).trim();
}

export async function sendResendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error('RESEND_API_KEY no configurada');

  const body: Record<string, unknown> = {
    from: getResendFrom(),
    to: [options.to],
    subject: options.subject,
    text: options.text,
    reply_to: options.replyTo ?? SUPPORT_EMAIL,
  };
  if (options.html) body.html = options.html;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Resend ${res.status}: ${errBody}`);
  }
}
