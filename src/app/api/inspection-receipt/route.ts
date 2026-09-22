import { NextResponse } from 'next/server';
import { dispatchInspectionReceipt } from '@/lib/inspectionReceipt';

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      inspectionId?: string;
      sessionToken?: string;
    };
    const inspectionId = body.inspectionId?.trim() ?? '';
    const sessionToken = body.sessionToken?.trim() ?? '';
    if (inspectionId && sessionToken) {
      await dispatchInspectionReceipt(inspectionId, sessionToken);
    }
  } catch (e) {
    console.error('[inspection-receipt]', e instanceof Error ? e.message : e);
  }

  return NextResponse.json({ ok: true });
}
