ALTER TABLE gm_memories
  ADD COLUMN IF NOT EXISTS provenance_type text NOT NULL DEFAULT 'session_fact';

CREATE INDEX IF NOT EXISTS gm_memories_provenance_type_idx ON gm_memories (provenance_type);
