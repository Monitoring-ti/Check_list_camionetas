import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Check ECF 4 — Monitoring',
  description: 'Inspección técnica de camionetas en terreno',
  applicationName: 'Check ECF 4',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Check ECF 4',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1A418C',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
