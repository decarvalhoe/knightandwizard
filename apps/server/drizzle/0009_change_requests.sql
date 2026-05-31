CREATE TABLE IF NOT EXISTS change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('game_state', 'canon')),
  session_id uuid REFERENCES game_sessions (id) ON DELETE CASCADE,
  target_type text NOT NULL,
  target_id text,
  change_kind text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  requested_by text NOT NULL,
  assigned_to text NOT NULL DEFAULT 'human_gm',
  authority text NOT NULL DEFAULT 'human_gm',
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'applied', 'superseded')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolution jsonb,
  resolved_by text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS change_requests_session_status_idx ON change_requests (session_id, status);
CREATE INDEX IF NOT EXISTS change_requests_target_idx ON change_requests (target_type, target_id);
CREATE INDEX IF NOT EXISTS change_requests_status_idx ON change_requests (status);
