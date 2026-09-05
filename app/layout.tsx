import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  applicationName: 'Aydın ÜNLÜ',
  title: 'Aydın ÜNLÜ',
  description: 'Oto tamirhane operasyon yönetimi',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    title: 'Aydın ÜNLÜ',
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
