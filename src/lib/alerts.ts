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

export interface AlertChannelStatus {
  email: boolean;
  webhook: boolean;
}

export async function fetchAlertChannelStatus(): Promise<AlertChannelStatus> {
  try {
    const res = await fetch('/api/alert-no-apto');
    if (!res.ok) return { email: false, webhook: false };
    return (await res.json()) as AlertChannelStatus;
  } catch {
    return { email: false, webhook: false };
  }
}

export async function sendNoAptoAlert(inspectionId: string): Promise<{
  ok: boolean;
  channels?: string[];
  error?: string;
}> {
  const res = await fetch('/api/alert-no-apto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inspectionId }),
  });

  return res.json();
}
