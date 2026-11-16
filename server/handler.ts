// Leaderboard API logic, shared by the Neon Function (server/leaderboard.ts) and the Azure Static Web Apps API
// (server/azure/index.ts). See server/README.md.
// GET  → top scores (optional ?scenario=<id>) with the badges each one earned and the honors it holds, and the total count
// POST → { name, choice, goVotes, players } → the server recomputes the score with the game engine, saves it, returns the rank
//        and the honors the new row holds (mission leader, first success, first perfect)
// The score is never taken from the client: it comes from evaluateMission(), so a forged request cannot post a fake 100.
import type { Pool } from 'pg'
import { honorHolders, missionBadges, type HonorId } from '../src/engine/achievements'
import * as C from '../src/engine/catalog'
import { evaluateMission, isComplete, MAX_PLAYERS, type Choice } from '../src/engine/game'
import { checkName } from '../src/leaderboard/name'

const SITE = 'https://victorious-pebble-0fcf34b10.6.azurestaticapps.net' // the game, on Azure Static Web Apps
const ORIGINS = new Set([SITE, 'https://statusgo.earth', 'https://www.statusgo.earth', 'http://localhost:5173', 'http://localhost:4173'])
const TOP = 20
const POSTS_PER_MINUTE = 6
const recent = new Map<string, number[]>()

function cors(origin: string | null): Record<string, string> {
  const allow = origin && ORIGINS.has(origin) ? origin : SITE
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

/**
 * Badges are never stored: like the score, they are worked out from the saved design, so they cannot be forged and
 * they follow the rules of the engine that is deployed. The rest of the design stays out of the public list.
 */
export function withBadges(row: Record<string, unknown>) {
  const { instrument_id, power_id, downlink_id, launch_id, go_votes, ...entry } = row
  let badges: string[] = []
  try {
    const choice = { scenarioId: row.scenario_id, orbitId: row.orbit_id, instrumentId: instrument_id, powerId: power_id, downlinkId: downlink_id, launchId: launch_id } as Choice
    badges = missionBadges(choice, Number(go_votes), Number(row.players))
  } catch {
    // A row saved with an older catalog simply shows no badges.
  }
  return { ...entry, badges }
}

// The only rows that can hold an honor: per mission, the best successful score, the first success and the first 100.
// At most three rows per mission whatever the table size; honorHolders() then applies the rule itself.
const CANDIDATE = 'SELECT DISTINCT ON (scenario_id) id, scenario_id, score, success, created_at FROM scores WHERE success'
const HONOR_CANDIDATES = `
  (${CANDIDATE} ORDER BY scenario_id, score DESC, created_at ASC, id ASC)
  UNION (${CANDIDATE} ORDER BY scenario_id, created_at ASC, id ASC)
  UNION (${CANDIDATE} AND score = 100 ORDER BY scenario_id, created_at ASC, id ASC)`

/** Honors by row id. They are an extra: if this query fails, the leaderboard still answers, without honors. */
export async function honors(pool: Pool): Promise<Map<string, HonorId[]>> {
  try {
    const found = await pool.query(HONOR_CANDIDATES)
    return honorHolders(found.rows.map((r) => ({ id: r.id, scenarioId: r.scenario_id, score: r.score, success: r.success, savedAt: r.created_at })))
  } catch {
    return new Map()
  }
}

async function top(pool: Pool, scenario: string | null) {
  const where = scenario ? 'WHERE scenario_id = $1' : ''
  const params = scenario ? [scenario] : []
  const rows = await pool.query(
    `SELECT id, name, score, success, scenario_id, orbit_id, instrument_id, power_id, downlink_id, launch_id, go_votes, players, created_at FROM scores ${where} ORDER BY score DESC, created_at ASC LIMIT ${TOP}`,
    params,
  )
  const count = await pool.query(`SELECT count(*)::int AS n FROM scores ${where}`, params)
  const held = await honors(pool)
  return { entries: rows.rows.map((row) => ({ ...withBadges(row), honors: held.get(String(row.id)) ?? [] })), total: count.rows[0].n as number }
}

/** The whole API as a web-standard handler, so Neon Functions and Azure Functions run the same code. */
export function createLeaderboard(pool: Pool) {
  return async function handle(request: Request): Promise<Response> {
    const origin = request.headers.get('origin')
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) })
    try {
      if (request.method === 'GET') {
        const s = new URL(request.url).searchParams.get('scenario')
        const scenario = s && known(C.SCENARIOS, s) ? s : null
        return json(await top(pool, scenario), 200, origin)
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
        const held = (await honors(pool)).get(String(saved.rows[0].id)) ?? []
        return json({ id: saved.rows[0].id, score: card.score, rank: rank.rows[0].r, total: total.rows[0].n, honors: held }, 201, origin)
      }
      return json({ error: 'Method not allowed' }, 405, origin)
    } catch {
      return json({ error: 'The leaderboard is unavailable right now.' }, 503, origin)
    }
  }
}
