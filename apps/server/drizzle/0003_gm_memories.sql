CREATE TABLE IF NOT EXISTS gm_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_key text NOT NULL,
  memory_kind text NOT NULL,
  subject text NOT NULL,
  summary text NOT NULL,
  importance integer NOT NULL DEFAULT 1,
  source text NOT NULL DEFAULT 'game-master',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gm_memories_session_key_idx ON gm_memories (session_key);
CREATE INDEX IF NOT EXISTS gm_memories_kind_idx ON gm_memories (memory_kind);
CREATE INDEX IF NOT EXISTS gm_memories_importance_idx ON gm_memories (importance);
CREATE INDEX IF NOT EXISTS gm_memories_occurred_at_idx ON gm_memories (occurred_at);
