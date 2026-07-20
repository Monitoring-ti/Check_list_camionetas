'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, CheckCircle, XCircle, MapPin, Loader2 } from 'lucide-react';

interface FaultPhotoProps {
  itemKey: string;
  hint?: string;
  /** URL ya guardada en storage (si existe) */
  savedUrl?: string | null;
  uploading?: boolean;
  uploadError?: string | null;
  onPhotoChange: (file: File | null, geoTag: string) => void;
}

export default function FaultPhoto({
  itemKey,
  hint,
  savedUrl,
  uploading = false,
  uploadError = null,
  onPhotoChange,
}: FaultPhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [geoTag, setGeoTag] = useState<string>('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!savedUrl && !preview) return;
    // Si se limpia desde el padre, resetear preview local
  }, [savedUrl, preview]);

  const captureGeo = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve('geolocalización no disponible');
        return;
      }
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const tag = `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)} @ ${new Date().toLocaleString('es-CL')}`;
          setGeoTag(tag);
          setLocating(false);
          resolve(tag);
        },
        () => {
          const tag = `sin GPS @ ${new Date().toLocaleString('es-CL')}`;
          setGeoTag(tag);
          setLocating(false);
          resolve(tag);
        },
        { timeout: 5000 }
      );
    });
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    const geo = await captureGeo();
    onPhotoChange(file, geo);
  };

  const clear = () => {
    setPreview(null);
    setGeoTag('');
    onPhotoChange(null, '');
    if (inputRef.current) inputRef.current.value = '';
  };

  const showImage = preview || savedUrl;

  return (
    <div className="fault-photo-box">
      {hint && <p className="fault-hint"><span>📷</span> {hint}</p>}
      {showImage ? (
        <div className="fault-preview-wrap">
          <img src={preview || savedUrl || ''} alt={`hallazgo-${itemKey}`} className="fault-preview" />
          {geoTag && (
            <div className="fault-geo">
              <MapPin size={12} /> {geoTag}
            </div>
          )}
          {uploading && (
            <p className="fault-upload-status fault-upload-status--pending">
              <Loader2 size={14} className="spin" /> Guardando foto…
            </p>
          )}
          {!uploading && savedUrl && (
            <p className="fault-upload-status fault-upload-status--ok">
              <CheckCircle size={14} /> Foto guardada
            </p>
          )}
          {uploadError && (
            <p className="fault-upload-status fault-upload-status--err">{uploadError}</p>
          )}
          <button type="button" className="fault-clear" onClick={clear} disabled={uploading}>
            <XCircle size={16} /> Cambiar foto
          </button>
        </div>
      ) : (
        <label className={`fault-upload-btn ${locating ? 'is-busy' : ''}`}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleFile}
            disabled={locating || uploading}
          />
          {locating ? (
            <span>Obteniendo GPS…</span>
          ) : (
            <>
              <Camera size={18} />
              <span>Tomar foto del hallazgo</span>
              <span className="fault-required">Obligatorio</span>
            </>
          )}
        </label>
      )}
    </div>
  );
}
