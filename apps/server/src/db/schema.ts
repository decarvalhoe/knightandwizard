import { sql } from 'drizzle-orm';
import {
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from 'drizzle-orm/pg-core';

const vector = customType<{ data: number[] | null; driverData: string | null }>({
  dataType() {
    return 'vector(1536)';
  },
  toDriver(value) {
    if (value === null) {
      return null;
    }

    return `[${value.join(',')}]`;
  }
});

const now = () => timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
const updatedNow = () => timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();

export const REQUIRED_APP_TABLES = [
  'catalog_documents',
  'character_drafts',
  'game_sessions',
  'session_events',
  'session_decisions',
  'gm_memories',
  'audit_events',
  'knowledge_documents',
  'knowledge_chunks'
] as const;

export const catalogDocuments = pgTable(
  'catalog_documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    catalogName: text('catalog_name').notNull(),
    sourcePath: text('source_path').notNull(),
    contentHash: varchar('content_hash', { length: 64 }).notNull(),
    document: jsonb('document').$type<Record<string, unknown>>().notNull(),
    importedAt: timestamp('imported_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: now(),
    updatedAt: updatedNow()
  },
  (table) => ({
    sourcePathIdx: uniqueIndex('catalog_documents_source_path_idx').on(table.sourcePath),
    catalogNameIdx: index('catalog_documents_catalog_name_idx').on(table.catalogName)
  })
);

export const characterDrafts = pgTable(
  'character_drafts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().default('local-dev'),
    currentStep: text('current_step').notNull(),
    payload: jsonb('payload')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: now(),
    updatedAt: updatedNow()
  },
  (table) => ({
    updatedAtIdx: index('character_drafts_updated_at_idx').on(table.updatedAt),
    userIdIdx: index('character_drafts_user_id_idx').on(table.userId)
  })
);

export const gameSessions = pgTable(
  'game_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    mode: text('mode').notNull().default('classic_table'),
    status: text('status').notNull().default('planned'),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: now(),
    updatedAt: updatedNow()
  },
  (table) => ({
    slugIdx: uniqueIndex('game_sessions_slug_idx').on(table.slug),
    statusIdx: index('game_sessions_status_idx').on(table.status)
  })
);

export const sessionEvents = pgTable(
  'session_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => gameSessions.id, { onDelete: 'cascade' }),
    sequence: integer('sequence').notNull(),
    eventType: text('event_type').notNull(),
    actorId: text('actor_id'),
    payload: jsonb('payload')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: now()
  },
  (table) => ({
    sessionSequenceIdx: uniqueIndex('session_events_session_sequence_idx').on(
      table.sessionId,
      table.sequence
    ),
    eventTypeIdx: index('session_events_event_type_idx').on(table.eventType)
  })
);

export const sessionDecisions = pgTable(
  'session_decisions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => gameSessions.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    requestedBy: text('requested_by').notNull(),
    assignedTo: text('assigned_to').notNull().default('human_gm'),
    priority: text('priority').notNull().default('normal'),
    status: text('status').notNull().default('pending'),
    payload: jsonb('payload')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    resolution: jsonb('resolution').$type<Record<string, unknown> | null>(),
    createdAt: now(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    updatedAt: updatedNow()
  },
  (table) => ({
    sessionStatusIdx: index('session_decisions_session_status_idx').on(
      table.sessionId,
      table.status
    ),
    priorityIdx: index('session_decisions_priority_idx').on(table.priority)
  })
);

export const gmMemories = pgTable(
  'gm_memories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sessionKey: text('session_key').notNull(),
    memoryKind: text('memory_kind').notNull(),
    subject: text('subject').notNull(),
    summary: text('summary').notNull(),
    importance: integer('importance').notNull().default(1),
    source: text('source').notNull().default('game-master'),
    payload: jsonb('payload')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: now(),
    updatedAt: updatedNow()
  },
  (table) => ({
    sessionKeyIdx: index('gm_memories_session_key_idx').on(table.sessionKey),
    kindIdx: index('gm_memories_kind_idx').on(table.memoryKind),
    importanceIdx: index('gm_memories_importance_idx').on(table.importance),
    occurredAtIdx: index('gm_memories_occurred_at_idx').on(table.occurredAt)
  })
);

export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: text('actor_id'),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    payload: jsonb('payload')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    createdAt: now()
  },
  (table) => ({
    entityIdx: index('audit_events_entity_idx').on(table.entityType, table.entityId),
    actionIdx: index('audit_events_action_idx').on(table.action),
    createdAtIdx: index('audit_events_created_at_idx').on(table.createdAt)
  })
);

export const knowledgeDocuments = pgTable(
  'knowledge_documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourcePath: text('source_path').notNull(),
    sourceKind: text('source_kind').notNull(),
    title: text('title').notNull(),
    contentHash: varchar('content_hash', { length: 64 }).notNull(),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    importedAt: timestamp('imported_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: now(),
    updatedAt: updatedNow()
  },
  (table) => ({
    sourcePathIdx: uniqueIndex('knowledge_documents_source_path_idx').on(table.sourcePath),
    sourceKindIdx: index('knowledge_documents_source_kind_idx').on(table.sourceKind),
    metadataIdx: index('knowledge_documents_metadata_idx').using('gin', table.metadata)
  })
);

export const knowledgeChunks = pgTable(
  'knowledge_chunks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('document_id')
      .notNull()
      .references(() => knowledgeDocuments.id, { onDelete: 'cascade' }),
    chunkIndex: integer('chunk_index').notNull(),
    sourcePath: text('source_path').notNull(),
    sourceKind: text('source_kind').notNull(),
    heading: text('heading').notNull(),
    contentHash: varchar('content_hash', { length: 64 }).notNull(),
    text: text('text').notNull(),
    metadata: jsonb('metadata')
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    embedding: vector('embedding'),
    createdAt: now(),
    updatedAt: updatedNow()
  },
  (table) => ({
    documentChunkIdx: uniqueIndex('knowledge_chunks_document_chunk_idx').on(
      table.documentId,
      table.chunkIndex
    ),
    sourcePathIdx: index('knowledge_chunks_source_path_idx').on(table.sourcePath),
    sourceKindIdx: index('knowledge_chunks_source_kind_idx').on(table.sourceKind),
    metadataIdx: index('knowledge_chunks_metadata_idx').using('gin', table.metadata)
  })
);
