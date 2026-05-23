import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AppShell } from '@/components/app-shell';
import './globals.css';
import '@knightandwizard/ui/styles.css';

export const metadata: Metadata = {
  title: 'Knight & Wizard',
  description: 'Compagnon de table digital pour les joueurs et le MJ Knight & Wizard.'
};

// Polices des skins du design system (pack Terres Oubliées + pack moderne).
const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@400;700;900&family=Bitter:ital,wght@0,400;0,700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Cormorant+SC:wght@400;600&family=Courier+Prime&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Mono&family=Inter:wght@400;500;600;700&family=Libre+Caslon+Display&family=Playfair+Display:wght@400;700;900&family=PT+Serif:ital,wght@0,400;0,700;1,400&family=Source+Serif+4:wght@400;600&family=Special+Elite&display=swap';

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONTS_HREF} rel="stylesheet" />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
