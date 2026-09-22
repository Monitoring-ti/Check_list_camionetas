import { createHmac, timingSafeEqual } from 'crypto';

const TTL_SECONDS = 90 * 24 * 60 * 60;

function secret(): string {
  const s =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SMTP_PASS?.trim() ||
    '';
  if (!s) throw new Error('Falta secreto para firmar el enlace de reporte');
  return s;
}

export function signInspectionReportToken(inspectionId: string, rut: string): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const rutPart = rut.replace(/[^0-9kK]/g, '').toUpperCase() || '-';
  const payload = `${inspectionId}.${exp}.${rutPart}`;
  const sig = createHmac('sha256', secret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyInspectionReportToken(
  token: string
): { inspectionId: string; rut: string } | null {
  const parts = token.split('.');
  if (parts.length !== 4) return null;
  const [id, expStr, rutPart, sig] = parts;
  if (!id || !expStr || !rutPart || !sig) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;

  const payload = `${id}.${expStr}.${rutPart}`;
  const expected = createHmac('sha256', secret()).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return { inspectionId: id, rut: rutPart === '-' ? '' : rutPart };
}
