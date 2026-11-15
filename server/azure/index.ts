// Leaderboard API as an Azure Static Web Apps managed function: GET/POST /api/leaderboard on the game's own address.
// The logic lives in server/handler.ts (shared with the Neon Function). DATABASE_URL is an app setting of the
// Static Web App (Azure portal or `az staticwebapp appsettings set`), never in the repo.
import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions'
import { Pool } from 'pg'
import { createLeaderboard } from '../handler'
import { SCHEMA } from '../schema'

// Azure Database for PostgreSQL requires TLS; sslmode=require in DATABASE_URL turns it on.
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
pool.on('error', () => {})
const handle = createLeaderboard(pool)

// Create the table on first use (idempotent). If it fails, the next request tries again.
let ready: Promise<unknown> | null = null
const ensureSchema = () => (ready ??= pool.query(SCHEMA).catch((e) => { ready = null; throw e }))

async function leaderboard(req: HttpRequest): Promise<HttpResponseInit> {
  try {
    await ensureSchema()
  } catch {
    return { status: 503, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ error: 'The leaderboard is unavailable right now.' }) }
  }
  const hasBody = !['GET', 'HEAD', 'OPTIONS'].includes(req.method)
  const res = await handle(
    new Request(req.url, { method: req.method, headers: Object.fromEntries(req.headers.entries()), body: hasBody ? await req.text() : undefined }),
  )
  return { status: res.status, headers: Object.fromEntries(res.headers.entries()), body: await res.text() }
}

app.http('leaderboard', { methods: ['GET', 'POST', 'OPTIONS'], authLevel: 'anonymous', route: 'leaderboard', handler: leaderboard })
