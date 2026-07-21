import { buildNoAptoAlertText } from '@/lib/alerts';
import { createSupabaseAdmin } from '@/lib/supabaseAdmin';

const DEFAULT_ALERT_EMAIL = 'ti.soporte@monitoring.cl';

export function getServerAlertEmail(): string {
  return (process.env.ALERT_EMAIL ?? DEFAULT_ALERT_EMAIL).trim();
}

export function getAlertChannelStatus(): { email: boolean; webhook: boolean } {
  return {
    email: !!(process.env.RESEND_API_KEY?.trim() && getServerAlertEmail()),
    webhook: !!process.env.ALERT_WEBHOOK_URL?.trim(),
  };
}

function isNoAptoResultado(resultado: string): boolean {
  return /no\s*apto/i.test(resultado);
}

async function loadNoAptoInspection(inspectionId: string) {
  const supabase = createSupabaseAdmin();

  const { data: inspection, error: inspError } = await supabase
    .from('monitoring_inspections')
    .select('id, patente, responsable_inspeccion, resultado, kilometraje, fecha, hora')
    .eq('id', inspectionId)
    .maybeSingle();

  if (inspError) throw new Error(inspError.message);
  if (!inspection) return null;
  if (!isNoAptoResultado(inspection.resultado ?? '')) return null;

  const { data: details, error: detError } = await supabase
    .from('monitoring_inspection_details')
    .select('item_label, descripcion, is_good, is_blocking')
    .eq('inspection_id', inspectionId)
    .eq('is_good', false);

  if (detError) throw new Error(detError.message);

  const hallazgos = (details ?? []).map(d => {
    const desc = (d.descripcion ?? '').trim();
    return desc ? `${d.item_label}: ${desc}` : d.item_label;
  });

  const text = buildNoAptoAlertText({
    patente: inspection.patente,
    responsable: inspection.responsable_inspeccion,
    resultado: inspection.resultado,
    kilometraje: inspection.kilometraje,
    fecha: inspection.fecha,
    hora: inspection.hora,
    hallazgos,
  });

  const subject = `No apta — ${inspection.patente} — Check ECF 4`;

  return { inspection, subject, text };
}

async function sendEmailAlert(to: string, subject: string, text: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error('RESEND_API_KEY no configurada');

  const from = (process.env.RESEND_FROM ?? 'Monitoring Checklist <onboarding@resend.dev>').trim();

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}

async function sendWebhookAlert(payload: Record<string, unknown>): Promise<void> {
  const url = process.env.ALERT_WEBHOOK_URL?.trim();
  if (!url) throw new Error('ALERT_WEBHOOK_URL no configurada');

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      text: payload.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Webhook ${res.status}: ${body}`);
  }
}

export async function dispatchNoAptoAlert(inspectionId: string): Promise<{
  ok: boolean;
  channels: string[];
  error?: string;
}> {
  const status = getAlertChannelStatus();
  if (!status.email && !status.webhook) {
    return { ok: false, channels: [], error: 'Sin canal de alerta configurado' };
  }

  try {
    const loaded = await loadNoAptoInspection(inspectionId);
    if (!loaded) {
      return { ok: false, channels: [], error: 'Inspección no encontrada o no es No apta' };
    }

    const { inspection, subject, text } = loaded;
    const channels: string[] = [];
    const errors: string[] = [];

    if (status.email) {
      try {
        await sendEmailAlert(getServerAlertEmail(), subject, text);
        channels.push('correo');
      } catch (e) {
        errors.push(e instanceof Error ? e.message : 'Error al enviar correo');
      }
    }

    if (status.webhook) {
      try {
        await sendWebhookAlert({
          type: 'checklist_no_apto',
          inspection_id: inspection.id,
          patente: inspection.patente,
          responsable: inspection.responsable_inspeccion,
          resultado: inspection.resultado,
          subject,
          text,
        });
        channels.push('webhook');
      } catch (e) {
        errors.push(e instanceof Error ? e.message : 'Error al enviar webhook');
      }
    }

    if (channels.length === 0) {
      return { ok: false, channels: [], error: errors.join('; ') || 'No se pudo enviar la alerta' };
    }

    return { ok: true, channels, error: errors.length ? errors.join('; ') : undefined };
  } catch (e) {
    return {
      ok: false,
      channels: [],
      error: e instanceof Error ? e.message : 'Error al procesar alerta',
    };
  }
}
