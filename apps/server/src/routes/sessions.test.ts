import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import { createSqlClient } from '../db/client.js';

const app = buildApp({ logger: false });

beforeAll(async () => {
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe('session routes', () => {
  it('creates sessions and appends canonical events with monotonic sequences', async () => {
    const slug = `api-session-${randomUUID()}`;

    const createResponse = await app.inject({
      method: 'POST',
      payload: {
        metadata: {
          players: [
            { id: 'gm', name: 'MJ', role: 'human_gm' },
            { id: 'aveline', name: 'Aveline', role: 'player' }
          ],
          scenes: [{ id: 'brumeval-gate', location: 'Brumeval', title: 'Porte nord' }]
        },
        mode: 'digital_human_gm',
        slug,
        title: 'Session API'
      },
      url: '/sessions'
    });

    const firstEventResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        eventType: 'scene_opened',
        payload: { location: 'Porte nord' }
      },
      url: `/sessions/${slug}/events`
    });
    const secondEventResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'aveline',
        eventType: 'dice_roll',
        payload: { difficulty: 7, successes: 2 }
      },
      url: `/sessions/${slug}/events`
    });
    const readResponse = await app.inject({
      method: 'GET',
      url: `/sessions/${slug}`
    });

    expect(createResponse.statusCode).toBe(201);
    expect(firstEventResponse.statusCode).toBe(201);
    expect(secondEventResponse.statusCode).toBe(201);
    expect(readResponse.statusCode).toBe(200);
    expect(readResponse.json()).toMatchObject({
      events: [
        { actorId: 'gm', eventType: 'scene_opened', sequence: 1 },
        { actorId: 'aveline', eventType: 'dice_roll', sequence: 2 }
      ],
      mode: 'digital_human_gm',
      slug,
      status: 'planned',
      title: 'Session API'
    });
    expect(readResponse.json().state).toMatchObject({
      events: [
        { actorId: 'gm', type: 'scene_opened', sequence: 1 },
        { actorId: 'aveline', type: 'dice_roll', sequence: 2 }
      ],
      players: [
        { id: 'aveline', name: 'Aveline', role: 'player' },
        { id: 'gm', name: 'MJ', role: 'human_gm' }
      ],
      scenes: [{ id: 'brumeval-gate', location: 'Brumeval', title: 'Porte nord' }],
      slug,
      title: 'Session API'
    });
  });

  it('persists initial session players and scenes as first-class rows', async () => {
    const slug = `api-session-rows-${randomUUID()}`;

    const createResponse = await app.inject({
      method: 'POST',
      payload: {
        metadata: {
          players: [
            { id: 'gm', name: 'MJ', role: 'human_gm' },
            { id: 'aveline', name: 'Aveline', role: 'player' }
          ],
          scenes: [
            {
              description: 'La garde surveille les voyageurs.',
              id: 'brumeval-gate',
              location: 'Brumeval',
              status: 'active',
              title: 'Porte nord'
            }
          ],
          tableNote: 'Session publique'
        },
        mode: 'digital_human_gm',
        slug,
        title: 'Session Rows API'
      },
      url: '/sessions'
    });
    const readResponse = await app.inject({ method: 'GET', url: `/sessions/${slug}` });
    const sql = createSqlClient();
    let playerRows: { name: string; player_id: string; role: string }[];
    let sceneRows: { location: string; scene_id: string; status: string; title: string }[];
    let metadataRows: { metadata: Record<string, unknown> }[];

    try {
      playerRows = await sql<{ name: string; player_id: string; role: string }[]>`
        SELECT sp.player_id, sp.name, sp.role
        FROM session_players sp
        JOIN game_sessions gs ON gs.id = sp.session_id
        WHERE gs.slug = ${slug}
        ORDER BY sp.player_id ASC
      `;
      sceneRows = await sql<
        { location: string; scene_id: string; status: string; title: string }[]
      >`
        SELECT ss.scene_id, ss.location, ss.status, ss.title
        FROM session_scenes ss
        JOIN game_sessions gs ON gs.id = ss.session_id
        WHERE gs.slug = ${slug}
        ORDER BY ss.scene_id ASC
      `;
      metadataRows = await sql<{ metadata: Record<string, unknown> }[]>`
        SELECT metadata
        FROM game_sessions
        WHERE slug = ${slug}
      `;
    } finally {
      await sql.end({ timeout: 5 });
    }

    expect(createResponse.statusCode).toBe(201);
    expect(playerRows).toEqual([
      { name: 'Aveline', player_id: 'aveline', role: 'player' },
      { name: 'MJ', player_id: 'gm', role: 'human_gm' }
    ]);
    expect(sceneRows).toEqual([
      {
        location: 'Brumeval',
        scene_id: 'brumeval-gate',
        status: 'active',
        title: 'Porte nord'
      }
    ]);
    expect(metadataRows[0]?.metadata).toEqual({ tableNote: 'Session publique' });
    expect(readResponse.json().state).toMatchObject({
      players: [
        { id: 'aveline', name: 'Aveline', role: 'player' },
        { id: 'gm', name: 'MJ', role: 'human_gm' }
      ],
      scenes: [
        {
          description: 'La garde surveille les voyageurs.',
          id: 'brumeval-gate',
          location: 'Brumeval',
          status: 'active',
          title: 'Porte nord'
        }
      ]
    });
  });

  it('joins a player to a session with a persisted current character and capability link', async () => {
    const slug = `join-session-${randomUUID()}`;
    const draftId = `join-character-${randomUUID()}`;

    await app.inject({
      method: 'PUT',
      payload: sampleCharacterDraft('Aveline Join'),
      url: `/character-drafts/${draftId}`
    });
    const finalizeResponse = await app.inject({
      method: 'POST',
      payload: { draftId },
      url: '/characters/finalize'
    });
    await app.inject({
      method: 'POST',
      payload: { mode: 'digital_human_gm', slug, status: 'active', title: 'Join API' },
      url: '/sessions'
    });

    const joinResponse = await app.inject({
      method: 'POST',
      payload: {
        characterId: finalizeResponse.json().character.id,
        name: 'Aveline Join',
        playerId: 'player-aveline',
        role: 'player'
      },
      url: `/sessions/${slug}/players`
    });
    const readResponse = await app.inject({ method: 'GET', url: `/sessions/${slug}` });

    expect(joinResponse.statusCode).toBe(200);
    expect(joinResponse.json()).toMatchObject({
      join: {
        playerId: 'player-aveline'
      },
      player: {
        characterId: draftId,
        connected: true,
        id: 'player-aveline',
        name: 'Aveline Join',
        role: 'player'
      },
      status: 'joined'
    });
    expect(joinResponse.json().join.href).toEqual(
      expect.stringContaining(`/session?slug=${slug}&player=player-aveline`)
    );
    expect(joinResponse.json().join.capability).toEqual(expect.any(String));
    expect(readResponse.json().state.players).toMatchObject([
      {
        characterId: draftId,
        connected: true,
        id: 'player-aveline',
        name: 'Aveline Join',
        role: 'player'
      }
    ]);
  });

  it('upserts scenes through the first-class session scene API', async () => {
    const slug = `scene-session-${randomUUID()}`;

    await app.inject({
      method: 'POST',
      payload: { mode: 'digital_human_gm', slug, status: 'active', title: 'Scene API' },
      url: '/sessions'
    });

    const sceneResponse = await app.inject({
      method: 'POST',
      payload: {
        description: 'Les cloches de la porte nord sonnent.',
        location: 'Brumeval',
        npcIds: ['captain-thern'],
        openedAtSequence: 3,
        sceneId: 'brumeval-gate',
        status: 'active',
        title: 'Porte nord'
      },
      url: `/sessions/${slug}/scenes`
    });
    const readResponse = await app.inject({ method: 'GET', url: `/sessions/${slug}` });

    expect(sceneResponse.statusCode).toBe(200);
    expect(sceneResponse.json()).toMatchObject({
      scene: {
        description: 'Les cloches de la porte nord sonnent.',
        id: 'brumeval-gate',
        location: 'Brumeval',
        npcIds: ['captain-thern'],
        openedAtSequence: 3,
        status: 'active',
        title: 'Porte nord'
      },
      status: 'upserted'
    });
    expect(readResponse.json().state.scenes).toEqual([
      {
        description: 'Les cloches de la porte nord sonnent.',
        id: 'brumeval-gate',
        location: 'Brumeval',
        npcIds: ['captain-thern'],
        openedAtSequence: 3,
        status: 'active',
        title: 'Porte nord'
      }
    ]);
  });

  it('queues and resolves GM decisions with audit-friendly events', async () => {
    const slug = `decision-session-${randomUUID()}`;

    await app.inject({
      method: 'POST',
      payload: {
        mode: 'digital_llm_gm',
        slug,
        title: 'Decision API'
      },
      url: '/sessions'
    });

    const queuedResponse = await app.inject({
      method: 'POST',
      payload: {
        assignedTo: 'human_gm',
        payload: { options: ['approve', 'rewrite'] },
        priority: 'urgent',
        requestedBy: 'llm',
        title: 'Valider la description du sanctuaire'
      },
      url: `/sessions/${slug}/decisions`
    });
    const queuedDecision = queuedResponse.json().decision;
    const resolvedResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        resolution: { ruling: 'approved' },
        status: 'approved'
      },
      url: `/sessions/${slug}/decisions/${queuedDecision.id}/resolve`
    });
    const readResponse = await app.inject({
      method: 'GET',
      url: `/sessions/${slug}`
    });

    expect(queuedResponse.statusCode).toBe(201);
    expect(resolvedResponse.statusCode).toBe(200);
    expect(readResponse.json().decisions).toMatchObject([
      {
        assignedTo: 'human_gm',
        priority: 'urgent',
        requestedBy: 'llm',
        status: 'approved',
        title: 'Valider la description du sanctuaire'
      }
    ]);
    expect(
      readResponse.json().events.map((event: { eventType: string }) => event.eventType)
    ).toEqual(['gm_decision_requested', 'gm_decision_resolved']);
  });

  it('records rollback requests without deleting previous events', async () => {
    const slug = `rollback-session-${randomUUID()}`;

    await app.inject({
      method: 'POST',
      payload: {
        slug,
        title: 'Rollback API'
      },
      url: '/sessions'
    });
    await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        eventType: 'narration',
        payload: { text: 'La relique se brise.' }
      },
      url: `/sessions/${slug}/events`
    });

    const rollbackResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        reason: 'Erreur de regle',
        targetSequence: 1
      },
      url: `/sessions/${slug}/rollback`
    });
    const readResponse = await app.inject({
      method: 'GET',
      url: `/sessions/${slug}`
    });

    expect(rollbackResponse.statusCode).toBe(201);
    expect(readResponse.json().events).toMatchObject([
      { eventType: 'narration', sequence: 1 },
      { eventType: 'rollback_requested', sequence: 2 }
    ]);
  });

  it('returns a reverted state reconstructed from the event log', async () => {
    const slug = `revert-session-${randomUUID()}`;

    await app.inject({
      method: 'POST',
      payload: { mode: 'digital_human_gm', slug, title: 'Revert API' },
      url: '/sessions'
    });
    await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        eventType: 'scene_opened',
        payload: { location: 'Brumeval', sceneId: 'gate', title: 'Porte nord' }
      },
      url: `/sessions/${slug}/events`
    });
    const queuedResponse = await app.inject({
      method: 'POST',
      payload: {
        assignedTo: 'human_gm',
        payload: { options: ['negotiate', 'fight'] },
        priority: 'high',
        requestedBy: 'llm',
        title: 'Les brigands negocient-ils ?'
      },
      url: `/sessions/${slug}/decisions`
    });
    const decisionId = queuedResponse.json().decision.id;
    // Resolving appends event sequence 3 (request was sequence 2, scene was 1).
    await app.inject({
      method: 'POST',
      payload: { actorId: 'gm', resolution: { ruling: 'fight' }, status: 'approved' },
      url: `/sessions/${slug}/decisions/${decisionId}/resolve`
    });

    // Revert to sequence 2 (decision requested) — the resolution at seq 3 must vanish.
    const rollbackResponse = await app.inject({
      method: 'POST',
      payload: { actorId: 'gm', reason: 'Annule la resolution', targetSequence: 2 },
      url: `/sessions/${slug}/rollback`
    });

    expect(rollbackResponse.statusCode).toBe(201);
    const reverted = rollbackResponse.json().revertedState;
    // The rollback marker (seq 4) and the resolution (seq 3) are excluded.
    expect(reverted.events.map((event: { sequence: number }) => event.sequence)).toEqual([1, 2]);
    expect(reverted.events.map((event: { type: string }) => event.type)).toEqual([
      'scene_opened',
      'gm_decision_requested'
    ]);
    expect(reverted.scenes).toMatchObject([{ id: 'gate', openedAtSequence: 1 }]);
    expect(reverted.decisions).toMatchObject([{ id: decisionId, status: 'pending' }]);
    expect(reverted.decisions[0].resolvedAt).toBeUndefined();

    // The persisted journal still preserves the full history including the marker.
    const readResponse = await app.inject({ method: 'GET', url: `/sessions/${slug}` });
    const readBody = readResponse.json();
    expect(readBody.events.map((event: { eventType: string }) => event.eventType)).toEqual([
      'scene_opened',
      'gm_decision_requested',
      'gm_decision_resolved',
      'rollback_requested'
    ]);
    expect(readBody.state.events.map((event: { sequence: number }) => event.sequence)).toEqual([
      1, 2
    ]);
    expect(readBody.state.decisions).toMatchObject([{ id: decisionId, status: 'pending' }]);
  });

  it('keeps play continuable when new decisions are queued after a rollback marker', async () => {
    const slug = `continued-session-${randomUUID()}`;

    await app.inject({
      method: 'POST',
      payload: { mode: 'digital_human_gm', slug, title: 'Continued API' },
      url: '/sessions'
    });
    await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        eventType: 'scene_opened',
        payload: { location: 'Brumeval', sceneId: 'gate', title: 'Porte nord' }
      },
      url: `/sessions/${slug}/events`
    });
    const staleDecisionResponse = await app.inject({
      method: 'POST',
      payload: {
        assignedTo: 'human_gm',
        requestedBy: 'llm',
        title: 'Ancienne decision'
      },
      url: `/sessions/${slug}/decisions`
    });
    await app.inject({
      method: 'POST',
      payload: { actorId: 'gm', resolution: { ruling: 'annulee' }, status: 'approved' },
      url: `/sessions/${slug}/decisions/${staleDecisionResponse.json().decision.id}/resolve`
    });
    await app.inject({
      method: 'POST',
      payload: { actorId: 'gm', reason: 'Reprendre avant arbitrage', targetSequence: 1 },
      url: `/sessions/${slug}/rollback`
    });
    const nextDecisionResponse = await app.inject({
      method: 'POST',
      payload: {
        assignedTo: 'human_gm',
        priority: 'high',
        requestedBy: 'llm',
        title: 'Nouvelle decision apres rollback'
      },
      url: `/sessions/${slug}/decisions`
    });
    const nextDecisionId = nextDecisionResponse.json().decision.id;

    const readResponse = await app.inject({ method: 'GET', url: `/sessions/${slug}` });
    const readBody = readResponse.json();

    expect(readBody.events.map((event: { sequence: number }) => event.sequence)).toEqual([
      1, 2, 3, 4, 5
    ]);
    expect(readBody.state.events.map((event: { sequence: number }) => event.sequence)).toEqual([
      1, 5
    ]);
    expect(readBody.state.decisions).toMatchObject([
      {
        id: nextDecisionId,
        status: 'pending',
        title: 'Nouvelle decision apres rollback'
      }
    ]);
  });

  it('records canonical entity links on events, decisions and rollback markers', async () => {
    const slug = `linked-session-${randomUUID()}`;
    const links = {
      characters: ['aveline'],
      objects: ['relique-brisee'],
      places: ['brumeval-gate'],
      rules: [{ ref: 'R-13.9', sourcePath: 'docs/rules/13-roles-passation.md' }]
    };

    await app.inject({
      method: 'POST',
      payload: { slug, title: 'Linked API' },
      url: '/sessions'
    });

    const eventResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        eventType: 'scene_opened',
        links,
        payload: { text: 'La relique apparait dans la brume.' }
      },
      url: `/sessions/${slug}/events`
    });
    const decisionResponse = await app.inject({
      method: 'POST',
      payload: {
        assignedTo: 'human_gm',
        links,
        payload: { options: ['examiner', 'ignorer'] },
        requestedBy: 'llm',
        title: 'Tracer la relique dans le journal'
      },
      url: `/sessions/${slug}/decisions`
    });
    const decisionId = decisionResponse.json().decision.id;
    const resolveResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        links,
        resolution: { ruling: 'examiner' },
        status: 'approved'
      },
      url: `/sessions/${slug}/decisions/${decisionId}/resolve`
    });
    const rollbackResponse = await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        links,
        reason: 'Retour avant decision',
        targetSequence: 1
      },
      url: `/sessions/${slug}/rollback`
    });
    const readResponse = await app.inject({ method: 'GET', url: `/sessions/${slug}` });
    const readBody = readResponse.json();
    const sql = createSqlClient();
    let auditRows: { action: string; payload: { links?: unknown } }[];

    try {
      auditRows = await sql<{ action: string; payload: { links?: unknown } }[]>`
        SELECT action, payload
        FROM audit_events
        WHERE payload->>'sessionId' = ${readBody.id}
        ORDER BY created_at ASC
      `;
    } finally {
      await sql.end({ timeout: 5 });
    }

    expect(eventResponse.statusCode).toBe(201);
    expect(decisionResponse.statusCode).toBe(201);
    expect(resolveResponse.statusCode).toBe(200);
    expect(rollbackResponse.statusCode).toBe(201);
    expect(eventResponse.json().event.payload.links).toEqual(links);
    expect(decisionResponse.json().decision.payload.links).toEqual(links);
    expect(resolveResponse.json().decision.resolution.links).toEqual(links);
    expect(rollbackResponse.json().event.payload.links).toEqual(links);
    expect(
      readBody.events.map((event: { payload: { links?: unknown } }) => event.payload.links)
    ).toEqual([links, links, links, links]);
    expect(auditRows.map((row) => row.action)).toEqual([
      'session.event.appended',
      'session.decision.queued',
      'session.decision.resolved',
      'session.rollback.requested'
    ]);
    expect(auditRows.map((row) => row.payload.links)).toEqual([links, links, links, links]);
  });

  it('projects the narrative clock and active spells from the event journal (R-8.20)', async () => {
    const slug = `clock-session-${randomUUID()}`;

    await app.inject({
      method: 'POST',
      payload: { mode: 'digital_human_gm', slug, title: 'Clock API' },
      url: '/sessions'
    });
    // Advance one hour of narrative time, then cast a 10-minute buff.
    await app.inject({
      method: 'POST',
      payload: { actorId: 'gm', eventType: 'narrative_time_advanced', payload: { hours: 1 } },
      url: `/sessions/${slug}/events`
    });
    await app.inject({
      method: 'POST',
      payload: {
        actorId: 'gm',
        eventType: 'spell_cast',
        payload: {
          activeSpellId: 'spell-aura',
          durationAmount: 10,
          durationUnit: 'minute',
          spellId: 'aura-de-courage',
          targetId: 'aveline'
        }
      },
      url: `/sessions/${slug}/events`
    });

    const whileActive = await app.inject({ method: 'GET', url: `/sessions/${slug}` });
    const activeState = whileActive.json().state;

    expect(activeState.narrativeSeconds).toBe(3_600);
    expect(activeState.activeSpells).toMatchObject([
      { id: 'spell-aura', castAtSeconds: 3_600, durationUnit: 'minute' }
    ]);

    // Skip past the buff's lifetime — it must lapse on the shared narrative clock.
    await app.inject({
      method: 'POST',
      payload: { actorId: 'gm', eventType: 'narrative_time_advanced', payload: { minutes: 10 } },
      url: `/sessions/${slug}/events`
    });

    const afterExpiry = await app.inject({ method: 'GET', url: `/sessions/${slug}` });
    const expiredState = afterExpiry.json().state;

    expect(expiredState.narrativeSeconds).toBe(4_200);
    expect(expiredState.activeSpells).toEqual([]);
  });

  it('rejects invalid session payloads', async () => {
    const response = await app.inject({
      method: 'POST',
      payload: {
        slug: 'Invalid Slug',
        title: ''
      },
      url: '/sessions'
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      errors: ['slug must use lowercase letters, numbers and dashes', 'title is required'],
      status: 'invalid'
    });
  });
});

function sampleCharacterDraft(name: string) {
  return {
    currentStep: 'review',
    payload: {
      attributes: {
        aestheticism: 1,
        charisma: 2,
        dexterity: 3,
        empathy: 1,
        intelligence: 2,
        perception: 2,
        reflexes: 2,
        stamina: 3,
        strength: 4
      },
      background: 'Garde de la porte nord.',
      classId: 'garde',
      deity: 'Les Trois Flammes',
      equipmentIds: ['epee_batarde'],
      extraSpellPoints: 0,
      genderId: 'unspecified',
      name,
      orientationId: 'guerrier',
      psychology: 'calme',
      quote: 'La lame engage.',
      raceId: 'humain',
      skills: [
        { id: 'epee-a-une-main', points: 4 },
        { id: 'stoicisme', points: 4 },
        { id: 'commandement', points: 4 },
        { id: 'observation-du-terrain', points: 4 },
        { id: 'bouclier', points: 4 }
      ],
      spells: []
    }
  };
}
