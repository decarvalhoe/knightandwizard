'use client';

import {
  BookOpen,
  BookUser,
  Dices,
  FileArchive,
  LayoutDashboard,
  LibraryBig,
  Map,
  Moon,
  PenLine,
  ScrollText,
  Sun,
  Swords,
  WandSparkles,
  type LucideIcon
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLayoutEffect, useState, type ReactNode } from 'react';

import {
  KW_THEME_COOKIE,
  KW_THEME_STORAGE_KEY,
  resolveSkinForPath,
  surfaceNavItems,
  type KwSkin,
  type KwThemePreference
} from '@/lib/surface-theme';

const THEME_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

const navIcons: Record<string, LucideIcon> = {
  '/': LayoutDashboard,
  '/character': BookUser,
  '/character/create': PenLine,
  '/combat': Swords,
  '/session': ScrollText,
  '/grimoire': WandSparkles,
  '/dice': Dices,
  '/rules': FileArchive,
  '/bibliotheque': LibraryBig,
  '/cartulaire': Map,
  '/design-proto': BookOpen
};

export function AppShell({
  children,
  initialSkin,
  initialTheme
}: Readonly<{
  children: ReactNode;
  initialSkin: KwSkin;
  initialTheme: KwThemePreference;
}>) {
  const pathname = usePathname();
  const activeHref = resolveActiveHref(pathname);
  const skin = resolveSkinForPath(pathname);
  const [theme, setTheme] = useState<KwThemePreference>(initialTheme);

  useLayoutEffect(() => {
    document.documentElement.dataset.skin = skin;
  }, [skin]);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const nextTheme = theme === 'night' ? 'day' : 'night';
  const ThemeIcon = theme === 'night' ? Moon : Sun;

  return (
    <div className="app-shell" data-shell-skin={initialSkin}>
      <header className="app-shell__header">
        <div className="app-shell__bar">
          <Link className="app-shell__brand" href="/">
            <span aria-hidden="true" className="app-shell__brand-mark">
              K&W
            </span>
            <span>
              <span className="app-shell__brand-title">Knight & Wizard</span>
              <span className="app-shell__brand-subtitle">Table Companion</span>
            </span>
          </Link>

          <button
            aria-label={nextTheme === 'night' ? 'Passer en mode Veillee' : 'Passer en mode Jour'}
            className="app-shell__theme-button"
            onClick={() => setTheme(nextTheme)}
            title={nextTheme === 'night' ? 'Passer en mode Veillee' : 'Passer en mode Jour'}
            type="button"
          >
            <ThemeIcon aria-hidden="true" className="app-shell__theme-icon" />
            <span>{theme === 'night' ? 'Veillee' : 'Jour'}</span>
          </button>
        </div>

        <nav aria-label="Navigation principale" className="app-shell__nav">
          {surfaceNavItems.map((item) => {
            const Icon = navIcons[item.href] ?? BookOpen;
            const active = item.href === activeHref;

            return (
              <Link
                aria-current={active ? 'page' : undefined}
                className="app-shell__nav-link"
                href={item.href}
                key={item.href}
                title={item.label}
              >
                <Icon aria-hidden="true" className="app-shell__nav-icon" />
                <span className="app-shell__nav-label">{item.label}</span>
                <span className="app-shell__nav-short">{item.shortLabel}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="app-shell__main">{children}</main>
    </div>
  );
}

function resolveActiveHref(pathname: string): string {
  const candidates = surfaceNavItems
    .map((item) => item.href)
    .filter((href) => pathname === href || (href !== '/' && pathname.startsWith(href + '/')))
    .sort((left, right) => right.length - left.length);

  return candidates[0] ?? '/';
}

function applyTheme(theme: KwThemePreference): void {
  if (theme === 'night') {
    document.documentElement.dataset.theme = 'night';
  } else {
    document.documentElement.removeAttribute('data-theme');
  }

  document.cookie =
    KW_THEME_COOKIE + '=' + theme + '; path=/; max-age=' + THEME_MAX_AGE_SECONDS + '; samesite=lax';
  window.localStorage.setItem(KW_THEME_STORAGE_KEY, theme);
}
