import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyInspectionReportToken } from '@/lib/reportToken';
import { buildInspectionPdf } from '@/lib/inspectionPdf';

export const runtime = 'nodejs';

async function pdfForToken(token: string): Promise<{ buffer: Buffer; filename: string } | null> {
  let verified: { inspectionId: string; rut: string } | null;
  try {
    verified = verifyInspectionReportToken(token);
  } catch {
    return null;
  }
  if (!verified) return null;

  const supabase = createSupabaseAdmin();
  const { data: inspection, error: inspError } = await supabase
    .from('monitoring_inspections')
    .select(
      'id, patente, responsable_inspeccion, cargo, resultado, kilometraje, fecha, hora, marca_modelo, observaciones, nivel_combustible'
    )
    .eq('id', verified.inspectionId)
    .maybeSingle();

  if (inspError || !inspection) return null;

  const { data: details } = await supabase
    .from('monitoring_inspection_details')
    .select('seccion, item_label, descripcion, is_good, is_blocking')
    .eq('inspection_id', verified.inspectionId);

  const buffer = await buildInspectionPdf({
    patente: inspection.patente ?? '',
    resultado: inspection.resultado ?? '',
    fecha: String(inspection.fecha ?? ''),
    hora: inspection.hora,
    responsable: inspection.responsable_inspeccion ?? '',
    cargo: inspection.cargo ?? '',
    rut: verified.rut,
    marcaModelo: inspection.marca_modelo ?? '',
    kilometraje: inspection.kilometraje ?? 0,
    combustible: inspection.nivel_combustible ?? null,
    observaciones: inspection.observaciones ?? null,
    details: details ?? [],
  });

  const patente = (inspection.patente ?? 'vehiculo').replace(/[^\w-]+/g, '');
  return { buffer, filename: `estado-operativo-${patente}.pdf` };
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const token = String(form?.get('t') ?? '').trim();
  if (!token) {
    return NextResponse.json({ ok: false, error: 'Falta enlace' }, { status: 400 });
  }

  try {
    const pdf = await pdfForToken(token);
    if (!pdf) {
      return NextResponse.json({ ok: false, error: 'Enlace inválido o vencido' }, { status: 404 });
    }
    return new NextResponse(new Uint8Array(pdf.buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdf.filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('[inspection-report]', e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: 'No se pudo generar el reporte' }, { status: 500 });
  }
}
