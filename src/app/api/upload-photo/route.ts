import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from '@/lib/supabaseAdmin';

export const maxDuration = 30;

const FOLDERS = new Set(['hallazgos', 'general', 'firmas']);
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BYTES = 6_000_000;

function extensionOf(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && ['jpg', 'jpeg', 'png', 'webp'].includes(fromName)) {
    return fromName === 'jpeg' ? 'jpg' : fromName;
  }
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
}

function safeBaseName(raw: string): string {
  const cleaned = raw.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/-+/g, '-').slice(0, 120);
  return cleaned || 'foto';
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get('file');
    const folder = String(form.get('folder') ?? '');
    const baseName = safeBaseName(String(form.get('baseName') ?? ''));
    const sessionToken = String(form.get('sessionToken') ?? '').trim();

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'La foto es demasiado pesada' }, { status: 400 });
    }
    if (!FOLDERS.has(folder)) {
      return NextResponse.json({ error: 'Carpeta no permitida' }, { status: 400 });
    }
    if (!UUID_RE.test(sessionToken)) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data: session, error: sessError } = await supabase
      .from('check_field_sessions')
      .select('id, expires_at')
      .eq('id', sessionToken)
      .maybeSingle();

    if (sessError) throw new Error(sessError.message);
    if (!session) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 403 });
    }
    if (new Date(session.expires_at) <= new Date()) {
      return NextResponse.json({ error: 'Sesión vencida' }, { status: 403 });
    }

    const ext = extensionOf(file);
    const path = `${folder}/${baseName}.${ext}`;
    const contentType = file.type || (ext === 'png' ? 'image/png' : 'image/jpeg');
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: upError } = await supabase.storage.from('vehicle-photos').upload(path, buffer, {
      upsert: true,
      contentType,
    });
    if (upError) throw new Error(upError.message);

    const { data } = supabase.storage.from('vehicle-photos').getPublicUrl(path);
    return NextResponse.json({ ok: true, url: data.publicUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'No se pudo guardar la foto';
    console.error('[upload-photo]', msg);
    const publicMsg = 'No se pudo guardar la foto. Reintente con conexión estable.';
    return NextResponse.json({ error: publicMsg }, { status: 500 });
  }
}
