import Link from 'next/link';
import { createSupabaseAdmin } from '@/lib/supabaseAdmin';
import { verifyInspectionReportToken } from '@/lib/reportToken';
import { operativoLabel } from '@/lib/inspectionPdf';
import { APP_NAME, APP_VERSION, SUPPORT_EMAIL } from '@/lib/version';

export const dynamic = 'force-dynamic';

export default async function ReportePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const token = t?.trim() ?? '';

  let invalid = !token;
  let patente = '';
  let estado = '';

  if (token) {
    try {
      const verified = verifyInspectionReportToken(token);
      if (!verified) {
        invalid = true;
      } else {
        const supabase = createSupabaseAdmin();
        const { data } = await supabase
          .from('monitoring_inspections')
          .select('patente, resultado')
          .eq('id', verified.inspectionId)
          .maybeSingle();
        if (!data) invalid = true;
        else {
          patente = data.patente ?? '';
          estado = operativoLabel(data.resultado ?? '');
        }
      }
    } catch {
      invalid = true;
    }
  }

  return (
    <div className="id-shell">
      <header className="id-topbar">
        <Link href="/" className="id-back">Inicio</Link>
        <div className="id-topbar-brand">
          <img src="/branding/logo-circular.svg" alt="" className="id-topbar-logo" />
          <span>Monitoring</span>
        </div>
        <span className="id-topbar-ver">v{APP_VERSION}</span>
      </header>
      <main className="id-main">
        <div className="id-hero">
          <h1 className="id-title">INSPECCIÓN CAMIONETA</h1>
          {invalid ? (
            <p className="id-lead">
              El enlace venció o no es válido. Escriba a {SUPPORT_EMAIL} si necesita el reporte.
            </p>
          ) : (
            <>
              <p className="id-lead">
                Patente <strong>{patente}</strong> · Resultado <strong>{estado}</strong>
              </p>
              <p className="id-hint">PDF con logo y detalle de la inspección. Sin fotografías.</p>
              <form action="/api/inspection-report" method="post">
                <input type="hidden" name="t" value={token} />
                <button type="submit" className="btn btn-action btn-full id-submit">
                  Solicitar reporte completo
                </button>
              </form>
              <p className="id-hint" style={{ marginTop: '1rem' }}>{APP_NAME}</p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
