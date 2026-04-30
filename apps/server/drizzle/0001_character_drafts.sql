CREATE TABLE IF NOT EXISTS character_drafts (
  id text PRIMARY KEY,
  user_id text NOT NULL DEFAULT 'local-dev',
  current_step text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS character_drafts_user_id_idx ON character_drafts (user_id);
CREATE INDEX IF NOT EXISTS character_drafts_updated_at_idx ON character_drafts (updated_at);
