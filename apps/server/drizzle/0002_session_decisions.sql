CREATE TABLE IF NOT EXISTS session_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES game_sessions (id) ON DELETE CASCADE,
  title text NOT NULL,
  requested_by text NOT NULL,
  assigned_to text NOT NULL DEFAULT 'human_gm',
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'pending',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolution jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS session_decisions_session_status_idx ON session_decisions (session_id, status);
CREATE INDEX IF NOT EXISTS session_decisions_priority_idx ON session_decisions (priority);
