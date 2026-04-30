import type { FastifyInstance } from 'fastify';
import {
  describeSceneWithGameMaster,
  validateRollDiceShape,
  type RollDiceToolInput
} from '../llm/game-master.js';

interface DescribeSceneRequestBody {
  roll?: unknown;
  sceneDescription?: unknown;
  sessionId?: unknown;
}

export async function registerGameMasterRoutes(app: FastifyInstance): Promise<void> {
  app.options('/game-master/scenes/describe', async (_request, reply) => reply.code(204).send());

  app.post<{ Body: DescribeSceneRequestBody }>(
    '/game-master/scenes/describe',
    async (request, reply) => {
      const body = request.body ?? {};
      const validation = validateDescribeSceneBody(body);

      if (!validation.valid) {
        return reply.code(400).send({
          errors: validation.errors,
          status: 'invalid'
        });
      }

      const result = await describeSceneWithGameMaster({
        roll: body.roll as RollDiceToolInput | undefined,
        sceneDescription: body.sceneDescription as string,
        sessionId: body.sessionId as string
      });

      return {
        ...result,
        status: 'described'
      };
    }
  );
}

interface ValidationResult {
  errors: string[];
  valid: boolean;
}

function validateDescribeSceneBody(body: DescribeSceneRequestBody): ValidationResult {
  const errors: string[] = [];

  if (typeof body.sessionId !== 'string' || body.sessionId.trim().length === 0) {
    errors.push('sessionId is required');
  }

  if (typeof body.sceneDescription !== 'string' || body.sceneDescription.trim().length === 0) {
    errors.push('sceneDescription is required');
  }

  if (body.roll !== undefined) {
    if (!isRecord(body.roll)) {
      errors.push('roll must be an object');
    } else {
      errors.push(...validateRollDiceShape(body.roll));
    }
  }

  return {
    errors,
    valid: errors.length === 0
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
