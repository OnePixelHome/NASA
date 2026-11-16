import { describe, expect, it } from 'vitest'
import type { Pool } from 'pg'
import { createLeaderboard, honors, withBadges } from './handler'

// The pitch demo mission as the table stores it.
const row = { id: '7', name: 'Crew', score: 86, success: true, scenario_id: 'ice', orbit_id: 'sso', instrument_id: 'radar', power_id: 'hybrid', downlink_id: 'daily', launch_id: 'medium', go_votes: 4, players: 4, created_at: '2026-11-15T00:00:00Z' }
// An earlier, weaker save of the same mission: it succeeded first, but no longer leads.
const earlier = { ...row, id: '3', name: 'First', score: 71, created_at: '2026-11-14T00:00:00Z' }

/** A database stand-in: answers each kind of query the handler sends, and can fail the honors query. */
function fakePool(rows: (typeof row)[], opts: { honorsFail?: boolean } = {}) {
  const sent: string[] = []
  const pool = {
    query: async (sql: string) => {
      sent.push(sql)
      if (sql.includes('DISTINCT ON')) {
        if (opts.honorsFail) throw new Error('honors query failed')
        return { rows: rows.filter((r) => r.success) }
      }
      if (sql.startsWith('INSERT')) return { rows: [{ id: row.id }] }
      if (sql.includes('+ 1 AS r')) return { rows: [{ r: 1 }] }
      if (sql.includes('count(')) return { rows: [{ n: rows.length }] }
      return { rows }
    },
  } as unknown as Pool
  return { pool, sent }
}

const get = async (pool: Pool) => {
  const res = await createLeaderboard(pool)(new Request('https://statusgo.earth/api/leaderboard'))
  return { status: res.status, body: (await res.json()) as { entries: { id: string; badges: string[]; honors: string[]; instrument_id?: string }[]; total: number } }
}

describe('leaderboard list', () => {
  it('adds the badges worked out from the saved design and keeps the rest of the design private', () => {
    const entry = withBadges(row)
    expect(entry.badges).toEqual(['right-tool', 'full-downlink', 'reserve-keeper', 'unanimous-go', 'full-crew'])
    expect(Object.keys(entry).sort()).toEqual(['badges', 'created_at', 'id', 'name', 'orbit_id', 'players', 'scenario_id', 'score', 'success'])
  })
  it('a row the current catalog cannot fly shows no badges instead of failing', () => {
    expect(withBadges({ ...row, instrument_id: 'retired-part' }).badges).toEqual([])
    expect(withBadges({ ...row, orbit_id: 'geo' }).badges).toEqual([]) // radar is locked in GEO
    expect(withBadges({ id: '1' }).badges).toEqual([])
  })
  it('GET returns every entry with its badges and the honors it holds', async () => {
    const { status, body } = await get(fakePool([row, earlier]).pool)
    expect(status).toBe(200)
    expect(body.total).toBe(2)
    expect(body.entries[0].badges).toContain('reserve-keeper')
    expect(body.entries[0].instrument_id).toBeUndefined()
    // The best score leads the mission; the earlier save keeps "first to succeed".
    expect(body.entries.map((e) => [e.id, e.honors])).toEqual([['7', ['mission-leader']], ['3', ['first-success']]])
  })
  it('honors are an extra: when their query fails the list still answers, without honors', async () => {
    const { pool } = fakePool([row], { honorsFail: true })
    expect((await honors(pool)).size).toBe(0)
    const { status, body } = await get(pool)
    expect(status).toBe(200)
    expect(body.entries[0].honors).toEqual([])
    expect(body.entries[0].badges.length).toBeGreaterThan(0)
  })
  it('the honors query only asks for successful rows, per mission', async () => {
    const { pool, sent } = fakePool([row])
    await honors(pool)
    const sql = sent[0].replace(/\s+/g, ' ')
    expect(sql.match(/SELECT DISTINCT ON \(scenario_id\)/g)).toHaveLength(3)
    expect(sql.match(/WHERE success/g)).toHaveLength(3)
    expect(sql).toContain('ORDER BY scenario_id, score DESC, created_at ASC, id ASC')
    expect(sql).toContain('AND score = 100 ORDER BY scenario_id, created_at ASC, id ASC')
  })
})

describe('saving a score', () => {
  const post = async (pool: Pool) => {
    const body = { name: 'Crew', choice: { scenarioId: 'ice', orbitId: 'sso', instrumentId: 'radar', powerId: 'hybrid', downlinkId: 'daily', launchId: 'medium' }, goVotes: 4, players: 4 }
    const res = await createLeaderboard(pool)(new Request('https://statusgo.earth/api/leaderboard', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }))
    return { status: res.status, body: (await res.json()) as { id: string; score: number; rank: number; total: number; honors: string[] } }
  }
  it('answers with the honors the new row holds', async () => {
    // The first success of a mission is also its leader.
    const first = await post(fakePool([row]).pool)
    expect(first.status).toBe(201)
    expect(first.body).toMatchObject({ id: '7', score: 86, rank: 1, total: 1, honors: ['mission-leader', 'first-success'] })
    // Someone had already succeeded: the new, better score takes the lead only.
    expect((await post(fakePool([row, earlier]).pool)).body.honors).toEqual(['mission-leader'])
  })
  it('still saves when the honors query fails', async () => {
    const saved = await post(fakePool([row], { honorsFail: true }).pool)
    expect(saved.status).toBe(201)
    expect(saved.body.honors).toEqual([])
  })
})
