'use client';

import {
  BookCheck,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleDashed,
  DatabaseZap,
  Minus,
  Plus,
  RotateCcw,
  Save,
  ScrollText,
  UserPlus
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { Character } from '@knightandwizard/rules-core';

import {
  ATTRIBUTE_CREATION_ORDER,
  CREATION_STEPS,
  buildCreationView,
  createCreationDraft,
  previewCharacter,
  setAttributePoints,
  setExtraSpellPoints,
  setSkillPoints,
  setSpellPoints,
  type CharacterCreationAsset,
  type CharacterCreationDraft,
  type CharacterCreationStepId,
  type StepValidation
} from './model';
import {
  loadDraftLocally,
  saveDraftLocally,
  syncDraftToApi,
  type DraftSyncResult
} from './persistence';
import { attributeLabels, characterCreationCatalog } from './sample';

const draftTemplate = createCreationDraft(characterCreationCatalog, {
  classId: 'garde',
  equipmentIds: ['travel-kit'],
  id: 'draft-local',
  orientationId: 'guerrier',
  raceId: 'humain'
});

const syncIdle: DraftSyncResult = {
  detail: 'En attente',
  state: 'idle'
};

export function CharacterCreationWizard() {
  const [draft, setDraft] = useState<CharacterCreationDraft>(draftTemplate);
  const [apiSync, setApiSync] = useState<DraftSyncResult>(syncIdle);
  const [localSync, setLocalSync] = useState<DraftSyncResult>(syncIdle);
  const [loaded, setLoaded] = useState(false);
  const [submittedCharacter, setSubmittedCharacter] = useState<Character | null>(null);
  const view = useMemo(() => buildCreationView(draft, characterCreationCatalog), [draft]);
  const currentStepIndex = Math.max(
    0,
    CREATION_STEPS.findIndex((step) => step.id === draft.currentStep)
  );
  const currentValidation = view.stepValidations[draft.currentStep];
  const isMagician =
    view.selectedOrientation?.isMagical === true || draft.orientationId === 'magicien';
  const extraSpellMax = Math.max(0, Math.floor((view.selectedRace?.category ?? 0) / 10));

  useEffect(() => {
    const savedDraft = loadDraftLocally(window.localStorage);

    if (savedDraft) {
      setDraft(savedDraft);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) {
      return undefined;
    }

    setLocalSync(saveDraftLocally(draft, window.localStorage));
    const timeoutId = window.setTimeout(() => {
      void syncDraftToApi(draft).then(setApiSync);
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [draft, loaded]);

  function updateDraft(patch: Partial<CharacterCreationDraft>) {
    setDraft((current) => ({
      ...current,
      ...patch
    }));
    setSubmittedCharacter(null);
  }

  function selectOrientation(orientationId: string) {
    const nextClassId =
      characterCreationCatalog.classes.find(
        (classProfile) => classProfile.orientationId === orientationId
      )?.id ?? draft.classId;
    const nextOrientation = characterCreationCatalog.orientations.find(
      (orientation) => orientation.id === orientationId
    );
    const nextIsMagician = nextOrientation?.isMagical === true || orientationId === 'magicien';

    updateDraft({
      classId: nextClassId,
      extraSpellPoints: nextIsMagician ? draft.extraSpellPoints : 0,
      orientationId,
      spells: nextIsMagician ? draft.spells : []
    });
  }

  function goToStep(stepId: CharacterCreationStepId) {
    updateDraft({ currentStep: stepId });
  }

  function goToOffset(offset: number) {
    const nextStep = CREATION_STEPS[currentStepIndex + offset];

    if (nextStep) {
      goToStep(nextStep.id);
    }
  }

  function resetDraft() {
    setDraft({
      ...draftTemplate,
      id: `draft-${Date.now()}`
    });
    setSubmittedCharacter(null);
  }

  function submitDraft() {
    if (!view.canSubmit) {
      return;
    }

    const character = previewCharacter(draft, characterCreationCatalog);

    setDraft((current) => ({
      ...current,
      currentStep: 'review'
    }));
    setSubmittedCharacter(character);
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-wine">
              Creation PJ
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-ink">Nouveau personnage</h1>
            <p className="mt-2 text-sm text-ink/62">
              {view.selectedRace?.name ?? 'Race'} ·{' '}
              {view.selectedOrientation?.name ?? 'Orientation'} ·{' '}
              {view.selectedClass?.name ?? 'Classe'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <SyncPill icon={Save} result={localSync} />
            <SyncPill icon={DatabaseZap} result={apiSync} />
            <button
              className="inline-flex min-h-10 items-center gap-2 rounded-md border border-ink/10 bg-paper px-3 text-sm font-semibold text-ink transition hover:bg-vellum"
              onClick={resetDraft}
              title="Reinitialiser"
              type="button"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-2 md:grid-cols-9">
          {CREATION_STEPS.map((step, index) => {
            const validation = view.stepValidations[step.id];
            const active = step.id === draft.currentStep;
            const Icon = validation.valid ? CircleCheck : CircleDashed;

            return (
              <button
                className={[
                  'flex min-h-12 items-center justify-center gap-2 rounded-md border px-2 text-xs font-semibold transition',
                  active
                    ? 'border-ink bg-ink text-paper shadow-sm'
                    : validation.valid
                      ? 'border-forest/20 bg-forest/10 text-forest hover:bg-forest/15'
                      : 'border-ink/10 bg-paper text-ink/62 hover:bg-vellum'
                ].join(' ')}
                key={step.id}
                onClick={() => goToStep(step.id)}
                type="button"
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span className="hidden lg:inline">{index + 1}. </span>
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-ink">
                {CREATION_STEPS[currentStepIndex]?.label}
              </h2>
              <ValidationSummary validation={currentValidation} />
            </div>
            <div className="flex gap-2">
              <button
                className="inline-flex min-h-10 items-center gap-2 rounded-md bg-vellum px-3 text-sm font-semibold text-ink transition hover:bg-paper disabled:opacity-40"
                disabled={currentStepIndex === 0}
                onClick={() => goToOffset(-1)}
                title="Etape precedente"
                type="button"
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </button>
              <button
                className="inline-flex min-h-10 items-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-paper transition hover:bg-ink/88 disabled:opacity-40"
                disabled={
                  !currentValidation.valid || currentStepIndex === CREATION_STEPS.length - 1
                }
                onClick={() => goToOffset(1)}
                title="Etape suivante"
                type="button"
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-5">
            {draft.currentStep === 'identity' && (
              <IdentityStep draft={draft} updateDraft={updateDraft} />
            )}
            {draft.currentStep === 'attributes' && (
              <AttributesStep draft={draft} updateDraft={updateDraft} view={view} />
            )}
            {draft.currentStep === 'path' && (
              <PathStep
                draft={draft}
                selectOrientation={selectOrientation}
                updateDraft={updateDraft}
                view={view}
              />
            )}
            {draft.currentStep === 'spells' && (
              <SpellsStep
                draft={draft}
                extraSpellMax={extraSpellMax}
                isMagician={isMagician}
                setDraft={setDraft}
                updateDraft={updateDraft}
                view={view}
              />
            )}
            {draft.currentStep === 'skills' && (
              <SkillsStep draft={draft} setDraft={setDraft} view={view} />
            )}
            {draft.currentStep === 'assets' && <AssetsStep assets={view.grantedAssets} />}
            {draft.currentStep === 'equipment' && (
              <EquipmentStep draft={draft} updateDraft={updateDraft} />
            )}
            {draft.currentStep === 'story' && <StoryStep draft={draft} updateDraft={updateDraft} />}
            {draft.currentStep === 'review' && (
              <ReviewStep
                draft={draft}
                submittedCharacter={submittedCharacter}
                submitDraft={submitDraft}
                view={view}
              />
            )}
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <PreviewPanel draft={draft} submittedCharacter={submittedCharacter} view={view} />
          <BudgetPanel draft={draft} view={view} />
        </aside>
      </div>
    </div>
  );
}

function IdentityStep({
  draft,
  updateDraft
}: Readonly<{
  draft: CharacterCreationDraft;
  updateDraft: (patch: Partial<CharacterCreationDraft>) => void;
}>) {
  return (
    <div className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold text-ink">
        Nom
        <input
          className="min-h-11 rounded-md border border-ink/10 bg-paper px-3 text-base font-medium outline-none ring-wine/20 transition focus:ring-4"
          onChange={(event) => updateDraft({ name: event.target.value })}
          value={draft.name}
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold text-ink">
        Genre
        <select
          className="min-h-11 rounded-md border border-ink/10 bg-paper px-3 text-base font-medium outline-none ring-wine/20 transition focus:ring-4"
          onChange={(event) => updateDraft({ genderId: event.target.value })}
          value={draft.genderId}
        >
          <option value="unspecified">Non precise</option>
          <option value="female">Feminin</option>
          <option value="male">Masculin</option>
        </select>
      </label>
      <ChoiceGrid
        items={characterCreationCatalog.races.map((race) => ({
          detail: `${race.category} points · VIT ${race.vitality} · FV ${race.speedFactor}`,
          id: race.id,
          label: race.name
        }))}
        onSelect={(raceId) => updateDraft({ raceId })}
        selectedId={draft.raceId}
      />
    </div>
  );
}

function AttributesStep({
  draft,
  updateDraft,
  view
}: Readonly<{
  draft: CharacterCreationDraft;
  updateDraft: (patch: Partial<CharacterCreationDraft>) => void;
  view: ReturnType<typeof buildCreationView>;
}>) {
  return (
    <div className="grid gap-4">
      <BudgetStrip
        items={[
          ['Aptitudes', `${view.attributeBudget.spent}/${view.attributeBudget.limit}`],
          ['Reste', String(view.attributeBudget.remaining)]
        ]}
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ATTRIBUTE_CREATION_ORDER.map((attribute) => {
          const max = (view.selectedRace?.attributeMax[attribute] ?? 1) - 1;

          return (
            <NumberStepper
              key={attribute}
              label={attributeLabels[attribute]}
              max={max}
              onChange={(value) =>
                updateDraft({
                  attributes: setAttributePoints(draft, attribute, value).attributes
                })
              }
              value={draft.attributes[attribute]}
            />
          );
        })}
      </div>
    </div>
  );
}

function PathStep({
  draft,
  selectOrientation,
  updateDraft,
  view
}: Readonly<{
  draft: CharacterCreationDraft;
  selectOrientation: (orientationId: string) => void;
  updateDraft: (patch: Partial<CharacterCreationDraft>) => void;
  view: ReturnType<typeof buildCreationView>;
}>) {
  return (
    <div className="grid gap-5">
      <ChoiceGrid
        items={characterCreationCatalog.orientations.map((orientation) => ({
          detail: orientation.isMagical ? 'Magie engagee' : 'Voie non magique',
          id: orientation.id,
          label: orientation.name
        }))}
        onSelect={selectOrientation}
        selectedId={draft.orientationId}
      />
      <ChoiceGrid
        items={view.availableClasses.map((classProfile) => ({
          detail:
            classProfile.primarySkillIds && classProfile.primarySkillIds.length > 0
              ? `Primaire ${classProfile.primarySkillIds.join(', ')}`
              : 'Sans primaire mecanique',
          id: classProfile.id,
          label: classProfile.name
        }))}
        onSelect={(classId) => updateDraft({ classId })}
        selectedId={draft.classId}
      />
    </div>
  );
}

function SpellsStep({
  draft,
  extraSpellMax,
  isMagician,
  setDraft,
  updateDraft,
  view
}: Readonly<{
  draft: CharacterCreationDraft;
  extraSpellMax: number;
  isMagician: boolean;
  setDraft: (updater: (current: CharacterCreationDraft) => CharacterCreationDraft) => void;
  updateDraft: (patch: Partial<CharacterCreationDraft>) => void;
  view: ReturnType<typeof buildCreationView>;
}>) {
  if (!isMagician) {
    return (
      <div className="rounded-md border border-ink/10 bg-paper p-4">
        <p className="font-semibold text-ink">Aucun point de sort a la creation.</p>
        <p className="mt-1 text-sm text-ink/58">Energie initiale 0 / 0.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <BudgetStrip
        items={[
          ['Sorts', `${view.spellBudget.spent}/${view.spellBudget.requiredPoints}`],
          ['Gratuits', String(view.spellBudget.freePoints)],
          ['Achetes', String(view.spellBudget.extraPoints)]
        ]}
      />
      <NumberStepper
        label="Points de sort supplementaires"
        max={extraSpellMax}
        onChange={(value) => updateDraft(setExtraSpellPoints(draft, value))}
        value={draft.extraSpellPoints}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {characterCreationCatalog.spells.map((spell) => (
          <NumberStepper
            key={spell.id}
            label={spell.label}
            max={4}
            onChange={(value) => setDraft((current) => setSpellPoints(current, spell.id, value))}
            value={draft.spells.find((entry) => entry.id === spell.id)?.points ?? 0}
          />
        ))}
      </div>
    </div>
  );
}

function SkillsStep({
  draft,
  setDraft,
  view
}: Readonly<{
  draft: CharacterCreationDraft;
  setDraft: (updater: (current: CharacterCreationDraft) => CharacterCreationDraft) => void;
  view: ReturnType<typeof buildCreationView>;
}>) {
  return (
    <div className="grid gap-4">
      <BudgetStrip
        items={[
          ['Competences', `${view.skillBudget.spent}/${view.skillBudget.limit}`],
          ['Convertis', String(view.skillBudget.convertedToSpells)]
        ]}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {characterCreationCatalog.skills.map((skill) => (
          <NumberStepper
            key={skill.id}
            label={skill.label}
            max={4}
            onChange={(value) =>
              setDraft((current) => setSkillPoints(current, skill.id, value, skill.parentId))
            }
            value={draft.skills.find((entry) => entry.id === skill.id)?.points ?? 0}
          />
        ))}
      </div>
    </div>
  );
}

function AssetsStep({ assets }: Readonly<{ assets: CharacterCreationAsset[] }>) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {assets.map((asset) => (
        <div className="rounded-md border border-ink/10 bg-paper p-4" key={asset.id}>
          <p className="font-semibold text-ink">{asset.label}</p>
          <p className="mt-1 text-sm font-medium uppercase tracking-[0.12em] text-ink/48">
            {asset.source}
          </p>
        </div>
      ))}
    </div>
  );
}

function EquipmentStep({
  draft,
  updateDraft
}: Readonly<{
  draft: CharacterCreationDraft;
  updateDraft: (patch: Partial<CharacterCreationDraft>) => void;
}>) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {characterCreationCatalog.equipment.map((item) => {
        const selected = draft.equipmentIds.includes(item.id);

        return (
          <button
            className={[
              'min-h-16 rounded-md border p-4 text-left transition',
              selected
                ? 'border-forest/40 bg-forest text-paper'
                : 'border-ink/10 bg-paper text-ink hover:bg-vellum'
            ].join(' ')}
            key={item.id}
            onClick={() =>
              updateDraft({
                equipmentIds: selected
                  ? draft.equipmentIds.filter((equipmentId) => equipmentId !== item.id)
                  : [...draft.equipmentIds, item.id]
              })
            }
            type="button"
          >
            <p className="font-semibold">{item.name}</p>
          </button>
        );
      })}
    </div>
  );
}

function StoryStep({
  draft,
  updateDraft
}: Readonly<{
  draft: CharacterCreationDraft;
  updateDraft: (patch: Partial<CharacterCreationDraft>) => void;
}>) {
  return (
    <div className="grid gap-4">
      <TextField
        label="Psychologie"
        onChange={(psychology) => updateDraft({ psychology })}
        value={draft.psychology}
      />
      <TextField
        label="Divinite"
        onChange={(deity) => updateDraft({ deity })}
        value={draft.deity}
      />
      <TextField
        label="Citation"
        onChange={(quote) => updateDraft({ quote })}
        value={draft.quote}
      />
      <label className="grid gap-2 text-sm font-semibold text-ink">
        Background
        <textarea
          className="min-h-32 rounded-md border border-ink/10 bg-paper px-3 py-2 text-base font-medium outline-none ring-wine/20 transition focus:ring-4"
          onChange={(event) => updateDraft({ background: event.target.value })}
          value={draft.background}
        />
      </label>
    </div>
  );
}

function ReviewStep({
  draft,
  submittedCharacter,
  submitDraft,
  view
}: Readonly<{
  draft: CharacterCreationDraft;
  submittedCharacter: Character | null;
  submitDraft: () => void;
  view: ReturnType<typeof buildCreationView>;
}>) {
  const invalidSteps = CREATION_STEPS.filter((step) => !view.stepValidations[step.id].valid);

  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-ink/10 bg-paper p-4">
        <p className="text-2xl font-semibold text-ink">{draft.name || 'Personnage sans nom'}</p>
        <p className="mt-1 text-sm text-ink/62">
          {view.selectedRace?.name} · {view.selectedOrientation?.name} · {view.selectedClass?.name}
        </p>
      </div>
      {invalidSteps.length > 0 && (
        <div className="rounded-md border border-wine/20 bg-wine/10 p-4">
          <p className="font-semibold text-wine">Corrections requises</p>
          <ul className="mt-2 grid gap-1 text-sm text-wine">
            {invalidSteps.map((step) => (
              <li key={step.id}>{step.label}</li>
            ))}
          </ul>
        </div>
      )}
      <button
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-forest px-4 text-sm font-semibold text-paper transition hover:bg-forest/90 disabled:opacity-40"
        disabled={!view.canSubmit}
        onClick={submitDraft}
        type="button"
      >
        <BookCheck aria-hidden="true" className="size-4" />
        Valider le brouillon
      </button>
      {submittedCharacter && (
        <p className="rounded-md border border-forest/20 bg-forest/10 p-3 text-sm font-semibold text-forest">
          Brouillon valide · vitalite {submittedCharacter.vitality.max} · energie{' '}
          {submittedCharacter.energy.max}
        </p>
      )}
    </div>
  );
}

function PreviewPanel({
  draft,
  submittedCharacter,
  view
}: Readonly<{
  draft: CharacterCreationDraft;
  submittedCharacter: Character | null;
  view: ReturnType<typeof buildCreationView>;
}>) {
  let preview: Character | null = submittedCharacter;

  if (!preview && view.canSubmit) {
    preview = previewCharacter(draft, characterCreationCatalog);
  }

  return (
    <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-ink">Apercu</h2>
        <UserPlus aria-hidden="true" className="size-5 text-wine" />
      </div>
      <dl className="mt-4 grid gap-3 text-sm">
        <PreviewRow label="Nom" value={draft.name || 'NA'} />
        <PreviewRow label="Race" value={view.selectedRace?.name ?? 'NA'} />
        <PreviewRow label="Classe" value={view.selectedClass?.name ?? 'NA'} />
        <PreviewRow label="Atouts" value={String(view.grantedAssets.length)} />
        <PreviewRow label="Equipement" value={String(draft.equipmentIds.length)} />
        {preview && (
          <PreviewRow
            label="Ressources"
            value={`${preview.vitality.max} VIT / ${preview.energy.max} EN`}
          />
        )}
      </dl>
    </section>
  );
}

function BudgetPanel({
  draft,
  view
}: Readonly<{
  draft: CharacterCreationDraft;
  view: ReturnType<typeof buildCreationView>;
}>) {
  return (
    <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-ink">Budgets</h2>
        <ScrollText aria-hidden="true" className="size-5 text-wine" />
      </div>
      <div className="mt-4 grid gap-3">
        <Meter
          label="Aptitudes"
          limit={view.attributeBudget.limit}
          value={view.attributeBudget.spent}
        />
        <Meter label="Competences" limit={view.skillBudget.limit} value={view.skillBudget.spent} />
        <Meter
          label="Sorts"
          limit={view.spellBudget.requiredPoints}
          value={view.spellBudget.spent}
        />
        <div className="rounded-md bg-paper p-3 text-sm text-ink/62">
          Niveau preview : skills {view.skillBudget.spent} + sorts x2 ({draft.spells.length} entree
          {draft.spells.length > 1 ? 's' : ''})
        </div>
      </div>
    </section>
  );
}

function ChoiceGrid({
  items,
  onSelect,
  selectedId
}: Readonly<{
  items: Array<{ detail: string; id: string; label: string }>;
  onSelect: (id: string) => void;
  selectedId: string;
}>) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const selected = item.id === selectedId;

        return (
          <button
            className={[
              'min-h-20 rounded-md border p-4 text-left transition',
              selected
                ? 'border-forest/40 bg-forest text-paper'
                : 'border-ink/10 bg-paper text-ink hover:bg-vellum'
            ].join(' ')}
            key={item.id}
            onClick={() => onSelect(item.id)}
            type="button"
          >
            <span className="block font-semibold">{item.label}</span>
            <span
              className={['mt-1 block text-sm', selected ? 'text-paper/68' : 'text-ink/56'].join(
                ' '
              )}
            >
              {item.detail}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function NumberStepper({
  label,
  max = 99,
  onChange,
  value
}: Readonly<{
  label: string;
  max?: number;
  onChange: (value: number) => void;
  value: number;
}>) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-ink/10 bg-paper p-3">
      <div>
        <p className="font-semibold text-ink">{label}</p>
        <p className="text-sm text-ink/52">max {max}</p>
      </div>
      <div className="grid grid-cols-[2.5rem_3rem_2.5rem] overflow-hidden rounded-md border border-ink/10 bg-white">
        <button
          className="grid place-items-center text-ink/70 transition hover:bg-vellum disabled:opacity-30"
          disabled={value <= 0}
          onClick={() => onChange(value - 1)}
          title={`Diminuer ${label}`}
          type="button"
        >
          <Minus aria-hidden="true" className="size-4" />
        </button>
        <input
          className="min-h-10 border-x border-ink/10 bg-white text-center font-mono text-sm font-semibold outline-none"
          max={max}
          min={0}
          onChange={(event) => onChange(Number(event.target.value))}
          type="number"
          value={value}
        />
        <button
          className="grid place-items-center text-ink/70 transition hover:bg-vellum disabled:opacity-30"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          title={`Augmenter ${label}`}
          type="button"
        >
          <Plus aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}

function TextField({
  label,
  onChange,
  value
}: Readonly<{
  label: string;
  onChange: (value: string) => void;
  value: string;
}>) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-ink">
      {label}
      <input
        className="min-h-11 rounded-md border border-ink/10 bg-paper px-3 text-base font-medium outline-none ring-wine/20 transition focus:ring-4"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
  );
}

function ValidationSummary({ validation }: Readonly<{ validation: StepValidation }>) {
  if (validation.valid && validation.warnings.length === 0) {
    return <p className="mt-1 text-sm font-medium text-forest">Valide</p>;
  }

  return (
    <div className="mt-2 grid gap-1 text-sm">
      {validation.errors.map((error) => (
        <p className="font-medium text-wine" key={error}>
          {formatValidationMessage(error)}
        </p>
      ))}
      {validation.warnings.map((warning) => (
        <p className="font-medium text-gold" key={warning}>
          {formatValidationMessage(warning)}
        </p>
      ))}
    </div>
  );
}

function formatValidationMessage(message: string): string {
  if (message.startsWith('magician spell points must be at least 2')) {
    return 'Magicien : au moins 2 points de sort gratuits a placer.';
  }

  if (message.startsWith('magician spell points must total')) {
    return message.replace('magician spell points must total', 'Points de sort requis :');
  }

  if (message.startsWith('skill points must total')) {
    return message.replace('skill points must total', 'Points de competences requis :');
  }

  if (message.startsWith('attribute points must total')) {
    return message.replace('attribute points must total', "Points d'aptitudes requis :");
  }

  if (message === 'character name is required') {
    return 'Nom obligatoire.';
  }

  if (message === 'race is required') {
    return 'Race obligatoire.';
  }

  if (message === 'orientation is required') {
    return 'Orientation obligatoire.';
  }

  if (message === 'class is required') {
    return 'Classe obligatoire.';
  }

  return message;
}

function BudgetStrip({ items }: Readonly<{ items: Array<[string, string]> }>) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {items.map(([label, value]) => (
        <div className="rounded-md bg-vellum/70 p-3" key={label}>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/50">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
        </div>
      ))}
    </div>
  );
}

function Meter({
  label,
  limit,
  value
}: Readonly<{
  label: string;
  limit: number;
  value: number;
}>) {
  const width = limit > 0 ? Math.min(100, Math.round((value / limit) * 100)) : 0;

  return (
    <div className="grid gap-2 rounded-md bg-paper p-3">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-ink">{label}</span>
        <span className="font-mono text-ink/62">
          {value}/{limit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ink/10">
        <div className="h-full rounded-full bg-forest" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-paper p-3">
      <dt className="font-medium text-ink/55">{label}</dt>
      <dd className="text-right font-semibold text-ink">{value}</dd>
    </div>
  );
}

function SyncPill({
  icon: Icon,
  result
}: Readonly<{
  icon: typeof Save;
  result: DraftSyncResult;
}>) {
  const color =
    result.state === 'saved'
      ? 'text-forest'
      : result.state === 'idle'
        ? 'text-ink/56'
        : 'text-wine';

  return (
    <span className="inline-flex min-h-10 items-center gap-2 rounded-md border border-ink/10 bg-paper px-3 text-sm font-semibold text-ink">
      <Icon aria-hidden="true" className={`size-4 ${color}`} />
      {result.detail}
    </span>
  );
}
