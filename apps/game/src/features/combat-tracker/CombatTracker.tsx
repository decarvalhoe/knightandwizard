'use client';

import {
  Activity,
  Footprints,
  HeartPulse,
  Hourglass,
  Minus,
  Plus,
  Shield,
  Sparkles,
  Swords,
  Trash2,
  UserPlus
} from 'lucide-react';
import { useMemo, useState } from 'react';

import type {
  CombatAction,
  CombatActionType,
  Combatant,
  CombatState
} from '@knightandwizard/rules-core';
import {
  Badge,
  Button,
  Card,
  Label,
  ProgressBar,
  Seal,
  SelectField,
  TimelineDT,
  Toast,
  type BadgeTone,
  type ProgressTone,
  type ToastTone
} from '@knightandwizard/ui';

import {
  addTrackerCombatant,
  applyTrackerDamage,
  buildCombatTrackerView,
  queueTrackerAction,
  removeTrackerCombatant,
  resolveTrackerNextAction,
  type CombatantTemplate,
  type CombatLogRow,
  type CombatRosterRow,
  type CombatTimelineRow,
  type VitalityState
} from './model';

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

interface CombatTrackerProps {
  combatantTemplates: CombatantTemplate[];
  initialState: CombatState;
}

export function CombatTracker({ combatantTemplates, initialState }: Readonly<CombatTrackerProps>) {
  const [state, setState] = useState<CombatState>(() => initialState);
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
    <div className="kw-combat">
      <Card className="kw-combat__hero">
        <div className="kw-combat__hero-head">
          <div className="kw-combat__title-lockup">
            <Swords aria-hidden="true" className="kw-combat__hero-icon" />
            <div>
              <Label>Combat</Label>
              <h1>Tracker DT</h1>
              <p>
                Round {view.current.round} · DT {view.current.cyclicDT} · prochain{' '}
                {view.nextActor?.name ?? 'NA'}
              </p>
            </div>
          </div>
          <Seal>DT {view.current.cyclicDT}</Seal>
        </div>

        <div className="kw-combat__metrics" aria-label="Etat du combat">
          <Metric label="DT" value={view.current.cyclicDT} />
          <Metric label="Absolu" value={view.current.absoluteDT} />
          <Metric label="Acteurs" value={view.roster.length} />
        </div>
      </Card>

      <Card>
        <div className="kw-combat__section-head">
          <h2>Timeline DT</h2>
          <Hourglass aria-hidden="true" className="kw-combat__section-icon" />
        </div>
        <TimelineDT
          items={view.timeline.map((row) => ({
            id: row.id,
            current: row.active,
            description: row.pendingCostDT
              ? `${row.intent} · Coût DT ${row.pendingCostDT}`
              : row.intent,
            dt: row.absoluteDT,
            label: row.name,
            meta: `R${row.round} · DT ${row.cyclicDT} · +${row.relativeDT}`
          }))}
          label="Timeline DT"
        />
      </Card>

      <div className="kw-combat__layout">
        <section className="kw-combat__stack">
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

        <aside className="kw-combat__stack">
          <AddCombatantPanel
            addTemplate={addTemplate}
            combatantTemplates={combatantTemplates}
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
    <Card>
      <div className="kw-combat__panel-head">
        <div>
          <Label>Action active</Label>
          <h2>{viewNextActor?.name ?? 'NA'}</h2>
          <p>{viewNextActor?.intent ?? 'Timeline vide'}</p>
        </div>
        <Button disabled={!activeCombatant} onClick={resolveNext}>
          <Activity aria-hidden="true" className="kw-combat__button-icon" />
          Résoudre
        </Button>
      </div>

      <div className="kw-combat__action-grid">
        <SelectField
          label="Cible"
          onChange={(event) => setTargetId(event.target.value)}
          options={targets.map((combatant) => ({ label: combatant.name, value: combatant.id }))}
          value={effectiveTargetId || targetId}
        />
        <div className="kw-combat__action-buttons" aria-label="Actions disponibles">
          {(['attack', 'defense', 'spell', 'move', 'wait'] as CombatActionType[]).map((type) => (
            <ActionButton key={type} onClick={() => queueAction(type)} type={type} />
          ))}
        </div>
      </div>
    </Card>
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
    <Card>
      <div className="kw-combat__panel-head">
        <div>
          <h2>Combattants</h2>
          <p>Vitalité, FV, réflexes et états actifs.</p>
        </div>
        <div className="kw-combat__damage-tools">
          <SelectField
            label="Cible vitalité"
            onChange={(event) => setDamageTargetId(event.target.value)}
            options={combatants.map((combatant) => ({
              label: combatant.name,
              value: combatant.id
            }))}
            value={damageTargetId}
          />
          <div className="kw-combat__small-buttons" aria-label="Ajuster la vitalité">
            <SmallButton label="-3" onClick={() => damageTarget(3)} />
            <SmallButton label="-1" onClick={() => damageTarget(1)} />
            <SmallButton label="+1" onClick={() => damageTarget(-1)} />
            <SmallButton label="+3" onClick={() => damageTarget(-3)} />
          </div>
        </div>
      </div>

      <div className="kw-combat__roster-grid">
        {combatants.map((combatant) => (
          <RosterCard combatant={combatant} key={combatant.id} removeCombatant={removeCombatant} />
        ))}
      </div>
    </Card>
  );
}

function AddCombatantPanel({
  addTemplate,
  combatantTemplates,
  setTemplateId,
  templateId
}: Readonly<{
  addTemplate: () => void;
  combatantTemplates: CombatantTemplate[];
  setTemplateId: (templateId: string) => void;
  templateId: string;
}>) {
  return (
    <Card>
      <div className="kw-combat__section-head">
        <h2>Renfort</h2>
        <UserPlus aria-hidden="true" className="kw-combat__section-icon" />
      </div>
      <div className="kw-combat__add-grid">
        <SelectField
          label="Modele"
          onChange={(event) => setTemplateId(event.target.value)}
          options={combatantTemplates.map((template) => ({
            label: template.name,
            value: template.id
          }))}
          value={templateId}
        />
        <Button onClick={addTemplate}>
          <Plus aria-hidden="true" className="kw-combat__button-icon" />
          Ajouter
        </Button>
      </div>
    </Card>
  );
}

function CombatLogPanel({ log }: Readonly<{ log: CombatLogRow[] }>) {
  const visibleLog = [...log].reverse().slice(0, 8);

  return (
    <Card>
      <div className="kw-combat__section-head">
        <h2>Journal de bataille</h2>
      </div>
      <div className="kw-combat__log-list">
        {visibleLog.length === 0 && (
          <Toast title="Registre vide" tone="neutral">
            Aucun événement.
          </Toast>
        )}
        {visibleLog.map((event, index) => (
          <Toast
            key={`${event.atDT}-${event.label}-${index}`}
            title={`DT ${event.atDT}`}
            tone={logTone(event.tone)}
          >
            <span>{event.label}</span>
            {event.details?.length ? (
              <span className="kw-combat__log-details">{event.details.join(' · ')}</span>
            ) : null}
          </Toast>
        ))}
      </div>
    </Card>
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
    <article className="kw-combat__roster-card">
      <div className="kw-combat__roster-head">
        <div>
          <h3>{combatant.name}</h3>
          <p>
            FV {combatant.speedFactor} · Réflexes {combatant.reflexes} · prochain DT{' '}
            {combatant.cyclicDT}
          </p>
        </div>
        <button
          aria-label={`Retirer ${combatant.name}`}
          className="kw-combat__icon-button"
          onClick={() => removeCombatant(combatant.id)}
          title={`Retirer ${combatant.name}`}
          type="button"
        >
          <Trash2 aria-hidden="true" className="kw-combat__icon" />
        </button>
      </div>
      <ProgressBar
        label={`Vitalité ${combatant.name}`}
        max={combatant.vitality.max}
        tone={vitalityTone(combatant.vitalityState)}
        value={combatant.vitality.current}
      />
      <div className="kw-combat__pill-row">
        <Badge tone="info">
          <HeartPulse aria-hidden="true" className="kw-combat__badge-icon" />
          {combatant.vitality.current}/{combatant.vitality.max}
        </Badge>
        {combatant.statusLabels.map((status) => (
          <Badge key={status} tone={statusTone(status)}>
            {status}
          </Badge>
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
      aria-label={actionLabels[type]}
      className="kw-combat__icon-button"
      onClick={onClick}
      title={actionLabels[type]}
      type="button"
    >
      <Icon aria-hidden="true" className="kw-combat__icon" />
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
    <button className="kw-combat__small-button" onClick={onClick} type="button">
      <Icon aria-hidden="true" className="kw-combat__small-icon" />
      {label.replace(/^[-+]/, '')}
    </button>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="kw-combat__metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function vitalityTone(state: VitalityState): ProgressTone {
  if (state === 'dead' || state === 'critical') return 'danger';
  if (state === 'wounded') return 'warn';
  return 'success';
}

function statusTone(status: string): BadgeTone {
  if (status === 'Mort' || status === 'Inconscient') return 'danger';
  if (status === 'Saignement' || status === 'Étourdi') return 'warn';
  return 'neutral';
}

function logTone(tone: CombatLogRow['tone']): ToastTone {
  return tone === 'warning' ? 'warn' : tone;
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
