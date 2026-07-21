/**
 * Prueba envío Resend (alertas No apta).
 * Uso: node scripts/test-resend.mjs
 * Lee variables desde .env.local en la raíz del proyecto.
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const envPath = resolve(root, '.env.local');

function loadEnvLocal() {
  try {
    const raw = readFileSync(envPath, 'utf8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    console.error('No se encontró .env.local');
    process.exit(1);
  }
}

loadEnvLocal();

const apiKey = process.env.RESEND_API_KEY?.trim();
const to = (process.env.ALERT_EMAIL ?? 'ti.soporte@monitoring.cl').trim();
const from = (process.env.RESEND_FROM ?? 'Monitoring Checklist <onboarding@resend.dev>').trim();

if (!apiKey) {
  console.error('Falta RESEND_API_KEY en .env.local');
  process.exit(1);
}

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from,
    to: [to],
    subject: 'Prueba — Monitoring Check Campo',
    text: 'Correo de prueba. Si lo recibes, Resend está configurado correctamente.',
  }),
});

const body = await res.text();
if (res.ok) {
  console.log('OK — correo enviado a', to);
  console.log(body);
} else {
  console.error('Error', res.status, body);
  process.exit(1);
}
