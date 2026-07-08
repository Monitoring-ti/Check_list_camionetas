'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, User, AlertTriangle, ChevronRight } from 'lucide-react';
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

export default function AccessGate() {
  const router = useRouter();
  const [rut, setRut] = useState('');
  const [patente, setPatente] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rutOk = isValidRut(rut);
  const patenteOk = isValidPatenteChilena(patente);
  const canSubmit = rutOk && patenteOk && !loading;

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
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div>
            <h1 className="app-title">Check ECF 4</h1>
            <p className="app-subtitle">Inspección de camioneta en terreno</p>
          </div>
        </div>
      </header>

      <main className="step-card access-card">
        <div className="step-card-header">
          <span className="step-card-icon"><User size={22} /></span>
          <h2 className="step-card-title">Identificación</h2>
        </div>

        <form className="step-body" onSubmit={handleSubmit}>
          <p className="access-intro">
            Ingrese su RUT y la patente del vehículo a inspeccionar.
            Solo personal y vehículos registrados pueden continuar.
          </p>

          {error && (
            <div className="page-alert page-alert--error">
              <AlertTriangle size={20} />
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="rut">RUT del responsable</label>
            <input
              id="rut"
              type="text"
              inputMode="text"
              autoComplete="off"
              placeholder="12.345.678-9"
              value={rut}
              onChange={(e) => setRut(formatRutInput(e.target.value))}
              className={rut && !rutOk ? 'is-invalid' : ''}
              required
            />
            {rut && !rutOk && (
              <span className="invalid-feedback">RUT inválido</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="patente">
              <Truck size={16} /> Patente del vehículo
            </label>
            <input
              id="patente"
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="ABCD-12 o AB-1234"
              value={patente}
              onChange={(e) => setPatente(formatPatenteDisplay(e.target.value))}
              className={patente && !patenteOk ? 'is-invalid' : ''}
              required
            />
            {patente && !patenteOk && (
              <span className="invalid-feedback">
                Formato chileno: AB-1234 (antiguo) o ABCD-12 (nuevo)
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={!canSubmit}>
            {loading ? 'Validando…' : <>Continuar a inspección <ChevronRight size={18} /></>}
          </button>
        </form>
      </main>

      <style jsx>{`
        .access-card { margin-top: -1.5rem; position: relative; z-index: 2; }
        .access-intro { font-size: 0.9rem; color: var(--text-muted); line-height: 1.5; }
        .btn-full { width: 100%; margin-top: 0.5rem; }
      `}</style>
    </div>
  );
}
