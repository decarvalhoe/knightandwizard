import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import {
  type SessionDecision,
  type SessionEvent,
  type SessionPlayer,
  type SessionScene,
  type SessionState,
  SESSION_CONTROLLER_ROLES,
  SESSION_DECISION_PRIORITIES,
  SESSION_DECISION_STATUSES,
  SESSION_MODES,
  SESSION_STATUSES,
  SPELL_DURATION_UNITS,
  createSessionState,
  durationToSeconds,
  projectSessionStateFromJournal,
  revertSessionToSequence,
  type SpellDurationUnit
} from '@knightandwizard/rules-core';
import type postgres from 'postgres';
import { createSqlClient } from '../db/client.js';
import { sessionHub } from '../sessions/hub.js';

interface CreateSessionRequestBody {
  metadata?: unknown;
  mode?: unknown;
  slug?: unknown;
  status?: unknown;
  title?: unknown;
}

interface AppendEventRequestBody {
  actorId?: unknown;
  eventType?: unknown;
  links?: unknown;
  payload?: unknown;
}

interface QueueDecisionRequestBody {
  assignedTo?: unknown;
  links?: unknown;
  payload?: unknown;
  priority?: unknown;
  requestedBy?: unknown;
  title?: unknown;
}

interface ResolveDecisionRequestBody {
  actorId?: unknown;
  links?: unknown;
  resolution?: unknown;
  status?: unknown;
}

interface RollbackRequestBody {
  actorId?: unknown;
  links?: unknown;
  reason?: unknown;
  targetSequence?: unknown;
}

interface JoinSessionPlayerRequestBody {
  capability?: unknown;
  characterId?: unknown;
  name?: unknown;
  playerId?: unknown;
  role?: unknown;
}

interface UpsertSessionSceneRequestBody {
  description?: unknown;
  location?: unknown;
  npcIds?: unknown;
  openedAtSequence?: unknown;
  sceneId?: unknown;
  status?: unknown;
  title?: unknown;
}

interface SessionParams {
  slug: string;
}

type SessionSql = postgres.Sql | postgres.TransactionSql;

interface DecisionParams extends SessionParams {
  decisionId: string;
}

interface SessionRuleLink {
  ref?: string;
  sourcePath: string;
  title?: string;
}

interface SessionEntityLinks {
  characters?: string[];
  objects?: string[];
  places?: string[];
  rules?: SessionRuleLink[];
}

// Validation vocabularies are derived from the canonical rules-core unions so
// the SQL surface and the pure model never drift apart.
const validModes = new Set<string>(SESSION_MODES);
const validStatuses = new Set<string>(SESSION_STATUSES);
const validPriorities = new Set<string>(SESSION_DECISION_PRIORITIES);
const validSpellDurationUnits = new Set<string>(SPELL_DURATION_UNITS);
// A decision cannot be *resolved* into the 'pending' state.
const validDecisionStatuses = new Set<string>(
  SESSION_DECISION_STATUSES.filter((status) => status !== 'pending')
);
const validControllerRoles = new Set<string>(SESSION_CONTROLLER_ROLES);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function registerSessionRoutes(app: FastifyInstance): Promise<void> {
  app.options('/sessions', async (_request, reply) => reply.code(204).send());
  app.options('/sessions/:slug', async (_request, reply) => reply.code(204).send());
  app.options('/sessions/:slug/players', async (_request, reply) => reply.code(204).send());
  app.options('/sessions/:slug/scenes', async (_request, reply) => reply.code(204).send());
  app.options('/sessions/:slug/events', async (_request, reply) => reply.code(204).send());
  app.options('/sessions/:slug/decisions', async (_request, reply) => reply.code(204).send());
  app.options('/sessions/:slug/decisions/:decisionId/resolve', async (_request, reply) =>
    reply.code(204).send()
  );
  app.options('/sessions/:slug/rollback', async (_request, reply) => reply.code(204).send());

  app.get('/sessions', async () => {
    const sql = createSqlClient();

    try {
      const rows = await sql<SessionListRow[]>`
        SELECT
          gs.id,
          gs.slug,
          gs.title,
          gs.mode,
          gs.status,
          gs.metadata,
          gs.created_at,
          gs.updated_at,
          (
            SELECT count(*)::int
            FROM session_events se
            WHERE se.session_id = gs.id
          ) AS event_count,
          (
            SELECT count(*)::int
            FROM session_decisions sd
            WHERE sd.session_id = gs.id AND sd.status = 'pending'
          ) AS pending_decision_count
        FROM game_sessions gs
        ORDER BY gs.updated_at DESC, gs.created_at DESC
        LIMIT 50
      `;

      return {
        sessions: rows.map((row) => ({
          createdAt: serializeDate(row.created_at),
          eventCount: row.event_count,
          id: row.id,
          metadata: row.metadata,
          mode: row.mode,
          pendingDecisionCount: row.pending_decision_count,
          slug: row.slug,
          status: row.status,
          title: row.title,
          updatedAt: serializeDate(row.updated_at)
        }))
      };
    } finally {
      await sql.end({ timeout: 5 });
    }
  });

  app.post<{ Body: CreateSessionRequestBody }>('/sessions', async (request, reply) => {
    const body = request.body ?? {};
    const validation = validateCreateSessionBody(body);

    if (!validation.valid) {
      return reply.code(400).send({
        errors: validation.errors,
        status: 'invalid'
      });
    }

    const sql = createSqlClient();
    const initial = splitSessionMetadata(
      body.metadata === undefined ? {} : (body.metadata as Record<string, unknown>)
    );
    const mode = typeof body.mode === 'string' ? body.mode : 'classic_table';
    const status = typeof body.status === 'string' ? body.status : 'planned';

    try {
      const result = await sql.begin(async (tx) => {
        const rows = await tx<SessionRow[]>`
          INSERT INTO game_sessions (slug, title, mode, status, metadata)
          VALUES (
            ${body.slug as string},
            ${body.title as string},
            ${mode},
            ${status},
            ${tx.json(initial.metadata as postgres.JSONValue)}::jsonb
          )
          RETURNING id, slug, title, mode, status, metadata, created_at, updated_at
        `;
        const session = rows[0]!;

        for (const player of initial.players ?? []) {
          await upsertSessionPlayerRow(tx, session.id, {
            ...player,
            capability: randomUUID(),
            connected: player.connected ?? false,
            lastSeenAt: player.lastSeenAt
          });
        }

        for (const scene of initial.scenes ?? []) {
          await upsertSessionSceneRow(tx, session.id, scene);
        }

        return {
          players: await selectSessionPlayers(tx, session.id),
          scenes: await selectSessionScenes(tx, session.id),
          session
        };
      });

      return reply
        .code(201)
        .send(toSessionResponse(result.session, [], [], result.players, result.scenes));
    } finally {
      await sql.end({ timeout: 5 });
    }
  });

  app.get<{ Params: SessionParams }>('/sessions/:slug', async (request, reply) => {
    const sql = createSqlClient();

    try {
      const sessionRows = await sql<SessionRow[]>`
        SELECT id, slug, title, mode, status, metadata, created_at, updated_at
        FROM game_sessions
        WHERE slug = ${request.params.slug}
      `;
      const session = sessionRows[0];

      if (!session) {
        return reply.code(404).send({ status: 'not_found' });
      }

      const eventRows = await sql<SessionEventRow[]>`
        SELECT id, session_id, sequence, event_type, actor_id, payload, created_at
        FROM session_events
        WHERE session_id = ${session.id}
        ORDER BY sequence ASC
      `;
      const decisionRows = await sql<SessionDecisionRow[]>`
        SELECT
          id,
          session_id,
          title,
          requested_by,
          assigned_to,
          priority,
          status,
          payload,
          resolution,
          created_at,
          resolved_at,
          updated_at
        FROM session_decisions
        WHERE session_id = ${session.id}
        ORDER BY
          CASE priority
            WHEN 'urgent' THEN 4
            WHEN 'high' THEN 3
            WHEN 'normal' THEN 2
            ELSE 1
          END DESC,
          created_at ASC
      `;
      const playerRows = await selectSessionPlayers(sql, session.id);
      const sceneRows = await selectSessionScenes(sql, session.id);

      return toSessionResponse(session, eventRows, decisionRows, playerRows, sceneRows);
    } finally {
      await sql.end({ timeout: 5 });
    }
  });

  app.post<{ Body: JoinSessionPlayerRequestBody; Params: SessionParams }>(
    '/sessions/:slug/players',
    async (request, reply) => {
      const body = request.body ?? {};
      const validation = validateJoinSessionPlayerBody(body);

      if (!validation.valid) {
        return reply.code(400).send({
          errors: validation.errors,
          status: 'invalid'
        });
      }

      const sql = createSqlClient();
      const playerId = (body.playerId as string).trim();
      const name = (body.name as string).trim();
      const role = (body.role as SessionPlayer['role']).trim() as SessionPlayer['role'];
      const characterId = isNonEmptyString(body.characterId) ? body.characterId.trim() : undefined;
      const capability = isNonEmptyString(body.capability) ? body.capability.trim() : randomUUID();
      const now = new Date().toISOString();

      try {
        const result = await sql.begin(async (tx) => {
          const sessionRows = await tx<SessionRow[]>`
            SELECT id, slug, title, mode, status, metadata, created_at, updated_at
            FROM game_sessions
            WHERE slug = ${request.params.slug}
            FOR UPDATE
          `;
          const session = sessionRows[0];

          if (!session) {
            return { status: 'not_found' as const };
          }

          if (characterId !== undefined) {
            const characterRows = await tx<{ id: string }[]>`
              SELECT id
              FROM characters
              WHERE id = ${characterId}
            `;

            if (characterRows.length === 0) {
              return { status: 'character_not_found' as const };
            }
          }

          const player: SessionPlayer = {
            connected: true,
            id: playerId,
            lastSeenAt: now,
            name,
            role
          };

          if (characterId !== undefined) {
            player.characterId = characterId;
          }

          const persistedPlayer = await upsertSessionPlayerRow(tx, session.id, {
            ...player,
            capability
          });
          const updatedRows = await tx<SessionRow[]>`
            UPDATE game_sessions
            SET updated_at = now()
            WHERE id = ${session.id}
            RETURNING id, slug, title, mode, status, metadata, created_at, updated_at
          `;
          const eventRows = await tx<SessionEventRow[]>`
            SELECT id, session_id, sequence, event_type, actor_id, payload, created_at
            FROM session_events
            WHERE session_id = ${session.id}
            ORDER BY sequence ASC
          `;
          const decisionRows = await tx<SessionDecisionRow[]>`
            SELECT
              id,
              session_id,
              title,
              requested_by,
              assigned_to,
              priority,
              status,
              payload,
              resolution,
              created_at,
              resolved_at,
              updated_at
            FROM session_decisions
            WHERE session_id = ${session.id}
            ORDER BY
              CASE priority
                WHEN 'urgent' THEN 4
                WHEN 'high' THEN 3
                WHEN 'normal' THEN 2
                ELSE 1
              END DESC,
              created_at ASC
          `;

          return {
            capability,
            decisions: decisionRows,
            events: eventRows,
            player: persistedPlayer,
            players: await selectSessionPlayers(tx, session.id),
            scenes: await selectSessionScenes(tx, session.id),
            session: updatedRows[0]!,
            status: 'joined' as const
          };
        });

        if (result.status === 'not_found') {
          return reply.code(404).send({ status: 'not_found' });
        }

        if (result.status === 'character_not_found') {
          return reply.code(404).send({ status: 'character_not_found' });
        }

        return {
          join: {
            capability: result.capability,
            href: buildJoinHref(request.params.slug, result.player.id, result.capability),
            playerId: result.player.id
          },
          player: result.player,
          session: toSessionResponse(
            result.session,
            result.events,
            result.decisions,
            result.players,
            result.scenes
          ),
          status: 'joined'
        };
      } finally {
        await sql.end({ timeout: 5 });
      }
    }
  );

  app.post<{ Body: UpsertSessionSceneRequestBody; Params: SessionParams }>(
    '/sessions/:slug/scenes',
    async (request, reply) => {
      const body = request.body ?? {};
      const validation = validateUpsertSessionSceneBody(body);

      if (!validation.valid) {
        return reply.code(400).send({
          errors: validation.errors,
          status: 'invalid'
        });
      }

      const sql = createSqlClient();
      const scene = validation.scene!;

      try {
        const result = await sql.begin(async (tx) => {
          const sessionRows = await tx<SessionRow[]>`
            SELECT id, slug, title, mode, status, metadata, created_at, updated_at
            FROM game_sessions
            WHERE slug = ${request.params.slug}
            FOR UPDATE
          `;
          const session = sessionRows[0];

          if (!session) {
            return { status: 'not_found' as const };
          }

          const persistedScene = await upsertSessionSceneRow(tx, session.id, scene);
          const updatedRows = await tx<SessionRow[]>`
            UPDATE game_sessions
            SET updated_at = now()
            WHERE id = ${session.id}
            RETURNING id, slug, title, mode, status, metadata, created_at, updated_at
          `;
          await tx`
            INSERT INTO audit_events (actor_id, action, entity_type, entity_id, payload)
            VALUES (
              null,
              'session.scene.upserted',
              'session_scene',
              ${persistedScene.id},
              ${tx.json({
                sceneId: persistedScene.scene_id,
                sessionId: session.id
              } as postgres.JSONValue)}::jsonb
            )
          `;
          const eventRows = await tx<SessionEventRow[]>`
            SELECT id, session_id, sequence, event_type, actor_id, payload, created_at
            FROM session_events
            WHERE session_id = ${session.id}
            ORDER BY sequence ASC
          `;
          const decisionRows = await tx<SessionDecisionRow[]>`
            SELECT
              id,
              session_id,
              title,
              requested_by,
              assigned_to,
              priority,
              status,
              payload,
              resolution,
              created_at,
              resolved_at,
              updated_at
            FROM session_decisions
            WHERE session_id = ${session.id}
            ORDER BY
              CASE priority
                WHEN 'urgent' THEN 4
                WHEN 'high' THEN 3
                WHEN 'normal' THEN 2
                ELSE 1
              END DESC,
              created_at ASC
          `;

          return {
            decisions: decisionRows,
            events: eventRows,
            players: await selectSessionPlayers(tx, session.id),
            scene: persistedScene,
            scenes: await selectSessionScenes(tx, session.id),
            session: updatedRows[0]!,
            status: 'upserted' as const
          };
        });

        if (result.status === 'not_found') {
          return reply.code(404).send({ status: 'not_found' });
        }

        sessionHub.broadcast(request.params.slug, {
          kind: 'session.scene',
          scene: toSessionSceneResponse(result.scene),
          slug: request.params.slug
        });

        return {
          scene: toSessionSceneResponse(result.scene),
          session: toSessionResponse(
            result.session,
            result.events,
            result.decisions,
            result.players,
            result.scenes
          ),
          status: 'upserted'
        };
      } finally {
        await sql.end({ timeout: 5 });
      }
    }
  );

  app.post<{ Body: AppendEventRequestBody; Params: SessionParams }>(
    '/sessions/:slug/events',
    async (request, reply) => {
      const body = request.body ?? {};
      const validation = validateEventBody(body);

      if (!validation.valid) {
        return reply.code(400).send({
          errors: validation.errors,
          status: 'invalid'
        });
      }

      const sql = createSqlClient();
      const links = normalizeSessionLinks(body.links);
      const payload = attachLinks(
        body.payload === undefined ? {} : (body.payload as Record<string, unknown>),
        links
      );
      const actorId = typeof body.actorId === 'string' ? body.actorId : null;
      const eventType = body.eventType as string;

      try {
        const result = await sql.begin(async (tx) => {
          const sessionRows = await tx<SessionRow[]>`
            SELECT id, slug, title, mode, status, metadata, created_at, updated_at
            FROM game_sessions
            WHERE slug = ${request.params.slug}
            FOR UPDATE
          `;
          const session = sessionRows[0];

          if (!session) {
            return { status: 'not_found' as const };
          }

          const sequenceRows = await tx<{ next_sequence: number }[]>`
            SELECT (COALESCE(MAX(sequence), 0) + 1)::int AS next_sequence
            FROM session_events
            WHERE session_id = ${session.id}
          `;
          const sequence = sequenceRows[0]!.next_sequence;
          const needsPriorEventRows =
            eventType === 'spell_cast' ||
            eventType === 'narrative_time_advanced' ||
            eventType === 'combat_ended';
          const priorEventRows = needsPriorEventRows
            ? await tx<SessionEventRow[]>`
                  SELECT id, session_id, sequence, event_type, actor_id, payload, created_at
                  FROM session_events
                  WHERE session_id = ${session.id}
                  ORDER BY sequence ASC
                `
            : [];
          const eventRows = await tx<SessionEventRow[]>`
            INSERT INTO session_events (session_id, sequence, event_type, actor_id, payload)
            VALUES (
              ${session.id},
              ${sequence},
              ${eventType},
              ${actorId},
              ${tx.json(payload as postgres.JSONValue)}::jsonb
            )
            RETURNING id, session_id, sequence, event_type, actor_id, payload, created_at
          `;
          const event = eventRows[0]!;

          await tx`
            INSERT INTO audit_events (actor_id, action, entity_type, entity_id, payload)
            VALUES (
              ${actorId},
              'session.event.appended',
              'session_event',
              ${event.id},
              ${tx.json(
                attachLinks(
                  {
                    eventType,
                    sequence,
                    sessionId: session.id
                  },
                  links
                ) as postgres.JSONValue
              )}::jsonb
            )
          `;
          await persistCharacterActiveSpellEvent(tx, session, event, priorEventRows);
          await tx`
            UPDATE game_sessions
            SET updated_at = now()
            WHERE id = ${session.id}
          `;

          return { event, status: 'created' as const };
        });

        if (result.status === 'not_found') {
          return reply.code(404).send({ status: 'not_found' });
        }

        sessionHub.broadcast(request.params.slug, {
          event: toEventResponse(result.event),
          kind: 'session.event',
          slug: request.params.slug
        });

        return reply.code(201).send({
          event: toEventResponse(result.event),
          status: 'created'
        });
      } finally {
        await sql.end({ timeout: 5 });
      }
    }
  );

  app.post<{ Body: QueueDecisionRequestBody; Params: SessionParams }>(
    '/sessions/:slug/decisions',
    async (request, reply) => {
      const body = request.body ?? {};
      const validation = validateDecisionBody(body);

      if (!validation.valid) {
        return reply.code(400).send({
          errors: validation.errors,
          status: 'invalid'
        });
      }

      const sql = createSqlClient();
      const links = normalizeSessionLinks(body.links);
      const payload = attachLinks(
        body.payload === undefined ? {} : (body.payload as Record<string, unknown>),
        links
      );
      const priority = typeof body.priority === 'string' ? body.priority : 'normal';
      const assignedTo = typeof body.assignedTo === 'string' ? body.assignedTo : 'human_gm';
      const requestedBy = body.requestedBy as string;
      const title = body.title as string;

      try {
        const result = await sql.begin(async (tx) => {
          const sessionRows = await tx<SessionRow[]>`
            SELECT id, slug, title, mode, status, metadata, created_at, updated_at
            FROM game_sessions
            WHERE slug = ${request.params.slug}
            FOR UPDATE
          `;
          const session = sessionRows[0];

          if (!session) {
            return { status: 'not_found' as const };
          }

          const decisionRows = await tx<SessionDecisionRow[]>`
            INSERT INTO session_decisions (
              session_id,
              title,
              requested_by,
              assigned_to,
              priority,
              payload
            )
            VALUES (
              ${session.id},
              ${title},
              ${requestedBy},
              ${assignedTo},
              ${priority},
              ${tx.json(payload as postgres.JSONValue)}::jsonb
            )
            RETURNING
              id,
              session_id,
              title,
              requested_by,
              assigned_to,
              priority,
              status,
              payload,
              resolution,
              created_at,
              resolved_at,
              updated_at
          `;
          const decision = decisionRows[0]!;
          const sequenceRows = await tx<{ next_sequence: number }[]>`
            SELECT (COALESCE(MAX(sequence), 0) + 1)::int AS next_sequence
            FROM session_events
            WHERE session_id = ${session.id}
          `;
          const sequence = sequenceRows[0]!.next_sequence;
          const eventRows = await tx<SessionEventRow[]>`
            INSERT INTO session_events (session_id, sequence, event_type, actor_id, payload)
            VALUES (
              ${session.id},
              ${sequence},
              'gm_decision_requested',
              ${requestedBy},
              ${tx.json(
                attachLinks(
                  {
                    assignedTo,
                    decisionId: decision.id,
                    priority,
                    requestedBy,
                    title
                  },
                  links
                ) as postgres.JSONValue
              )}::jsonb
            )
            RETURNING id, session_id, sequence, event_type, actor_id, payload, created_at
          `;

          await tx`
            INSERT INTO audit_events (actor_id, action, entity_type, entity_id, payload)
            VALUES (
              ${requestedBy},
              'session.decision.queued',
              'session_decision',
              ${decision.id},
              ${tx.json(
                attachLinks(
                  {
                    eventId: eventRows[0]!.id,
                    priority,
                    sessionId: session.id
                  },
                  links
                ) as postgres.JSONValue
              )}::jsonb
            )
          `;
          await tx`
            UPDATE game_sessions
            SET updated_at = now()
            WHERE id = ${session.id}
          `;

          return { decision, event: eventRows[0]!, status: 'created' as const };
        });

        if (result.status === 'not_found') {
          return reply.code(404).send({ status: 'not_found' });
        }

        sessionHub.broadcast(request.params.slug, {
          event: toEventResponse(result.event),
          kind: 'session.event',
          slug: request.params.slug
        });

        return reply.code(201).send({
          decision: toDecisionResponse(result.decision),
          event: toEventResponse(result.event),
          status: 'created'
        });
      } finally {
        await sql.end({ timeout: 5 });
      }
    }
  );

  app.post<{ Body: ResolveDecisionRequestBody; Params: DecisionParams }>(
    '/sessions/:slug/decisions/:decisionId/resolve',
    async (request, reply) => {
      const body = request.body ?? {};
      const validation = validateResolveDecisionBody(body);

      if (!validation.valid) {
        return reply.code(400).send({
          errors: validation.errors,
          status: 'invalid'
        });
      }

      const sql = createSqlClient();
      const links = normalizeSessionLinks(body.links);
      const resolution = attachLinks(
        body.resolution === undefined ? {} : (body.resolution as Record<string, unknown>),
        links
      );
      const actorId = body.actorId as string;
      const decisionStatus = body.status as string;

      try {
        const result = await sql.begin(async (tx) => {
          const sessionRows = await tx<SessionRow[]>`
            SELECT id, slug, title, mode, status, metadata, created_at, updated_at
            FROM game_sessions
            WHERE slug = ${request.params.slug}
            FOR UPDATE
          `;
          const session = sessionRows[0];

          if (!session) {
            return { status: 'not_found' as const };
          }

          const decisionRows = await tx<SessionDecisionRow[]>`
            UPDATE session_decisions
            SET
              status = ${decisionStatus},
              resolution = ${tx.json(resolution as postgres.JSONValue)}::jsonb,
              resolved_at = now(),
              updated_at = now()
            WHERE id = ${request.params.decisionId}
              AND session_id = ${session.id}
              AND status = 'pending'
            RETURNING
              id,
              session_id,
              title,
              requested_by,
              assigned_to,
              priority,
              status,
              payload,
              resolution,
              created_at,
              resolved_at,
              updated_at
          `;
          const decision = decisionRows[0];

          if (!decision) {
            return { status: 'decision_not_found' as const };
          }

          const sequenceRows = await tx<{ next_sequence: number }[]>`
            SELECT (COALESCE(MAX(sequence), 0) + 1)::int AS next_sequence
            FROM session_events
            WHERE session_id = ${session.id}
          `;
          const sequence = sequenceRows[0]!.next_sequence;
          const eventRows = await tx<SessionEventRow[]>`
            INSERT INTO session_events (session_id, sequence, event_type, actor_id, payload)
            VALUES (
              ${session.id},
              ${sequence},
              'gm_decision_resolved',
              ${actorId},
              ${tx.json(
                attachLinks(
                  {
                    decisionId: decision.id,
                    resolution,
                    status: decisionStatus
                  },
                  links
                ) as postgres.JSONValue
              )}::jsonb
            )
            RETURNING id, session_id, sequence, event_type, actor_id, payload, created_at
          `;

          await tx`
            INSERT INTO audit_events (actor_id, action, entity_type, entity_id, payload)
            VALUES (
              ${actorId},
              'session.decision.resolved',
              'session_decision',
              ${decision.id},
              ${tx.json(
                attachLinks(
                  {
                    eventId: eventRows[0]!.id,
                    sessionId: session.id,
                    status: decisionStatus
                  },
                  links
                ) as postgres.JSONValue
              )}::jsonb
            )
          `;
          await tx`
            UPDATE game_sessions
            SET updated_at = now()
            WHERE id = ${session.id}
          `;

          return { decision, event: eventRows[0]!, status: 'resolved' as const };
        });

        if (result.status === 'not_found') {
          return reply.code(404).send({ status: 'not_found' });
        }

        if (result.status === 'decision_not_found') {
          return reply.code(404).send({ status: 'decision_not_found' });
        }

        sessionHub.broadcast(request.params.slug, {
          event: toEventResponse(result.event),
          kind: 'session.event',
          slug: request.params.slug
        });

        return {
          decision: toDecisionResponse(result.decision),
          event: toEventResponse(result.event),
          status: 'resolved'
        };
      } finally {
        await sql.end({ timeout: 5 });
      }
    }
  );

  // The journal is history-preserving: rollback records an auditable marker
  // and returns a pure rules-core projection at the requested sequence.
  app.post<{ Body: RollbackRequestBody; Params: SessionParams }>(
    '/sessions/:slug/rollback',
    async (request, reply) => {
      const body = request.body ?? {};
      const validation = validateRollbackBody(body);

      if (!validation.valid) {
        return reply.code(400).send({
          errors: validation.errors,
          status: 'invalid'
        });
      }

      const sql = createSqlClient();
      const actorId = body.actorId as string;
      const reason = body.reason as string;
      const targetSequence = body.targetSequence as number;
      const links = normalizeSessionLinks(body.links);

      try {
        const result = await sql.begin(async (tx) => {
          const sessionRows = await tx<SessionRow[]>`
            SELECT id, slug, title, mode, status, metadata, created_at, updated_at
            FROM game_sessions
            WHERE slug = ${request.params.slug}
            FOR UPDATE
          `;
          const session = sessionRows[0];

          if (!session) {
            return { status: 'not_found' as const };
          }

          const targetRows = await tx<Pick<SessionEventRow, 'id' | 'sequence'>[]>`
            SELECT id, sequence
            FROM session_events
            WHERE session_id = ${session.id}
              AND sequence = ${targetSequence}
          `;
          const target = targetRows[0];

          if (!target) {
            return { status: 'invalid_target' as const };
          }

          const sequenceRows = await tx<{ next_sequence: number }[]>`
            SELECT (COALESCE(MAX(sequence), 0) + 1)::int AS next_sequence
            FROM session_events
            WHERE session_id = ${session.id}
          `;
          const sequence = sequenceRows[0]!.next_sequence;
          const eventRows = await tx<SessionEventRow[]>`
            INSERT INTO session_events (session_id, sequence, event_type, actor_id, payload)
            VALUES (
              ${session.id},
              ${sequence},
              'rollback_requested',
              ${actorId},
              ${tx.json(
                attachLinks(
                  {
                    reason,
                    targetEventId: target.id,
                    targetSequence: target.sequence
                  },
                  links
                ) as postgres.JSONValue
              )}::jsonb
            )
            RETURNING id, session_id, sequence, event_type, actor_id, payload, created_at
          `;

          await tx`
            INSERT INTO audit_events (actor_id, action, entity_type, entity_id, payload)
            VALUES (
              ${actorId},
              'session.rollback.requested',
              'session',
              ${session.id},
              ${tx.json(
                attachLinks(
                  {
                    eventId: eventRows[0]!.id,
                    reason,
                    sessionId: session.id,
                    targetSequence: target.sequence
                  },
                  links
                ) as postgres.JSONValue
              )}::jsonb
            )
          `;
          await tx`
            UPDATE game_sessions
            SET updated_at = now()
            WHERE id = ${session.id}
          `;

          // Read the full (post-marker) journal so the reverted projection is
          // computed by the pure rules-core reconstruction rather than re-derived
          // in SQL. The marker we just inserted sits beyond `targetSequence`, so
          // it is naturally excluded from the reverted state while remaining in
          // the immutable log for audit.
          const fullEventRows = await tx<SessionEventRow[]>`
            SELECT id, session_id, sequence, event_type, actor_id, payload, created_at
            FROM session_events
            WHERE session_id = ${session.id}
            ORDER BY sequence ASC
          `;
          const decisionRows = await tx<SessionDecisionRow[]>`
            SELECT
              id,
              session_id,
              title,
              requested_by,
              assigned_to,
              priority,
              status,
              payload,
              resolution,
              created_at,
              resolved_at,
              updated_at
            FROM session_decisions
            WHERE session_id = ${session.id}
          `;

          return {
            decisionRows,
            event: eventRows[0]!,
            fullEventRows,
            playerRows: await selectSessionPlayers(tx, session.id),
            sceneRows: await selectSessionScenes(tx, session.id),
            session,
            status: 'created' as const,
            targetSequence: target.sequence
          };
        });

        if (result.status === 'not_found') {
          return reply.code(404).send({ status: 'not_found' });
        }

        if (result.status === 'invalid_target') {
          return reply.code(400).send({
            errors: ['targetSequence must reference an existing event'],
            status: 'invalid'
          });
        }

        // Delegate the actual revert to the canonical pure model. This replaces
        // the previous behaviour where the endpoint only recorded a marker and
        // never returned the reverted state (#54).
        const priorState = buildSessionState(
          result.session,
          result.fullEventRows,
          result.decisionRows,
          result.playerRows,
          result.sceneRows
        );
        const revertedState = revertSessionToSequence(priorState, result.targetSequence);

        sessionHub.broadcast(request.params.slug, {
          event: toEventResponse(result.event),
          kind: 'session.event',
          slug: request.params.slug
        });

        return reply.code(201).send({
          event: toEventResponse(result.event),
          revertedState: toSessionStateResponse(revertedState),
          status: 'created'
        });
      } finally {
        await sql.end({ timeout: 5 });
      }
    }
  );
}

interface SessionRow {
  created_at: Date | string;
  id: string;
  metadata: Record<string, unknown>;
  mode: string;
  slug: string;
  status: string;
  title: string;
  updated_at: Date | string;
}

interface SessionPlayerRow {
  capability: string;
  character_id: null | string;
  connected: boolean;
  created_at: Date | string;
  id: string;
  last_seen_at: Date | null | string;
  name: string;
  player_id: string;
  role: string;
  session_id: string;
  updated_at: Date | string;
}

interface SessionSceneRow {
  created_at: Date | string;
  description: null | string;
  id: string;
  location: string;
  npc_ids: string[];
  opened_at_sequence: null | number;
  scene_id: string;
  session_id: string;
  status: string;
  title: string;
  updated_at: Date | string;
}

interface SessionListRow extends SessionRow {
  event_count: number;
  pending_decision_count: number;
}

interface SessionEventRow {
  actor_id: null | string;
  created_at: Date | string;
  event_type: string;
  id: string;
  payload: Record<string, unknown>;
  sequence: number;
  session_id: string;
}

interface SessionDecisionRow {
  assigned_to: string;
  created_at: Date | string;
  id: string;
  payload: Record<string, unknown>;
  priority: string;
  requested_by: string;
  resolution: null | Record<string, unknown>;
  resolved_at: Date | null | string;
  session_id: string;
  status: string;
  title: string;
  updated_at: Date | string;
}

interface CharacterActiveSpellCast {
  activeSpellId: string;
  characterId: string;
  durationAmount: number;
  durationUnit: SpellDurationUnit;
  expiresAtCombatDt: null | number;
  expiresAtNarrativeSeconds: null | number;
  sourceCasterId: null | string;
  spellId: null | string;
  successesCount: null | number;
}

function validateCreateSessionBody(body: CreateSessionRequestBody): ValidationResult {
  const errors: string[] = [];

  if (typeof body.slug !== 'string' || !slugPattern.test(body.slug)) {
    errors.push('slug must use lowercase letters, numbers and dashes');
  }

  if (typeof body.title !== 'string' || body.title.trim().length === 0) {
    errors.push('title is required');
  }

  if (body.mode !== undefined && (typeof body.mode !== 'string' || !validModes.has(body.mode))) {
    errors.push('mode is invalid');
  }

  if (
    body.status !== undefined &&
    (typeof body.status !== 'string' || !validStatuses.has(body.status))
  ) {
    errors.push('status is invalid');
  }

  if (body.metadata !== undefined && !isRecord(body.metadata)) {
    errors.push('metadata must be an object');
  }

  return { errors, valid: errors.length === 0 };
}

function validateJoinSessionPlayerBody(body: JoinSessionPlayerRequestBody): ValidationResult {
  const errors: string[] = [];
  const role = isNonEmptyString(body.role) ? body.role.trim() : undefined;

  if (!isNonEmptyString(body.playerId)) {
    errors.push('playerId is required');
  }

  if (!isNonEmptyString(body.name)) {
    errors.push('name is required');
  }

  if (role === undefined || !validControllerRoles.has(role)) {
    errors.push('role is invalid');
  }

  if (role === 'player' && !isNonEmptyString(body.characterId)) {
    errors.push('characterId is required for player role');
  }

  if (body.characterId !== undefined && !isNonEmptyString(body.characterId)) {
    errors.push('characterId must be a non-empty string');
  }

  if (body.capability !== undefined && !isNonEmptyString(body.capability)) {
    errors.push('capability must be a non-empty string');
  }

  return { errors, valid: errors.length === 0 };
}

function validateUpsertSessionSceneBody(
  body: UpsertSessionSceneRequestBody
): ValidationResult & { scene?: SessionScene } {
  const errors: string[] = [];
  const sceneId = isNonEmptyString(body.sceneId) ? body.sceneId.trim() : undefined;
  const location = isNonEmptyString(body.location) ? body.location.trim() : undefined;
  const title = isNonEmptyString(body.title) ? body.title.trim() : location;
  const status =
    body.status === 'active' || body.status === 'closed' || body.status === 'draft'
      ? body.status
      : body.status === undefined
        ? 'draft'
        : undefined;
  const openedAtSequence =
    typeof body.openedAtSequence === 'number' && Number.isInteger(body.openedAtSequence)
      ? body.openedAtSequence
      : undefined;

  if (sceneId === undefined) {
    errors.push('sceneId is required');
  }

  if (location === undefined) {
    errors.push('location is required');
  }

  if (title === undefined) {
    errors.push('title is required');
  }

  if (status === undefined) {
    errors.push('status is invalid');
  }

  if (
    body.openedAtSequence !== undefined &&
    (openedAtSequence === undefined || openedAtSequence < 1)
  ) {
    errors.push('openedAtSequence must be a positive integer');
  }

  if (
    body.npcIds !== undefined &&
    (!Array.isArray(body.npcIds) || !body.npcIds.every(isNonEmptyString))
  ) {
    errors.push('npcIds must be an array of strings');
  }

  if (errors.length > 0) {
    return { errors, valid: false };
  }

  const scene: SessionScene = {
    id: sceneId!,
    location: location!,
    status: status!,
    title: title!
  };

  if (isNonEmptyString(body.description)) {
    scene.description = body.description.trim();
  }

  if (Array.isArray(body.npcIds)) {
    const npcIds = body.npcIds.map((npcId) => npcId.trim());
    if (npcIds.length > 0) {
      scene.npcIds = npcIds;
    }
  }

  if (openedAtSequence !== undefined) {
    scene.openedAtSequence = openedAtSequence;
  }

  return { errors, scene, valid: true };
}

function validateEventBody(body: AppendEventRequestBody): ValidationResult {
  const errors: string[] = [];

  if (typeof body.eventType !== 'string' || body.eventType.trim().length === 0) {
    errors.push('eventType is required');
  }

  if (body.actorId !== undefined && typeof body.actorId !== 'string') {
    errors.push('actorId must be a string');
  }

  if (body.payload !== undefined && !isRecord(body.payload)) {
    errors.push('payload must be an object');
  }

  validateSessionLinks(body.links, errors);

  return { errors, valid: errors.length === 0 };
}

function validateDecisionBody(body: QueueDecisionRequestBody): ValidationResult {
  const errors: string[] = [];

  if (typeof body.title !== 'string' || body.title.trim().length === 0) {
    errors.push('title is required');
  }

  if (typeof body.requestedBy !== 'string' || body.requestedBy.trim().length === 0) {
    errors.push('requestedBy is required');
  }

  if (
    body.assignedTo !== undefined &&
    (typeof body.assignedTo !== 'string' || !validControllerRoles.has(body.assignedTo))
  ) {
    errors.push('assignedTo is invalid');
  }

  if (
    body.priority !== undefined &&
    (typeof body.priority !== 'string' || !validPriorities.has(body.priority))
  ) {
    errors.push('priority is invalid');
  }

  if (body.payload !== undefined && !isRecord(body.payload)) {
    errors.push('payload must be an object');
  }

  validateSessionLinks(body.links, errors);

  return { errors, valid: errors.length === 0 };
}

function validateResolveDecisionBody(body: ResolveDecisionRequestBody): ValidationResult {
  const errors: string[] = [];

  if (typeof body.actorId !== 'string' || body.actorId.trim().length === 0) {
    errors.push('actorId is required');
  }

  if (typeof body.status !== 'string' || !validDecisionStatuses.has(body.status)) {
    errors.push('status is invalid');
  }

  if (body.resolution !== undefined && !isRecord(body.resolution)) {
    errors.push('resolution must be an object');
  }

  validateSessionLinks(body.links, errors);

  return { errors, valid: errors.length === 0 };
}

function validateRollbackBody(body: RollbackRequestBody): ValidationResult {
  const errors: string[] = [];

  if (typeof body.actorId !== 'string' || body.actorId.trim().length === 0) {
    errors.push('actorId is required');
  }

  if (typeof body.reason !== 'string' || body.reason.trim().length === 0) {
    errors.push('reason is required');
  }

  if (!Number.isInteger(body.targetSequence) || (body.targetSequence as number) <= 0) {
    errors.push('targetSequence must be a positive integer');
  }

  validateSessionLinks(body.links, errors);

  return { errors, valid: errors.length === 0 };
}

const linkCollectionKeys = ['characters', 'objects', 'places'] as const;

function validateSessionLinks(value: unknown, errors: string[]): void {
  if (value === undefined) {
    return;
  }

  if (!isRecord(value)) {
    errors.push('links must be an object');
    return;
  }

  for (const key of linkCollectionKeys) {
    const entries = value[key];

    if (entries === undefined) {
      continue;
    }

    if (!Array.isArray(entries) || entries.some((entry) => !isNonEmptyString(entry))) {
      errors.push(`links.${key} must be an array of non-empty strings`);
    }
  }

  const rules = value.rules;

  if (rules === undefined) {
    return;
  }

  if (!Array.isArray(rules)) {
    errors.push('links.rules must be an array of rule links');
    return;
  }

  rules.forEach((rule, index) => {
    if (!isRecord(rule)) {
      errors.push(`links.rules[${index}] must be an object`);
      return;
    }

    if (!isNonEmptyString(rule.sourcePath)) {
      errors.push(`links.rules[${index}].sourcePath is required`);
    }

    for (const key of ['ref', 'title'] as const) {
      if (rule[key] !== undefined && !isNonEmptyString(rule[key])) {
        errors.push(`links.rules[${index}].${key} must be a non-empty string`);
      }
    }
  });
}

function normalizeSessionLinks(value: unknown): SessionEntityLinks | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const links: SessionEntityLinks = {};

  for (const key of linkCollectionKeys) {
    const entries = value[key];

    if (!Array.isArray(entries)) {
      continue;
    }

    const normalizedEntries = entries.filter(isNonEmptyString).map((entry) => entry.trim());

    if (normalizedEntries.length > 0) {
      links[key] = normalizedEntries;
    }
  }

  if (Array.isArray(value.rules)) {
    const rules = value.rules
      .filter(isRecord)
      .map((rule) => {
        if (!isNonEmptyString(rule.sourcePath)) {
          return undefined;
        }

        const normalizedRule: SessionRuleLink = { sourcePath: rule.sourcePath.trim() };

        if (isNonEmptyString(rule.ref)) {
          normalizedRule.ref = rule.ref.trim();
        }

        if (isNonEmptyString(rule.title)) {
          normalizedRule.title = rule.title.trim();
        }

        return normalizedRule;
      })
      .filter((rule): rule is SessionRuleLink => rule !== undefined);

    if (rules.length > 0) {
      links.rules = rules;
    }
  }

  return Object.keys(links).length > 0 ? links : undefined;
}

function attachLinks(
  payload: Record<string, unknown>,
  links: SessionEntityLinks | undefined
): Record<string, unknown> {
  return links === undefined ? payload : { ...payload, links };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function readNonEmptyString(value: unknown): string | undefined {
  return isNonEmptyString(value) ? value.trim() : undefined;
}

function readSpellDurationUnit(value: unknown): SpellDurationUnit | undefined {
  return typeof value === 'string' && validSpellDurationUnits.has(value)
    ? (value as SpellDurationUnit)
    : undefined;
}

function readNonNegativeNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
}

function readNonNegativeInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 ? value : undefined;
}

function splitSessionMetadata(metadata: Record<string, unknown>): {
  metadata: Record<string, unknown>;
  players: SessionPlayer[] | undefined;
  scenes: SessionScene[] | undefined;
} {
  const { players: rawPlayers, scenes: rawScenes, ...rest } = metadata;
  delete rest.capabilities;

  return {
    metadata: rest,
    players: toSessionPlayers(rawPlayers),
    scenes: toSessionScenes(rawScenes)
  };
}

async function selectSessionPlayers(
  sql: SessionSql,
  sessionId: string
): Promise<SessionPlayerRow[]> {
  return sql<SessionPlayerRow[]>`
    SELECT
      id,
      session_id,
      player_id,
      name,
      role,
      character_id,
      capability,
      connected,
      last_seen_at,
      created_at,
      updated_at
    FROM session_players
    WHERE session_id = ${sessionId}
    ORDER BY player_id ASC
  `;
}

async function selectSessionScenes(sql: SessionSql, sessionId: string): Promise<SessionSceneRow[]> {
  return sql<SessionSceneRow[]>`
    SELECT
      id,
      session_id,
      scene_id,
      title,
      location,
      status,
      description,
      npc_ids,
      opened_at_sequence,
      created_at,
      updated_at
    FROM session_scenes
    WHERE session_id = ${sessionId}
    ORDER BY scene_id ASC
  `;
}

async function upsertSessionPlayerRow(
  sql: SessionSql,
  sessionId: string,
  player: SessionPlayer & { capability: string }
): Promise<SessionPlayer> {
  const rows = await sql<SessionPlayerRow[]>`
    INSERT INTO session_players (
      session_id,
      player_id,
      name,
      role,
      character_id,
      capability,
      connected,
      last_seen_at,
      updated_at
    )
    VALUES (
      ${sessionId},
      ${player.id},
      ${player.name},
      ${player.role},
      ${player.characterId ?? null},
      ${player.capability},
      ${player.connected ?? true},
      ${player.lastSeenAt ?? null},
      now()
    )
    ON CONFLICT (session_id, player_id)
    DO UPDATE SET
      name = EXCLUDED.name,
      role = EXCLUDED.role,
      character_id = EXCLUDED.character_id,
      capability = EXCLUDED.capability,
      connected = EXCLUDED.connected,
      last_seen_at = EXCLUDED.last_seen_at,
      updated_at = now()
    RETURNING
      id,
      session_id,
      player_id,
      name,
      role,
      character_id,
      capability,
      connected,
      last_seen_at,
      created_at,
      updated_at
  `;

  return toSessionPlayerResponse(rows[0]!);
}

async function upsertSessionSceneRow(
  sql: SessionSql,
  sessionId: string,
  scene: SessionScene
): Promise<SessionSceneRow> {
  const rows = await sql<SessionSceneRow[]>`
    INSERT INTO session_scenes (
      session_id,
      scene_id,
      title,
      location,
      status,
      description,
      npc_ids,
      opened_at_sequence,
      updated_at
    )
    VALUES (
      ${sessionId},
      ${scene.id},
      ${scene.title},
      ${scene.location},
      ${scene.status},
      ${scene.description ?? null},
      ${sql.json((scene.npcIds ?? []) as postgres.JSONValue)}::jsonb,
      ${scene.openedAtSequence ?? null},
      now()
    )
    ON CONFLICT (session_id, scene_id)
    DO UPDATE SET
      title = EXCLUDED.title,
      location = EXCLUDED.location,
      status = EXCLUDED.status,
      description = EXCLUDED.description,
      npc_ids = EXCLUDED.npc_ids,
      opened_at_sequence = EXCLUDED.opened_at_sequence,
      updated_at = now()
    RETURNING
      id,
      session_id,
      scene_id,
      title,
      location,
      status,
      description,
      npc_ids,
      opened_at_sequence,
      created_at,
      updated_at
  `;

  return rows[0]!;
}

async function persistCharacterActiveSpellEvent(
  sql: SessionSql,
  session: SessionRow,
  event: SessionEventRow,
  priorEventRows: SessionEventRow[]
): Promise<void> {
  if (event.event_type === 'spell_cast') {
    const stateBeforeCast = buildSessionState(session, priorEventRows, []);
    const cast = readCharacterActiveSpellCast(event, stateBeforeCast.narrativeSeconds);

    if (cast === undefined) {
      return;
    }

    await expireCharacterActiveSpells(sql, session.id, stateBeforeCast.narrativeSeconds);
    const characterRows = await sql<{ id: string }[]>`
      SELECT id
      FROM characters
      WHERE id = ${cast.characterId}
    `;

    if (characterRows.length === 0) {
      return;
    }

    await sql`
      INSERT INTO character_active_spells (
        session_id,
        character_id,
        active_spell_id,
        spell_id,
        source_caster_id,
        cast_at_sequence,
        cast_at_narrative_seconds,
        duration_amount,
        duration_unit,
        successes_count,
        expires_at_narrative_seconds,
        expires_at_combat_dt,
        status,
        dispelled_at_sequence,
        updated_at
      )
      VALUES (
        ${session.id},
        ${cast.characterId},
        ${cast.activeSpellId},
        ${cast.spellId},
        ${cast.sourceCasterId},
        ${event.sequence},
        ${stateBeforeCast.narrativeSeconds},
        ${cast.durationAmount},
        ${cast.durationUnit},
        ${cast.successesCount},
        ${cast.expiresAtNarrativeSeconds},
        ${cast.expiresAtCombatDt},
        'active',
        null,
        now()
      )
      ON CONFLICT (session_id, character_id, active_spell_id)
      DO UPDATE SET
        spell_id = EXCLUDED.spell_id,
        source_caster_id = EXCLUDED.source_caster_id,
        cast_at_sequence = EXCLUDED.cast_at_sequence,
        cast_at_narrative_seconds = EXCLUDED.cast_at_narrative_seconds,
        duration_amount = EXCLUDED.duration_amount,
        duration_unit = EXCLUDED.duration_unit,
        successes_count = EXCLUDED.successes_count,
        expires_at_narrative_seconds = EXCLUDED.expires_at_narrative_seconds,
        expires_at_combat_dt = EXCLUDED.expires_at_combat_dt,
        status = 'active',
        dispelled_at_sequence = null,
        updated_at = now()
    `;
    return;
  }

  if (event.event_type === 'narrative_time_advanced' || event.event_type === 'combat_ended') {
    const stateAfterAdvance = buildSessionState(session, [...priorEventRows, event], []);

    await expireCharacterActiveSpells(sql, session.id, stateAfterAdvance.narrativeSeconds);
    return;
  }

  if (event.event_type !== 'spell_dispelled') {
    return;
  }

  const activeSpellId =
    readNonEmptyString(event.payload.activeSpellId) ?? readNonEmptyString(event.payload.id);

  if (activeSpellId === undefined) {
    return;
  }

  const targetId = readNonEmptyString(event.payload.targetId);

  if (targetId !== undefined) {
    await sql`
      UPDATE character_active_spells
      SET
        status = 'dispelled',
        dispelled_at_sequence = ${event.sequence},
        updated_at = now()
      WHERE session_id = ${session.id}
        AND character_id = ${targetId}
        AND active_spell_id = ${activeSpellId}
        AND status = 'active'
    `;
    return;
  }

  await sql`
    UPDATE character_active_spells
    SET
      status = 'dispelled',
      dispelled_at_sequence = ${event.sequence},
      updated_at = now()
    WHERE session_id = ${session.id}
      AND active_spell_id = ${activeSpellId}
      AND status = 'active'
  `;
}

function readCharacterActiveSpellCast(
  event: SessionEventRow,
  castAtNarrativeSeconds: number
): CharacterActiveSpellCast | undefined {
  const targetId = readNonEmptyString(event.payload.targetId);
  const durationUnit = readSpellDurationUnit(event.payload.durationUnit);

  if (targetId === undefined || durationUnit === undefined) {
    return undefined;
  }

  const durationAmount = readNonNegativeNumber(event.payload.durationAmount) ?? 0;
  const durationSeconds = durationToSeconds(durationAmount, durationUnit);

  return {
    activeSpellId:
      readNonEmptyString(event.payload.activeSpellId) ??
      readNonEmptyString(event.payload.id) ??
      `spell-${event.sequence}`,
    characterId: targetId,
    durationAmount,
    durationUnit,
    expiresAtCombatDt: durationUnit === 'DT' ? Math.floor(durationAmount) : null,
    expiresAtNarrativeSeconds:
      durationSeconds === null ? null : castAtNarrativeSeconds + durationSeconds,
    sourceCasterId: event.actor_id,
    spellId: readNonEmptyString(event.payload.spellId) ?? null,
    successesCount:
      readNonNegativeInteger(event.payload.successesCount) ??
      readNonNegativeInteger(event.payload.successes_count) ??
      null
  };
}

async function expireCharacterActiveSpells(
  sql: SessionSql,
  sessionId: string,
  narrativeSeconds: number
): Promise<void> {
  await sql`
    UPDATE character_active_spells
    SET
      status = 'expired',
      updated_at = now()
    WHERE session_id = ${sessionId}
      AND status = 'active'
      AND expires_at_narrative_seconds IS NOT NULL
      AND expires_at_narrative_seconds <= ${narrativeSeconds}
  `;
}

function buildJoinHref(slug: string, playerId: string, capability: string): string {
  return `/session?slug=${encodeURIComponent(slug)}&player=${encodeURIComponent(
    playerId
  )}&capability=${encodeURIComponent(capability)}`;
}

function toSessionPlayerResponse(row: SessionPlayerRow): SessionPlayer {
  const player: SessionPlayer = {
    connected: row.connected,
    id: row.player_id,
    name: row.name,
    role: row.role as SessionPlayer['role']
  };

  if (row.character_id !== null) {
    player.characterId = row.character_id;
  }

  if (row.last_seen_at !== null) {
    player.lastSeenAt = serializeDate(row.last_seen_at);
  }

  return player;
}

function toSessionSceneResponse(row: SessionSceneRow): SessionScene {
  const scene: SessionScene = {
    id: row.scene_id,
    location: row.location,
    status:
      row.status === 'active' || row.status === 'closed' || row.status === 'draft'
        ? row.status
        : 'draft',
    title: row.title
  };

  if (row.description !== null) {
    scene.description = row.description;
  }

  if (Array.isArray(row.npc_ids) && row.npc_ids.length > 0) {
    scene.npcIds = row.npc_ids.filter(isNonEmptyString);
  }

  if (row.opened_at_sequence !== null) {
    scene.openedAtSequence = row.opened_at_sequence;
  }

  return scene;
}

function toSessionResponse(
  session: SessionRow,
  events: SessionEventRow[],
  decisions: SessionDecisionRow[],
  playerRows: SessionPlayerRow[] = [],
  sceneRows: SessionSceneRow[] = []
) {
  const rawState = buildSessionState(session, events, decisions, playerRows, sceneRows);
  const state = rawState.events.some((event) => event.type === 'rollback_requested')
    ? projectSessionStateFromJournal(rawState)
    : rawState;

  return {
    createdAt: serializeDate(session.created_at),
    decisions: decisions.map(toDecisionResponse),
    events: events.map(toEventResponse),
    id: session.id,
    metadata: session.metadata,
    mode: session.mode,
    slug: session.slug,
    state: toProjectedSessionStateResponse(state),
    status: session.status,
    title: session.title,
    updatedAt: serializeDate(session.updated_at)
  };
}

/**
 * Lifts persisted session rows into the canonical pure {@link SessionState}.
 *
 * Persisted `mode`/`status`/`priority`/role values originate from the validated
 * write endpoints (see the `valid*` vocabularies), so the narrowing casts here
 * are safe; the pure model is the single source of truth for derived projection
 * logic such as rollback reconstruction.
 */
function buildSessionState(
  session: SessionRow,
  events: SessionEventRow[],
  decisions: SessionDecisionRow[],
  playerRows: SessionPlayerRow[] = [],
  sceneRows: SessionSceneRow[] = []
): SessionState {
  const metadata = isRecord(session.metadata) ? session.metadata : {};
  const players =
    playerRows.length > 0
      ? playerRows.map(toSessionPlayerResponse)
      : toSessionPlayers(metadata.players);
  const scenes =
    sceneRows.length > 0 ? sceneRows.map(toSessionSceneResponse) : toSessionScenes(metadata.scenes);

  return createSessionState({
    createdAt: serializeDate(session.created_at),
    decisions: decisions.map(toDecisionModel),
    events: events.map(toEventModel),
    id: session.id,
    metadata,
    mode: session.mode as SessionState['mode'],
    players,
    scenes,
    slug: session.slug,
    status: session.status as SessionState['status'],
    title: session.title,
    updatedAt: serializeDate(session.updated_at)
  });
}

function toEventModel(row: SessionEventRow): SessionEvent {
  return {
    actorId: row.actor_id ?? undefined,
    createdAt: serializeDate(row.created_at),
    id: row.id,
    payload: row.payload,
    sequence: row.sequence,
    type: row.event_type as SessionEvent['type']
  };
}

function toDecisionModel(row: SessionDecisionRow): SessionDecision {
  return {
    assignedTo: row.assigned_to as SessionDecision['assignedTo'],
    createdAt: serializeDate(row.created_at),
    id: row.id,
    payload: row.payload,
    priority: row.priority as SessionDecision['priority'],
    requestedBy: row.requested_by,
    resolution: row.resolution ?? undefined,
    resolvedAt: row.resolved_at ? serializeDate(row.resolved_at) : undefined,
    status: row.status as SessionDecision['status'],
    title: row.title
  };
}

/** Serializes the authoritative RSC snapshot in the rules-core `SessionState` shape. */
function toProjectedSessionStateResponse(state: SessionState): SessionState {
  return state;
}

/** Serializes a reverted {@link SessionState} projection for HTTP responses. */
function toSessionStateResponse(state: SessionState): SessionState {
  return state;
}

function toEventResponse(row: SessionEventRow) {
  return {
    actorId: row.actor_id ?? undefined,
    createdAt: serializeDate(row.created_at),
    eventType: row.event_type,
    id: row.id,
    payload: row.payload,
    sequence: row.sequence,
    sessionId: row.session_id
  };
}

function toDecisionResponse(row: SessionDecisionRow) {
  return {
    assignedTo: row.assigned_to,
    createdAt: serializeDate(row.created_at),
    id: row.id,
    payload: row.payload,
    priority: row.priority,
    requestedBy: row.requested_by,
    resolution: row.resolution ?? undefined,
    resolvedAt: row.resolved_at ? serializeDate(row.resolved_at) : undefined,
    sessionId: row.session_id,
    status: row.status,
    title: row.title,
    updatedAt: serializeDate(row.updated_at)
  };
}

function serializeDate(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

function toSessionPlayers(value: unknown): SessionPlayer[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const players = value
    .filter(isRecord)
    .map((player) => {
      if (!isNonEmptyString(player.id) || !isNonEmptyString(player.name)) {
        return undefined;
      }

      const role = isNonEmptyString(player.role) ? player.role : 'player';

      if (!validControllerRoles.has(role)) {
        return undefined;
      }

      const normalized: SessionPlayer = {
        id: player.id.trim(),
        name: player.name.trim(),
        role: role as SessionPlayer['role']
      };

      if (isNonEmptyString(player.characterId)) {
        normalized.characterId = player.characterId.trim();
      }

      if (typeof player.connected === 'boolean') {
        normalized.connected = player.connected;
      }

      if (isNonEmptyString(player.lastSeenAt)) {
        normalized.lastSeenAt = player.lastSeenAt.trim();
      }

      return normalized;
    })
    .filter((player): player is SessionPlayer => player !== undefined);

  return players.length > 0 ? players : undefined;
}

function toSessionScenes(value: unknown): SessionScene[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const scenes = value
    .filter(isRecord)
    .map((scene) => {
      if (!isNonEmptyString(scene.id) || !isNonEmptyString(scene.location)) {
        return undefined;
      }

      const normalized: SessionScene = {
        id: scene.id.trim(),
        location: scene.location.trim(),
        status:
          scene.status === 'active' || scene.status === 'closed' || scene.status === 'draft'
            ? scene.status
            : 'draft',
        title: isNonEmptyString(scene.title) ? scene.title.trim() : scene.location.trim()
      };

      if (isNonEmptyString(scene.description)) {
        normalized.description = scene.description.trim();
      }

      if (Array.isArray(scene.npcIds)) {
        const npcIds = scene.npcIds.filter(isNonEmptyString).map((npcId) => npcId.trim());

        if (npcIds.length > 0) {
          normalized.npcIds = npcIds;
        }
      }

      if (Number.isInteger(scene.openedAtSequence)) {
        normalized.openedAtSequence = scene.openedAtSequence as number;
      }

      return normalized;
    })
    .filter((scene): scene is SessionScene => scene !== undefined);

  return scenes.length > 0 ? scenes : undefined;
}

interface ValidationResult {
  errors: string[];
  valid: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
