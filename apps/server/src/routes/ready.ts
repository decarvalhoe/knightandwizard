import type { FastifyInstance } from 'fastify';
import { createSqlClient } from '../db/client.js';

export async function registerReadyRoute(app: FastifyInstance): Promise<void> {
  app.get('/ready', async (_request, reply) => {
    const sql = createSqlClient();

    try {
      await sql`SELECT 1`;
      const rows = await sql<{ extname: string }[]>`
        SELECT extname FROM pg_extension WHERE extname = 'vector'
      `;
      const hasPgvector = rows.some((row) => row.extname === 'vector');

      if (!hasPgvector) {
        return reply.code(503).send({
          status: 'not_ready',
          postgres: 'ok',
          pgvector: false
        });
      }

      return {
        status: 'ready',
        postgres: 'ok',
        pgvector: true
      };
    } catch (error) {
      app.log.warn({ error }, 'readiness check failed');

      return reply.code(503).send({
        status: 'not_ready',
        postgres: 'error',
        pgvector: false
      });
    } finally {
      await sql.end({ timeout: 5 });
    }
  });
}
