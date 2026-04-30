'use client';

import {
  CheckCircle2,
  Dice5,
  History,
  ListChecks,
  MapPin,
  MessageSquarePlus,
  RotateCcw,
  ScrollText,
  ShieldAlert,
  Users,
  XCircle
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import {
  buildSessionManagerView,
  recordSessionEvent,
  requestRollbackFromEvent,
  resolveNextPendingDecision,
  submitGmDecisionRequest
} from './model';
import { createSampleSessionManagerState } from './sample';

const eventToneClasses = {
  audit: 'border-wine/25 bg-wine/8 text-wine',
  decision: 'border-gold/35 bg-gold/12 text-ink',
  neutral: 'border-ink/10 bg-paper text-ink',
  rules: 'border-forest/25 bg-forest/8 text-forest'
};

const priorityClasses = {
  high: 'bg-gold/20 text-ink',
  low: 'bg-ink/5 text-ink/62',
  normal: 'bg-forest/10 text-forest',
  urgent: 'bg-wine/12 text-wine'
};

export function SessionManager() {
  const [state, setState] = useState(createSampleSessionManagerState);
  const view = useMemo(() => buildSessionManagerView(state), [state]);
  const [rollbackSequence, setRollbackSequence] = useState(
    view.rollbackTargets[0]?.sequence.toString() ?? ''
  );

  const effectiveRollbackSequence =
    rollbackSequence.length > 0
      ? Number.parseInt(rollbackSequence, 10)
      : (view.rollbackTargets[0]?.sequence ?? 0);

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.45fr]">
      <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-forest">Session</p>
            <h1 className="mt-1 text-3xl font-semibold text-ink">{state.title}</h1>
            <p className="mt-2 text-sm font-medium text-ink/62">
              {modeLabel(state.mode)} · {statusLabel(state.status)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
            {view.summaryMetrics.map((metric) => (
              <Metric label={metric.label} value={metric.value} key={metric.label} />
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <section className="rounded-md border border-ink/10 bg-vellum/60 p-4">
            <div className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-5 text-forest" />
              <h2 className="text-lg font-semibold text-ink">Scene active</h2>
            </div>
            <div className="mt-4">
              <p className="text-xl font-semibold text-ink">
                {view.activeScene?.title ?? 'Aucune scene'}
              </p>
              <p className="mt-1 text-sm font-semibold text-forest">
                {view.activeScene?.location ?? 'Hors scene'}
              </p>
              <p className="mt-3 text-sm leading-6 text-ink/70">
                {view.activeScene?.description ?? 'Scene non initialisee.'}
              </p>
            </div>
          </section>

          <section className="rounded-md border border-ink/10 bg-vellum/60 p-4">
            <div className="flex items-center gap-2">
              <Users aria-hidden="true" className="size-5 text-wine" />
              <h2 className="text-lg font-semibold text-ink">Participants</h2>
            </div>
            <ol className="mt-4 grid gap-2">
              {view.playerRows.map((player) => (
                <li
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-md bg-paper px-3 py-2"
                  key={player.id}
                >
                  <span>
                    <span className="block text-sm font-semibold text-ink">{player.name}</span>
                    <span className="block text-xs font-medium text-ink/52">
                      {roleLabel(player.role)}
                    </span>
                  </span>
                  <span
                    className={[
                      'rounded-sm px-2 py-1 text-xs font-semibold',
                      player.connected === false
                        ? 'bg-ink/8 text-ink/52'
                        : 'bg-forest/10 text-forest'
                    ].join(' ')}
                  >
                    {player.statusLabel}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="mt-5 rounded-md border border-ink/10 bg-white/72 p-4">
          <div className="flex items-center gap-2">
            <MessageSquarePlus aria-hidden="true" className="size-5 text-forest" />
            <h2 className="text-lg font-semibold text-ink">Actions rapides</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ActionButton
              icon={<ScrollText aria-hidden="true" className="size-4" />}
              label="RP"
              onClick={() =>
                setState((current) =>
                  recordSessionEvent(current, {
                    actorId: 'aveline',
                    payload: { text: 'Aveline precise son intention.' },
                    type: 'player_action'
                  })
                )
              }
            />
            <ActionButton
              icon={<Dice5 aria-hidden="true" className="size-4" />}
              label="D10"
              onClick={() =>
                setState((current) =>
                  recordSessionEvent(current, {
                    actorId: 'aveline',
                    payload: { difficulty: 7, successes: 2 },
                    type: 'dice_roll'
                  })
                )
              }
            />
            <ActionButton
              icon={<ShieldAlert aria-hidden="true" className="size-4" />}
              label="MJ"
              onClick={() =>
                setState((current) =>
                  submitGmDecisionRequest(current, 'Valider la consequence narrative')
                )
              }
            />
            <ActionButton
              disabled={view.rollbackTargets.length === 0}
              icon={<RotateCcw aria-hidden="true" className="size-4" />}
              label="Rollback"
              onClick={() =>
                setState((current) =>
                  requestRollbackFromEvent(
                    current,
                    effectiveRollbackSequence,
                    'Correction demandee par le MJ'
                  )
                )
              }
            />
          </div>
        </section>
      </section>

      <div className="grid gap-5">
        <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <ListChecks aria-hidden="true" className="size-5 text-wine" />
              <h2 className="text-xl font-semibold text-ink">File MJ</h2>
            </div>
            <div className="flex gap-2">
              <IconButton
                disabled={view.decisionQueue.length === 0}
                label="Approuver"
                onClick={() =>
                  setState((current) =>
                    resolveNextPendingDecision(current, 'approved', {
                      ruling: 'Decision validee par le MJ'
                    })
                  )
                }
              >
                <CheckCircle2 aria-hidden="true" className="size-4" />
              </IconButton>
              <IconButton
                disabled={view.decisionQueue.length === 0}
                label="Rejeter"
                onClick={() =>
                  setState((current) =>
                    resolveNextPendingDecision(current, 'rejected', {
                      ruling: 'Decision refusee par le MJ'
                    })
                  )
                }
              >
                <XCircle aria-hidden="true" className="size-4" />
              </IconButton>
            </div>
          </div>

          <ol className="mt-4 grid gap-3">
            {view.decisionQueue.length === 0 ? (
              <li className="rounded-md border border-ink/10 bg-paper p-4 text-sm font-semibold text-ink/58">
                File vide
              </li>
            ) : (
              view.decisionQueue.map((decision) => (
                <li
                  className="grid gap-3 rounded-md border border-ink/10 bg-paper p-4 md:grid-cols-[1fr_auto]"
                  key={decision.id}
                >
                  <span>
                    <span className="block text-base font-semibold text-ink">{decision.title}</span>
                    <span className="mt-1 block text-sm font-medium text-ink/56">
                      {decision.requestedBy} → {decision.assignedTo}
                    </span>
                  </span>
                  <span
                    className={[
                      'h-fit rounded-sm px-2 py-1 text-xs font-semibold uppercase',
                      priorityClasses[decision.priority]
                    ].join(' ')}
                  >
                    {decision.priority}
                  </span>
                </li>
              ))
            )}
          </ol>
        </section>

        <section className="rounded-md border border-ink/10 bg-white/78 p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <History aria-hidden="true" className="size-5 text-forest" />
              <h2 className="text-xl font-semibold text-ink">Journal canonique</h2>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold text-ink/62">
              <span>Retour</span>
              <select
                className="min-h-10 rounded-md border border-ink/15 bg-paper px-3 text-sm font-semibold text-ink outline-none focus:border-forest"
                onChange={(event) => setRollbackSequence(event.target.value)}
                value={rollbackSequence}
              >
                {view.rollbackTargets.map((target) => (
                  <option key={target.sequence} value={target.sequence}>
                    #{target.sequence}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <ol className="mt-4 grid gap-3">
            {view.recentEvents.map((event) => (
              <li
                className={`grid gap-2 rounded-md border p-3 md:grid-cols-[5rem_1fr] ${eventToneClasses[event.tone]}`}
                key={event.sequence}
              >
                <span className="font-mono text-sm font-semibold">#{event.sequence}</span>
                <span>
                  <span className="block text-sm font-semibold">{event.label}</span>
                  <span className="mt-1 block text-sm font-medium opacity-75">{event.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: number | string }>) {
  return (
    <div className="min-w-24 rounded-md border border-ink/10 bg-paper px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/46">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function ActionButton({
  disabled = false,
  icon,
  label,
  onClick
}: Readonly<{
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}>) {
  return (
    <button
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/12 bg-ink px-3 py-2 text-sm font-semibold text-paper transition hover:bg-forest disabled:cursor-not-allowed disabled:bg-ink/28"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {icon}
      {label}
    </button>
  );
}

function IconButton({
  children,
  disabled = false,
  label,
  onClick
}: Readonly<{
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}>) {
  return (
    <button
      aria-label={label}
      className="grid size-10 place-items-center rounded-md border border-ink/12 bg-paper text-ink transition hover:border-forest hover:text-forest disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

function modeLabel(mode: string): string {
  if (mode === 'digital_human_gm') {
    return 'MJ humain assiste';
  }

  if (mode === 'digital_llm_gm') {
    return 'MJ LLM';
  }

  if (mode === 'digital_auto_gm') {
    return 'Auto strict';
  }

  if (mode === 'multiplayer_no_gm') {
    return 'Sans MJ';
  }

  return 'Table classique';
}

function statusLabel(status: string): string {
  if (status === 'active') {
    return 'Active';
  }

  if (status === 'paused') {
    return 'En pause';
  }

  if (status === 'archived') {
    return 'Archivee';
  }

  return 'Planifiee';
}

function roleLabel(role: string): string {
  if (role === 'human_gm') {
    return 'MJ humain';
  }

  if (role === 'llm') {
    return 'LLM';
  }

  if (role === 'auto') {
    return 'Auto';
  }

  return 'Joueur';
}
