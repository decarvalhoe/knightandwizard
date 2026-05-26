import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  CharacterDraftNotFoundError,
  CharacterNotFoundError,
  finalizeCharacterDraft,
  getPersistedCharacter
} from '../characters/finalize.js';
import {
  CombatStateSchema,
  RollDiceInputSchema,
  executeAdvanceCombatTimelineTool,
  executeRollDiceTool,
  type RuleToolResult,
  type ToolErrorResult
} from '../llm/rules-tools.js';
import type { TrpcContext } from './context.js';
import { toRandomInteger } from './random.js';

const t = initTRPC.context<TrpcContext>().create();

const DeterministicRandomSchema = z.object({
  randomInteger: z.array(z.number().int().positive()).optional(),
  seed: z.union([z.number(), z.string().min(1)]).optional()
});

const RollDiceProcedureInputSchema = RollDiceInputSchema.merge(DeterministicRandomSchema);

const ResolveActionProcedureInputSchema = DeterministicRandomSchema.extend({
  state: CombatStateSchema
});

const CharacterIdInputSchema = z.object({
  id: z.string().min(1)
});

const FinalizeCharacterInputSchema = z.object({
  draftId: z.string().min(1)
});

export const appRouter = t.router({
  characters: t.router({
    finalize: t.procedure.input(FinalizeCharacterInputSchema).mutation(async ({ input }) => {
      try {
        return await finalizeCharacterDraft(input.draftId);
      } catch (error) {
        throw toCharacterProcedureError(error);
      }
    }),
    get: t.procedure.input(CharacterIdInputSchema).query(async ({ input }) => {
      try {
        return await getPersistedCharacter(input.id);
      } catch (error) {
        throw toCharacterProcedureError(error);
      }
    })
  }),
  combat: t.router({
    resolveAction: t.procedure
      .input(ResolveActionProcedureInputSchema)
      .mutation(async ({ input }) =>
        unwrapRuleToolResult(
          await executeAdvanceCombatTimelineTool(
            { state: input.state },
            { randomInteger: toRandomInteger(input) }
          )
        )
      )
  }),
  dice: t.router({
    roll: t.procedure.input(RollDiceProcedureInputSchema).mutation(async ({ input }) =>
      unwrapRuleToolResult(
        await executeRollDiceTool(input, {
          randomInteger: toRandomInteger(input)
        })
      )
    )
  })
});

export type AppRouter = typeof appRouter;

function unwrapRuleToolResult<T extends object>(result: RuleToolResult<T>): T {
  if (isToolError(result)) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: result.message
    });
  }

  return result;
}

function isToolError<T extends object>(result: RuleToolResult<T>): result is ToolErrorResult {
  return 'status' in result && result.status === 'error';
}

function toCharacterProcedureError(error: unknown): TRPCError {
  if (error instanceof CharacterDraftNotFoundError || error instanceof CharacterNotFoundError) {
    return new TRPCError({
      code: 'NOT_FOUND',
      message: error.message
    });
  }

  if (error instanceof z.ZodError) {
    return new TRPCError({
      code: 'BAD_REQUEST',
      message: error.issues.map((issue) => issue.message).join('; ')
    });
  }

  return new TRPCError({
    code: 'BAD_REQUEST',
    message: error instanceof Error ? error.message : 'Character persistence failed'
  });
}
