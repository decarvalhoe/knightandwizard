'use client';

import { BookUser, LayoutDashboard, ScrollText, Swords } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/character', label: 'Personnage', icon: BookUser },
  { href: '/combat', label: 'Combat', icon: Swords },
  { href: '/session', label: 'Session', icon: ScrollText }
];

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
      <header className="sticky top-3 z-20 rounded-md border border-ink/10 bg-paper/92 p-2 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Link className="flex items-center gap-3 px-2 py-1" href="/">
            <span className="grid size-10 place-items-center rounded-md bg-forest font-serif text-lg font-bold text-paper">
              K&W
            </span>
            <span>
              <span className="block text-base font-semibold text-ink">Knight & Wizard</span>
              <span className="block text-xs font-medium uppercase tracking-[0.16em] text-ink/54">
                Table Companion
              </span>
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="grid grid-cols-4 gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

              return (
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'flex min-h-11 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-ink text-paper shadow-sm'
                      : 'text-ink/68 hover:bg-vellum hover:text-ink'
                  ].join(' ')}
                  href={item.href}
                  key={item.href}
                >
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 py-6 md:py-8">{children}</main>
    </div>
  );
}
