import type { Metadata, Viewport } from 'next';
import { APP_NAME, APP_VERSION, PRODUCTION_ORIGIN } from '@/lib/version';
import PwaRegister from '@/components/PwaRegister';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_ORIGIN),
  title: `${APP_NAME} v${APP_VERSION}`,
  description: 'Inspección técnica de camionetas en terreno',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
  applicationName: APP_NAME,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: APP_NAME,
  },
  icons: {
    icon: [
      { url: '/branding/logo-circular.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/branding/logo-circular.svg', type: 'image/svg+xml' }],
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
  themeColor: '#142275',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
