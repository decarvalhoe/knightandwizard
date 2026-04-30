CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS catalog_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_name text NOT NULL,
  source_path text NOT NULL,
  content_hash varchar(64) NOT NULL,
  document jsonb NOT NULL,
  imported_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS catalog_documents_source_path_idx ON catalog_documents (source_path);
CREATE INDEX IF NOT EXISTS catalog_documents_catalog_name_idx ON catalog_documents (catalog_name);

CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  title text NOT NULL,
  mode text NOT NULL DEFAULT 'classic_table',
  status text NOT NULL DEFAULT 'planned',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS game_sessions_slug_idx ON game_sessions (slug);
CREATE INDEX IF NOT EXISTS game_sessions_status_idx ON game_sessions (status);

CREATE TABLE IF NOT EXISTS session_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES game_sessions (id) ON DELETE CASCADE,
  sequence integer NOT NULL,
  event_type text NOT NULL,
  actor_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS session_events_session_sequence_idx ON session_events (session_id, sequence);
CREATE INDEX IF NOT EXISTS session_events_event_type_idx ON session_events (event_type);

CREATE TABLE IF NOT EXISTS audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_events_entity_idx ON audit_events (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS audit_events_action_idx ON audit_events (action);
CREATE INDEX IF NOT EXISTS audit_events_created_at_idx ON audit_events (created_at);

CREATE TABLE IF NOT EXISTS knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path text NOT NULL,
  source_kind text NOT NULL,
  title text NOT NULL,
  content_hash varchar(64) NOT NULL,
  imported_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS knowledge_documents_source_path_idx ON knowledge_documents (source_path);
CREATE INDEX IF NOT EXISTS knowledge_documents_source_kind_idx ON knowledge_documents (source_kind);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES knowledge_documents (id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  source_path text NOT NULL,
  source_kind text NOT NULL,
  heading text NOT NULL,
  content_hash varchar(64) NOT NULL,
  text text NOT NULL,
  embedding vector(1536),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS knowledge_chunks_document_chunk_idx ON knowledge_chunks (document_id, chunk_index);
CREATE INDEX IF NOT EXISTS knowledge_chunks_source_path_idx ON knowledge_chunks (source_path);
CREATE INDEX IF NOT EXISTS knowledge_chunks_source_kind_idx ON knowledge_chunks (source_kind);
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_hnsw_idx ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);
