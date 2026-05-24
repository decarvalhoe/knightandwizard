import {
  buildSessionManagerView,
  type SessionDecisionRow,
  type SessionManagerState,
  type SessionManagerView
} from '../session-manager/model.js';

export type SessionDashboardTone = 'neutral' | 'success' | 'warn' | 'danger' | 'info';

export interface SessionDashboardAction {
  detail: string;
  id: string;
  label: string;
  tone: SessionDashboardTone;
}

export interface SessionDashboardAlert {
  detail: string;
  id: string;
  label: string;
  tone: SessionDashboardTone;
}

export interface SessionDashboardShortcut {
  detail: string;
  href: string;
  label: string;
}

export interface SessionDashboardView {
  alerts: SessionDashboardAlert[];
  nextActions: SessionDashboardAction[];
  session: SessionManagerView;
  shortcuts: SessionDashboardShortcut[];
}

const shortcuts: SessionDashboardShortcut[] = [
  {
    detail: 'Consulter les aptitudes, ressources et jets du PJ actif.',
    href: '/character',
    label: 'Fiche'
  },
  {
    detail: 'Ouvrir le registre DT pour resoudre la prochaine passe.',
    href: '/combat',
    label: 'Combat'
  },
  {
    detail: 'Verifier les ecoles, sorts et pistes de preparation.',
    href: '/grimoire',
    label: 'Grimoire'
  }
];

export function buildSessionDashboardView(state: SessionManagerState): SessionDashboardView {
  const session = buildSessionManagerView(state);

  return {
    alerts: buildAlerts(session),
    nextActions: buildNextActions(session),
    session,
    shortcuts
  };
}

function buildNextActions(session: SessionManagerView): SessionDashboardAction[] {
  if (session.decisionQueue.length === 0) {
    return [
      {
        detail: session.activeScene?.location ?? 'Hors scene',
        id: 'scene-watch',
        label: session.activeScene?.title ?? 'Ouvrir la prochaine scene',
        tone: 'info'
      }
    ];
  }

  return session.decisionQueue.map((decision) => ({
    detail: `${decision.requestedBy} -> ${decision.assignedTo}`,
    id: decision.id,
    label: decision.title,
    tone: decisionTone(decision)
  }));
}

function buildAlerts(session: SessionManagerView): SessionDashboardAlert[] {
  const alerts: SessionDashboardAlert[] = [];

  if (session.metrics.pendingDecisions > 0) {
    alerts.push({
      detail: plural(
        session.metrics.pendingDecisions,
        'decision MJ en attente',
        'decisions MJ en attente'
      ),
      id: 'decision-queue',
      label: 'Arbitrage requis',
      tone: 'warn'
    });
  }

  const offlinePlayers = session.playerRows.filter((player) => player.connected === false);
  if (offlinePlayers.length > 0) {
    alerts.push({
      detail: offlinePlayers.map((player) => player.name).join(', '),
      id: 'players-offline',
      label: offlinePlayers.length === 1 ? 'Joueur hors ligne' : 'Joueurs hors ligne',
      tone: 'neutral'
    });
  }

  if (alerts.length > 0) {
    return alerts;
  }

  return [
    {
      detail: 'Aucune decision bloquante ni absence signalee.',
      id: 'table-clear',
      label: 'Table stable',
      tone: 'success'
    }
  ];
}

function decisionTone(decision: SessionDecisionRow): SessionDashboardTone {
  if (decision.priority === 'urgent') {
    return 'danger';
  }

  if (decision.priority === 'high') {
    return 'warn';
  }

  if (decision.priority === 'normal') {
    return 'info';
  }

  return 'neutral';
}

function plural(count: number, singular: string, pluralized: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${pluralized}`;
}
