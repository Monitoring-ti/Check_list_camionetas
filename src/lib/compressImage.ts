/** Límite razonable para evidencia en terreno (celular / 4G). */
const DEFAULT_MAX_EDGE = 1600;
const DEFAULT_QUALITY = 0.72;

export interface CompressImageOptions {
  /** Lado mayor máximo en px (default 1600). */
  maxEdge?: number;
  /** Calidad JPEG 0–1 (default 0.72). */
  quality?: number;
}

function looksLikeImage(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  // Varios Android entregan type vacío al volver de la cámara
  if (!file.type) return true;
  return /\.(jpe?g|png|webp|gif|heic|heif|bmp)$/i.test(file.name);
}

type Decoded = {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
  close: () => void;
};

function decodeViaElement(file: File): Promise<Decoded> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
        close: () => URL.revokeObjectURL(url),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen'));
    };
    img.src = url;
  });
}

async function decodeFile(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        width: bitmap.width,
        height: bitmap.height,
        draw: (ctx, w, h) => ctx.drawImage(bitmap, 0, 0, w, h),
        close: () => bitmap.close(),
      };
    } catch {
      // HEIC / WebView viejo: probar <img>
    }
  }
  return decodeViaElement(file);
}

/**
 * Reduce resolución y peso de una foto antes de subirla.
 * Salida siempre JPEG (más liviano que PNG de cámara).
 */
export async function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  if (!looksLikeImage(file)) return file;

  const maxEdge = options.maxEdge ?? DEFAULT_MAX_EDGE;
  const quality = options.quality ?? DEFAULT_QUALITY;

  let decoded: Decoded;
  try {
    decoded = await decodeFile(file);
  } catch {
    return file;
  }

  try {
    const { width, height } = decoded;
    if (!width || !height) return file;

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

    decoded.draw(ctx, w, h);

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
    decoded.close();
  }
}
