import { NextResponse } from 'next/server';
import { sampleInspectionReceipt } from '@/lib/inspectionReceipt';
import { sendMail } from '@/lib/mail';
import { SUPPORT_EMAIL } from '@/lib/version';

export const runtime = 'nodejs';

function onlyDev() {
  return process.env.NODE_ENV !== 'development';
}

/** GET /api/dev/preview-email — HTML de prueba, sin escribir en la BD. */
export async function GET(request: Request) {
  if (onlyDev()) {
    return new NextResponse('Solo disponible en npm run dev', { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const mail = sampleInspectionReceipt('http://localhost:3000/reporte?t=demo');
  const to = searchParams.get('to')?.trim();
  const send = searchParams.get('send') === '1';

  if (send) {
    if (!to) {
      return NextResponse.json(
        { ok: false, error: 'Pase ?send=1&to=su@correo.cl' },
        { status: 400 }
      );
    }
    await sendMail({
      to,
      subject: `[PRUEBA] ${mail.subject}`,
      text: mail.text,
      html: mail.html,
      replyTo: SUPPORT_EMAIL,
    });
    return NextResponse.json({
      ok: true,
      sentTo: to,
      note: 'No se creó inspección en la BD. El asunto lleva [PRUEBA].',
    });
  }

  const page = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"/><title>${mail.subject}</title></head>
<body style="margin:0;background:#eef0f4;padding:24px">
  <p style="font-family:Arial;color:#454651;font-size:13px">
    Vista previa local. No hay registro en la BD.
    Para enviarlo: <code>/api/dev/preview-email?send=1&amp;to=su@correo.cl</code>
  </p>
  <div style="max-width:640px;margin:0 auto;background:#fff">
    <p style="font-family:Arial;font-size:12px;color:#454651;padding:8px 12px;border-bottom:1px solid #d1d5db">
      De: Check &lt;no-reply@monitoring.lat&gt;<br/>
      Para: (en un envío real, el correo del RUT en trabajadores)<br/>
      Asunto: ${mail.subject}
    </p>
    ${mail.html}
  </div>
</body></html>`;

  return new NextResponse(page, {
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
