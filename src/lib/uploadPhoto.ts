import { getCheckSession } from '@/lib/checkSession';
import { compressImage } from '@/lib/compressImage';

function extensionFor(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && ['jpg', 'jpeg', 'png', 'webp'].includes(fromName)) {
    return fromName === 'jpeg' ? 'jpg' : fromName;
  }
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
}

function friendlyUploadError(raw: string): string {
  if (/row-level security|violates|permission|jwt|403|401/i.test(raw)) {
    return 'No se pudo guardar la foto. Reintente con conexión estable.';
  }
  if (raw.startsWith('Error al subir foto:')) return friendlyUploadError(raw.slice(21));
  return raw || 'No se pudo guardar la foto. Reintente con conexión estable.';
}

/** Sube evidencia al bucket (vía API con sesión) y devuelve URL pública. */
export async function uploadVehiclePhoto(
  folder: 'hallazgos' | 'general' | 'firmas',
  baseName: string,
  file: File
): Promise<string> {
  const toUpload = folder === 'firmas' ? file : await compressImage(file);
  const sessionToken = getCheckSession()?.sessionToken ?? '';

  const body = new FormData();
  body.append('file', toUpload, toUpload.name || `foto.${extensionFor(toUpload)}`);
  body.append('folder', folder);
  body.append('baseName', baseName);
  body.append('sessionToken', sessionToken);

  const res = await fetch('/api/upload-photo', { method: 'POST', body });
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !data.url) {
    throw new Error(friendlyUploadError(data.error ?? `HTTP ${res.status}`));
  }
  return data.url;
}
