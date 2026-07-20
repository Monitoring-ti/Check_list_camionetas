/** Destinos de alerta No apta (configurar en .env.local / Vercel). */
const DEFAULT_ALERT_EMAIL = 'joseluis.urra@monitoring.cl';

export function getAlertEmail(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_ALERT_EMAIL ?? '').trim();
  return fromEnv || DEFAULT_ALERT_EMAIL;
}

/** WhatsApp en formato internacional sin + (ej. 56912345678). */
export function getAlertWhatsApp(): string {
  return (process.env.NEXT_PUBLIC_ALERT_WHATSAPP ?? '').replace(/\D/g, '');
}

export interface NoAptoAlertPayload {
  patente: string;
  responsable: string;
  resultado: string;
  kilometraje: number;
  fecha: string;
  hora: string;
  hallazgos: string[];
}

export function buildNoAptoAlertText(p: NoAptoAlertPayload): string {
  const hallazgos =
    p.hallazgos.length > 0
      ? p.hallazgos.map((h, i) => `${i + 1}. ${h}`).join('\n')
      : 'Sin detalle de hallazgos.';

  return [
    '⚠️ ALERTA CHECKLIST — VEHÍCULO NO APTA',
    '',
    `Patente: ${p.patente}`,
    `Responsable: ${p.responsable}`,
    `Fecha: ${p.fecha} ${p.hora}`,
    `Kilometraje: ${p.kilometraje.toLocaleString('es-CL')}`,
    `Resultado: ${p.resultado}`,
    '',
    'Hallazgos críticos / No:',
    hallazgos,
    '',
    '— Monitoring Check Campo',
  ].join('\n');
}

/** Abre cliente de correo con asunto y cuerpo precargados. */
export function openEmailAlert(to: string, subject: string, body: string): void {
  if (!to) return;
  const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/** Abre WhatsApp (app o web) con mensaje precargado. */
export function openWhatsAppAlert(phone: string, body: string): void {
  if (!phone) return;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(body)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
