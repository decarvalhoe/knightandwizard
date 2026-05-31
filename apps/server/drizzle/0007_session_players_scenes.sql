CREATE TABLE IF NOT EXISTS session_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES game_sessions (id) ON DELETE CASCADE,
  player_id text NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  character_id text REFERENCES characters (id) ON DELETE SET NULL,
  capability text NOT NULL,
  connected boolean NOT NULL DEFAULT true,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS session_players_session_player_idx ON session_players (session_id, player_id);
CREATE INDEX IF NOT EXISTS session_players_character_id_idx ON session_players (character_id);
CREATE INDEX IF NOT EXISTS session_players_role_idx ON session_players (role);

CREATE TABLE IF NOT EXISTS session_scenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES game_sessions (id) ON DELETE CASCADE,
  scene_id text NOT NULL,
  title text NOT NULL,
  location text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  description text,
  npc_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  opened_at_sequence integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS session_scenes_session_scene_idx ON session_scenes (session_id, scene_id);
CREATE INDEX IF NOT EXISTS session_scenes_status_idx ON session_scenes (status);
