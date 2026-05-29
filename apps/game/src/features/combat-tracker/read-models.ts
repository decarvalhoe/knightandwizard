import { toCombatant, type Character, type CombatState } from '@knightandwizard/rules-core';

import { getApiBaseUrl, getCatalogDocument } from '../../lib/catalogs';
import type { PersistedSessionSnapshot } from '../session-manager/session-api';

import { createCombatTrackerState, type CombatantTemplate } from './model';

interface BestiaryCatalogDocument {
  creatures?: Array<{ id?: string; name?: string; status?: string }>;
}

interface WeaponCatalogEntry {
  damage_formula?: string;
  difficulty?: number;
  id?: string;
  name?: string;
  status?: string;
}

interface WeaponsCatalogDocument {
  weapons?: WeaponCatalogEntry[];
}

export interface CombatTrackerReadModel {
  combatantTemplates: CombatantTemplate[];
  initialState: CombatState;
  sessionSlug: string;
}

export interface CombatTrackerReadModelOptions {
  characterId?: string;
  sessionSlug?: string;
}

export async function getCombatTrackerReadModel(
  options: CombatTrackerReadModelOptions = {}
): Promise<CombatTrackerReadModel> {
  const sessionSlug = options.sessionSlug ?? 'brumeval';
  const [bestiary, weapons, session, character] = await Promise.all([
    getCatalogDocument<BestiaryCatalogDocument>('bestiaire.yaml'),
    getCatalogDocument<WeaponsCatalogDocument>('armes.yaml'),
    options.sessionSlug ? getPersistedSessionSnapshot(sessionSlug) : null,
    options.characterId ? getPersistedCharacterSnapshot(options.characterId) : null
  ]);
  const combatantTemplates = buildCombatantTemplates(bestiary, {
    character,
    weapons
  });
  const journalState = latestCombatStateFromSession(session);

  return {
    combatantTemplates,
    initialState:
      journalState ??
      createCombatTrackerState({
        combatants: combatantTemplates.slice(0, 3),
        currentDT: 1
      }),
    sessionSlug
  };
}

export function buildCombatantTemplates(
  bestiary: BestiaryCatalogDocument,
  options: { character?: Character | null; weapons?: WeaponsCatalogDocument } = {}
): CombatantTemplate[] {
  const skeletonName =
    bestiary.creatures?.find((creature) => creature.id === 'squelette')?.name ?? 'Squelette';
  const characterCombatant = options.character
    ? [toPlayerCombatantTemplate(options.character, options.weapons ?? {})]
    : [];
  const demoAveline: CombatantTemplate[] = options.character
    ? []
    : [
        {
          attributes: { dexterity: 5, stamina: 4, strength: 4 },
          id: 'aveline',
          name: 'Aveline',
          nextActionAt: 6,
          pendingAction: {
            attack: { difficulty: 7, pool: 7 },
            damageOnHit: 3,
            targetId: 'brigand',
            type: 'attack'
          },
          reflexes: 4,
          skills: { 'epee-batarde': 3, bouclier: 2 },
          sourceLabel: 'Démo',
          speedFactor: 5,
          statuses: [],
          vitality: { current: 24, max: 24 }
        }
      ];

  return [
    ...characterCombatant,
    ...demoAveline,
    {
      attributes: { dexterity: 4, stamina: 4, strength: 5 },
      id: 'brigand',
      name: 'Brigand',
      nextActionAt: 8,
      reflexes: 3,
      skills: { hache: 2, esquive: 2 },
      sourceLabel: 'PNJ',
      speedFactor: 7,
      statuses: [{ id: 'bleeding', durationDT: 10 }],
      vitality: { current: 13, max: 18 }
    },
    {
      attributes: { dexterity: 3, stamina: 3, strength: 2 },
      id: 'mire',
      name: 'Mire',
      nextActionAt: 12,
      pendingAction: { costDT: 8, type: 'spell' },
      reflexes: 2,
      skills: { arcana: 4, rituals: 2 },
      sourceLabel: 'PNJ',
      speedFactor: 8,
      statuses: [],
      vitality: { current: 16, max: 16 }
    },
    {
      attributes: { dexterity: 2, stamina: 6, strength: 5 },
      id: 'squelette',
      ignoresVitalityMalus: true,
      name: cleanCreatureName(skeletonName),
      nextActionAt: 0,
      reflexes: 1,
      skills: { claws: 2 },
      sourceLabel: 'Bestiaire',
      speedFactor: 9,
      statuses: [],
      vitality: { current: 10, max: 10 }
    }
  ];
}

function cleanCreatureName(name: string): string {
  return name.replace(/,\s*-.*/, '').trim();
}

function toPlayerCombatantTemplate(
  character: Character,
  weapons: WeaponsCatalogDocument
): CombatantTemplate {
  const combatant = toCombatant(character);
  const equippedWeapons = character.equipment
    .map((item) => weapons.weapons?.find((weapon) => weapon.id === item.id))
    .filter((weapon): weapon is WeaponCatalogEntry => Boolean(weapon?.id && weapon.name));
  const primaryWeapon = equippedWeapons[0];
  const damageOnHit = parseDamageBonus(primaryWeapon?.damage_formula);

  return {
    ...combatant,
    attackDifficulty: primaryWeapon?.difficulty,
    attackSkillId: preferredAttackSkillId(character, primaryWeapon),
    characterId: character.id,
    damageOnHit,
    loadoutLabels: equippedWeapons.map((weapon) => weapon.name as string),
    sourceLabel: 'PJ'
  };
}

async function getPersistedSessionSnapshot(slug: string): Promise<PersistedSessionSnapshot | null> {
  const response = await fetch(`${getApiBaseUrl()}/sessions/${encodeURIComponent(slug)}`, {
    cache: 'no-store'
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Unable to load session ${slug}: HTTP ${response.status}`);
  }

  return (await response.json()) as PersistedSessionSnapshot;
}

async function getPersistedCharacterSnapshot(characterId: string): Promise<Character> {
  const response = await fetch(`${getApiBaseUrl()}/characters/${encodeURIComponent(characterId)}`, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(`Unable to load character ${characterId}: HTTP ${response.status}`);
  }

  const body = (await response.json()) as { character: Character };

  return body.character;
}

function latestCombatStateFromSession(
  session: PersistedSessionSnapshot | null
): CombatState | null {
  const events = session?.events ?? [];

  for (const event of [...events].reverse()) {
    const type = 'eventType' in event ? event.eventType : event.type;

    if (type !== 'combat') {
      continue;
    }

    const state = isRecord(event.payload) ? event.payload.state : undefined;

    if (isCombatState(state)) {
      return state;
    }
  }

  return null;
}

function isCombatState(value: unknown): value is CombatState {
  return (
    isRecord(value) &&
    Array.isArray(value.timeline) &&
    Number.isInteger(value.currentDT) &&
    Number.isInteger(value.round) &&
    Array.isArray(value.log)
  );
}

function preferredAttackSkillId(
  character: Character,
  primaryWeapon: WeaponCatalogEntry | undefined
): string | undefined {
  const equipmentSkill = primaryWeapon?.id
    ? character.skills.find((skill) => skill.id === primaryWeapon.id)
    : undefined;

  return equipmentSkill?.id ?? [...character.skills].sort((a, b) => b.points - a.points)[0]?.id;
}

function parseDamageBonus(formula: string | undefined): number | undefined {
  if (!formula) {
    return undefined;
  }

  const match = formula.match(/F\+(\d+)/);

  return match ? Number.parseInt(match[1]!, 10) : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
