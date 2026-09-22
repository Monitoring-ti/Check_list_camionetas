import PDFDocument from 'pdfkit';
import { APTITUD_CONDUCIR_LABEL } from '@/lib/checklistData';
import { SUPPORT_EMAIL } from '@/lib/version';

const NAVY = '#142275';
const ORANGE = '#f28c28';
const MUTED = '#454651';

export function operativoLabel(resultado: string): string {
  return /no\s*apto/i.test(resultado) ? 'No apta' : 'Apta';
}

function formatHora(hora: unknown): string {
  if (hora == null) return '';
  if (typeof hora === 'string') return hora.slice(0, 8);
  return String(hora);
}

export interface InspectionPdfDetail {
  seccion: string | null;
  item_label: string;
  is_good: boolean | null;
  descripcion: string | null;
  is_blocking: boolean | null;
}

export interface InspectionPdfData {
  patente: string;
  resultado: string;
  fecha: string;
  hora: unknown;
  responsable: string;
  cargo: string;
  rut: string;
  marcaModelo: string;
  kilometraje: number;
  combustible: string | null;
  observaciones: string | null;
  details: InspectionPdfDetail[];
}

export function buildInspectionPdf(data: InspectionPdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const estado = operativoLabel(data.resultado);
    const fechaHora = `${data.fecha} ${formatHora(data.hora)}`.trim();

    doc.rect(0, 0, doc.page.width, 72).fill(NAVY);
    doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text('INSPECCIÓN CAMIONETA', 48, 18, {
      continued: false,
    });
    doc.fontSize(9).font('Helvetica').fillColor('#c5cae8').text('check · Monitoring', 48, 38);
    doc.fontSize(11).fillColor('#ffffff').font('Helvetica-Bold').text(data.patente.toUpperCase(), 48, 52);

    doc.rect(0, 72, doc.page.width, 4).fill(ORANGE);

    doc.fillColor(NAVY).fontSize(14).font('Helvetica-Bold').text('Situación final vehículo', 48, 92);
    doc.moveDown(0.4);
    const vehiculoEstado = estado === 'No apta' ? 'Vehiculo No Operativo' : 'Vehiculo Operativo';
    doc.fontSize(12).fillColor(estado === 'No apta' ? '#b91c1c' : '#15803d').text(vehiculoEstado);

    doc.moveDown(0.8);
    doc.fillColor(MUTED).fontSize(9).font('Helvetica').text('Identificación', { underline: true });
    doc.moveDown(0.3);
    doc.fillColor('#191c1e').fontSize(10);
    const meta = [
      `Patente: ${data.patente}`,
      data.marcaModelo ? `Vehículo: ${data.marcaModelo}` : '',
      `Fecha y hora: ${fechaHora}`,
      `Responsable: ${data.responsable}`,
      data.rut ? `RUT: ${data.rut}` : '',
      data.cargo ? `Cargo: ${data.cargo}` : '',
      `Kilometraje: ${data.kilometraje.toLocaleString('es-CL')}`,
      data.combustible ? `Combustible: ${data.combustible}` : '',
    ].filter(Boolean);
    doc.text(meta.join('\n'));

    if (data.observaciones?.includes(APTITUD_CONDUCIR_LABEL)) {
      doc.moveDown(0.8);
      doc.fillColor(MUTED).fontSize(9).font('Helvetica').text('Aptitud para conducir', { underline: true });
      doc.moveDown(0.2);
      doc.fillColor('#191c1e').fontSize(10).text(APTITUD_CONDUCIR_LABEL);
    }

    const notas = (data.observaciones ?? '')
      .split(/\n+/)
      .map(l => l.trim())
      .filter(l => l && l !== APTITUD_CONDUCIR_LABEL)
      .join('\n')
      .trim();
    if (notas) {
      doc.moveDown(0.8);
      doc.fillColor(MUTED).fontSize(9).font('Helvetica').text('Observaciones', { underline: true });
      doc.moveDown(0.2);
      doc.fillColor('#191c1e').fontSize(10).text(notas);
    }

    doc.moveDown(0.8);
    doc.fillColor(MUTED).fontSize(9).font('Helvetica').text('Detalle de inspección (sin fotografías)', { underline: true });
    doc.moveDown(0.4);

    let currentSection = '';
    for (const row of data.details) {
      const section = (row.seccion || 'Ítems').trim();
      if (section !== currentSection) {
        currentSection = section;
        doc.moveDown(0.35);
        doc.fillColor(NAVY).fontSize(11).font('Helvetica-Bold').text(section);
      }
      const mark = row.is_good === true ? 'B' : row.is_good === false ? 'M' : '—';
      const block = row.is_blocking ? ' (bloqueante)' : '';
      doc.fillColor('#191c1e').fontSize(10).font('Helvetica').text(`${row.item_label}: ${mark}${block}`);
      const desc = (row.descripcion ?? '').trim();
      if (desc && row.is_good === false) {
        doc.fillColor(MUTED).fontSize(9).text(`  ${desc}`);
      }
    }

    if (data.details.length === 0) {
      doc.fillColor(MUTED).fontSize(10).text('Sin ítems registrados.');
    }

    doc.moveDown(1.2);
    doc.fontSize(8).fillColor(MUTED).text(
      `Las fotografías de evidencia no se incluyen en este PDF. Consultas: ${SUPPORT_EMAIL}`
    );

    doc.end();
  });
}
