'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Truck, AlertTriangle, ChevronRight, ChevronLeft, IdCard } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatRutInput, isValidRut, normalizeRut } from '@/lib/rut';
import {
  formatPatenteDisplay,
  isValidPatenteChilena,
  normalizePatente,
} from '@/lib/patente';
import {
  saveCheckSession,
  type ValidateAccessResponse,
} from '@/lib/checkSession';
import { APP_VERSION } from '@/lib/version';

export default function AccessGate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rut, setRut] = useState('');
  const [patente, setPatente] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rutInputRef = useRef<HTMLInputElement>(null);

  const rutOk = isValidRut(rut);
  const patenteOk = isValidPatenteChilena(patente);
  const canSubmit = rutOk && patenteOk && !loading;

  useEffect(() => {
    const p = searchParams?.get('patente');
    if (p) {
      setPatente(formatPatenteDisplay(p));
      setTimeout(() => rutInputRef.current?.focus(), 150);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError(null);

    const { data, error: rpcError } = await supabase.rpc('check_validate_access', {
      p_rut: normalizeRut(rut),
      p_patente: normalizePatente(patente),
    });

    if (rpcError) {
      setError('Error de conexión. Intente nuevamente.');
      setLoading(false);
      return;
    }

    const res = data as ValidateAccessResponse;

    if (!res.ok || !res.session_token || !res.trabajador || !res.vehiculo) {
      setError(res.error ?? 'Acceso denegado');
      setLoading(false);
      return;
    }

    saveCheckSession({
      sessionToken: res.session_token,
      expiresAt: res.expires_at!,
      trabajador: res.trabajador,
      vehiculo: res.vehiculo,
    });

    router.push('/check/inspeccion');
  }

  return (
    <div className="id-shell">
      <header className="id-topbar">
        <Link href="/" className="id-back" aria-label="Volver al inicio">
          <ChevronLeft size={22} />
        </Link>
        <div className="id-topbar-brand">
          <img src="/branding/logo-circular.svg" alt="" className="id-topbar-logo" />
          <span>Monitoring</span>
        </div>
        <span className="id-topbar-ver">v{APP_VERSION}</span>
      </header>

      <main className="id-main">
        <div className="id-hero">
          <h1 className="id-title">Identificar activo</h1>
          <p className="id-lead">
            Ingrese RUT del responsable y patente de la unidad para iniciar la inspección de campo.
          </p>
        </div>

        <form className="id-form" onSubmit={handleSubmit}>
          {error && (
            <div className="page-alert page-alert--error">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          <div className="id-field-card">
            <div className="id-field-icon id-field-icon--rut">
              <IdCard size={22} />
            </div>
            <div className="id-field-body">
              <label className="form-label" htmlFor="rut">RUT del responsable</label>
              <input
                id="rut"
                ref={rutInputRef}
                type="text"
                inputMode="text"
                enterKeyHint="next"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="12.345.678-9 o …-K"
                value={rut}
                onChange={(e) => setRut(formatRutInput(e.target.value))}
                className={rut && !rutOk ? 'is-invalid' : ''}
                required
              />
              {rut && !rutOk ? (
                <span className="invalid-feedback">RUT inválido (revise el dígito verificador, puede ser K)</span>
              ) : (
                <span className="id-hint">Debe estar registrado como trabajador activo. El DV puede ser 0–9 o K.</span>
              )}
            </div>
          </div>

          <div className="id-field-card">
            <div className="id-field-icon id-field-icon--plate">
              <Truck size={22} />
            </div>
            <div className="id-field-body">
              <label className="form-label" htmlFor="patente">Patente del vehículo</label>
              <input
                id="patente"
                type="text"
                inputMode="text"
                enterKeyHint="go"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="off"
                placeholder="EJ: ABCD-12"
                value={patente}
                onChange={(e) => setPatente(formatPatenteDisplay(e.target.value))}
                className={patente && !patenteOk ? 'is-invalid' : ''}
                required
              />
              {patente && !patenteOk ? (
                <span className="invalid-feedback">
                  Formato chileno: AB-1234 o ABCD-12
                </span>
              ) : (
                <span className="id-hint">Código alfanumérico visible en la placa.</span>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-action btn-full id-submit" disabled={!canSubmit}>
            {loading ? 'Validando…' : <>Continuar <ChevronRight size={20} /></>}
          </button>
        </form>
      </main>
    </div>
  );
}
