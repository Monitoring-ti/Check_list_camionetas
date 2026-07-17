import type { ReactNode } from 'react';
import Link from 'next/link';
import AppVersion from '@/components/AppVersion';

interface AppHeaderProps {
  subtitle?: string;
  badge?: ReactNode;
  /** Compact light bar for inspection flow (Stitch) */
  variant?: 'hero' | 'bar';
  meta?: ReactNode;
}

export default function AppHeader({
  subtitle,
  badge,
  variant = 'hero',
  meta,
}: AppHeaderProps) {
  if (variant === 'bar') {
    return (
      <header className="insp-topbar">
        <div className="insp-topbar-row">
          <div className="insp-topbar-left">
            <img src="/branding/logo-circular.svg" alt="" className="insp-topbar-logo" />
            <div className="insp-topbar-text">
              <strong>Monitoring</strong>
              {subtitle ? <span>{subtitle}</span> : null}
            </div>
          </div>
          <div className="insp-topbar-right">
            {badge}
            <Link href="/check" className="insp-exit">Salir</Link>
          </div>
        </div>
        {meta ? <div className="insp-topbar-meta">{meta}</div> : null}
      </header>
    );
  }

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="app-header-brand">
          <img
            src="/branding/logo-banner.svg"
            alt="Monitoring — Gestión de Activos"
            className="app-logo-banner"
          />
          {subtitle ? <p className="app-subtitle">{subtitle}</p> : null}
        </div>
        <div className="app-header-badges">
          <AppVersion />
          {badge}
        </div>
      </div>
    </header>
  );
}
