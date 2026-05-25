CREATE TABLE IF NOT EXISTS characters (
  id text PRIMARY KEY,
  user_id text NOT NULL DEFAULT 'local-dev',
  draft_id text REFERENCES character_drafts (id) ON DELETE SET NULL,
  kind text NOT NULL,
  name text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS characters_draft_id_idx ON characters (draft_id);
CREATE INDEX IF NOT EXISTS characters_user_id_idx ON characters (user_id);
CREATE INDEX IF NOT EXISTS characters_kind_idx ON characters (kind);
CREATE INDEX IF NOT EXISTS characters_updated_at_idx ON characters (updated_at);
