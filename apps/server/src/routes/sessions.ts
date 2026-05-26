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
  createSessionState,
  revertSessionToSequence
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

interface SessionParams {
  slug: string;
}

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
// A decision cannot be *resolved* into the 'pending' state.
const validDecisionStatuses = new Set<string>(
  SESSION_DECISION_STATUSES.filter((status) => status !== 'pending')
);
const validControllerRoles = new Set<string>(SESSION_CONTROLLER_ROLES);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function registerSessionRoutes(app: FastifyInstance): Promise<void> {
  app.options('/sessions', async (_request, reply) => reply.code(204).send());
  app.options('/sessions/:slug', async (_request, reply) => reply.code(204).send());
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
    const metadata = body.metadata === undefined ? {} : (body.metadata as Record<string, unknown>);
    const mode = typeof body.mode === 'string' ? body.mode : 'classic_table';
    const status = typeof body.status === 'string' ? body.status : 'planned';

    try {
      const rows = await sql<SessionRow[]>`
        INSERT INTO game_sessions (slug, title, mode, status, metadata)
        VALUES (
          ${body.slug as string},
          ${body.title as string},
          ${mode},
          ${status},
          ${sql.json(metadata as postgres.JSONValue)}::jsonb
        )
        RETURNING id, slug, title, mode, status, metadata, created_at, updated_at
      `;

      return reply.code(201).send(toSessionResponse(rows[0]!, [], []));
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

      return toSessionResponse(session, eventRows, decisionRows);
    } finally {
      await sql.end({ timeout: 5 });
    }
  });

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

          await tx`
            INSERT INTO audit_events (actor_id, action, entity_type, entity_id, payload)
            VALUES (
              ${actorId},
              'session.event.appended',
              'session_event',
              ${eventRows[0]!.id},
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
          await tx`
            UPDATE game_sessions
            SET updated_at = now()
            WHERE id = ${session.id}
          `;

          return { event: eventRows[0]!, status: 'created' as const };
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
          result.decisionRows
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

function toSessionResponse(
  session: SessionRow,
  events: SessionEventRow[],
  decisions: SessionDecisionRow[]
) {
  const state = projectCurrentSessionState(buildSessionState(session, events, decisions));

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
  decisions: SessionDecisionRow[]
): SessionState {
  const metadata = isRecord(session.metadata) ? session.metadata : {};

  return createSessionState({
    createdAt: serializeDate(session.created_at),
    decisions: decisions.map(toDecisionModel),
    events: events.map(toEventModel),
    id: session.id,
    metadata,
    mode: session.mode as SessionState['mode'],
    players: toSessionPlayers(metadata.players),
    scenes: toSessionScenes(metadata.scenes),
    slug: session.slug,
    status: session.status as SessionState['status'],
    title: session.title,
    updatedAt: serializeDate(session.updated_at)
  });
}

function projectCurrentSessionState(state: SessionState): SessionState {
  const rollbackTargetSequence = getLatestRollbackTargetSequence(state.events);

  if (rollbackTargetSequence === undefined) {
    return state;
  }

  return revertSessionToSequence(state, rollbackTargetSequence);
}

function getLatestRollbackTargetSequence(events: SessionEvent[]): number | undefined {
  const sortedEvents = [...events].sort((left, right) => right.sequence - left.sequence);

  for (const event of sortedEvents) {
    if (event.type !== 'rollback_requested') {
      continue;
    }

    const targetSequence = event.payload.targetSequence;

    if (
      typeof targetSequence === 'number' &&
      events.some((candidate) => candidate.sequence === targetSequence)
    ) {
      return targetSequence;
    }
  }

  return undefined;
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
