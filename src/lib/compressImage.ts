/** Límite razonable para evidencia en terreno (celular / 4G). */
const DEFAULT_MAX_EDGE = 1600;
const DEFAULT_QUALITY = 0.72;

export interface CompressImageOptions {
  /** Lado mayor máximo en px (default 1600). */
  maxEdge?: number;
  /** Calidad JPEG 0–1 (default 0.72). */
  quality?: number;
}

/**
 * Reduce resolución y peso de una foto antes de subirla.
 * Salida siempre JPEG (más liviano que PNG de cámara).
 */
export async function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  if (!file.type.startsWith('image/')) return file;

  const maxEdge = options.maxEdge ?? DEFAULT_MAX_EDGE;
  const quality = options.quality ?? DEFAULT_QUALITY;

  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = bitmap;
    const scale = Math.min(1, maxEdge / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    // Ya cabe en el límite y es JPEG: no reprocesar (evita doble compresión)
    if (scale === 1 && file.type === 'image/jpeg' && file.size <= 1_200_000) {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, w, h);

    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    );
    if (!blob) return file;

    // Si por alguna razón quedó más pesada, conservar original
    if (blob.size >= file.size && file.type === 'image/jpeg') {
      return file;
    }

    const base = file.name.replace(/\.[^.]+$/, '') || 'foto';
    return new File([blob], `${base}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}
