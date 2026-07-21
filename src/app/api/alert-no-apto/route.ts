import { NextResponse } from 'next/server';
import { dispatchNoAptoAlert, getAlertChannelStatus } from '@/lib/alertServer';

export async function GET() {
  return NextResponse.json(getAlertChannelStatus());
}

export async function POST(request: Request) {
  let body: { inspectionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const inspectionId = body.inspectionId?.trim();
  if (!inspectionId) {
    return NextResponse.json({ ok: false, error: 'Falta inspectionId' }, { status: 400 });
  }

  const result = await dispatchNoAptoAlert(inspectionId);

  if (!result.ok && result.channels.length === 0) {
    const status = result.error?.includes('no configurado') ? 503 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
