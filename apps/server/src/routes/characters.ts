import type { FastifyInstance, FastifyReply } from 'fastify';
import {
  CharacterDraftNotFoundError,
  CharacterNotFoundError,
  finalizeCharacterDraft,
  getPersistedCharacter
} from '../characters/finalize.js';

interface FinalizeCharacterRequestBody {
  draftId?: unknown;
}

interface CharacterParams {
  id: string;
}

export async function registerCharacterRoutes(app: FastifyInstance): Promise<void> {
  app.options('/characters/finalize', async (_request, reply) => reply.code(204).send());
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
