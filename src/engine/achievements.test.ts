import { describe, expect, it } from 'vitest'
import * as C from './catalog'
import { ALL_BADGES, badgeById, EMPTY_LOG, honorById, honorHolders, HONORS, isViable, MISSION_BADGES, missionBadges, recordMission, sanitizeLog, type MissionLog, type SavedMission } from './achievements'
import { choose, evaluateMission, tierOptions, type Choice } from './game'
import { SOURCES } from './sources'

/** Every design the game lets a player build, for every mission. */
function viableDesigns(): Choice[] {
  const out: Choice[] = []
  const walk = (c: Choice, tiers: C.Tier[]) => {
    if (!tiers.length) return void out.push(c)
    for (const n of tierOptions(tiers[0], c).filter((x) => x.ok)) walk(choose(c, tiers[0], n.id), tiers.slice(1))
  }
  for (const s of C.SCENARIOS) for (const o of C.ORBITS) walk({ scenarioId: s.id, orbitId: o.id }, ['instrument', 'power', 'downlink', 'launch'])
  return out
}

// One scorecard per design, with a unanimous Go. The team size does not change it: a full Go is always full team points.
const designs = viableDesigns().map((c) => ({ c, card: evaluateMission(c, 1, 1) }))
const winners = designs.filter((d) => d.card.success)
const part = (d: (typeof designs)[number], id: string) => d.card.breakdown.find((x) => x.id === id)!

const demo: Choice = { scenarioId: 'ice', orbitId: 'sso', instrumentId: 'radar', powerId: 'hybrid', downlinkId: 'daily', launchId: 'medium' }

describe('mission badges', () => {
  it('every badge can be earned by a design the game allows', () => {
    const seen = new Set(winners.flatMap((d) => [...missionBadges(d.c, 1, 1), ...missionBadges(d.c, 4, 4)]))
    expect([...seen].sort()).toEqual(MISSION_BADGES.map((b) => b.id).sort())
  })
  it('a failed mission earns nothing, and neither does a design with a locked option', () => {
    const losers = designs.filter((d) => !d.card.success)
    expect(losers.length).toBeGreaterThan(0)
    for (const d of losers) expect(missionBadges(d.c, 1, 1)).toEqual([])
    // Radar is locked in GEO: a hand-made request cannot collect badges with it.
    const locked: Choice = { ...demo, orbitId: 'geo' }
    expect(isViable(locked)).toBe(false)
    expect(missionBadges(locked, 4, 4)).toEqual([])
    expect(missionBadges({ scenarioId: 'ice', orbitId: 'sso' }, 4, 4)).toEqual([])
    expect(missionBadges({ ...demo, launchId: 'nope' }, 4, 4)).toEqual([])
  })
  it('the pitch demo mission earns the badges its scorecard shows', () => {
    // 86/100: best instrument, all data down, 10% reserve kept, four Go votes; the revisit costs science points.
    expect(missionBadges(demo, 4, 4)).toEqual(['right-tool', 'full-downlink', 'reserve-keeper', 'unanimous-go', 'full-crew'])
    expect(missionBadges(demo, 1, 1)).toEqual(['right-tool', 'full-downlink', 'reserve-keeper', 'solo-commander'])
    expect(missionBadges(demo, 3, 4)).toEqual(['right-tool', 'full-downlink', 'reserve-keeper', 'full-crew'])
    expect(missionBadges(demo, 2, 2)).toContain('unanimous-go')
    // Asking twice gives the same list.
    expect(missionBadges(demo, 4, 4)).toBe(missionBadges(demo, 4, 4))
  })
  it('badges agree with the scorecard they sit on', () => {
    for (const d of winners) {
      const got = missionBadges(d.c, 1, 1)
      expect(got.includes('full-science')).toBe(part(d, 'science').points === part(d, 'science').max)
      expect(got.includes('full-downlink')).toBe(part(d, 'data').points === part(d, 'data').max)
      expect(got.includes('reserve-keeper')).toBe(part(d, 'budget').points === part(d, 'budget').max)
      expect(got.includes('perfect-mission')).toBe(d.card.score === 100)
      if (got.includes('perfect-mission')) expect(got).toEqual(expect.arrayContaining(['right-tool', 'full-science', 'full-downlink', 'reserve-keeper']))
      expect(got).toContain('solo-commander')
      expect(got).not.toContain('full-crew')
      expect(got).not.toContain('unanimous-go')
    }
  })
  it('every badge has a short hint and a known source; the reserve rule cites CubeSat 101', () => {
    expect(new Set(ALL_BADGES.map((b) => b.id)).size).toBe(ALL_BADGES.length)
    for (const b of ALL_BADGES) {
      expect(b.name.length).toBeLessThanOrEqual(18)
      expect(b.hint.length).toBeLessThanOrEqual(70)
      expect(b.hint.split('. ').length).toBe(1)
      expect(SOURCES).toHaveProperty(b.source)
    }
    expect(badgeById('reserve-keeper')!.source).toBe('S2')
    expect(badgeById('reserve-keeper')!.hint).toContain(`${C.RESERVE_FRACTION * 100}%`)
  })
})

describe('mission log (collection on one device)', () => {
  const fly = (log: MissionLog, c: Choice, goVotes = 1, players = 1) => recordMission(log, c, goVotes, players)
  const best = (scenarioId: string, orbitId?: string) => winners.filter((d) => d.c.scenarioId === scenarioId && (!orbitId || d.c.orbitId === orbitId)).sort((a, b) => b.card.score - a.card.score)[0]?.c
  // A design that fails even with a Go, so the failure does not depend on the vote.
  const bad = designs.find((d) => d.c.scenarioId === 'ice' && !d.card.success)!.c

  it('recording the same mission twice changes nothing', () => {
    const once = fly(EMPTY_LOG, demo)
    expect(fly(once, demo)).toEqual(once)
    expect(once.badges).toEqual(missionBadges(demo, 1, 1))
    expect(once.succeeded).toEqual(['ice'])
    expect(once.orbits).toEqual(['sso'])
    const failedOnce = fly(EMPTY_LOG, bad)
    expect(failedOnce).toEqual({ ...EMPTY_LOG, failed: ['ice'] })
    expect(fly(failedOnce, bad)).toBe(failedOnce)
  })
  it('a design the game does not allow is not recorded', () => {
    expect(fly(EMPTY_LOG, { ...demo, orbitId: 'geo' })).toBe(EMPTY_LOG)
    expect(fly(EMPTY_LOG, {})).toBe(EMPTY_LOG)
  })
  it('Mission planner needs a success in every mission', () => {
    let log = EMPTY_LOG
    for (const s of C.SCENARIOS.slice(0, -1)) log = fly(log, best(s.id))
    expect(log.badges).not.toContain('all-missions')
    log = fly(log, best(C.SCENARIOS.at(-1)!.id))
    expect(log.badges).toContain('all-missions')
  })
  it('Orbit explorer needs a success in every orbit, and every orbit has one', () => {
    let log = EMPTY_LOG
    for (const o of C.ORBITS) {
      const c = C.SCENARIOS.map((s) => best(s.id, o.id)).find(Boolean)
      expect(c, `a successful design in ${o.short}`).toBeTruthy()
      expect(log.badges).not.toContain('orbit-explorer')
      log = fly(log, c!)
    }
    expect(log.badges).toContain('orbit-explorer')
  })
  it('Comeback counts only a success that follows a failure in the same mission', () => {
    // Success first, failure later: no comeback.
    const wrongOrder = fly(fly(EMPTY_LOG, demo), bad)
    expect(wrongOrder.failed).toEqual(['ice'])
    expect(wrongOrder.badges).not.toContain('comeback')
    // A failure in one mission and a success in another: no comeback.
    expect(fly(fly(EMPTY_LOG, bad), best('crops')).badges).not.toContain('comeback')
    // Failure, then success in the same mission; it stays earned afterwards.
    const back = fly(fly(EMPTY_LOG, bad), demo)
    expect(back.badges).toContain('comeback')
    expect(fly(back, best('crops')).badges).toContain('comeback')
  })
  it('Badge collector can be completed by flying real designs', () => {
    let log = fly(EMPTY_LOG, bad)
    for (const d of winners) {
      log = fly(log, d.c, 1, 1)
      log = fly(log, d.c, 4, 4)
    }
    expect([...log.badges].sort()).toEqual(ALL_BADGES.map((b) => b.id).sort())
  })
  it('stored data is cleaned before use', () => {
    expect(sanitizeLog(null)).toEqual(EMPTY_LOG)
    expect(sanitizeLog('x')).toEqual(EMPTY_LOG)
    expect(sanitizeLog({ badges: 'right-tool' })).toEqual(EMPTY_LOG)
    expect(sanitizeLog({ badges: ['right-tool', 'right-tool', 'made-up', 7], succeeded: ['ice', 'mars'], failed: [null], orbits: ['geo', 'moon'], extra: 1 })).toEqual({
      badges: ['right-tool'],
      succeeded: ['ice'],
      failed: [],
      orbits: ['geo'],
    })
    const log = fly(EMPTY_LOG, demo)
    expect(sanitizeLog(JSON.parse(JSON.stringify(log)))).toEqual(log)
  })
})

describe('leaderboard honors', () => {
  const save = (id: number, scenarioId: string, score: number, day: number, success = true): SavedMission => ({ id, scenarioId, score, success, savedAt: `2026-11-${10 + day}T00:00:00Z` })
  const held = (saved: SavedMission[]) => Object.fromEntries(honorHolders(saved))

  it('nothing saved, or nothing successful, means no honors', () => {
    expect(held([])).toEqual({})
    expect(held([save(1, 'ice', 40, 1, false), save(2, 'ice', 30, 2, false)])).toEqual({})
  })
  it('the first success of a mission is also its leader', () => {
    expect(held([save(1, 'ice', 86, 1)])).toEqual({ 1: ['mission-leader', 'first-success'] })
  })
  it('a better score takes the lead; the first success keeps its honor', () => {
    expect(held([save(1, 'ice', 71, 1), save(2, 'ice', 86, 2)])).toEqual({ 1: ['first-success'], 2: ['mission-leader'] })
  })
  it('an equal score does not take the lead: the earlier save keeps it', () => {
    expect(held([save(1, 'ice', 86, 1), save(2, 'ice', 86, 2)])).toEqual({ 1: ['mission-leader', 'first-success'] })
    // Same instant: the lower id was saved first.
    expect(held([save(5, 'ice', 86, 1), save(4, 'ice', 86, 1)])).toEqual({ 4: ['mission-leader', 'first-success'] })
  })
  it('a failed mission never holds an honor, even with the highest number', () => {
    expect(held([save(1, 'ice', 90, 1, false), save(2, 'ice', 60, 2)])).toEqual({ 2: ['mission-leader', 'first-success'] })
  })
  it('First perfect goes to the first 100, not to a later one', () => {
    expect(held([save(1, 'crops', 80, 1), save(2, 'crops', 100, 2), save(3, 'crops', 100, 3)])).toEqual({ 1: ['first-success'], 2: ['mission-leader', 'first-perfect'] })
  })
  it('each mission has its own holders', () => {
    expect(held([save(1, 'ice', 86, 1), save(2, 'crops', 100, 2), save(3, 'storms', 70, 3)])).toEqual({
      1: ['mission-leader', 'first-success'],
      2: ['mission-leader', 'first-success', 'first-perfect'],
      3: ['mission-leader', 'first-success'],
    })
  })
  it('ids from the database arrive as text and still match', () => {
    expect(held([{ ...save(1, 'ice', 86, 1), id: '12' }, { ...save(2, 'ice', 90, 2), id: '9', savedAt: new Date('2026-11-20T00:00:00Z') }])).toEqual({ 12: ['first-success'], 9: ['mission-leader'] })
  })
  it('every honor has a short hint and a known source, and none shares an id with a badge', () => {
    for (const h of HONORS) {
      expect(h.name.length).toBeLessThanOrEqual(18)
      expect(h.hint.length).toBeLessThanOrEqual(70)
      expect(h.hint.split('. ').length).toBe(1)
      expect(SOURCES).toHaveProperty(h.source)
      expect(badgeById(h.id)).toBeUndefined()
      expect(honorById(h.id)).toBe(h)
    }
  })
})
