import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AppShell } from '@/components/app-shell';
import './globals.css';

export const metadata: Metadata = {
  title: 'Knight & Wizard',
  description: 'Compagnon de table digital pour les joueurs et le MJ Knight & Wizard.'
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
