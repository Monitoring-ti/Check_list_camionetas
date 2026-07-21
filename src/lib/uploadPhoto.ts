import { supabase } from '@/lib/supabase';
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

/** Sube evidencia al bucket y devuelve URL pública. Comprime fotos (no firmas). */
export async function uploadVehiclePhoto(
  folder: 'hallazgos' | 'general' | 'firmas',
  baseName: string,
  file: File
): Promise<string> {
  const toUpload =
    folder === 'firmas' ? file : await compressImage(file);

  const ext = extensionFor(toUpload);
  const path = `${folder}/${baseName}.${ext}`;
  const { error } = await supabase.storage.from('vehicle-photos').upload(path, toUpload, {
    upsert: false,
    contentType: toUpload.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
  });
  if (error) throw new Error(`Error al subir foto: ${error.message}`);
  const { data } = supabase.storage.from('vehicle-photos').getPublicUrl(path);
  return data.publicUrl;
}
