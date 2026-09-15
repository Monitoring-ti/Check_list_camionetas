'use client';

import React, { useRef } from 'react';
import { Camera, Images } from 'lucide-react';

/** Cámara: JPEG/PNG/WebP. Evita `image/*` + capture, que en varios Android abre la cámara y deja el obturador muerto. */
const ACCEPT_CAMERA = 'image/jpeg,image/png,image/webp';
/** Galería: formatos de celular (incl. HEIC de iPhone). Sin `capture`. */
const ACCEPT_GALLERY = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif';

interface PhotoPickerProps {
  disabled?: boolean;
  onFile: (file: File) => void;
  /** Estilo compacto para las tarjetas de fotos exteriores. */
  compact?: boolean;
}

/**
 * Dos vías: cámara trasera y galería.
 * `display:none` en el file input rompe el retorno de la foto en varios WebView;
 * el input cubre el botón con opacity 0.
 */
export default function PhotoPicker({ disabled, onFile, compact }: PhotoPickerProps) {
  const busyRef = useRef(false);

  const takeFile = (input: HTMLInputElement) => {
    const file = input.files?.[0];
    if (!file || busyRef.current) return;
    busyRef.current = true;
    onFile(file);
    input.value = '';
    queueMicrotask(() => {
      busyRef.current = false;
    });
  };

  const resetValue = (e: React.MouseEvent<HTMLInputElement>) => {
    e.currentTarget.value = '';
  };

  return (
    <div className={`photo-picker${compact ? ' photo-picker--compact' : ''}`}>
      <div className={`photo-picker-hit${disabled ? ' is-disabled' : ''}`}>
        <input
          type="file"
          accept={ACCEPT_CAMERA}
          capture="environment"
          className="photo-picker-input"
          disabled={disabled}
          aria-label="Tomar foto con la cámara"
          onClick={resetValue}
          onChange={e => takeFile(e.currentTarget)}
          onInput={e => takeFile(e.currentTarget)}
        />
        <span className="photo-picker-face photo-picker-face--camera">
          <Camera size={compact ? 16 : 18} />
          <span>Cámara</span>
        </span>
      </div>
      <div className={`photo-picker-hit${disabled ? ' is-disabled' : ''}`}>
        <input
          type="file"
          accept={ACCEPT_GALLERY}
          className="photo-picker-input"
          disabled={disabled}
          aria-label="Elegir foto de la galería"
          onClick={resetValue}
          onChange={e => takeFile(e.currentTarget)}
          onInput={e => takeFile(e.currentTarget)}
        />
        <span className="photo-picker-face photo-picker-face--gallery">
          <Images size={compact ? 16 : 18} />
          <span>Galería</span>
        </span>
      </div>
    </div>
  );
}
