ALTER TABLE gm_memories
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE INDEX IF NOT EXISTS gm_memories_embedding_hnsw_idx
  ON gm_memories USING hnsw (embedding vector_cosine_ops);
