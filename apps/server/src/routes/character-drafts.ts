import type { FastifyInstance } from 'fastify';
import type postgres from 'postgres';
import { createSqlClient } from '../db/client.js';

interface CharacterDraftRequestBody {
  currentStep?: unknown;
  payload?: unknown;
  userId?: unknown;
}

interface CharacterDraftRouteParams {
  id: string;
}

export async function registerCharacterDraftRoutes(app: FastifyInstance): Promise<void> {
  app.options('/character-drafts/:id', async (_request, reply) => reply.code(204).send());

  app.put<{ Body: CharacterDraftRequestBody; Params: CharacterDraftRouteParams }>(
    '/character-drafts/:id',
    async (request, reply) => {
      const validation = validateDraftBody(request.body);

      if (!validation.valid) {
        return reply.code(400).send({
          errors: validation.errors,
          status: 'invalid'
        });
      }

      const sql = createSqlClient();
      const userId = typeof request.body.userId === 'string' ? request.body.userId : 'local-dev';
      const payload = request.body.payload as postgres.JSONValue;

      try {
        const rows = await sql<CharacterDraftRow[]>`
          INSERT INTO character_drafts (id, user_id, current_step, payload, updated_at)
          VALUES (
            ${request.params.id},
            ${userId},
            ${request.body.currentStep as string},
            ${sql.json(payload)},
            now()
          )
          ON CONFLICT (id)
          DO UPDATE SET
            user_id = EXCLUDED.user_id,
            current_step = EXCLUDED.current_step,
            payload = EXCLUDED.payload,
            updated_at = now()
          RETURNING id, user_id, current_step, payload, updated_at
        `;
        const row = rows[0];

        return {
          currentStep: row.current_step,
          id: row.id,
          payload: row.payload,
          status: 'saved',
          updatedAt: row.updated_at,
          userId: row.user_id
        };
      } finally {
        await sql.end({ timeout: 5 });
      }
    }
  );

  app.get<{ Params: CharacterDraftRouteParams }>(
    '/character-drafts/:id',
    async (request, reply) => {
      const sql = createSqlClient();

      try {
        const rows = await sql<CharacterDraftRow[]>`
          SELECT id, user_id, current_step, payload, updated_at
          FROM character_drafts
          WHERE id = ${request.params.id}
        `;
        const row = rows[0];

        if (!row) {
          return reply.code(404).send({
            status: 'not_found'
          });
        }

        return {
          currentStep: row.current_step,
          id: row.id,
          payload: row.payload,
          status: 'found',
          updatedAt: row.updated_at,
          userId: row.user_id
        };
      } finally {
        await sql.end({ timeout: 5 });
      }
    }
  );
}

interface CharacterDraftRow {
  current_step: string;
  id: string;
  payload: Record<string, unknown>;
  updated_at: string;
  user_id: string;
}

function validateDraftBody(body: CharacterDraftRequestBody): { errors: string[]; valid: boolean } {
  const errors: string[] = [];

  if (typeof body.currentStep !== 'string' || body.currentStep.trim().length === 0) {
    errors.push('currentStep is required');
  }

  if (!isRecord(body.payload)) {
    errors.push('payload must be an object');
  }

  return {
    errors,
    valid: errors.length === 0
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
