ALTER TABLE knowledge_documents
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE knowledge_chunks
  ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS knowledge_documents_metadata_idx ON knowledge_documents USING gin (metadata);
CREATE INDEX IF NOT EXISTS knowledge_chunks_metadata_idx ON knowledge_chunks USING gin (metadata);
