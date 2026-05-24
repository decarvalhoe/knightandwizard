export const KW_THEME_COOKIE = 'kw-theme';
export const KW_THEME_STORAGE_KEY = 'kw-theme';

export const KW_SKINS = [
  'grimoire',
  'registre',
  'tripot',
  'archives',
  'bibliotheque',
  'gazette',
  'armorial',
  'moderne'
] as const;

export type KwSkin = (typeof KW_SKINS)[number];
export type KwThemePreference = 'day' | 'night';

export type SurfaceNavItem = {
  href: string;
  label: string;
  skin: KwSkin;
  shortLabel: string;
};

export const surfaceNavItems: readonly SurfaceNavItem[] = [
  { href: '/', label: 'Dashboard', shortLabel: 'Poste', skin: 'gazette' },
  { href: '/character', label: 'Personnage', shortLabel: 'Fiche', skin: 'armorial' },
  { href: '/character/create', label: 'Creation', shortLabel: 'Creer', skin: 'armorial' },
  { href: '/bestiaire', label: 'Bestiaire', shortLabel: 'Betes', skin: 'armorial' },
  { href: '/combat', label: 'Combat', shortLabel: 'DT', skin: 'registre' },
  { href: '/session', label: 'Session', shortLabel: 'Journal', skin: 'gazette' },
  { href: '/grimoire', label: 'Grimoire', shortLabel: 'Sorts', skin: 'grimoire' },
  { href: '/dice', label: 'Des', shortLabel: 'D10', skin: 'tripot' },
  { href: '/rules', label: 'Archives', shortLabel: 'D1-D13', skin: 'archives' },
  { href: '/bibliotheque', label: 'Bibliotheque', shortLabel: 'CMS', skin: 'bibliotheque' },
  { href: '/design-proto', label: 'Lab', shortLabel: 'Skin', skin: 'moderne' }
] as const;

export const routeSkins: readonly [prefix: string, skin: KwSkin][] = [
  ['/design-proto/registre', 'registre'],
  ['/design-proto/fiche', 'armorial'],
  ['/character/create', 'armorial'],
  ['/character', 'armorial'],
  ['/bestiaire', 'armorial'],
  ['/combat', 'registre'],
  ['/session', 'gazette'],
  ['/grimoire', 'grimoire'],
  ['/dice', 'tripot'],
  ['/rules', 'archives'],
  ['/bibliotheque', 'bibliotheque'],
  ['/design-proto', 'moderne']
] as const;

export function resolveSkinForPath(pathname: string | null | undefined): KwSkin {
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname === '/') return 'gazette';

  const match = routeSkins.find(
    ([prefix]) => normalizedPathname === prefix || normalizedPathname.startsWith(prefix + '/')
  );

  return match?.[1] ?? 'gazette';
}

export function resolveThemePreference(value: string | null | undefined): KwThemePreference {
  return value === 'night' ? 'night' : 'day';
}

function normalizePathname(pathname: string | null | undefined): string {
  if (!pathname) return '/';

  const [withoutQuery] = pathname.split(/[?#]/, 1);
  const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : '/' + withoutQuery;
  return withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/$/, '') : withLeadingSlash;
}

export const SKIN_BOOTSTRAP_SCRIPT =
  '(() => {' +
  'const routeSkins=' +
  JSON.stringify(routeSkins) +
  ';' +
  'const pathname=window.location.pathname || "/";' +
  'let skin="gazette";' +
  'for (const [prefix,value] of routeSkins) {' +
  'if (pathname===prefix || pathname.startsWith(prefix + "/")) { skin=value; break; }' +
  '}' +
  'document.documentElement.dataset.skin=skin;' +
  '})();';
