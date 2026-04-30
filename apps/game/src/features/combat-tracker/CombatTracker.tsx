'use client';

import {
  Activity,
  Footprints,
  HeartPulse,
  Hourglass,
  Minus,
  Plus,
  ScrollText,
  Shield,
  Sparkles,
  Swords,
  Trash2,
  UserPlus
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';

import type {
  CombatAction,
  CombatActionType,
  Combatant,
  CombatState
} from '@knightandwizard/rules-core';

import {
  addTrackerCombatant,
  applyTrackerDamage,
  buildCombatTrackerView,
  queueTrackerAction,
  removeTrackerCombatant,
  resolveTrackerNextAction,
  type CombatLogRow,
  type CombatRosterRow,
  type CombatTimelineRow,
  type VitalityState
} from './model';
import { combatantTemplates, createSampleCombatTrackerState } from './sample';

const actionIcons: Record<CombatActionType, typeof Swords> = {
  attack: Swords,
  defense: Shield,
  move: Footprints,
  spell: Sparkles,
  wait: Hourglass
};

const actionLabels: Record<CombatActionType, string> = {
  attack: 'Attaque',
  defense: 'Défense',
  move: 'Mouvement',
  spell: 'Sort',
  wait: 'Attente'
};

const vitalityClasses: Record<VitalityState, string> = {
  critical: 'bg-wine',
  dead: 'bg-ink',
  healthy: 'bg-forest',
  wounded: 'bg-gold'
};

const logToneClasses: Record<CombatLogRow['tone'], string> = {
  danger: 'border-wine/25 bg-wine/10 text-wine',
  neutral: 'border-ink/10 bg-paper text-ink/68',
  success: 'border-forest/25 bg-forest/10 text-forest',
  warning: 'border-gold/35 bg-gold/15 text-ink'
};

export function CombatTracker() {
  const [state, setState] = useState<CombatState>(() => createSampleCombatTrackerState());
  const view = useMemo(() => buildCombatTrackerView(state), [state]);
  const activeCombatant = view.nextActor
    ? state.timeline.find((combatant) => combatant.id === view.nextActor?.id)
    : undefined;
  const defaultTargetId =
    state.timeline.find((combatant) => combatant.id !== activeCombatant?.id)?.id ??
    state.timeline[0]?.id ??
    '';
  const [targetId, setTargetId] = useState(defaultTargetId);
  const [damageTargetId, setDamageTargetId] = useState(defaultTargetId);
  const [templateId, setTemplateId] = useState(
    combatantTemplates[3]?.id ?? combatantTemplates[0]?.id ?? ''
  );
  const effectiveTargetId = state.timeline.some(
    (combatant) => combatant.id === targetId && combatant.id !== activeCombatant?.id
  )
    ? targetId
    : defaultTargetId;
  const effectiveDamageTargetId = state.timeline.some(
    (combatant) => combatant.id === damageTargetId
  )
    ? damageTargetId
    : (state.timeline[0]?.id ?? '');

  function queueAction(type: CombatActionType) {
    if (!activeCombatant) {
      return;
    }

    setState((current) =>
      queueTrackerAction(
        current,
        activeCombatant.id,
        buildAction(type, activeCombatant, effectiveTargetId)
      )
    );
  }

  function resolveNext() {
    setState((current) => resolveTrackerNextAction(current));
  }

  function damageTarget(damage: number) {
    if (!effectiveDamageTargetId) {
      return;
    }

    setState((current) => applyTrackerDamage(current, effectiveDamageTargetId, damage));
  }

  function addTemplate() {
    const template = combatantTemplates.find((combatant) => combatant.id === templateId);

    if (!template) {
      return;
    }

    setState((current) => addTrackerCombatant(current, withUniqueId(template, current)));
  }

  function removeCombatant(combatantId: string) {
    setState((current) => removeTrackerCombatant(current, combatantId));
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <Swords aria-hidden="true" className="mt-1 size-5 text-wine" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-wine">Combat</p>
              <h1 className="mt-1 text-3xl font-semibold text-ink">Tracker DT</h1>
              <p className="mt-2 text-sm text-ink/62">
                Round {view.current.round} · DT {view.current.cyclicDT} · prochain{' '}
                {view.nextActor?.name ?? 'NA'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-md bg-vellum/70 p-2 text-center">
            <Metric label="DT" value={view.current.cyclicDT} />
            <Metric label="Absolu" value={view.current.absoluteDT} />
            <Metric label="Acteurs" value={view.roster.length} />
          </div>
        </div>
      </section>

      <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-ink">Timeline DT</h2>
          <Hourglass aria-hidden="true" className="size-5 text-wine" />
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {view.timeline.map((row) => (
            <TimelineCard key={row.id} row={row} />
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="grid gap-5">
          <ActionPanel
            activeCombatant={activeCombatant}
            effectiveTargetId={effectiveTargetId}
            queueAction={queueAction}
            resolveNext={resolveNext}
            setTargetId={setTargetId}
            targetId={targetId}
            targets={state.timeline.filter((combatant) => combatant.id !== activeCombatant?.id)}
            viewNextActor={view.nextActor}
          />

          <RosterPanel
            combatants={view.roster}
            damageTarget={damageTarget}
            damageTargetId={effectiveDamageTargetId}
            removeCombatant={removeCombatant}
            setDamageTargetId={setDamageTargetId}
          />
        </section>

        <aside className="grid content-start gap-5">
          <AddCombatantPanel
            addTemplate={addTemplate}
            setTemplateId={setTemplateId}
            templateId={templateId}
          />
          <CombatLogPanel log={view.log} />
        </aside>
      </div>
    </div>
  );
}

function ActionPanel({
  activeCombatant,
  effectiveTargetId,
  queueAction,
  resolveNext,
  setTargetId,
  targetId,
  targets,
  viewNextActor
}: Readonly<{
  activeCombatant: Combatant | undefined;
  effectiveTargetId: string;
  queueAction: (type: CombatActionType) => void;
  resolveNext: () => void;
  setTargetId: (targetId: string) => void;
  targetId: string;
  targets: Combatant[];
  viewNextActor: CombatTimelineRow | undefined;
}>) {
  return (
    <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-forest">
            Action active
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">{viewNextActor?.name ?? 'NA'}</h2>
          <p className="mt-1 text-sm text-ink/58">{viewNextActor?.intent ?? 'Timeline vide'}</p>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-paper transition hover:bg-ink/88 disabled:opacity-40"
          disabled={!activeCombatant}
          onClick={resolveNext}
          type="button"
        >
          <Activity aria-hidden="true" className="size-4" />
          Résoudre
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="grid gap-2 text-sm font-semibold text-ink">
          Cible
          <select
            className="min-h-11 rounded-md border border-ink/10 bg-paper px-3 font-medium outline-none ring-wine/20 transition focus:ring-4"
            onChange={(event) => setTargetId(event.target.value)}
            value={effectiveTargetId || targetId}
          >
            {targets.map((combatant) => (
              <option key={combatant.id} value={combatant.id}>
                {combatant.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-5 gap-2 sm:self-end">
          {(['attack', 'defense', 'spell', 'move', 'wait'] as CombatActionType[]).map((type) => (
            <ActionButton key={type} onClick={() => queueAction(type)} type={type} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RosterPanel({
  combatants,
  damageTarget,
  damageTargetId,
  removeCombatant,
  setDamageTargetId
}: Readonly<{
  combatants: CombatRosterRow[];
  damageTarget: (damage: number) => void;
  damageTargetId: string;
  removeCombatant: (combatantId: string) => void;
  setDamageTargetId: (combatantId: string) => void;
}>) {
  return (
    <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink">Combattants</h2>
          <p className="mt-1 text-sm text-ink/58">Vitalité, FV, réflexes et états actifs.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[12rem_auto]">
          <select
            className="min-h-10 rounded-md border border-ink/10 bg-paper px-3 text-sm font-semibold outline-none ring-wine/20 transition focus:ring-4"
            onChange={(event) => setDamageTargetId(event.target.value)}
            value={damageTargetId}
          >
            {combatants.map((combatant) => (
              <option key={combatant.id} value={combatant.id}>
                {combatant.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-4 overflow-hidden rounded-md border border-ink/10 bg-white">
            <SmallButton label="-3" onClick={() => damageTarget(3)} />
            <SmallButton label="-1" onClick={() => damageTarget(1)} />
            <SmallButton label="+1" onClick={() => damageTarget(-1)} />
            <SmallButton label="+3" onClick={() => damageTarget(-3)} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {combatants.map((combatant) => (
          <RosterCard combatant={combatant} key={combatant.id} removeCombatant={removeCombatant} />
        ))}
      </div>
    </section>
  );
}

function AddCombatantPanel({
  addTemplate,
  setTemplateId,
  templateId
}: Readonly<{
  addTemplate: () => void;
  setTemplateId: (templateId: string) => void;
  templateId: string;
}>) {
  return (
    <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-ink">Renfort</h2>
        <UserPlus aria-hidden="true" className="size-5 text-wine" />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <select
          className="min-h-11 rounded-md border border-ink/10 bg-paper px-3 text-sm font-semibold outline-none ring-wine/20 transition focus:ring-4"
          onChange={(event) => setTemplateId(event.target.value)}
          value={templateId}
        >
          {combatantTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-forest px-4 text-sm font-semibold text-paper transition hover:bg-forest/90"
          onClick={addTemplate}
          type="button"
        >
          <Plus aria-hidden="true" className="size-4" />
          Ajouter
        </button>
      </div>
    </section>
  );
}

function CombatLogPanel({ log }: Readonly<{ log: CombatLogRow[] }>) {
  const visibleLog = [...log].reverse().slice(0, 8);

  return (
    <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-ink">Journal</h2>
        <ScrollText aria-hidden="true" className="size-5 text-wine" />
      </div>
      <div className="mt-4 grid gap-2">
        {visibleLog.length === 0 && (
          <p className="rounded-md bg-paper p-3 text-sm font-medium text-ink/58">
            Aucun événement.
          </p>
        )}
        {visibleLog.map((event, index) => (
          <article
            className={`rounded-md border p-3 text-sm font-semibold ${logToneClasses[event.tone]}`}
            key={`${event.atDT}-${event.label}-${index}`}
          >
            <span className="font-mono">DT {event.atDT}</span>
            <span className="ml-2">{event.label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function TimelineCard({ row }: Readonly<{ row: CombatTimelineRow }>) {
  return (
    <article
      className={[
        'grid min-h-32 gap-3 rounded-md border p-4 shadow-sm',
        row.active ? 'border-wine/40 bg-wine/10' : 'border-ink/10 bg-paper'
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-xl font-semibold text-wine">
          <Hourglass aria-hidden="true" className="size-4" />
          DT {row.cyclicDT}
        </div>
        <span className="rounded-md bg-white/70 px-2 py-1 text-xs font-semibold text-ink/58">
          +{row.relativeDT}
        </span>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-ink">{row.name}</h3>
        <p className="mt-1 text-sm text-ink/58">{row.intent}</p>
      </div>
      <VitalityBar percent={row.vitalityPercent} state={row.vitalityState} />
    </article>
  );
}

function RosterCard({
  combatant,
  removeCombatant
}: Readonly<{
  combatant: CombatRosterRow;
  removeCombatant: (combatantId: string) => void;
}>) {
  return (
    <article className="grid gap-3 rounded-md border border-ink/10 bg-paper p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-ink">{combatant.name}</h3>
          <p className="mt-1 text-sm text-ink/56">
            FV {combatant.speedFactor} · Réflexes {combatant.reflexes} · prochain DT{' '}
            {combatant.cyclicDT}
          </p>
        </div>
        <button
          className="grid size-9 place-items-center rounded-md text-ink/58 transition hover:bg-wine/10 hover:text-wine"
          onClick={() => removeCombatant(combatant.id)}
          title={`Retirer ${combatant.name}`}
          type="button"
        >
          <Trash2 aria-hidden="true" className="size-4" />
        </button>
      </div>
      <VitalityBar percent={combatant.vitalityPercent} state={combatant.vitalityState} />
      <div className="flex flex-wrap gap-2">
        <Pill>
          <HeartPulse aria-hidden="true" className="size-3.5" />
          {combatant.vitality.current}/{combatant.vitality.max}
        </Pill>
        {combatant.statusLabels.map((status) => (
          <Pill key={status}>{status}</Pill>
        ))}
      </div>
    </article>
  );
}

function ActionButton({
  onClick,
  type
}: Readonly<{
  onClick: () => void;
  type: CombatActionType;
}>) {
  const Icon = actionIcons[type];

  return (
    <button
      className="grid min-h-11 min-w-11 place-items-center rounded-md bg-vellum text-ink transition hover:bg-paper"
      onClick={onClick}
      title={actionLabels[type]}
      type="button"
    >
      <Icon aria-hidden="true" className="size-4" />
    </button>
  );
}

function SmallButton({
  label,
  onClick
}: Readonly<{
  label: string;
  onClick: () => void;
}>) {
  const Icon = label.startsWith('+') ? Plus : Minus;

  return (
    <button
      className="inline-flex min-h-10 items-center justify-center gap-1 border-r border-ink/10 px-2 text-sm font-semibold text-ink transition last:border-r-0 hover:bg-vellum"
      onClick={onClick}
      type="button"
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {label.replace(/^[-+]/, '')}
    </button>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="min-w-20 rounded-md bg-white/75 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/50">{label}</p>
      <p className="mt-1 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function VitalityBar({
  percent,
  state
}: Readonly<{
  percent: number;
  state: VitalityState;
}>) {
  return (
    <div className="grid gap-1.5">
      <div className="h-2 overflow-hidden rounded-full bg-ink/10">
        <div
          className={`h-full rounded-full ${vitalityClasses[state]}`}
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/46">
        Vitalité {percent}%
      </p>
    </div>
  );
}

function Pill({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <span className="inline-flex min-h-7 items-center gap-1.5 rounded-md bg-white/70 px-2 text-xs font-semibold text-ink/62">
      {children}
    </span>
  );
}

function buildAction(type: CombatActionType, actor: Combatant, targetId: string): CombatAction {
  if (type === 'attack') {
    return {
      attack: {
        difficulty: 7,
        pool: actor.attributes.dexterity + strongestSkill(actor)
      },
      damageOnHit: Math.max(1, Math.round(actor.attributes.strength / 2)),
      targetId,
      type
    };
  }

  if (type === 'defense') {
    return { costDT: Math.max(1, Math.round(actor.speedFactor / 2)), type };
  }

  if (type === 'spell') {
    return { costDT: actor.speedFactor + 2, type };
  }

  if (type === 'move') {
    return { costDT: Math.max(1, actor.speedFactor - 2), type };
  }

  return { costDT: actor.speedFactor, type: 'wait' };
}

function strongestSkill(actor: Combatant): number {
  return Math.max(0, ...Object.values(actor.skills));
}

function withUniqueId(template: Combatant, state: CombatState): Combatant {
  if (!state.timeline.some((combatant) => combatant.id === template.id)) {
    return template;
  }

  const suffix =
    state.timeline.filter((combatant) => combatant.id.startsWith(template.id)).length + 1;

  return {
    ...template,
    id: `${template.id}-${suffix}`,
    name: `${template.name} ${suffix}`
  };
}
