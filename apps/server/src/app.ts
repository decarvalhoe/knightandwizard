import Fastify, { type FastifyServerOptions, type FastifyInstance } from 'fastify';
import { registerHealthRoute } from './routes/health.js';
import { registerReadyRoute } from './routes/ready.js';

export function buildApp(options: FastifyServerOptions = {}): FastifyInstance {
  const app = Fastify(options);

  app.register(registerHealthRoute);
  app.register(registerReadyRoute);

  return app;
}
