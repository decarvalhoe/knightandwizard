'use client';

import { useMemo, useState } from 'react';

import type { CombatAction, CombatState } from '@knightandwizard/rules-core';
import { Badge, Button, Card, Label, Seal } from '@knightandwizard/ui';
import type { BadgeTone } from '@knightandwizard/ui';

import {
  buildCombatTrackerView,
  createCombatTrackerState,
  queueTrackerAction,
  removeTrackerCombatant,
  resolveTrackerNextAction,
  type CombatLogTone,
  type VitalityState
} from '@/features/combat-tracker/model';
import {
  FOE_IDS,
  PLAYER_ID,
  demoCombatants,
  makeSeededRandomInteger
} from '@/lib/design-proto-data';

// Surface « Registre du commandant » (skin registre) — l'ordre de bataille en DT.
// Branchée sur le VRAI moteur de combat : createCombatTrackerState / queueTrackerAction /
// resolveTrackerNextAction / buildCombatTrackerView. Le moteur ordonne la timeline,
// résout les jets d'attaque/défense et applique les dégâts ; la surface ne calcule rien.

const FOES = FOE_IDS as readonly string[];

function logTone(tone: CombatLogTone): BadgeTone {
  return tone === 'warning' ? 'warn' : tone;
}

function vitalityColor(state: VitalityState): string {
  if (state === 'dead') return 'var(--color-text-muted)';
  if (state === 'critical') return 'var(--color-fb-danger)';
  if (state === 'wounded') return 'var(--color-fb-warn)';
  return 'var(--color-fb-success)';
}

function actionFor(id: string, state: CombatState): CombatAction | undefined {
  const me = state.timeline.find((combatant) => combatant.id === id);

  if (!me || me.vitality.current <= 0) {
    return undefined;
  }

  if (id === PLAYER_ID) {
    const foe = state.timeline.find(
      (combatant) => FOES.includes(combatant.id) && combatant.vitality.current > 0
    );

    if (!foe) {
      return { type: 'wait', costDT: 5 };
    }

    return {
      type: 'attack',
      targetId: foe.id,
      attack: { pool: 8, difficulty: 7 },
      defense: { pool: 3, difficulty: 7 },
      damageOnHit: 6,
      costDT: 8
    };
  }

  const player = state.timeline.find(
    (combatant) => combatant.id === PLAYER_ID && combatant.vitality.current > 0
  );

  if (!player) {
    return { type: 'wait', costDT: id === 'molosse' ? 6 : 10 };
  }

  if (id === 'molosse') {
    return {
      type: 'attack',
      targetId: PLAYER_ID,
      attack: { pool: 7, difficulty: 7 },
      defense: { pool: 4, difficulty: 7 },
      damageOnHit: 4,
      costDT: 6
    };
  }

  return {
    type: 'attack',
    targetId: PLAYER_ID,
    attack: { pool: 6, difficulty: 7 },
    defense: { pool: 4, difficulty: 7 },
    damageOnHit: 5,
    costDT: 10
  };
}

function queueAll(state: CombatState): CombatState {
  return [PLAYER_ID, 'brigand', 'molosse'].reduce((current, id) => {
    const combatant = current.timeline.find((entry) => entry.id === id);

    if (!combatant || combatant.pendingAction) {
      return current;
    }

    const action = actionFor(id, current);
    return action ? queueTrackerAction(current, id, action) : current;
  }, state);
}

function freshState(): CombatState {
  return queueAll(createCombatTrackerState({ combatants: demoCombatants }));
}

function pruneDeadFoes(state: CombatState): CombatState {
  return buildCombatTrackerView(state)
    .roster.filter((row) => row.vitalityState === 'dead' && FOES.includes(row.id))
    .reduce((current, row) => removeTrackerCombatant(current, row.id), state);
}

export default function RegistreSurfacePage() {
  const [night, setNight] = useState(false);
  const initialState = useMemo(() => freshState(), []);
  const [state, setState] = useState<CombatState>(initialState);

  const view = buildCombatTrackerView(state);
  const player = view.roster.find((row) => row.id === PLAYER_ID);
  const foesAlive = view.roster.filter(
    (row) => FOES.includes(row.id) && row.vitalityState !== 'dead'
  );
  const over = !player || player.vitalityState === 'dead' || foesAlive.length === 0;
  const verdict = over
    ? foesAlive.length === 0
      ? 'Le terrain est tenu — adversaires hors de combat.'
      : 'Le héros est tombé.'
    : null;

  function advance() {
    setState((current) => {
      const queued = queueAll(current);
      const resolved = resolveTrackerNextAction(
        queued,
        makeSeededRandomInteger(4096 + queued.log.length)
      );
      return pruneDeadFoes(resolved);
    });
  }

  const recentLog = [...view.log].slice(-8).reverse();

  return (
    <div style={{ padding: 24, maxWidth: 880, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 4 }}>Surface — Registre du commandant (skin registre)</h1>
      <p style={{ color: '#666', marginTop: 0 }}>
        Branchée sur le vrai moteur de combat <code>rules-core</code> + <code>combat-tracker</code>{' '}
        : timeline DT, jets d’attaque/défense et dégâts via <code>resolveTrackerNextAction</code> /{' '}
        <code>buildCombatTrackerView</code>.
      </p>
      <button type="button" onClick={() => setNight((n) => !n)} style={{ marginBottom: 12 }}>
        Mode : {night ? 'Veillée (nuit)' : 'Jour'}
      </button>

      <div
        data-skin="registre"
        data-theme={night ? 'night' : undefined}
        style={{
          background: 'var(--color-bg-canvas)',
          color: 'var(--color-text-ink)',
          fontFamily: 'var(--font-body)',
          padding: 24,
          border: 'var(--border-strong) solid var(--color-border-rule)',
          display: 'grid',
          gap: 16
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Label>Registre du commandant · ordre de bataille</Label>
            <h2 style={{ fontFamily: 'var(--font-display)', margin: '4px 0' }}>
              Escarmouche sur la route de Fauche-le-Vent
            </h2>
            <div style={{ color: 'var(--color-text-muted)' }}>
              Manche {view.current.round} · DT {view.current.cyclicDT} · prochain à agir :{' '}
              {view.nextActor?.name ?? '—'}
            </div>
          </div>
          <Seal>DT {view.current.cyclicDT}</Seal>
        </div>

        <Card>
          <Label>Ordre de bataille</Label>
          <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
            {view.roster.map((row) => (
              <div
                key={row.id}
                style={{
                  display: 'grid',
                  gap: 6,
                  padding: '8px 10px',
                  border: `var(--border-hairline) solid ${
                    row.active ? 'var(--color-accent)' : 'var(--color-border-hairline)'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>
                    {row.name}
                  </span>
                  <Badge tone={row.active ? 'info' : 'neutral'}>
                    {row.relativeDT === 0 ? 'à agir' : `DT +${row.relativeDT}`}
                  </Badge>
                </div>
                <div
                  style={{
                    height: 10,
                    background: 'var(--color-bg-elevated)',
                    border: 'var(--border-hairline) solid var(--color-border-hairline)',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${row.vitalityPercent}%`,
                      background: vitalityColor(row.vitalityState)
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                    color: 'var(--color-text-muted)',
                    fontSize: 13
                  }}
                >
                  <span>
                    {row.vitality.current}/{row.vitality.max} vit. · {row.intent}
                  </span>
                  <span style={{ display: 'flex', gap: 6 }}>
                    {row.statusLabels.map((status) => (
                      <Badge key={status} tone="warn">
                        {status}
                      </Badge>
                    ))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Label>Journal de bataille</Label>
          <div style={{ display: 'grid', gap: 6, marginTop: 8, minHeight: 40 }}>
            {recentLog.length === 0 && (
              <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                Aucune action résolue — le registre est encore vierge.
              </span>
            )}
            {recentLog.map((entry, index) => (
              <div
                key={`${entry.atDT}-${index}-${entry.label}`}
                style={{ display: 'flex', gap: 8, alignItems: 'center' }}
              >
                <Badge tone={logTone(entry.tone)}>DT {entry.atDT}</Badge>
                <span>{entry.label}</span>
              </div>
            ))}
          </div>
          {verdict && (
            <div style={{ marginTop: 10, fontFamily: 'var(--font-display)', fontSize: 18 }}>
              {verdict}
            </div>
          )}
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <Button onClick={advance} disabled={over}>
              Résoudre la prochaine action
            </Button>
            <Button variant="secondary" onClick={() => setState(freshState())}>
              Recommencer
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
