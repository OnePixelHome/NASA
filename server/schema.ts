// Leaderboard table, created by the Azure API on its first request (server/azure/index.ts), so no one has to connect
// to the database by hand. Same columns server/handler.ts reads and writes; idempotent.
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS scores (
  id            bigserial PRIMARY KEY,
  name          text        NOT NULL CHECK (char_length(name) BETWEEN 2 AND 24),
  score         integer     NOT NULL CHECK (score BETWEEN 0 AND 100),
  success       boolean     NOT NULL,
  scenario_id   text        NOT NULL,
  orbit_id      text        NOT NULL,
  instrument_id text        NOT NULL,
  power_id      text        NOT NULL,
  downlink_id   text        NOT NULL,
  launch_id     text        NOT NULL,
  go_votes      integer     NOT NULL CHECK (go_votes BETWEEN 0 AND 4),
  players       integer     NOT NULL DEFAULT 4 CHECK (players BETWEEN 1 AND 4),
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS scores_rank ON scores (score DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS scores_scenario_rank ON scores (scenario_id, score DESC, created_at ASC);
`
