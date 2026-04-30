import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export const DEFAULT_DATABASE_URL =
  'postgresql://knightandwizard:knightandwizard@localhost:55432/knightandwizard';

export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
}

export function createSqlClient(databaseUrl = getDatabaseUrl()) {
  return postgres(databaseUrl, { max: 1, onnotice: () => undefined });
}

export function createDbClient(sqlClient = createSqlClient()) {
  return drizzle(sqlClient, { schema });
}

export type SqlClient = ReturnType<typeof createSqlClient>;
