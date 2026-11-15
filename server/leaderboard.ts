// Online leaderboard API as a Neon Function next to its Postgres database (see server/README.md).
// The logic lives in server/handler.ts, shared with the Azure Static Web Apps API.
import { Pool } from 'pg'
import { createLeaderboard } from './handler'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
// An idle client dropped by scale-to-zero must not crash the function; the pool reconnects on the next query.
pool.on('error', () => {})

export default { fetch: createLeaderboard(pool) }
