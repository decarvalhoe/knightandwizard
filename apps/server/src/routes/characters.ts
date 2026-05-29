import type { FastifyInstance, FastifyReply } from 'fastify';
import {
  CharacterDraftNotFoundError,
  CharacterNotFoundError,
  awardPersistedCharacterXp,
  finalizeCharacterDraft,
  getPersistedCharacter,
  updatePersistedCharacterCombatState,
  type CharacterCombatStateUpdate,
  type CharacterXpAwardUpdate
} from '../characters/finalize.js';

interface FinalizeCharacterRequestBody {
  draftId?: unknown;
}

interface UpdateCharacterCombatStateRequestBody {
  sessionSlug?: unknown;
  statuses?: unknown;
  vitality?: unknown;
}

interface AwardCharacterXpRequestBody {
  actorId?: unknown;
  amount?: unknown;
  questPoints?: unknown;
  reason?: unknown;
  sessionSlug?: unknown;
}

interface CharacterParams {
  id: string;
}

export async function registerCharacterRoutes(app: FastifyInstance): Promise<void> {
  app.options('/characters/finalize', async (_request, reply) => reply.code(204).send());
  app.options('/characters/:id/combat-state', async (_request, reply) => reply.code(204).send());
  app.options('/characters/:id/xp-awards', async (_request, reply) => reply.code(204).send());
  app.options('/characters/:id', async (_request, reply) => reply.code(204).send());

  app.post<{ Body: FinalizeCharacterRequestBody }>(
    '/characters/finalize',
    async (request, reply) => {
      const draftId = normalizeOptionalString(request.body?.draftId);

      if (!draftId) {
        return reply.code(400).send({
          errors: ['draftId is required'],
          status: 'invalid'
        });
      }

      try {
        const result = await finalizeCharacterDraft(draftId);

        return reply.code(201).send({
          character: result.character,
          status: 'finalized'
        });
      } catch (error) {
        return sendCharacterRouteError(error, reply);
      }
    }
  );

  app.get<{ Params: CharacterParams }>('/characters/:id', async (request, reply) => {
    try {
      const result = await getPersistedCharacter(request.params.id);

      return {
        character: result.character,
        status: 'found'
      };
    } catch (error) {
      return sendCharacterRouteError(error, reply);
    }
  });

  app.patch<{ Body: UpdateCharacterCombatStateRequestBody; Params: CharacterParams }>(
    '/characters/:id/combat-state',
    async (request, reply) => {
      const validation = validateCombatStateUpdate(request.body ?? {});

      if (!validation.valid) {
        return reply.code(400).send({
          errors: validation.errors,
          status: 'invalid'
        });
      }

      try {
        const result = await updatePersistedCharacterCombatState(
          request.params.id,
          validation.input
        );

        return {
          character: result.character,
          status: 'updated'
        };
      } catch (error) {
        return sendCharacterRouteError(error, reply);
      }
    }
  );

  app.post<{ Body: AwardCharacterXpRequestBody; Params: CharacterParams }>(
    '/characters/:id/xp-awards',
    async (request, reply) => {
      const validation = validateXpAward(request.body ?? {});

      if (!validation.valid) {
        return reply.code(400).send({
          errors: validation.errors,
          status: 'invalid'
        });
      }

      try {
        const result = await awardPersistedCharacterXp(request.params.id, validation.input);

        return {
          character: result.character,
          status: 'updated'
        };
      } catch (error) {
        return sendCharacterRouteError(error, reply);
      }
    }
  );
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();

  return normalized.length > 0 ? normalized : undefined;
}

function sendCharacterRouteError(error: unknown, reply: FastifyReply) {
  if (error instanceof CharacterDraftNotFoundError || error instanceof CharacterNotFoundError) {
    return reply.code(404).send({ status: 'not_found' });
  }

  throw error;
}

function validateCombatStateUpdate(
  body: UpdateCharacterCombatStateRequestBody
): { input: CharacterCombatStateUpdate; valid: true } | { errors: string[]; valid: false } {
  const errors: string[] = [];
  const input: CharacterCombatStateUpdate = {};

  if (body.sessionSlug !== undefined) {
    if (typeof body.sessionSlug !== 'string' || body.sessionSlug.trim().length === 0) {
      errors.push('sessionSlug must be a non-empty string');
    } else {
      input.sessionSlug = body.sessionSlug.trim();
    }
  }

  if (body.vitality !== undefined) {
    if (!isRecord(body.vitality)) {
      errors.push('vitality must be an object');
    } else {
      const current = readOptionalNonNegativeInteger(body.vitality.current, 'vitality.current');
      const max = readOptionalPositiveInteger(body.vitality.max, 'vitality.max');

      errors.push(...current.errors, ...max.errors);
      input.vitality = {
        ...(current.value !== undefined ? { current: current.value } : {}),
        ...(max.value !== undefined ? { max: max.value } : {})
      };
    }
  }

  if (body.statuses !== undefined) {
    if (!Array.isArray(body.statuses)) {
      errors.push('statuses must be an array');
    } else {
      input.statuses = body.statuses.map((status, index) => {
        if (!isRecord(status) || typeof status.id !== 'string' || status.id.trim().length === 0) {
          errors.push(`statuses[${index}].id must be a non-empty string`);
          return { id: 'invalid' };
        }

        const duration = readOptionalNonNegativeInteger(
          status.durationDT,
          `statuses[${index}].durationDT`
        );
        const appliedAt = readOptionalNonNegativeInteger(
          status.appliedAtDT,
          `statuses[${index}].appliedAtDT`
        );

        errors.push(...duration.errors, ...appliedAt.errors);

        return {
          ...(appliedAt.value !== undefined ? { appliedAtDT: appliedAt.value } : {}),
          ...(duration.value !== undefined ? { durationDT: duration.value } : {}),
          id: status.id.trim()
        };
      });
    }
  }

  if (errors.length > 0) {
    return { errors, valid: false };
  }

  return { input, valid: true };
}

function validateXpAward(
  body: AwardCharacterXpRequestBody
): { input: CharacterXpAwardUpdate; valid: true } | { errors: string[]; valid: false } {
  const errors: string[] = [];
  const amount = readOptionalPositiveInteger(body.amount, 'amount');
  const questPoints = readOptionalNonNegativeInteger(body.questPoints, 'questPoints');
  const actorId = normalizeOptionalString(body.actorId);
  const reason = normalizeOptionalString(body.reason);
  const sessionSlug = normalizeOptionalString(body.sessionSlug);

  errors.push(...amount.errors, ...questPoints.errors);

  const amountValue = amount.value;

  if (amountValue === undefined) {
    errors.push('amount is required');
  }

  if (errors.length > 0 || amountValue === undefined) {
    return { errors, valid: false };
  }

  return {
    input: {
      ...(actorId ? { actorId } : {}),
      amount: amountValue,
      ...(questPoints.value !== undefined ? { questPoints: questPoints.value } : {}),
      ...(reason ? { reason } : {}),
      ...(sessionSlug ? { sessionSlug } : {})
    },
    valid: true
  };
}

function readOptionalNonNegativeInteger(value: unknown, label: string) {
  if (value === undefined) {
    return { errors: [] as string[], value: undefined };
  }

  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    return { errors: [`${label} must be a non-negative integer`], value: undefined };
  }

  return { errors: [] as string[], value: value as number };
}

function readOptionalPositiveInteger(value: unknown, label: string) {
  if (value === undefined) {
    return { errors: [] as string[], value: undefined };
  }

  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    return { errors: [`${label} must be a positive integer`], value: undefined };
  }

  return { errors: [] as string[], value: value as number };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
