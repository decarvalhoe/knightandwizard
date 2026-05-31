import { describe, expect, it } from 'vitest';

import {
  ARBITER_PRECEDENCE,
  CONFLICT_RECOURSES,
  CONFLICT_RESOLUTION_HIERARCHY,
  buildConflictResolutionPlan,
  compareArbiterAuthority,
  hasArbiterAuthorityOver,
  nextConflictResolutionStep
} from './arbiter.js';

describe('arbiter authority hierarchy', () => {
  it('keeps the canonical K&W authority order from D13', () => {
    expect(ARBITER_PRECEDENCE).toEqual(['human_gm', 'player', 'llm', 'auto']);
  });

  it('reports whether one arbiter can override another', () => {
    expect(hasArbiterAuthorityOver('human_gm', 'player')).toBe(true);
    expect(hasArbiterAuthorityOver('player', 'llm')).toBe(true);
    expect(hasArbiterAuthorityOver('llm', 'auto')).toBe(true);
    expect(hasArbiterAuthorityOver('auto', 'llm')).toBe(false);
    expect(hasArbiterAuthorityOver('player', 'player')).toBe(false);
  });

  it('compares two arbiters by authority', () => {
    expect(compareArbiterAuthority('human_gm', 'auto')).toBeGreaterThan(0);
    expect(compareArbiterAuthority('auto', 'human_gm')).toBeLessThan(0);
    expect(compareArbiterAuthority('llm', 'llm')).toBe(0);
  });

  it('rejects an unknown arbiter value defensively', () => {
    expect(() => compareArbiterAuthority('ghost' as never, 'auto')).toThrow('Unknown arbiter');
  });

  it('keeps the canonical R-13.12 conflict escalation order', () => {
    expect(CONFLICT_RESOLUTION_HIERARCHY.map((step) => step.id)).toEqual([
      'discussion_among_table',
      'gm_ruling',
      'rule_lookup',
      'dice_arbitration',
      'session_pause_for_admin_intervention'
    ]);
  });

  it('builds an auditable conflict resolution plan for a known conflict type', () => {
    expect(buildConflictResolutionPlan('dice_roll_dispute')).toMatchObject({
      conflictType: 'dice_roll_dispute',
      description: 'Jet contesté, erreur de lancer ou soupçon de triche',
      recourses: CONFLICT_RECOURSES,
      steps: [
        { actor: 'table', id: 'discussion_among_table' },
        { actor: 'human_gm', id: 'gm_ruling' },
        { actor: 'auto', id: 'rule_lookup' },
        { actor: 'auto', id: 'dice_arbitration' },
        { actor: 'admin', id: 'session_pause_for_admin_intervention' }
      ]
    });
  });

  it('selects the next unresolved escalation step', () => {
    expect(nextConflictResolutionStep(['discussion_among_table', 'gm_ruling'])).toMatchObject({
      actor: 'auto',
      id: 'rule_lookup'
    });
    expect(nextConflictResolutionStep(CONFLICT_RESOLUTION_HIERARCHY.map((step) => step.id))).toBe(
      undefined
    );
  });

  it('rejects an unknown conflict type defensively', () => {
    expect(() => buildConflictResolutionPlan('lost_item' as never)).toThrow(
      'Unknown conflict type'
    );
  });
});
