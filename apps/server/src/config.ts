import 'dotenv/config';

export const DEFAULT_SERVER_HOST = '127.0.0.1';
export const DEFAULT_SERVER_PORT = 3002;

export function getServerHost(): string {
  return process.env.SERVER_HOST ?? DEFAULT_SERVER_HOST;
}

export function getServerPort(): number {
  const rawPort = process.env.SERVER_PORT;

  if (rawPort === undefined) {
    return DEFAULT_SERVER_PORT;
  }

  const port = Number.parseInt(rawPort, 10);

  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Error(`Invalid SERVER_PORT: ${rawPort}`);
  }

  return port;
}
