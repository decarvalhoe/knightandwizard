import Fastify, { type FastifyServerOptions, type FastifyInstance } from 'fastify';
import { registerCharacterDraftRoutes } from './routes/character-drafts.js';
import { registerGameMasterRoutes } from './routes/game-master.js';
import { registerHealthRoute } from './routes/health.js';
import { registerReadyRoute } from './routes/ready.js';
import { registerSessionRoutes } from './routes/sessions.js';

export function buildApp(options: FastifyServerOptions = {}): FastifyInstance {
  const app = Fastify(options);

  app.addHook('onRequest', async (request, reply) => {
    const origin = request.headers.origin ?? '*';

    reply.header('access-control-allow-origin', origin);
    reply.header('access-control-allow-methods', 'GET,PUT,POST,OPTIONS');
    reply.header('access-control-allow-headers', 'content-type,authorization');
  });

  app.register(registerCharacterDraftRoutes);
  app.register(registerGameMasterRoutes);
  app.register(registerHealthRoute);
  app.register(registerReadyRoute);
  app.register(registerSessionRoutes);

  return app;
}
