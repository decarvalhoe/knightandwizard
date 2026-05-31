CREATE TABLE IF NOT EXISTS character_active_spells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES game_sessions (id) ON DELETE CASCADE,
  character_id text NOT NULL REFERENCES characters (id) ON DELETE CASCADE,
  active_spell_id text NOT NULL,
  spell_id text,
  source_caster_id text,
  cast_at_sequence integer NOT NULL,
  cast_at_narrative_seconds double precision NOT NULL DEFAULT 0,
  duration_amount double precision NOT NULL DEFAULT 0,
  duration_unit text NOT NULL CHECK (duration_unit IN ('DT', 'minute', 'hour', 'day', 'permanent')),
  successes_count integer,
  expires_at_narrative_seconds double precision,
  expires_at_combat_dt integer,
  last_renewed_at timestamptz,
  dispelled_at_sequence integer,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dispelled', 'expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS character_active_spells_session_character_spell_idx
  ON character_active_spells (session_id, character_id, active_spell_id);
CREATE INDEX IF NOT EXISTS character_active_spells_character_status_idx
  ON character_active_spells (character_id, status);
CREATE INDEX IF NOT EXISTS character_active_spells_session_idx
  ON character_active_spells (session_id);
