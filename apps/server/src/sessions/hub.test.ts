import { describe, expect, it, vi } from 'vitest';

import { SessionHub } from './hub.js';

function fakeConnection(readyState = 1) {
  return { readyState, send: vi.fn() };
}

describe('SessionHub', () => {
  it('broadcasts a committed event to every subscriber of the room', () => {
    const hub = new SessionHub();
    const a = fakeConnection();
    const b = fakeConnection();

    hub.subscribe('brumeval', a);
    hub.subscribe('brumeval', b);
    hub.broadcast('brumeval', { kind: 'session.event', slug: 'brumeval', event: { sequence: 1 } });

    const payload = JSON.stringify({
      kind: 'session.event',
      slug: 'brumeval',
      event: { sequence: 1 }
    });
    expect(a.send).toHaveBeenCalledWith(payload);
    expect(b.send).toHaveBeenCalledWith(payload);
  });

  it('isolates rooms by slug', () => {
    const hub = new SessionHub();
    const brumeval = fakeConnection();
    const other = fakeConnection();

    hub.subscribe('brumeval', brumeval);
    hub.subscribe('autre-table', other);
    hub.broadcast('brumeval', { kind: 'session.presence', slug: 'brumeval', count: 1 });

    expect(brumeval.send).toHaveBeenCalledTimes(1);
    expect(other.send).not.toHaveBeenCalled();
  });

  it('stops delivering once a connection unsubscribes and tracks presence', () => {
    const hub = new SessionHub();
    const a = fakeConnection();
    const b = fakeConnection();

    hub.subscribe('brumeval', a);
    hub.subscribe('brumeval', b);
    expect(hub.presence('brumeval')).toBe(2);

    hub.unsubscribe('brumeval', a);
    expect(hub.presence('brumeval')).toBe(1);

    hub.broadcast('brumeval', { kind: 'session.event', slug: 'brumeval', event: { sequence: 2 } });
    expect(a.send).not.toHaveBeenCalled();
    expect(b.send).toHaveBeenCalledTimes(1);
  });

  it('skips connections that are not open', () => {
    const hub = new SessionHub();
    const closing = fakeConnection(2);

    hub.subscribe('brumeval', closing);
    hub.broadcast('brumeval', { kind: 'session.event', slug: 'brumeval', event: { sequence: 3 } });

    expect(closing.send).not.toHaveBeenCalled();
  });
});
