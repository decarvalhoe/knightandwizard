'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Gavel,
  PlusCircle,
  RotateCcw,
  ScrollText,
  Swords,
  Users,
  XCircle
} from 'lucide-react';

import type { SessionManagerState } from '../session-manager/model';
import {
  appendGmRulingToSession,
  awardCharacterXp,
  fetchPersistedSessionState,
  queuePersistedChangeRequest,
  requestPersistedRollback,
  resolvePersistedChangeRequest
} from '../session-manager/persistence';

import { buildGmCockpitView } from './model';

interface GmCockpitProps {
  initialState: SessionManagerState;
}

export function GmCockpit({ initialState }: Readonly<GmCockpitProps>) {
  const [state, setState] = useState(initialState);
  const view = useMemo(() => buildGmCockpitView(state), [state]);
  const [selectedXpTarget, setSelectedXpTarget] = useState(view.xpTargets[0]?.characterId ?? '');
  const [changeKind, setChangeKind] = useState('predilection_target');
  const [changeSummary, setChangeSummary] = useState('Changement a valider par le MJ.');
  const [changeTargetId, setChangeTargetId] = useState(view.xpTargets[0]?.characterId ?? '');
  const [changeTargetType, setChangeTargetType] = useState('character');
  const [changeTitle, setChangeTitle] = useState('Changer une predilection');
  const [rollbackSequence, setRollbackSequence] = useState(
    view.rollbackTargets[0]?.sequence.toString() ?? ''
  );
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const effectiveXpTarget =
    view.xpTargets.find((target) => target.characterId === selectedXpTarget) ?? view.xpTargets[0];
  const effectiveRollbackSequence =
    rollbackSequence.length > 0
      ? Number.parseInt(rollbackSequence, 10)
      : (view.rollbackTargets[0]?.sequence ?? 0);

  async function run(action: string, mutation: () => Promise<SessionManagerState | void>) {
    if (pendingAction) {
      return;
    }

    setPendingAction(action);
    setError(null);

    try {
      const nextState = await mutation();
      setState(nextState ?? (await fetchPersistedSessionState(state.slug)));
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : 'Action MJ impossible');
    } finally {
      setPendingAction(null);
    }
  }

  function awardXp() {
    if (!effectiveXpTarget) {
      return;
    }

    void run('xp', async () => {
      await awardCharacterXp(effectiveXpTarget.characterId, {
        actorId: 'gm',
        amount: 1,
        reason: 'Fin de session',
        sessionSlug: state.slug
      });
      await appendGmRulingToSession(state.slug, {
        actorId: 'gm',
        payload: {
          characterId: effectiveXpTarget.characterId,
          kind: 'xp_award',
          text: `XP attribue a ${effectiveXpTarget.name}`,
          xp: 1
        }
      });
    });
  }

  function addQuickNpc() {
    void run('npc', async () => {
      await appendGmRulingToSession(state.slug, {
        actorId: 'gm',
        payload: {
          kind: 'quick_npc',
          name: 'PNJ rapide',
          text: 'PNJ rapide ajoute au suivi MJ'
        }
      });
    });
  }

  function closeSession() {
    void run('close', async () => {
      await appendGmRulingToSession(state.slug, {
        actorId: 'gm',
        payload: {
          kind: 'session_closed',
          text: 'Fin de session marquee par le MJ'
        }
      });
    });
  }

  function rollback() {
    if (effectiveRollbackSequence <= 0) {
      return;
    }

    void run('rollback', async () =>
      requestPersistedRollback(state.slug, {
        actorId: 'gm',
        reason: 'Renvoi depuis cockpit MJ',
        targetSequence: effectiveRollbackSequence
      })
    );
  }

  function submitChangeRequest() {
    const title = changeTitle.trim();
    const summary = changeSummary.trim();
    const targetId = changeTargetId.trim();

    if (!title || !summary) {
      return;
    }

    void run('change-request-create', async () => {
      await queuePersistedChangeRequest(state.slug, {
        assignedTo: 'human_gm',
        authority: 'human_gm',
        changeKind,
        payload: { source: 'gm-cockpit' },
        priority: 'normal',
        requestedBy: 'gm',
        summary,
        ...(targetId ? { targetId } : {}),
        targetType: changeTargetType,
        title
      });
      setChangeTitle('Changer une predilection');
      setChangeSummary('Changement a valider par le MJ.');
    });
  }

  function resolveChangeRequest(changeRequestId: string, status: 'approved' | 'rejected') {
    void run(`change-request-${changeRequestId}-${status}`, async () => {
      await resolvePersistedChangeRequest(state.slug, changeRequestId, {
        actorId: 'gm',
        resolution: {
          ruling:
            status === 'approved'
              ? 'Demande approuvee depuis le cockpit MJ.'
              : 'Demande rejetee depuis le cockpit MJ.'
        },
        status
      });
    });
  }

  return (
    <main className="grid gap-5">
      <section className="rounded-md border border-ink/10 bg-white/72 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-wine">
              Cockpit MJ
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">{view.title}</h1>
            <p className="mt-2 text-sm leading-6 text-ink/68">
              {view.activeScene?.title ?? 'Aucune scène active'} ·{' '}
              {view.activeScene?.location ?? 'Hors scène'} · {view.metrics.pendingDecisions}{' '}
              décision(s) MJ · {view.pendingChangeRequests.length} demande(s)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CockpitLink href={view.sessionHref} label="Session" />
            <CockpitLink href={view.primaryCombatHref} label="Combat" />
          </div>
        </div>
        {error ? (
          <p className="mt-4 rounded-md border border-wine/20 bg-wine/10 px-3 py-2 text-sm font-semibold text-wine">
            {error}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-md border border-ink/10 bg-white/72 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <ScrollText aria-hidden="true" className="size-5 text-forest" />
            <h2 className="text-lg font-semibold text-ink">Scène active</h2>
          </div>
          <p className="mt-4 text-xl font-semibold text-ink">
            {view.activeScene?.title ?? 'Aucune scène'}
          </p>
          <p className="mt-1 text-sm font-semibold text-forest">
            {view.activeScene?.location ?? 'Hors scène'}
          </p>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            {view.activeScene?.description ?? 'Le MJ peut reprendre depuis le journal de session.'}
          </p>
        </article>

        <article className="rounded-md border border-ink/10 bg-white/72 p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Users aria-hidden="true" className="size-5 text-wine" />
            <h2 className="text-lg font-semibold text-ink">Participants</h2>
          </div>
          <ol className="mt-4 grid gap-2">
            {view.participants.length === 0 ? (
              <li className="rounded-md bg-forest/8 px-3 py-2 text-sm font-semibold text-forest">
                Aucun participant connecté pour l&apos;instant.
              </li>
            ) : null}
            {view.participants.map((participant) => (
              <li
                className="grid grid-cols-[1fr_auto] gap-3 rounded-md bg-paper px-3 py-2"
                key={participant.id}
              >
                <span>
                  <span className="block text-sm font-semibold text-ink">{participant.name}</span>
                  <span className="block text-xs font-medium text-ink/55">
                    {participant.role} · {participant.statusLabel}
                  </span>
                </span>
                {participant.characterHref ? (
                  <Link
                    className="text-xs font-semibold text-forest"
                    href={participant.characterHref}
                  >
                    Fiche
                  </Link>
                ) : null}
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-md border border-ink/10 bg-white/72 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">File MJ</h2>
          <ol className="mt-4 grid gap-2">
            {view.pendingDecisions.length === 0 ? (
              <li className="rounded-md bg-forest/8 px-3 py-2 text-sm font-semibold text-forest">
                Aucune decision bloquante.
              </li>
            ) : (
              view.pendingDecisions.map((decision) => (
                <li className="rounded-md bg-paper px-3 py-2" key={decision.id}>
                  <span className="block text-sm font-semibold text-ink">{decision.title}</span>
                  <span className="block text-xs font-medium text-ink/55">
                    {decision.requestedBy}
                    {' -> '}
                    {decision.assignedTo} · {decision.priorityLabel}
                  </span>
                </li>
              ))
            )}
          </ol>
          <div className="mt-5 border-t border-ink/10 pt-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink/55">
              Demandes de changement
            </h3>
            <ol className="mt-3 grid gap-2">
              {view.pendingChangeRequests.length === 0 ? (
                <li className="rounded-md bg-forest/8 px-3 py-2 text-sm font-semibold text-forest">
                  Aucune demande ouverte.
                </li>
              ) : (
                view.pendingChangeRequests.map((request) => (
                  <li className="rounded-md bg-paper px-3 py-2" key={request.id}>
                    <span className="block text-sm font-semibold text-ink">{request.title}</span>
                    <span className="block text-xs font-medium text-ink/55">
                      {request.requestedBy}
                      {' -> '}
                      {request.authority} · {request.targetLabel}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-ink/65">
                      {request.summary}
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        className="inline-flex items-center gap-1 rounded-md bg-forest px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
                        disabled={pendingAction !== null}
                        onClick={() => resolveChangeRequest(request.id, 'approved')}
                        type="button"
                      >
                        <CheckCircle2 aria-hidden="true" className="size-3.5" />
                        Approuver
                      </button>
                      <button
                        className="inline-flex items-center gap-1 rounded-md bg-wine px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
                        disabled={pendingAction !== null}
                        onClick={() => resolveChangeRequest(request.id, 'rejected')}
                        type="button"
                      >
                        <XCircle aria-hidden="true" className="size-3.5" />
                        Rejeter
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ol>
          </div>
        </article>

        <article className="rounded-md border border-ink/10 bg-white/72 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Renvoi</h2>
          <label className="mt-4 block text-sm font-semibold text-ink/70" htmlFor="gm-rollback">
            Point de reprise
          </label>
          <select
            className="mt-2 w-full rounded-md border border-ink/12 bg-paper px-3 py-2 text-sm font-semibold text-ink"
            id="gm-rollback"
            onChange={(event) => setRollbackSequence(event.target.value)}
            value={rollbackSequence}
          >
            {view.rollbackTargets.map((target) => (
              <option key={target.sequence} value={target.sequence}>
                {target.label}
              </option>
            ))}
          </select>
          <button
            className="mt-3 inline-flex items-center gap-2 rounded-md bg-wine px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
            disabled={pendingAction !== null || view.rollbackTargets.length === 0}
            onClick={rollback}
            type="button"
          >
            <RotateCcw aria-hidden="true" className="size-4" />
            Renvoi
          </button>
        </article>

        <article className="rounded-md border border-ink/10 bg-white/72 p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-ink">Actions MJ</h2>
          <label className="mt-4 block text-sm font-semibold text-ink/70" htmlFor="gm-xp-target">
            Cible XP
          </label>
          <select
            className="mt-2 w-full rounded-md border border-ink/12 bg-paper px-3 py-2 text-sm font-semibold text-ink"
            id="gm-xp-target"
            onChange={(event) => setSelectedXpTarget(event.target.value)}
            value={selectedXpTarget}
          >
            {view.xpTargets.map((target) => (
              <option key={target.characterId} value={target.characterId}>
                {target.name}
              </option>
            ))}
          </select>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="inline-flex items-center gap-2 rounded-md bg-forest px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={pendingAction !== null || !effectiveXpTarget}
              onClick={awardXp}
              type="button"
            >
              <CheckCircle2 aria-hidden="true" className="size-4" />
              Attribuer 1 XP
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
              disabled={pendingAction !== null}
              onClick={addQuickNpc}
              type="button"
            >
              <Users aria-hidden="true" className="size-4" />
              PNJ rapide
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-md bg-gold px-3 py-2 text-sm font-semibold text-ink disabled:opacity-50"
              disabled={pendingAction !== null}
              onClick={closeSession}
              type="button"
            >
              Fin de session
            </button>
          </div>
        </article>
      </section>

      <section className="rounded-md border border-ink/10 bg-white/72 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Gavel aria-hidden="true" className="size-5 text-wine" />
          <h2 className="text-lg font-semibold text-ink">Nouvelle demande</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block text-sm font-semibold text-ink/70" htmlFor="gm-change-title">
            Minute
            <input
              className="mt-2 w-full rounded-md border border-ink/12 bg-paper px-3 py-2 text-sm font-semibold text-ink"
              id="gm-change-title"
              onChange={(event) => setChangeTitle(event.target.value)}
              value={changeTitle}
            />
          </label>
          <label className="block text-sm font-semibold text-ink/70" htmlFor="gm-change-kind">
            Type
            <select
              className="mt-2 w-full rounded-md border border-ink/12 bg-paper px-3 py-2 text-sm font-semibold text-ink"
              id="gm-change-kind"
              onChange={(event) => setChangeKind(event.target.value)}
              value={changeKind}
            >
              <option value="predilection_target">Prédilection</option>
              <option value="feat_target">Cible d&apos;atout</option>
              <option value="class_reclassification">Reclassement</option>
              <option value="scene_state">État de scène</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-ink/70" htmlFor="gm-change-target">
            Cible
            <select
              className="mt-2 w-full rounded-md border border-ink/12 bg-paper px-3 py-2 text-sm font-semibold text-ink"
              id="gm-change-target"
              onChange={(event) => setChangeTargetType(event.target.value)}
              value={changeTargetType}
            >
              <option value="character">Personnage</option>
              <option value="session">Session</option>
              <option value="scene">Scène</option>
              <option value="catalog_entry">Entrée canonique</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-ink/70" htmlFor="gm-change-target-id">
            Identifiant
            <input
              className="mt-2 w-full rounded-md border border-ink/12 bg-paper px-3 py-2 text-sm font-semibold text-ink"
              id="gm-change-target-id"
              onChange={(event) => setChangeTargetId(event.target.value)}
              value={changeTargetId}
            />
          </label>
          <label
            className="block text-sm font-semibold text-ink/70 md:col-span-2"
            htmlFor="gm-change-summary"
          >
            Résumé
            <textarea
              className="mt-2 min-h-24 w-full rounded-md border border-ink/12 bg-paper px-3 py-2 text-sm font-semibold text-ink"
              id="gm-change-summary"
              onChange={(event) => setChangeSummary(event.target.value)}
              value={changeSummary}
            />
          </label>
        </div>
        <button
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          disabled={pendingAction !== null || !changeTitle.trim() || !changeSummary.trim()}
          onClick={submitChangeRequest}
          type="button"
        >
          <PlusCircle aria-hidden="true" className="size-4" />
          Inscrire
        </button>
      </section>

      <section className="rounded-md border border-ink/10 bg-white/72 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Swords aria-hidden="true" className="size-5 text-forest" />
          <h2 className="text-lg font-semibold text-ink">Journal récent</h2>
        </div>
        <ol className="mt-4 grid gap-2">
          {view.recentEvents.map((event) => (
            <li className="rounded-md bg-paper px-3 py-2" key={event.sequence}>
              <span className="block text-sm font-semibold text-ink">
                #{event.sequence} · {event.label}
              </span>
              <span className="block text-xs font-medium text-ink/55">{event.detail}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

function CockpitLink({ href, label }: Readonly<{ href: string; label: string }>) {
  return (
    <Link
      className="inline-flex items-center gap-2 rounded-md border border-ink/12 bg-paper px-3 py-2 text-sm font-semibold text-ink hover:border-forest hover:text-forest"
      href={href}
    >
      {label}
      <ArrowUpRight aria-hidden="true" className="size-4" />
    </Link>
  );
}
