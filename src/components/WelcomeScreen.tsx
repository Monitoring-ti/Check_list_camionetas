import Link from 'next/link';
import { ChevronRight, Radio } from 'lucide-react';
import { APP_VERSION } from '@/lib/version';

export default function WelcomeScreen() {
  return (
    <div className="welcome-shell">
      <div className="welcome-brand">
        <img
          src="/branding/logo-circular.svg"
          alt="Monitoring"
          className="welcome-logo"
        />
        <div className="welcome-brand-text">
          <span className="welcome-brand-name">Monitoring</span>
          <span className="welcome-brand-tag">Gestión de Activos</span>
        </div>
      </div>

      <div className="welcome-hero">
        <h1 className="welcome-title">Inspección de camionetas</h1>
        <div className="welcome-accent" aria-hidden />
        <p className="welcome-subtitle">
          Sistema de gestión de activos y monitoreo preventivo de flota.
        </p>
      </div>

      <div className="welcome-actions">
        <Link href="/check" className="btn btn-action btn-full welcome-cta">
          Comenzar inspección <ChevronRight size={20} />
        </Link>
      </div>

      <footer className="welcome-footer">
        <span className="welcome-version">Versión {APP_VERSION}</span>
        <span className="welcome-sync">
          <Radio size={14} aria-hidden /> Terminal lista
        </span>
      </footer>
    </div>
  );
}
