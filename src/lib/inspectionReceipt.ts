import { createSupabaseAdmin } from '@/lib/supabaseAdmin';
import { sendMail, isSmtpConfigured } from '@/lib/mail';
import { normalizePatente } from '@/lib/patente';
import { signInspectionReportToken } from '@/lib/reportToken';
import { operativoLabel } from '@/lib/inspectionPdf';
import { PRODUCTION_ORIGIN, SUPPORT_EMAIL } from '@/lib/version';

function appOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_ORIGIN?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000';
  return PRODUCTION_ORIGIN;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EMAIL_KEYS = ['email', 'correo', 'correo_electronico', 'email_corporativo', 'mail'];

function looksLikeEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function emailFromTrabajadorRow(row: Record<string, unknown>): string | null {
  for (const key of EMAIL_KEYS) {
    const v = row[key];
    if (typeof v === 'string' && looksLikeEmail(v)) return v.trim();
  }
  for (const [key, v] of Object.entries(row)) {
    if (!/(email|correo|mail)/i.test(key)) continue;
    if (typeof v === 'string' && looksLikeEmail(v)) return v.trim();
  }
  return null;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatHora(hora: unknown): string {
  if (hora == null) return '';
  if (typeof hora === 'string') return hora.slice(0, 8);
  return String(hora);
}

interface DetailRow {
  seccion: string | null;
  item_label: string;
  is_good: boolean | null;
  descripcion: string | null;
}

function formatFechaDisplay(fecha: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha);
  if (!m) return fecha;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

function itemMark(isGood: boolean | null): string {
  if (isGood === true) return 'B';
  if (isGood === false) return 'M';
  return '—';
}

function formatDetailsText(details: DetailRow[]): string {
  if (details.length === 0) return 'Sin ítems registrados.';
  const lines: string[] = [];
  let section = '';
  for (const d of details) {
    const s = (d.seccion || 'General').trim();
    if (s !== section) {
      section = s;
      lines.push('', s.toUpperCase());
    }
    lines.push(`${d.item_label}\t${itemMark(d.is_good)}`);
    const desc = (d.descripcion ?? '').trim();
    if (desc && d.is_good === false) lines.push(`  ${desc}`);
  }
  return lines.join('\n').trim();
}

function kvRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;color:#454651">${escapeHtml(label)}</td>
    <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-weight:700">${escapeHtml(value)}</td>
  </tr>`;
}

function formatDetailsHtml(details: DetailRow[]): string {
  if (details.length === 0) return '<p>Sin ítems registrados.</p>';
  const parts: string[] = [];
  let section = '';
  for (const d of details) {
    const s = (d.seccion || 'General').trim();
    if (s !== section) {
      section = s;
      parts.push(
        `<tr><td colspan="2" style="padding:14px 8px 6px;font-weight:700;color:#142275;text-transform:uppercase;font-size:12px">${escapeHtml(s)}</td></tr>`
      );
    }
    const desc = (d.descripcion ?? '').trim();
    parts.push(kvRow(d.item_label, itemMark(d.is_good)));
    if (desc && d.is_good === false) {
      parts.push(
        `<tr><td colspan="2" style="padding:0 8px 8px;color:#b91c1c;font-size:13px">${escapeHtml(desc)}</td></tr>`
      );
    }
  }
  return parts.join('');
}

export function buildInspectionReceipt(params: {
  resultado: string;
  fecha: string;
  hora: string;
  responsable: string;
  rut: string;
  cargo: string;
  patente: string;
  marcaModelo: string;
  kilometraje: number;
  combustible: string | null;
  observaciones: string | null;
  details: DetailRow[];
  reportUrl: string;
}): { subject: string; text: string; html: string } {
  const estado = operativoLabel(params.resultado);
  const vehiculoEstado = estado === 'No apta' ? 'Vehiculo No Operativo' : 'Vehiculo Operativo';
  const patente = params.patente.toUpperCase();
  const subject = `INSPECCIÓN CAMIONETA ${patente}`;
  const fechaUi = formatFechaDisplay(params.fecha);
  const fechaHora = `${params.fecha} ${params.hora}`.trim();
  const detalle = formatDetailsText(params.details);

  const text = [
    'check',
    `INSPECCIÓN CAMIONETA ${patente}`,
    fechaHora,
    '',
    'SITUACION FINAL VEHICULO',
    `Estado del Vehiculo\t${vehiculoEstado}`,
    estado === 'No apta' ? 'El vehículo no debe operar hasta revisión.' : '',
    '',
    'IDENTIFICACION',
    'Empresa\tMONITORING',
    `Placa Patente\t${patente}`,
    params.marcaModelo ? `Vehículo\t${params.marcaModelo}` : '',
    `Fecha de la Inspección\t${fechaUi}`,
    `Hora de la Inspección\t${params.hora}`,
    `Kilometraje\t${params.kilometraje.toLocaleString('es-CL')}`,
    params.combustible ? `Nivel de combustible\t${params.combustible}` : '',
    '',
    'IDENTIFICACION DE CONDUCTOR QUE INSPECCIONA',
    `Nombre\t${params.responsable}`,
    `RUT\t${params.rut}`,
    params.cargo ? `Cargo\t${params.cargo}` : '',
    'Empresa\tMONITORING',
    params.observaciones ? `\nObservaciones\t${params.observaciones}` : '',
    '',
    detalle,
    '',
    `Solicitar reporte completo (PDF): ${params.reportUrl}`,
  ]
    .filter(line => line !== '')
    .join('\n');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#191c1e;max-width:640px">
      <div style="background:#142275;color:#fff;padding:16px 20px">
        <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.85">check</div>
        <div style="font-size:18px;font-weight:700">INSPECCIÓN CAMIONETA ${escapeHtml(patente)}</div>
        <div style="font-size:13px;margin-top:6px;opacity:.9">${escapeHtml(fechaHora)}</div>
      </div>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d1d5db;border-top:0">
        <tr><td colspan="2" style="padding:14px 8px 4px;font-weight:700;background:#f8f9fb;text-transform:uppercase;font-size:12px;color:#142275">Situación final vehículo</td></tr>
        ${kvRow('Estado del Vehiculo', vehiculoEstado)}
        <tr><td colspan="2" style="padding:14px 8px 4px;font-weight:700;background:#f8f9fb;text-transform:uppercase;font-size:12px;color:#142275">Identificación</td></tr>
        ${kvRow('Empresa', 'MONITORING')}
        ${kvRow('Placa Patente', patente)}
        ${params.marcaModelo ? kvRow('Vehículo', params.marcaModelo) : ''}
        ${kvRow('Fecha de la Inspección', fechaUi)}
        ${kvRow('Hora de la Inspección', params.hora)}
        ${kvRow('Kilometraje', params.kilometraje.toLocaleString('es-CL'))}
        ${params.combustible ? kvRow('Nivel de combustible', params.combustible) : ''}
        <tr><td colspan="2" style="padding:14px 8px 4px;font-weight:700;background:#f8f9fb;text-transform:uppercase;font-size:12px;color:#142275">Identificación de conductor que inspecciona</td></tr>
        ${kvRow('Nombre', params.responsable)}
        ${kvRow('RUT', params.rut)}
        ${params.cargo ? kvRow('Cargo', params.cargo) : ''}
        ${kvRow('Empresa', 'MONITORING')}
        ${params.observaciones ? kvRow('Observaciones', params.observaciones) : ''}
        ${formatDetailsHtml(params.details)}
      </table>
      ${estado === 'No apta' ? '<p style="color:#b91c1c;padding:0 8px"><strong>El vehículo no debe operar hasta revisión.</strong></p>' : ''}
      <p style="margin:20px 8px">
        <a href="${escapeHtml(params.reportUrl)}"
           style="display:inline-block;background:#142275;color:#fff;text-decoration:none;padding:12px 18px;font-weight:700">
          Solicitar reporte completo
        </a>
      </p>
      <p style="font-size:12px;color:#454651;padding:0 8px">PDF con logo y detalle. Sin fotografías. Este correo es automático (noreply).</p>
    </div>
  `.trim();

  return { subject, text, html };
}

/** Datos ficticios: no toca Supabase. Solo para previsualizar el mail en local. */
export function sampleInspectionReceipt(reportUrl = 'http://localhost:3000/reporte?t=demo') {
  return buildInspectionReceipt({
    resultado: 'Vehículo Apto',
    fecha: '2026-09-21',
    hora: '06:40:35',
    responsable: 'Carol Silva',
    rut: '12345678K',
    cargo: 'Conductor',
    patente: 'VXWZ46',
    marcaModelo: 'Toyota Hilux',
    kilometraje: 84210,
    combustible: '3/4',
    observaciones: null,
    details: [
      { seccion: 'Fotos exterior', item_label: 'Cintas reflectantes', is_good: true, descripcion: null },
      { seccion: 'Estructura y Seguridad Activa', item_label: 'Airbags (frontales y laterales)', is_good: true, descripcion: null },
      { seccion: 'Estructura y Seguridad Activa', item_label: 'Cinturones de seguridad (3 puntos / todos asientos)', is_good: true, descripcion: null },
      { seccion: 'Estructura y Seguridad Activa', item_label: 'Dirección', is_good: true, descripcion: null },
      { seccion: 'Neumáticos y Tracción', item_label: 'Estado neumáticos', is_good: true, descripcion: null },
      { seccion: 'Visibilidad y Señalización', item_label: 'Luces funcionando', is_good: true, descripcion: null },
      { seccion: 'Visibilidad y Señalización', item_label: 'Luces de freno', is_good: true, descripcion: null },
      { seccion: 'Equipos de Emergencia', item_label: 'Dos cuñas de seguridad', is_good: true, descripcion: null },
      { seccion: 'Equipos de Emergencia', item_label: 'Botiquín de primeros auxilios completo', is_good: false, descripcion: 'Faltan insumos y hay vendajes vencidos.' },
      { seccion: 'Mecánica y Fluidos', item_label: 'Frenos', is_good: true, descripcion: null },
      { seccion: 'Kilometraje y tablero', item_label: 'Tablero de instrumentos (sin testigos encendidos)', is_good: true, descripcion: null },
    ],
    reportUrl,
  });
}

export async function dispatchInspectionReceipt(
  inspectionId: string,
  sessionToken: string
): Promise<void> {
  if (!UUID_RE.test(inspectionId) || !UUID_RE.test(sessionToken)) {
    console.error('[inspection-receipt] ids inválidos');
    return;
  }

  if (!isSmtpConfigured()) {
    console.error('[inspection-receipt] SMTP no configurado');
    return;
  }

  const supabase = createSupabaseAdmin();

  const { data: session, error: sessError } = await supabase
    .from('check_field_sessions')
    .select('id, rut, patente, trabajador_id')
    .eq('id', sessionToken)
    .maybeSingle();

  if (sessError) throw new Error(sessError.message);
  if (!session) {
    console.error('[inspection-receipt] sesión no encontrada');
    return;
  }

  const { data: inspection, error: inspError } = await supabase
    .from('monitoring_inspections')
    .select(
      'id, patente, responsable_inspeccion, cargo, resultado, kilometraje, fecha, hora, marca_modelo, observaciones, nivel_combustible'
    )
    .eq('id', inspectionId)
    .maybeSingle();

  if (inspError) throw new Error(inspError.message);
  if (!inspection) {
    console.error('[inspection-receipt] inspección no encontrada');
    return;
  }

  if (normalizePatente(session.patente) !== normalizePatente(inspection.patente ?? '')) {
    console.error('[inspection-receipt] patente de sesión no coincide con la inspección');
    return;
  }

  const { data: trabajador, error: trabError } = await supabase
    .from('trabajadores')
    .select('*')
    .eq('id_trabajador', session.trabajador_id)
    .maybeSingle();

  if (trabError) throw new Error(trabError.message);
  if (!trabajador) {
    console.error('[inspection-receipt] trabajador no encontrado');
    return;
  }

  const to = emailFromTrabajadorRow(trabajador as Record<string, unknown>);
  if (!to) {
    console.error('[inspection-receipt] RUT sin correo en trabajadores');
    return;
  }

  const { data: details, error: detError } = await supabase
    .from('monitoring_inspection_details')
    .select('seccion, item_label, descripcion, is_good')
    .eq('inspection_id', inspectionId);

  if (detError) throw new Error(detError.message);

  const token = signInspectionReportToken(inspectionId, session.rut);
  const reportUrl = `${appOrigin()}/reporte?t=${encodeURIComponent(token)}`;

  const { subject, text, html } = buildInspectionReceipt({
    resultado: inspection.resultado ?? '',
    fecha: String(inspection.fecha ?? ''),
    hora: formatHora(inspection.hora),
    responsable: inspection.responsable_inspeccion ?? '',
    rut: session.rut,
    cargo: inspection.cargo ?? '',
    patente: inspection.patente ?? '',
    marcaModelo: inspection.marca_modelo ?? '',
    kilometraje: inspection.kilometraje ?? 0,
    combustible: inspection.nivel_combustible ?? null,
    observaciones: inspection.observaciones ?? null,
    details: details ?? [],
    reportUrl,
  });

  await sendMail({ to, subject, text, html, replyTo: SUPPORT_EMAIL });
}
