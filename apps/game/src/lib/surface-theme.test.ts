import { describe, expect, it } from 'vitest';

import {
  KW_SKINS,
  resolveSkinForPath,
  resolveThemePreference,
  surfaceNavItems
} from './surface-theme';

describe('surface theme contract', () => {
  it('maps the product routes to their in-world skins', () => {
    expect(resolveSkinForPath('/')).toBe('gazette');
    expect(resolveSkinForPath('/mj')).toBe('gazette');
    expect(resolveSkinForPath('/atouts')).toBe('armorial');
    expect(resolveSkinForPath('/character')).toBe('armorial');
    expect(resolveSkinForPath('/character/create')).toBe('armorial');
    expect(resolveSkinForPath('/bestiaire')).toBe('armorial');
    expect(resolveSkinForPath('/combat')).toBe('registre');
    expect(resolveSkinForPath('/session')).toBe('gazette');
    expect(resolveSkinForPath('/grimoire')).toBe('grimoire');
    expect(resolveSkinForPath('/dice')).toBe('tripot');
    expect(resolveSkinForPath('/rules')).toBe('archives');
    expect(resolveSkinForPath('/greffe')).toBe('archives');
    expect(resolveSkinForPath('/bibliotheque')).toBe('bibliotheque');
    expect(resolveSkinForPath('/cartulaire')).toBe('armorial');
    expect(resolveSkinForPath('/design-proto')).toBe('moderne');
  });

  it('exposes the greffe surface in navigation', () => {
    expect(surfaceNavItems).toContainEqual({
      href: '/greffe',
      label: 'Greffe',
      shortLabel: 'Greffe',
      skin: 'archives'
    });
  });

  it('exposes the GM cockpit in the surface navigation', () => {
    expect(surfaceNavItems).toContainEqual({
      href: '/mj',
      label: 'Cockpit MJ',
      shortLabel: 'MJ',
      skin: 'gazette'
    });
  });

  it('keeps navigation coverage for every emitted skin', () => {
    const navSkins = new Set(surfaceNavItems.map((item) => item.skin));

    expect(navSkins).toEqual(new Set(KW_SKINS));
  });

  it('exposes the atouts carnet in the surface navigation', () => {
    expect(surfaceNavItems).toContainEqual({
      href: '/atouts',
      label: 'Atouts',
      shortLabel: 'Atouts',
      skin: 'armorial'
    });
  });

  it('exposes the bestiaire as an armorial surface in primary navigation', () => {
    expect(surfaceNavItems).toContainEqual({
      href: '/bestiaire',
      label: 'Bestiaire',
      shortLabel: 'Bêtes',
      skin: 'armorial'
    });
  });

  it('normalizes the persisted Jour/Veillée preference', () => {
    expect(resolveThemePreference('night')).toBe('night');
    expect(resolveThemePreference('day')).toBe('day');
    expect(resolveThemePreference(undefined)).toBe('day');
    expect(resolveThemePreference('bogus')).toBe('day');
  });
});
