// Online leaderboard API, deployed as a Neon Function next to its Postgres database (see server/README.md).
// GET  /            → top scores (optional ?scenario=<id>) and the total count
// POST /            → { name, choice, goVotes, players } → the server recomputes the score with the game engine, saves it, returns the rank
// The score is never taken from the client: it comes from evaluateMission(), so a forged request cannot post a fake 100.
import { Pool } from 'pg'
import * as C from '../src/engine/catalog'
import { evaluateMission, isComplete, MAX_PLAYERS, type Choice } from '../src/engine/game'
import { checkName } from '../src/leaderboard/name'

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
// An idle client dropped by scale-to-zero must not crash the function; the pool reconnects on the next query.
pool.on('error', () => {})

const ORIGINS = new Set(['https://onepixelhome.github.io', 'http://localhost:5173', 'http://localhost:4173'])
const TOP = 20
const POSTS_PER_MINUTE = 6
const recent = new Map<string, number[]>()

function cors(origin: string | null): Record<string, string> {
  const allow = origin && ORIGINS.has(origin) ? origin : 'https://onepixelhome.github.io'
  return { 'Access-Control-Allow-Origin': allow, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'content-type', Vary: 'Origin' }
}

const json = (body: unknown, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...cors(origin) } })

function tooMany(ip: string) {
  const now = Date.now()
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 60_000)
  hits.push(now)
  recent.set(ip, hits)
  return hits.length > POSTS_PER_MINUTE
}

const known = <T extends { id: string }>(list: T[], id: unknown) => typeof id === 'string' && list.some((x) => x.id === id)

/** Only a complete design made of catalog ids is accepted. */
function readChoice(raw: unknown): Choice | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const c: Choice = {
    scenarioId: r.scenarioId as string,
    orbitId: r.orbitId as string,
    instrumentId: r.instrumentId as string,
    powerId: r.powerId as string,
    downlinkId: r.downlinkId as string,
    launchId: r.launchId as string,
  }
  const valid =
    known(C.SCENARIOS, c.scenarioId) && known(C.ORBITS, c.orbitId) && known(C.INSTRUMENTS, c.instrumentId) &&
    known(C.POWER, c.powerId) && known(C.DOWNLINKS, c.downlinkId) && known(C.LAUNCHERS, c.launchId)
  return valid && isComplete(c) ? c : null
}

async function top(scenario: string | null) {
  const where = scenario ? 'WHERE scenario_id = $1' : ''
  const params = scenario ? [scenario] : []
  const rows = await pool.query(
    `SELECT id, name, score, success, scenario_id, orbit_id, players, created_at FROM scores ${where} ORDER BY score DESC, created_at ASC LIMIT ${TOP}`,
    params,
  )
  const count = await pool.query(`SELECT count(*)::int AS n FROM scores ${where}`, params)
  return { entries: rows.rows, total: count.rows[0].n as number }
}

export default {
  async fetch(request: Request) {
    const origin = request.headers.get('origin')
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) })
    try {
      if (request.method === 'GET') {
        const s = new URL(request.url).searchParams.get('scenario')
        const scenario = s && known(C.SCENARIOS, s) ? s : null
        return json(await top(scenario), 200, origin)
      }
      if (request.method === 'POST') {
        const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
        if (tooMany(ip)) return json({ error: 'Too many saves. Wait a minute and try again.' }, 429, origin)
        const body = (await request.json().catch(() => null)) as { name?: unknown; choice?: unknown; goVotes?: unknown; players?: unknown } | null
        const name = checkName(body?.name)
        if (!name.ok) return json({ error: name.error }, 400, origin)
        const choice = readChoice(body?.choice)
        const goVotes = body?.goVotes
        // Older clients do not send the team size; they always polled four roles.
        const players = body?.players ?? MAX_PLAYERS
        const whole = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n)
        if (!choice || !whole(players) || players < 1 || players > MAX_PLAYERS || !whole(goVotes) || goVotes < 0 || goVotes > players)
          return json({ error: 'That mission design is not complete.' }, 400, origin)
        const card = evaluateMission(choice, goVotes, players)
        const saved = await pool.query(
          `INSERT INTO scores (name, score, success, scenario_id, orbit_id, instrument_id, power_id, downlink_id, launch_id, go_votes, players)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
          [name.name, card.score, card.success, choice.scenarioId, choice.orbitId, choice.instrumentId, choice.powerId, choice.downlinkId, choice.launchId, goVotes, players],
        )
        const rank = await pool.query('SELECT count(*)::int + 1 AS r FROM scores WHERE score > $1', [card.score])
        const total = await pool.query('SELECT count(*)::int AS n FROM scores')
        return json({ id: saved.rows[0].id, score: card.score, rank: rank.rows[0].r, total: total.rows[0].n }, 201, origin)
      }
      return json({ error: 'Method not allowed' }, 405, origin)
    } catch {
      return json({ error: 'The leaderboard is unavailable right now.' }, 503, origin)
    }
  },
}
