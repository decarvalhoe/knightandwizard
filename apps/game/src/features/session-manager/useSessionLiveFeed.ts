'use client';

import { useEffect, useRef, useState } from 'react';

import { getClientWsBaseUrl } from '../../lib/api';

import type { PersistedSessionEvent } from './session-api';

export type SessionLiveStatus = 'connecting' | 'offline' | 'online';

interface SessionLiveMessage {
  count?: number;
  event?: PersistedSessionEvent;
  kind?: string;
  slug?: string;
}

export interface SessionLiveHandlers {
  onEvent?: (event: PersistedSessionEvent) => void;
  onPresence?: (count: number) => void;
}

export interface SessionLiveFeed {
  connections: number;
  status: SessionLiveStatus;
}

const RECONNECT_DELAY_MS = 2000;

/**
 * Subscribes to the live session room (E-N) over a WebSocket and forwards
 * committed journal events + presence to the caller. Connection failures are
 * non-fatal: the surface keeps working over REST and the feed reconnects.
 */
export function useSessionLiveFeed(slug: string, handlers: SessionLiveHandlers): SessionLiveFeed {
  const [status, setStatus] = useState<SessionLiveStatus>('connecting');
  const [connections, setConnections] = useState(0);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (typeof window === 'undefined' || typeof WebSocket === 'undefined' || slug.length === 0) {
      return undefined;
    }

    const url = `${getClientWsBaseUrl()}/sessions/${encodeURIComponent(slug)}/live`;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;

    function connect(): void {
      setStatus('connecting');

      try {
        socket = new WebSocket(url);
      } catch {
        if (!disposed) {
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        }

        return;
      }

      socket.onopen = () => setStatus('online');

      socket.onmessage = (raw: MessageEvent) => {
        if (typeof raw.data !== 'string') {
          return;
        }

        let message: SessionLiveMessage;

        try {
          message = JSON.parse(raw.data) as SessionLiveMessage;
        } catch {
          return;
        }

        if (message.kind === 'session.event' && message.event) {
          handlersRef.current.onEvent?.(message.event);
        } else if (message.kind === 'session.presence' && typeof message.count === 'number') {
          setConnections(message.count);
          handlersRef.current.onPresence?.(message.count);
        }
      };

      socket.onerror = () => socket?.close();

      socket.onclose = () => {
        setStatus('offline');

        if (!disposed) {
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };
    }

    connect();

    return () => {
      disposed = true;

      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }

      socket?.close();
    };
  }, [slug]);

  return { connections, status };
}
