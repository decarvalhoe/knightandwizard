'use client';

import { BookOpen, Dices, Minus, PackagePlus, Shield, Sparkles, UserCog } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

import {
  calculateLevelProgression,
  type AttributeKey,
  type Character
} from '@knightandwizard/rules-core';

import {
  addInventoryItem,
  buildCharacterSheetView,
  removeInventoryItem,
  rollAttributeCheck,
  skillTreeRows,
  socialAttributeKeys,
  type AttributeRollResult,
  type CharacterSheetMode,
  type InventoryItem,
  type SpellEntry
} from './model';
import { attributeLabels, attributeOrder, skillCatalog, skillLabels } from './sample';

interface CharacterSheetProps {
  character: Character;
  initialInventory: InventoryItem[];
  spells: SpellEntry[];
}

const modes: Array<{ id: CharacterSheetMode; label: string }> = [
  { id: 'complete', label: 'Complet' },
  { id: 'combat', label: 'Combat' },
  { id: 'social', label: 'Social' },
  { id: 'gm', label: 'MJ' }
];

const modeIcons: Record<CharacterSheetMode, typeof BookOpen> = {
  combat: Shield,
  complete: BookOpen,
  gm: UserCog,
  social: Sparkles
};

const quickItem: InventoryItem = {
  category: 'gear',
  id: 'torch',
  name: 'Torche',
  quantity: 1,
  weightKg: 0.4
};

export function CharacterSheet({
  character,
  initialInventory,
  spells
}: Readonly<CharacterSheetProps>) {
  const [mode, setMode] = useState<CharacterSheetMode>('complete');
  const [inventory, setInventory] = useState(initialInventory);
  const [lastRoll, setLastRoll] = useState<AttributeRollResult | null>(null);
  const view = useMemo(
    () => buildCharacterSheetView({ character, inventory, mode, spells }),
    [character, inventory, mode, spells]
  );
  const level = calculateLevelProgression(character);
  const attributeTotal = attributeOrder.reduce(
    (total, key) => total + character.attributes[key],
    0
  );
  const skillTotal = character.skills.reduce((total, skill) => total + skill.points, 0);
  const skills = skillTreeRows(character.skills, skillCatalog);
  const trainedSkillCount = skills.filter((skill) => !skill.isImplicitZero).length;

  function roll(attribute: AttributeKey) {
    setLastRoll(
      rollAttributeCheck(character, attribute, 7, (sides) => Math.floor(Math.random() * sides) + 1)
    );
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-wine">Fiche PJ</p>
            <h1 className="mt-1 text-3xl font-semibold text-ink">{character.name}</h1>
            <p className="mt-2 text-sm text-ink/62">
              {character.race.name} · {character.orientation.name} · {character.classProfile.name}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-1 rounded-md bg-vellum/70 p-1">
            {modes.map((item) => {
              const Icon = modeIcons[item.id];
              const active = item.id === mode;

              return (
                <button
                  className={[
                    'flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition',
                    active
                      ? 'bg-ink text-paper shadow-sm'
                      : 'text-ink/66 hover:bg-paper hover:text-ink'
                  ].join(' ')}
                  key={item.id}
                  onClick={() => setMode(item.id)}
                  type="button"
                >
                  <Icon aria-hidden="true" className="size-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Resource
            label="Vitalité"
            value={character.vitality.current}
            max={character.vitality.max}
          />
          <Resource label="Énergie" value={character.energy.current} max={character.energy.max} />
          <Metric label="Facteur vitesse" value={character.speedFactor} />
          <Metric label="Facteur volonté" value={character.willFactor} />
        </div>
      </section>

      {mode === 'complete' && (
        <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-ink">9 aptitudes</h2>
                <p className="text-sm text-ink/58">
                  Total création {attributeTotal}/{character.race.category}
                </p>
              </div>
              {lastRoll && (
                <div className="rounded-md bg-forest px-3 py-2 text-right text-paper">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-paper/70">
                    Dernier jet
                  </p>
                  <p className="font-mono text-sm">
                    {attributeLabels[lastRoll.attribute]} · {lastRoll.successes} succès
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {attributeOrder.map((attribute) => (
                <button
                  className="rounded-md border border-ink/10 bg-paper p-4 text-left shadow-sm transition hover:border-wine/30 hover:bg-vellum"
                  key={attribute}
                  onClick={() => roll(attribute)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-ink">
                      {attributeLabels[attribute]}
                    </span>
                    <Dices aria-hidden="true" className="size-4 text-wine" />
                  </div>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <span className="text-3xl font-semibold text-ink">
                      {view.attributes[attribute]}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-[0.12em] text-ink/50">
                      base {character.attributes[attribute]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-ink">Compétences</h2>
                <p className="text-sm text-ink/58">
                  Points {skillTotal}/{character.race.category}
                </p>
                <p className="mt-1 text-sm text-ink/58">
                  Catalogue implicite : {skills.length} entrées, {trainedSkillCount} notées sur la
                  fiche.
                </p>
                {character.orientation.isMagical && (
                  <p className="mt-1 text-sm text-wine">
                    Magicien : pas de compétence primaire mécanique, les sorts comptent double en
                    progression.
                  </p>
                )}
              </div>
              <span className="rounded-md bg-gold px-3 py-2 text-sm font-semibold text-ink">
                Niveau {level.level ?? 'NA'}
              </span>
            </div>
            <div className="mt-4 grid gap-3">
              {skills.map((skill) => (
                <div
                  className={[
                    'grid grid-cols-[1fr_auto] items-center gap-3 rounded-md bg-paper p-3',
                    skill.isImplicitZero ? 'opacity-70' : ''
                  ].join(' ')}
                  key={skill.id}
                  style={{ marginLeft: `${skill.depth * 1.25}rem` }}
                >
                  <div>
                    <p className="font-semibold text-ink">
                      {skill.depth > 0 && <span className="text-ink/36">└ </span>}
                      {skill.label ?? skillLabels[skill.id] ?? skill.id}
                    </p>
                    <p className="text-sm text-ink/56">
                      {skill.isImplicitZero
                        ? skill.parentId
                          ? 'Spécialisation implicite à 0'
                          : 'Compétence implicite à 0'
                        : skill.isMain
                          ? 'Compétence primaire'
                          : skill.isInheritedPrimary
                            ? 'Spécialisation héritée primaire'
                            : skill.implicitParentId
                              ? `Spécialisation, parent implicite à 0 (${skill.implicitParentId})`
                              : skill.parentId
                                ? 'Spécialisation'
                                : 'Compétence'}
                    </p>
                  </div>
                  <span className="rounded-md bg-ink px-3 py-2 font-mono text-sm font-semibold text-paper">
                    {skill.points} {skill.points > 1 ? 'pts' : 'pt'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {mode === 'combat' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Armes équipées">
            {view.equippedWeapons.map((item) => (
              <InventoryRow
                item={item}
                key={item.id}
                onRemove={() => setInventory(removeInventoryItem(inventory, item.id))}
              />
            ))}
          </Panel>
          <Panel title="Sorts actifs">
            {spells
              .filter((spell) => spell.active)
              .map((spell) => (
                <div className="rounded-md bg-paper p-3" key={spell.id}>
                  <p className="font-semibold text-ink">{spell.name}</p>
                  <p className="text-sm text-ink/58">{spell.points} point de sort</p>
                </div>
              ))}
          </Panel>
        </div>
      )}

      {mode === 'social' && (
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Panel title="Attributs sociaux">
            <div className="grid gap-3 sm:grid-cols-3">
              {socialAttributeKeys.map((attribute) => (
                <button
                  className="rounded-md bg-paper p-4 text-left"
                  key={attribute}
                  onClick={() => roll(attribute)}
                  type="button"
                >
                  <p className="text-sm font-semibold text-ink/64">{attributeLabels[attribute]}</p>
                  <p className="mt-2 text-3xl font-semibold text-ink">
                    {view.attributes[attribute]}
                  </p>
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="Réputation et relations">
            <p className="rounded-md bg-paper p-3 text-sm leading-6 text-ink/72">
              {String(character.metadata.reputation)}
            </p>
            <p className="rounded-md bg-paper p-3 text-sm leading-6 text-ink/72">
              Divinité : {String(character.metadata.deity)}
            </p>
            <p className="rounded-md bg-paper p-3 text-sm leading-6 text-ink/72">
              Citation : {String(character.metadata.quote)}
            </p>
          </Panel>
        </div>
      )}

      {mode === 'gm' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Panel title="Audit complet">
            {view.sections.map((section) => (
              <div
                className="rounded-md bg-paper p-3 text-sm font-medium text-ink"
                key={section.id}
              >
                {section.label}
              </div>
            ))}
          </Panel>
          <Panel title="Notes privées MJ">
            <p className="rounded-md bg-paper p-3 text-sm leading-6 text-ink/72">
              {String(character.metadata.gmNotes)}
            </p>
          </Panel>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <Panel
          action={
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-md bg-forest px-3 text-sm font-semibold text-paper"
              onClick={() => setInventory(addInventoryItem(inventory, quickItem))}
              type="button"
            >
              <PackagePlus aria-hidden="true" className="size-4" />
              Torche
            </button>
          }
          title="Inventaire"
        >
          <p className="text-sm text-ink/58">Charge {view.carriedWeightKg} kg</p>
          {inventory.map((item) => (
            <InventoryRow
              item={item}
              key={item.id}
              onRemove={() => setInventory(removeInventoryItem(inventory, item.id))}
            />
          ))}
        </Panel>

        <Panel title="Grimoire">
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Sorts" value={view.spellSummary.knownSpells} />
            <Metric label="Points" value={view.spellSummary.pointsCommitted} />
            <Metric label="Énergie" value={view.spellSummary.energyAvailable} />
          </div>
          {spells.map((spell) => (
            <div className="rounded-md bg-paper p-3" key={spell.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-ink">{spell.name}</p>
                <span className="rounded-md bg-vellum px-2 py-1 text-xs font-semibold text-ink">
                  {spell.points} pt
                </span>
              </div>
              <p className="mt-1 text-sm text-ink/58">{spell.active ? 'Actif' : 'Disponible'}</p>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  action,
  children,
  title
}: Readonly<{ action?: ReactNode; children: ReactNode; title: string }>) {
  return (
    <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
        {action}
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

function Resource({ label, max, value }: Readonly<{ label: string; max: number; value: number }>) {
  const percent = max === 0 ? 0 : Math.round((value / max) * 100);

  return (
    <div className="rounded-md bg-vellum/70 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink/58">{label}</p>
        <p className="font-mono text-sm font-semibold text-ink">
          {value}/{max}
        </p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-ink/10">
        <div className="h-2 rounded-full bg-wine" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: number | string }>) {
  return (
    <div className="rounded-md bg-vellum/70 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/52">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function InventoryRow({ item, onRemove }: Readonly<{ item: InventoryItem; onRemove: () => void }>) {
  return (
    <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-md bg-paper p-3">
      <div>
        <p className="font-semibold text-ink">{item.name}</p>
        <p className="text-sm text-ink/56">
          {item.equipped ? 'Équipé' : item.category} · {item.weightKg ?? 0} kg
        </p>
      </div>
      <span className="font-mono text-sm font-semibold text-ink">x{item.quantity}</span>
      <button
        aria-label={`Retirer ${item.name}`}
        className="grid size-9 place-items-center rounded-md bg-vellum text-ink transition hover:bg-wine hover:text-paper"
        onClick={onRemove}
        type="button"
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
