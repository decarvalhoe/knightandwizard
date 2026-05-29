'use client';

import type { CSSProperties } from 'react';
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookUser,
  Clock3,
  Moon,
  Newspaper,
  ScrollText,
  Sun,
  Swords,
  Users,
  WandSparkles,
  type LucideIcon
} from 'lucide-react';
import Link from 'next/link';

import { Badge, Button, Card, Label, Seal, StatBlock, type BadgeTone } from '@knightandwizard/ui';

import {
  buildSessionDashboardView,
  type SessionDashboardShortcut,
  type SessionDashboardTone
} from '@/features/session-dashboard/model';
import { createInitialSessionManagerState } from '@/features/session-manager/initial-state';

const shortcutIcons: Record<string, LucideIcon> = {
  '/character': BookUser,
  '/combat': Swords,
  '/grimoire': WandSparkles
};

const iconStyle: CSSProperties = {
  flex: '0 0 auto',
  height: 18,
  width: 18
};

export default function DashboardPage() {
  const [night, setNight] = useState(false);
  const sessionState = useMemo(() => createInitialSessionManagerState(), []);
  const dashboard = useMemo(() => buildSessionDashboardView(sessionState), [sessionState]);
  const session = dashboard.session;
  const activeScene = session.activeScene;
  const ThemeIcon = night ? Moon : Sun;

  return (
    <main data-skin="gazette" data-theme={night ? 'night' : undefined} style={surfaceStyle}>
      <header style={heroStyle}>
        <div style={titleLockupStyle}>
          <div style={labelIconStyle}>
            <Newspaper aria-hidden="true" style={iconStyle} />
            <Label>Gazette de campagne · poste de table</Label>
          </div>
          <h1 style={titleStyle}>Poste de table · {sessionState.title}</h1>
          <p style={dekStyle}>
            {modeLabel(sessionState.mode)} · {statusLabel(sessionState.status)} · scene active :{' '}
            {activeScene?.title ?? 'hors scène'}
          </p>
          <div style={badgeRowStyle}>
            <Badge tone="info">{session.metrics.activePlayers} joueurs actifs</Badge>
            <Badge tone={session.metrics.pendingDecisions > 0 ? 'warn' : 'success'}>
              {session.metrics.pendingDecisions} décisions MJ
            </Badge>
            <Badge tone="neutral">{session.metrics.events} entrées au journal</Badge>
          </div>
        </div>

        <div style={heroAsideStyle}>
          <Button
            aria-pressed={night}
            onClick={() => setNight((current) => !current)}
            style={buttonWithIconStyle}
            variant="secondary"
          >
            <ThemeIcon aria-hidden="true" style={iconStyle} />
            {night ? 'Veillée' : 'Jour'}
          </Button>
          <Seal>Poste</Seal>
        </div>
      </header>

      <section style={summaryGridStyle} aria-label="État de session">
        <Card>
          <StatBlock
            title="État de session"
            items={session.summaryMetrics.map((metric) => ({
              label: metric.label,
              value: metric.value
            }))}
          />
        </Card>

        <Card>
          <div style={labelIconStyle}>
            <Users aria-hidden="true" style={iconStyle} />
            <Label>Table connectee</Label>
          </div>
          <ol style={listStyle}>
            {session.playerRows.map((player) => (
              <li key={player.id} style={rowStyle}>
                <span>
                  <strong style={rowTitleStyle}>{player.name}</strong>
                  <span style={rowDetailStyle}>{roleLabel(player.role)}</span>
                </span>
                <Badge tone={player.connected === false ? 'neutral' : 'success'}>
                  {player.statusLabel}
                </Badge>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      <section style={dashboardGridStyle}>
        <Card>
          <div style={panelHeadStyle}>
            <div style={labelIconStyle}>
              <Clock3 aria-hidden="true" style={iconStyle} />
              <Label>Prochaines actions</Label>
            </div>
            <Badge tone={dashboard.nextActions.length > 1 ? 'warn' : 'info'}>
              {dashboard.nextActions.length}
            </Badge>
          </div>
          <ol style={listStyle}>
            {dashboard.nextActions.map((action) => (
              <li key={action.id} style={rowStyle}>
                <span>
                  <strong style={rowTitleStyle}>{action.label}</strong>
                  <span style={rowDetailStyle}>{action.detail}</span>
                </span>
                <Badge tone={toBadgeTone(action.tone)}>{action.tone}</Badge>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <div style={panelHeadStyle}>
            <div style={labelIconStyle}>
              <AlertTriangle aria-hidden="true" style={iconStyle} />
              <Label>Alertes</Label>
            </div>
            <Badge
              tone={dashboard.alerts.some((alert) => alert.tone === 'warn') ? 'warn' : 'success'}
            >
              {dashboard.alerts.length}
            </Badge>
          </div>
          <ol style={listStyle}>
            {dashboard.alerts.map((alert) => (
              <li key={alert.id} style={rowStyle}>
                <span>
                  <strong style={rowTitleStyle}>{alert.label}</strong>
                  <span style={rowDetailStyle}>{alert.detail}</span>
                </span>
                <Badge tone={toBadgeTone(alert.tone)}>{alert.tone}</Badge>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      <section style={dashboardGridStyle}>
        <Card>
          <div style={labelIconStyle}>
            <ScrollText aria-hidden="true" style={iconStyle} />
            <Label>Scène active</Label>
          </div>
          <h2 style={sectionTitleStyle}>{activeScene?.title ?? 'Aucune scène ouverte'}</h2>
          <p style={bodyCopyStyle}>{activeScene?.description ?? 'La session attend une scène.'}</p>
          <p style={metaStyle}>{activeScene?.location ?? 'Hors scène'}</p>
        </Card>

        <Card>
          <Label>Raccourcis de surface</Label>
          <nav aria-label="Raccourcis du poste de table" style={shortcutGridStyle}>
            {dashboard.shortcuts.map((shortcut) => (
              <ShortcutLink key={shortcut.href} shortcut={shortcut} />
            ))}
          </nav>
        </Card>
      </section>

      <Card>
        <div style={panelHeadStyle}>
          <div style={labelIconStyle}>
            <Newspaper aria-hidden="true" style={iconStyle} />
            <Label>Journal récent</Label>
          </div>
          <Badge tone="neutral">#{session.recentEvents[0]?.sequence ?? 0}</Badge>
        </div>
        <ol style={journalListStyle}>
          {session.recentEvents.slice(0, 5).map((event) => (
            <li key={event.sequence} style={journalRowStyle}>
              <Badge tone={eventTone(event.tone)}>#{event.sequence}</Badge>
              <span>
                <strong style={rowTitleStyle}>{event.label}</strong>
                <span style={rowDetailStyle}>{event.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </Card>
    </main>
  );
}

function ShortcutLink({ shortcut }: Readonly<{ shortcut: SessionDashboardShortcut }>) {
  const Icon = shortcutIcons[shortcut.href] ?? ScrollText;

  return (
    <Link
      aria-label={`Ouvrir ${shortcut.label}`}
      className="kw-btn kw-btn--secondary"
      href={shortcut.href}
      style={shortcutLinkStyle}
    >
      <Icon aria-hidden="true" style={iconStyle} />
      <span style={shortcutTextStyle}>
        <strong style={rowTitleStyle}>{shortcut.label}</strong>
        <span style={rowDetailStyle}>{shortcut.detail}</span>
      </span>
    </Link>
  );
}

function toBadgeTone(tone: SessionDashboardTone): BadgeTone {
  return tone;
}

function eventTone(tone: string): BadgeTone {
  if (tone === 'audit') return 'danger';
  if (tone === 'decision') return 'warn';
  if (tone === 'rules') return 'info';
  return 'neutral';
}

function modeLabel(mode: string): string {
  if (mode === 'digital_human_gm') return 'MJ humain assiste';
  if (mode === 'digital_llm_gm') return 'MJ LLM';
  if (mode === 'digital_auto_gm') return 'Auto strict';
  if (mode === 'multiplayer_no_gm') return 'Sans MJ';
  return 'Table classique';
}

function statusLabel(status: string): string {
  if (status === 'active') return 'Active';
  if (status === 'paused') return 'En pause';
  if (status === 'archived') return 'Archivee';
  return 'Planifiee';
}

function roleLabel(role: string): string {
  if (role === 'human_gm') return 'MJ humain';
  if (role === 'llm') return 'LLM';
  if (role === 'auto') return 'Auto';
  return 'Joueur';
}

const surfaceStyle: CSSProperties = {
  background: 'var(--color-bg-canvas)',
  border: 'var(--border-strong) solid var(--color-border-rule)',
  color: 'var(--color-text-ink)',
  display: 'grid',
  fontFamily: 'var(--font-body)',
  gap: 16,
  padding: 24
};

const heroStyle: CSSProperties = {
  alignItems: 'flex-start',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
  justifyContent: 'space-between'
};

const titleLockupStyle: CSSProperties = {
  display: 'grid',
  flex: '1 1 520px',
  gap: 8,
  minWidth: 0
};

const titleStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-title-l)',
  lineHeight: 'var(--leading-tight)',
  margin: 0
};

const dekStyle: CSSProperties = {
  color: 'var(--color-text-muted)',
  fontSize: 'var(--text-body-l)',
  lineHeight: 'var(--leading-normal)',
  margin: 0,
  maxWidth: 760
};

const heroAsideStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  flex: '0 1 auto',
  gap: 12
};

const labelIconStyle: CSSProperties = {
  alignItems: 'center',
  color: 'var(--color-accent)',
  display: 'flex',
  gap: 8
};

const badgeRowStyle: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8
};

const buttonWithIconStyle: CSSProperties = {
  alignItems: 'center',
  display: 'inline-flex',
  gap: 8
};

const summaryGridStyle: CSSProperties = {
  alignItems: 'stretch',
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))'
};

const dashboardGridStyle: CSSProperties = {
  alignItems: 'start',
  display: 'grid',
  gap: 16,
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))'
};

const panelHeadStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: 12,
  justifyContent: 'space-between'
};

const listStyle: CSSProperties = {
  display: 'grid',
  gap: 10,
  listStyle: 'none',
  margin: '12px 0 0',
  padding: 0
};

const rowStyle: CSSProperties = {
  alignItems: 'center',
  background: 'var(--color-bg-elevated)',
  border: 'var(--border-hairline) solid var(--color-border-hairline)',
  display: 'flex',
  gap: 12,
  justifyContent: 'space-between',
  padding: '10px 12px'
};

const rowTitleStyle: CSSProperties = {
  color: 'var(--color-text-ink)',
  display: 'block',
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-body-l)',
  lineHeight: 'var(--leading-tight)'
};

const rowDetailStyle: CSSProperties = {
  color: 'var(--color-text-muted)',
  display: 'block',
  fontSize: 'var(--text-body-m)',
  lineHeight: 'var(--leading-normal)',
  marginTop: 2
};

const sectionTitleStyle: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-title-m)',
  lineHeight: 'var(--leading-tight)',
  margin: '12px 0 0'
};

const bodyCopyStyle: CSSProperties = {
  color: 'var(--color-text-muted)',
  lineHeight: 'var(--leading-normal)',
  margin: '8px 0 0'
};

const metaStyle: CSSProperties = {
  color: 'var(--color-accent)',
  fontFamily: 'var(--font-label)',
  fontSize: 'var(--text-label-sm)',
  letterSpacing: 'var(--tracking-label)',
  margin: '12px 0 0',
  textTransform: 'uppercase'
};

const shortcutGridStyle: CSSProperties = {
  display: 'grid',
  gap: 10,
  marginTop: 12
};

const shortcutLinkStyle: CSSProperties = {
  alignItems: 'center',
  display: 'flex',
  gap: 10,
  justifyContent: 'flex-start',
  minHeight: 58,
  textAlign: 'left',
  textDecoration: 'none',
  textTransform: 'none',
  width: '100%'
};

const shortcutTextStyle: CSSProperties = {
  display: 'grid',
  gap: 2,
  minWidth: 0
};

const journalListStyle: CSSProperties = {
  display: 'grid',
  gap: 8,
  listStyle: 'none',
  margin: '12px 0 0',
  padding: 0
};

const journalRowStyle: CSSProperties = {
  alignItems: 'flex-start',
  borderBottom: 'var(--border-hairline) solid var(--color-border-hairline)',
  display: 'grid',
  gap: 10,
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  padding: '0 0 10px'
};
