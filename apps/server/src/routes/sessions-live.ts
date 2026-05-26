import websocket from '@fastify/websocket';
import type { FastifyInstance } from 'fastify';

import { sessionHub } from '../sessions/hub.js';

interface LiveParams {
  slug: string;
}

/**
 * Live feed for a session room (E-N). Clients open one socket per session and
 * receive committed journal events broadcast by the write routes. The server
 * stays authoritative: this socket only fans out events, it never resolves rules.
 */
export async function registerSessionLiveRoutes(app: FastifyInstance): Promise<void> {
  await app.register(websocket);

  app.get<{ Params: LiveParams }>(
    '/sessions/:slug/live',
    { websocket: true },
    (socket, request) => {
      const { slug } = request.params;

      sessionHub.subscribe(slug, socket);
      sessionHub.broadcast(slug, {
        count: sessionHub.presence(slug),
        kind: 'session.presence',
        slug
      });

      socket.on('close', () => {
        sessionHub.unsubscribe(slug, socket);
        sessionHub.broadcast(slug, {
          count: sessionHub.presence(slug),
          kind: 'session.presence',
          slug
        });
      });
    }
  );
}
