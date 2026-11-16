import { describe, expect, it } from 'vitest'
import type { Pool } from 'pg'
import { createLeaderboard, withBadges } from './handler'

// The pitch demo mission as the table stores it.
const row = { id: '7', name: 'Crew', score: 86, success: true, scenario_id: 'ice', orbit_id: 'sso', instrument_id: 'radar', power_id: 'hybrid', downlink_id: 'daily', launch_id: 'medium', go_votes: 4, players: 4, created_at: '2026-11-15T00:00:00Z' }

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
  it('GET returns every entry with its badges', async () => {
    const pool = { query: async (sql: string) => (sql.includes('count(') ? { rows: [{ n: 1 }] } : { rows: [row] }) } as unknown as Pool
    const res = await createLeaderboard(pool)(new Request('https://statusgo.earth/api/leaderboard'))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { entries: { badges: string[]; instrument_id?: string }[]; total: number }
    expect(body.total).toBe(1)
    expect(body.entries[0].badges).toContain('reserve-keeper')
    expect(body.entries[0].instrument_id).toBeUndefined()
  })
})
