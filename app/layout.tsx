import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aydın ÜNLÜ',
  description: 'Oto tamirhane operasyon yönetimi',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
