import { supabase } from '@/lib/supabase';

function extensionFor(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && ['jpg', 'jpeg', 'png', 'webp'].includes(fromName)) {
    return fromName === 'jpeg' ? 'jpg' : fromName;
  }
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  return 'jpg';
}

/** Sube evidencia al bucket y devuelve URL pública. */
export async function uploadVehiclePhoto(
  folder: 'hallazgos' | 'general' | 'firmas',
  baseName: string,
  file: File
): Promise<string> {
  const ext = extensionFor(file);
  const path = `${folder}/${baseName}.${ext}`;
  const { error } = await supabase.storage.from('vehicle-photos').upload(path, file, {
    upsert: false,
    contentType: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
  });
  if (error) throw new Error(`Error al subir foto: ${error.message}`);
  const { data } = supabase.storage.from('vehicle-photos').getPublicUrl(path);
  return data.publicUrl;
}
