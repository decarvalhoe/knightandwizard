import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import type { FastifyInstance } from 'fastify';
import { createTrpcContext } from './context.js';
import { appRouter } from './router.js';

export async function registerTrpcRoutes(app: FastifyInstance): Promise<void> {
  app.options('/trpc/*', async (_request, reply) => reply.code(204).send());

  await app.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      createContext: createTrpcContext,
      router: appRouter
    }
  });
}
