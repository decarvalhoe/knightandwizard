'use client';

import { BookOpen, Dices, Minus, PackagePlus, Shield, Sparkles, UserCog } from 'lucide-react';
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';

import { type AttributeKey, type Character } from '@knightandwizard/rules-core';
import {
  Badge,
  Button,
  Card,
  Die,
  Label,
  ProgressBar,
  Seal,
  SelectField,
  StatBlock,
  Tabs,
  Toast,
  type ToastTone
} from '@knightandwizard/ui';

import {
  addInventoryItem,
  attributeRollOutcomeLabels,
  buildCharacterSheetView,
  removeInventoryItem,
  rollAttributeCheck,
  skillTreeRows,
  socialAttributeKeys,
  type AttributeRollResult,
  type CharacterSheetMode,
  type EquipmentCatalogEntry,
  type InventoryItem,
  type SkillCatalogEntry,
  type SkillTreeRow,
  type SpellEntry
} from './model';

interface CharacterSheetProps {
  attributeLabels: Record<AttributeKey, string>;
  attributeOrder: AttributeKey[];
  character: Character;
  equipmentCatalog: EquipmentCatalogEntry[];
  initialInventory: InventoryItem[];
  skillCatalog: SkillCatalogEntry[];
  skillLabels: Record<string, string>;
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

export function CharacterSheet({
  attributeLabels,
  attributeOrder,
  character,
  equipmentCatalog,
  initialInventory,
  skillCatalog,
  skillLabels,
  spells
}: Readonly<CharacterSheetProps>) {
  const [mode, setMode] = useState<CharacterSheetMode>('complete');
  const [inventory, setInventory] = useState(initialInventory);
  const [lastRoll, setLastRoll] = useState<AttributeRollResult | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(
    () => equipmentCatalog[0]?.id ?? ''
  );

  function addEquipment(equipmentId: string) {
    const option = equipmentCatalog.find((entry) => entry.id === equipmentId);

    if (!option) {
      return;
    }

    setInventory((current) =>
      addInventoryItem(current, {
        category: option.category,
        id: option.id,
        name: option.name,
        quantity: 1,
        weightKg: option.weightKg
      })
    );
  }
  const view = useMemo(
    () => buildCharacterSheetView({ character, inventory, mode, spells }),
    [character, inventory, mode, spells]
  );
  const attributeTotal = attributeOrder.reduce(
    (total, key) => total + character.attributes[key],
    0
  );
  const skills = skillTreeRows(character.skills, skillCatalog);
  const trainedSkillCount = skills.filter((skill) => !skill.isImplicitZero).length;

  function roll(attribute: AttributeKey) {
    setLastRoll(
      rollAttributeCheck(character, attribute, 7, (sides) => Math.floor(Math.random() * sides) + 1)
    );
  }

  const tabItems = modes.map((item) => {
    const Icon = modeIcons[item.id];

    return {
      id: item.id,
      label: (
        <span className="kw-sheet__tab-label">
          <Icon aria-hidden="true" className="kw-sheet__tab-icon" />
          {item.label}
        </span>
      ),
      panel: item.id === mode ? renderModePanel(item.id) : null
    };
  });

  function renderModePanel(panelMode: CharacterSheetMode): ReactNode {
    switch (panelMode) {
      case 'combat':
        return (
          <div className="kw-sheet__split-grid">
            <SectionCard title="Armes équipées">
              {view.equippedWeapons.map((item) => (
                <InventoryRow
                  item={item}
                  key={item.id}
                  onRemove={() => setInventory((current) => removeInventoryItem(current, item.id))}
                />
              ))}
            </SectionCard>
            <SectionCard title="Sorts actifs">
              {spells
                .filter((spell) => spell.active)
                .map((spell) => (
                  <div className="kw-sheet__spell-row" key={spell.id}>
                    <div>
                      <h3>{spell.name}</h3>
                      <p>{spell.points} point de sort</p>
                    </div>
                    <Badge tone="info">Actif</Badge>
                  </div>
                ))}
            </SectionCard>
          </div>
        );
      case 'social':
        return (
          <div className="kw-sheet__social-grid">
            <SectionCard title="Attributs sociaux">
              <div className="kw-sheet__attribute-grid kw-sheet__attribute-grid--social">
                {socialAttributeKeys.map((attribute) => (
                  <AttributeButton
                    attribute={attribute}
                    baseValue={character.attributes[attribute]}
                    effectiveValue={view.attributes[attribute]}
                    key={attribute}
                    label={attributeLabels[attribute]}
                    onRoll={() => roll(attribute)}
                  />
                ))}
              </div>
            </SectionCard>
            <SectionCard title="Réputation et relations">
              <InfoLine label="Réputation" value={String(character.metadata.reputation)} />
              <InfoLine label="Divinité" value={String(character.metadata.deity)} />
              <InfoLine label="Citation" value={String(character.metadata.quote)} />
            </SectionCard>
          </div>
        );
      case 'gm':
        return (
          <div className="kw-sheet__split-grid">
            <SectionCard title="Audit complet">
              {view.sections.map((section) => (
                <div className="kw-sheet__audit-row" key={section.id}>
                  {section.label}
                </div>
              ))}
            </SectionCard>
            <SectionCard title="Notes privées MJ">
              <InfoLine label="MJ" value={String(character.metadata.gmNotes)} />
            </SectionCard>
          </div>
        );
      case 'complete':
      default:
        return (
          <div className="kw-sheet__complete-grid">
            <SectionCard
              action={
                lastRoll ? (
                  <RollResult attributeLabels={attributeLabels} result={lastRoll} />
                ) : undefined
              }
              title="9 aptitudes"
            >
              <p className="kw-sheet__muted">
                Total création {attributeTotal}/{character.race.category}
              </p>
              <div className="kw-sheet__attribute-grid">
                {attributeOrder.map((attribute) => (
                  <AttributeButton
                    attribute={attribute}
                    baseValue={character.attributes[attribute]}
                    effectiveValue={view.attributes[attribute]}
                    key={attribute}
                    label={attributeLabels[attribute]}
                    onRoll={() => roll(attribute)}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              action={
                <Badge tone="info">
                  Niveau {view.levelProgression.level ?? 'NA'} ·{' '}
                  {view.levelProgression.levelPoints ?? 'NA'} /{' '}
                  {view.levelProgression.levelUpAt ?? 'NA'} points
                </Badge>
              }
              title="Compétences"
            >
              <p className="kw-sheet__muted">
                Points {view.creationBudget.skillPointsSpent}/{view.creationBudget.skillPointLimit}
                {view.creationBudget.convertedSkillPoints > 0 &&
                  ` · ${view.creationBudget.convertedSkillPoints} convertis en sorts`}
              </p>
              <p className="kw-sheet__muted">
                Catalogue implicite : {skills.length} entrées, {trainedSkillCount} notées sur la
                fiche.
              </p>
              {character.orientation.isMagical && (
                <Toast title="Magicien" tone="info">
                  Pas de compétence primaire mécanique, les sorts comptent double en progression.
                </Toast>
              )}
              <SkillTreeRows skills={skills} skillLabels={skillLabels} />
            </SectionCard>
          </div>
        );
    }
  }

  return (
    <div className="kw-sheet">
      <Card className="kw-sheet__hero">
        <div className="kw-sheet__hero-head">
          <div className="kw-sheet__title-lockup">
            <Seal>PJ</Seal>
            <div>
              <Label>Fiche PJ</Label>
              <h1>{character.name}</h1>
              <p>
                {character.race.name} · {character.orientation.name} · {character.classProfile.name}
              </p>
            </div>
          </div>
          <Badge tone="neutral">Skin armorial</Badge>
        </div>

        <div className="kw-sheet__resources" aria-label="Ressources personnage">
          <ProgressBar
            label="Vitalité"
            max={character.vitality.max}
            tone="danger"
            value={character.vitality.current}
          />
          <ProgressBar
            label="Énergie"
            max={character.energy.max}
            tone="info"
            value={character.energy.current}
          />
          <StatBlock
            items={[
              { label: 'Facteur vitesse', value: character.speedFactor },
              { label: 'Facteur volonté', value: character.willFactor }
            ]}
          />
        </div>
      </Card>

      <Tabs
        activeId={mode}
        items={tabItems}
        label="Modes fiche"
        onTabChange={(nextMode) => setMode(nextMode as CharacterSheetMode)}
      />

      <div className="kw-sheet__bottom-grid">
        <SectionCard
          action={
            equipmentCatalog.length > 0 ? (
              <div className="kw-sheet__inventory-tools">
                <SelectField
                  id="equipment-picker"
                  label="Équipement du catalogue"
                  onChange={(event) => setSelectedEquipmentId(event.target.value)}
                  options={equipmentCatalog.map((option) => ({
                    label: option.name,
                    value: option.id
                  }))}
                  value={selectedEquipmentId}
                />
                <Button
                  className="kw-sheet__add-button"
                  onClick={() => addEquipment(selectedEquipmentId)}
                  type="button"
                >
                  <PackagePlus aria-hidden="true" className="kw-sheet__button-icon" />
                  Ajouter
                </Button>
              </div>
            ) : undefined
          }
          title="Inventaire"
        >
          <p className="kw-sheet__muted">Charge {view.carriedWeightKg} kg</p>
          <div className="kw-sheet__row-list">
            {inventory.map((item) => (
              <InventoryRow
                item={item}
                key={item.id}
                onRemove={() => setInventory((current) => removeInventoryItem(current, item.id))}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Grimoire">
          <StatBlock
            items={[
              { label: 'Sorts', value: view.spellSummary.knownSpells },
              { label: 'Points', value: view.spellSummary.pointsCommitted },
              { label: 'Énergie', value: view.spellSummary.energyAvailable }
            ]}
          />
          {character.orientation.isMagical && (
            <InfoLine
              label="Création"
              value={`${view.creationBudget.spellPoints} points de sort = ${view.creationBudget.freeSpellPoints} gratuits + ${view.creationBudget.extraSpellPoints} achetés.`}
            />
          )}
          <div className="kw-sheet__row-list">
            {spells.map((spell) => (
              <div className="kw-sheet__spell-row" key={spell.id}>
                <div>
                  <h3>{spell.name}</h3>
                  <p>{spell.active ? 'Actif' : 'Disponible'}</p>
                </div>
                <Badge tone={spell.active ? 'info' : 'neutral'}>{spell.points} pt</Badge>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function SectionCard({
  action,
  children,
  title
}: Readonly<{ action?: ReactNode; children: ReactNode; title: string }>) {
  return (
    <Card className="kw-sheet__panel">
      <div className="kw-sheet__panel-head">
        <h2>{title}</h2>
        {action ? <div className="kw-sheet__panel-action">{action}</div> : null}
      </div>
      <div className="kw-sheet__panel-body">{children}</div>
    </Card>
  );
}

function AttributeButton({
  baseValue,
  effectiveValue,
  label,
  onRoll
}: Readonly<{
  attribute: AttributeKey;
  baseValue: number;
  effectiveValue: number;
  label: string;
  onRoll: () => void;
}>) {
  return (
    <button className="kw-sheet__attribute-card" onClick={onRoll} type="button">
      <span className="kw-sheet__attribute-name">
        {label}
        <Dices aria-hidden="true" className="kw-sheet__attribute-icon" />
      </span>
      <span className="kw-sheet__attribute-score">
        <Die kind={effectiveValue <= 0 ? 'one' : 'plain'} value={effectiveValue} />
        <span>base {baseValue}</span>
      </span>
    </button>
  );
}

function RollResult({
  attributeLabels,
  result
}: Readonly<{
  attributeLabels: Record<AttributeKey, string>;
  result: AttributeRollResult;
}>) {
  const tone: ToastTone =
    result.pool === 0 || result.isCriticalFailure
      ? 'danger'
      : result.isCriticalSuccess
        ? 'success'
        : 'info';

  return (
    <div className="kw-sheet__roll" data-testid="last-roll">
      <Toast title="Dernier jet" tone={tone}>
        <span>
          {attributeLabels[result.attribute]} · {result.pool}D · DT {result.difficulty} ·{' '}
          {result.successes} succès
        </span>
        {result.rolls.length > 0 ? (
          <span className="kw-sheet__dice-row" aria-label="Dés lancés">
            {result.rolls.map((value, index) => (
              <Die
                kind={dieKindForRoll(value, result.difficulty)}
                key={`${value}-${index}`}
                value={value}
              />
            ))}
          </span>
        ) : null}
        {attributeRollOutcomeLabels(result).map((label) => (
          <span className="kw-sheet__roll-outcome" data-testid={label.testId} key={label.id}>
            {label.label}
          </span>
        ))}
      </Toast>
    </div>
  );
}

function SkillTreeRows({
  skillLabels,
  skills
}: Readonly<{
  skillLabels: Record<string, string>;
  skills: SkillTreeRow[];
}>) {
  return (
    <div className="kw-sheet__row-list">
      {skills.map((skill) => (
        <div
          className="kw-sheet__skill-row"
          data-implicit={skill.isImplicitZero ? 'true' : undefined}
          key={skill.id}
          style={{ '--kw-sheet-depth': skill.depth } as CSSProperties}
        >
          <div>
            <h3>
              {skill.depth > 0 && <span aria-hidden="true">↪ </span>}
              {skill.label ?? skillLabels[skill.id] ?? skill.id}
            </h3>
            <p>{skillDescription(skill)}</p>
          </div>
          <Badge tone={skill.isImplicitZero ? 'neutral' : 'success'}>
            {skill.points} {skill.points > 1 ? 'pts' : 'pt'}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function InventoryRow({ item, onRemove }: Readonly<{ item: InventoryItem; onRemove: () => void }>) {
  return (
    <div className="kw-sheet__inventory-row">
      <div>
        <h3>{item.name}</h3>
        <p>
          {item.equipped ? 'Équipé' : item.category} · {item.weightKg ?? 0} kg
        </p>
      </div>
      <Badge tone={item.equipped ? 'info' : 'neutral'}>x{item.quantity}</Badge>
      <Button
        aria-label={`Retirer ${item.name}`}
        className="kw-sheet__icon-button"
        onClick={onRemove}
        type="button"
        variant="secondary"
      >
        <Minus aria-hidden="true" className="kw-sheet__button-icon" />
      </Button>
    </div>
  );
}

function InfoLine({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="kw-sheet__info-line">
      <Badge tone="neutral">{label}</Badge>
      <p>{value}</p>
    </div>
  );
}

function skillDescription(skill: SkillTreeRow): string {
  if (skill.isImplicitZero) {
    return skill.parentId ? 'Spécialisation implicite à 0' : 'Compétence implicite à 0';
  }

  if (skill.isMain) {
    return 'Compétence primaire';
  }

  if (skill.isInheritedPrimary) {
    return 'Spécialisation héritée primaire';
  }

  if (skill.implicitParentId) {
    return `Spécialisation, parent implicite à 0 (${skill.implicitParentId})`;
  }

  return skill.parentId ? 'Spécialisation' : 'Compétence';
}

function dieKindForRoll(value: number, difficulty: number) {
  if (value === 1) {
    return 'one';
  }

  if (value === 10) {
    return 'critical';
  }

  return value >= difficulty ? 'success' : 'plain';
}
