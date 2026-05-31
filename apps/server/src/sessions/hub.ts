/**
 * In-process fan-out for the live session feed (E-N).
 *
 * One "room" per session slug. A committed journal event is broadcast to every
 * connected client of that room; clients apply events by `sequence` and resync
 * via `GET /sessions/:slug` on a gap. This is the single-instance MVP transport:
 * scaling to many instances is an additive step (publish the same payloads over
 * Redis pub/sub) that does not change this contract.
 */

const WS_OPEN = 1;

/** Minimal surface we need from a live connection (a `ws` WebSocket satisfies it). */
export interface LiveConnection {
  readonly readyState?: number;
  send(data: string): void;
}

export type SessionBroadcastKind = 'session.event' | 'session.presence' | 'session.scene';

export interface SessionBroadcast {
  readonly kind: SessionBroadcastKind;
  readonly slug: string;
  readonly [key: string]: unknown;
}

export class SessionHub {
  private readonly rooms = new Map<string, Set<LiveConnection>>();

  subscribe(slug: string, connection: LiveConnection): void {
    let room = this.rooms.get(slug);

    if (!room) {
      room = new Set<LiveConnection>();
      this.rooms.set(slug, room);
    }

    room.add(connection);
  }

  unsubscribe(slug: string, connection: LiveConnection): void {
    const room = this.rooms.get(slug);

    if (!room) {
      return;
    }

    room.delete(connection);

    if (room.size === 0) {
      this.rooms.delete(slug);
    }
  }

  /** Number of currently connected clients in a room (presence). */
  presence(slug: string): number {
    return this.rooms.get(slug)?.size ?? 0;
  }

  /** Sends `message` to every open connection of the room. Closed sockets are skipped. */
  broadcast(slug: string, message: SessionBroadcast): void {
    const room = this.rooms.get(slug);

    if (!room) {
      return;
    }

    const data = JSON.stringify(message);

    for (const connection of room) {
      if (connection.readyState !== undefined && connection.readyState !== WS_OPEN) {
        continue;
      }

      try {
        connection.send(data);
      } catch {
        // A failed send must never break the authoritative request path; the
        // client will resync from Postgres via GET /sessions/:slug.
      }
    }
  }
}

/** Shared single-instance hub used by the routes and the live WebSocket feed. */
export const sessionHub = new SessionHub();
