import type { SessionScene } from '@knightandwizard/rules-core';

import {
  buildSessionManagerView,
  type SessionManagerState,
  type SessionManagerView
} from '../session-manager/model.js';

export interface GmCockpitParticipant {
  characterHref?: string;
  characterId?: string;
  id: string;
  name: string;
  role: string;
  statusLabel: string;
}

export interface GmCockpitDecision {
  assignedTo: string;
  id: string;
  priority: string;
  priorityLabel: string;
  requestedBy: string;
  title: string;
}

export interface GmCockpitRollbackTarget {
  label: string;
  sequence: number;
}

export interface GmCockpitXpTarget {
  characterId: string;
  id: string;
  name: string;
}

export interface GmCockpitView {
  activeScene?: SessionScene;
  metrics: SessionManagerView['metrics'];
  participants: GmCockpitParticipant[];
  pendingDecisions: GmCockpitDecision[];
  primaryCombatHref: string;
  recentEvents: SessionManagerView['recentEvents'];
  rollbackTargets: GmCockpitRollbackTarget[];
  sessionHref: string;
  slug: string;
  title: string;
  xpTargets: GmCockpitXpTarget[];
}

export function buildGmCockpitView(state: SessionManagerState): GmCockpitView {
  const session = buildSessionManagerView(state);
  const xpTargets = session.playerRows
    .filter((player) => player.characterId)
    .map((player) => ({
      characterId: player.characterId as string,
      id: player.id,
      name: player.name
    }));
  const primaryCharacterId = xpTargets[0]?.characterId;

  return {
    activeScene: session.activeScene,
    metrics: session.metrics,
    participants: session.playerRows.map((player) => ({
      ...(player.characterId
        ? {
            characterHref: `/character?characterId=${encodeURIComponent(player.characterId)}`,
            characterId: player.characterId
          }
        : {}),
      id: player.id,
      name: player.name,
      role: roleLabel(player.role),
      statusLabel: player.statusLabel
    })),
    pendingDecisions: session.decisionQueue.map((decision) => ({
      assignedTo: decision.assignedTo,
      id: decision.id,
      priority: decision.priority,
      priorityLabel: decision.priorityLabel,
      requestedBy: decision.requestedBy,
      title: decision.title
    })),
    primaryCombatHref: primaryCharacterId
      ? `/combat?slug=${encodeURIComponent(state.slug)}&characterId=${encodeURIComponent(primaryCharacterId)}`
      : `/combat?slug=${encodeURIComponent(state.slug)}`,
    recentEvents: session.recentEvents,
    rollbackTargets: session.rollbackTargets.map((target) => ({
      label: compactRollbackLabel(target.label, target.sequence),
      sequence: target.sequence
    })),
    sessionHref: `/session?slug=${encodeURIComponent(state.slug)}`,
    slug: state.slug,
    title: state.title,
    xpTargets
  };
}

function compactRollbackLabel(label: string, sequence: number): string {
  const parts = label.split(' · ');
  const eventLabel = parts.at(-1) ?? label;

  return `#${sequence} ${eventLabel}`.toLowerCase();
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
