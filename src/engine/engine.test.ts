import { describe, expect, it } from 'vitest'
import * as P from './physics'
import * as C from './catalog'
import { budget, choose, evaluateMission, missionRequirements, orbitStats, resources, TEAM_POINTS_MAX, teamPoints, tierOptions, type Choice } from './game'
import { AI_DISCLOSURE, DISCLAIMER, HOW_TO_PLAY, reasonSources, SOURCES, TEAM, type Reason } from './sources'

const orbit = (id: string) => C.byId(C.ORBITS, id)!

describe('physics sanity checks (Validity evidence)', () => {
  it('ISS-like orbit period ≈ 92.6 min at 400 km', () => {
    expect(P.periodSec(400) / 60).toBeCloseTo(92.6, 0)
  })
  it('GEO altitude ≈ 35,786 km', () => {
    expect(P.GEO_ALTITUDE_KM).toBeGreaterThan(35780)
    expect(P.GEO_ALTITUDE_KM).toBeLessThan(35792)
  })
  it('Landsat 9 orbit (705 km, 185 km swath) revisits in ~16 days [S6]', () => {
    const d = P.revisitDays(185, 705)
    expect(d).toBeGreaterThan(14)
    expect(d).toBeLessThan(17)
  })
  it('Landsat 9 period ≈ 99 min [S6]', () => {
    expect(P.periodSec(705) / 60).toBeCloseTo(98.9, 0)
  })
  it('LEO→GEO with plane change costs ~4 km/s', () => {
    const dv = orbitStats(orbit('geo')).extraDvKmS
    expect(dv).toBeGreaterThan(3.8)
    expect(dv).toBeLessThan(4.6)
  })
})

describe('Act 1 bars', () => {
  it('GEO is the most expensive orbit to reach, LEO the cheapest', () => {
    expect(orbitStats(orbit('geo')).bars.fuel).toBe(5)
    expect(orbitStats(orbit('leo')).bars.fuel).toBe(1)
  })
  it('SSO reaches higher latitudes than LEO (51.6°)', () => {
    expect(orbitStats(orbit('sso')).maxLatDeg).toBeGreaterThan(80)
    expect(orbitStats(orbit('leo')).maxLatDeg).toBeCloseTo(51.6, 1)
  })
})

describe('Act 2 dependency cascade', () => {
  it('GEO locks out cameras and radar, keeps the weather imager', () => {
    const ok = tierOptions('instrument', { orbitId: 'geo' }).filter((n) => n.ok).map((n) => n.id)
    expect(ok).toEqual(['weather'])
  })
  it('LEO/SSO lock out the weather imager', () => {
    for (const id of ['leo', 'sso']) {
      const w = tierOptions('instrument', { orbitId: id }).find((n) => n.id === 'weather')!
      expect(w.ok).toBe(false)
    }
  })
  it('radar needs the hybrid battery in LEO', () => {
    const ok = tierOptions('power', { orbitId: 'leo', instrumentId: 'radar' }).filter((n) => n.ok).map((n) => n.id)
    expect(ok).toEqual(['hybrid'])
  })
  it('a polar station is unreachable from a 51.6° orbit', () => {
    const polar = tierOptions('downlink', { orbitId: 'leo', instrumentId: 'multispectral', powerId: 'standard' }).find((n) => n.id === 'polar')!
    expect(polar.ok).toBe(false)
  })
  it('changing an upstream choice clears downstream choices', () => {
    const c: Choice = { scenarioId: 'crops', orbitId: 'sso', instrumentId: 'radar', powerId: 'hybrid', downlinkId: 'daily', launchId: 'medium' }
    expect(choose(c, 'instrument', 'multispectral')).toEqual({ scenarioId: 'crops', orbitId: 'sso', instrumentId: 'multispectral' })
  })
})

describe('sources (every number shown carries one)', () => {
  const full: Choice = { scenarioId: 'ice', orbitId: 'sso', instrumentId: 'radar', powerId: 'hybrid', downlinkId: 'daily', launchId: 'medium' }
  const known = (id: string) => expect(SOURCES).toHaveProperty(id)

  it('every node, locked or not, has sourced reasons and sourced facts', () => {
    for (const o of C.ORBITS) {
      const c: Choice = { scenarioId: 'ice', orbitId: o.id, instrumentId: 'multispectral', powerId: 'standard', downlinkId: 'daily' }
      for (const tier of ['instrument', 'power', 'downlink', 'launch'] as C.Tier[]) {
        for (const n of tierOptions(tier, c)) {
          expect(n.reasons.length).toBeGreaterThan(0)
          known(n.factsSource)
          n.reasons.flatMap(reasonSources).forEach(known)
        }
      }
    }
  })
  it('every simulation step and scorecard insight is a sourced reason', () => {
    const card = evaluateMission(full, 4)
    for (const r of [...card.timeline, card.primaryConstraint, card.biggestImpact, card.lesson]) {
      expect(r.text.length).toBeGreaterThan(0)
      reasonSources(r).forEach(known)
    }
    known(card.scoreSource)
  })
  it('the scorecard lists exactly the sources cited along the way', () => {
    const card = evaluateMission(full, 4)
    // Landsat 9 orbit and lifetime [S6], constants [S1], roles [S3], reserve rule [S2] — but not the ISS source: this path never uses LEO.
    // S12: the Earth image in the mission film. S15: battery depth of discharge in a low orbit. S19: Earth's spin, lost by a polar launch.
    expect(card.sources).toEqual(['S1', 'S2', 'S3', 'S6', 'S9', 'S12', 'S15', 'S19', 'PHYS', 'GAME']) // S9: the chosen downlink can carry the data
    const leo = evaluateMission({ scenarioId: 'crops', orbitId: 'leo', instrumentId: 'multispectral', powerId: 'standard', downlinkId: 'daily', launchId: 'small' }, 4)
    expect(leo.sources).toContain('S10')
  })
  it('game assumptions are not passed off as physics', () => {
    // Passes per day depends on the station's longitude, an illustrative value, so its reason must say so.
    const daily = tierOptions('downlink', { orbitId: 'sso', instrumentId: 'multispectral', powerId: 'standard' }).find((n) => n.id === 'daily')!
    expect(reasonSources(daily.reasons[0])).toContain('GAME')
    // The radar range limit is illustrative too, even though the distance⁴ law is physics.
    const radar = tierOptions('instrument', { orbitId: 'geo' }).find((n) => n.id === 'radar')!
    // Too blurry, then out of range: both mix physics with a game threshold. The last line only says where real radars fly.
    expect(radar.reasons.map(reasonSources)).toEqual([['PHYS', 'GAME'], ['PHYS', 'GAME'], ['S17', 'S18']])
  })
  it('the values that waited for a mentor now cite a published mission or test', () => {
    // Mission lifetime per orbit: GRACE-FO (490 km, five years), Landsat 9 (10 years of consumables), GOES-R (15 years).
    expect(C.ORBITS.map((o) => [o.lifetimeYears, o.lifetimeSource])).toEqual([[5, 'S13'], [10, 'S6'], [15, 'S14']])
    expect(SOURCES.S13.quote).toBe('Prime mission: Five years')
    expect(SOURCES.S6.quote).toBe('Consumables: 10 years')
    expect(SOURCES.S14.quote).toContain('on-orbit life of 15 years')
    for (const o of C.ORBITS) {
      const card = evaluateMission({ scenarioId: 'storms', orbitId: o.id, instrumentId: 'multispectral', powerId: 'hybrid', downlinkId: 'continuous', launchId: 'heavy' }, 4)
      expect(reasonSources(card.timeline.at(-1)!)).toEqual([o.lifetimeSource, 'GAME'])
    }
    // Battery depth of discharge stays inside what NASA tested: at most 40% in LEO [S15], at most 75% in GEO [S16].
    expect(C.maxDepthOfDischarge(500)).toBeLessThanOrEqual(0.4)
    expect(C.maxDepthOfDischarge(35786)).toBeLessThanOrEqual(0.75)
    expect(SOURCES.S15.quote).toContain('40 percent depth-of-discharge')
    expect(SOURCES.S16.quote).toContain('75% DOD')
    const power = (orbitId: string) => tierOptions('power', { orbitId, instrumentId: 'multispectral' }).flatMap((n) => n.reasons.flatMap(reasonSources))
    expect(power('leo')).toContain('S15')
    expect(power('geo')).toContain('S16')
    expect(power('geo')).not.toContain('S15')
    // The Sun-synchronous launch penalty is Earth's spin at the launch site [S19], and only that orbit pays it.
    expect(C.EQUATOR_SPEED_KMS * Math.cos((C.LAUNCH_SITE_LAT_DEG * Math.PI) / 180)).toBeCloseTo(C.SSO_ROTATION_PENALTY_KMS, 1)
    const launch = (orbitId: string) => tierOptions('launch', { orbitId, instrumentId: 'multispectral', powerId: 'extended', downlinkId: 'daily' }).flatMap((n) => n.reasons.flatMap(reasonSources))
    expect(launch('sso')).toContain('S19')
    expect(launch('leo')).not.toContain('S19')
  })
})

describe('Go/No-Go poll (team collaboration)', () => {
  const full: Choice = { scenarioId: 'ice', orbitId: 'sso', instrumentId: 'radar', powerId: 'hybrid', downlinkId: 'daily', launchId: 'medium' }
  const team = (votes: number) => evaluateMission(full, votes).breakdown.find((b) => b.label === 'Team Go/No-Go')!.points

  it('a unanimous Go earns the full team score', () => {
    expect(teamPoints(4)).toBe(TEAM_POINTS_MAX)
    expect(team(4)).toBe(15)
  })
  it('launching over No-Go votes costs team points and total score', () => {
    expect(team(3)).toBe(11)
    expect(team(2)).toBe(8)
    expect(team(0)).toBe(0)
    expect(evaluateMission(full, 2).score).toBe(evaluateMission(full, 4).score - 7)
  })
  it('vote counts outside 0–4 are clamped', () => {
    expect(teamPoints(9)).toBe(TEAM_POINTS_MAX)
    expect(teamPoints(-1)).toBe(0)
  })
})

/** Enumerate every fully viable path for a scenario. */
function viablePaths(scenarioId: string) {
  const out: { c: Choice; score: number; spent: number }[] = []
  for (const o of C.ORBITS) {
    let c: Choice = { scenarioId, orbitId: o.id }
    for (const i of tierOptions('instrument', c).filter((n) => n.ok)) {
      const c1 = choose(c, 'instrument', i.id)
      for (const p of tierOptions('power', c1).filter((n) => n.ok)) {
        const c2 = choose(c1, 'power', p.id)
        for (const d of tierOptions('downlink', c2).filter((n) => n.ok)) {
          const c3 = choose(c2, 'downlink', d.id)
          for (const l of tierOptions('launch', c3).filter((n) => n.ok)) {
            const c4 = choose(c3, 'launch', l.id)
            out.push({ c: c4, score: evaluateMission(c4, 4).score, spent: budget(c4).spentM })
          }
        }
      }
    }
    c = {}
  }
  return out
}

describe('node tooltips (copy lives in catalog.ts)', () => {
  const all = [...C.INSTRUMENTS, ...C.POWER, ...C.DOWNLINKS, ...C.LAUNCHERS]

  it('every option has a tooltip of one or two sentences', () => {
    for (const x of all) {
      const sentences = x.tip.split(/(?<=[.!?])\s+/).filter(Boolean)
      expect(sentences.length, x.id).toBeGreaterThanOrEqual(1)
      expect(sentences.length, x.id).toBeLessThanOrEqual(2)
      expect(x.tip.length, x.id).toBeLessThanOrEqual(170)
    }
  })
  it('tooltips state no numbers, so they never need a source chip', () => {
    for (const x of all) expect(x.tip, x.id).not.toMatch(/\d/)
  })
  it('the tree exposes the tooltip of every node, locked or not', () => {
    const nodes = tierOptions('instrument', { orbitId: 'geo' })
    expect(nodes.find((n) => n.id === 'radar')!.tip).toBe(C.byId(C.INSTRUMENTS, 'radar')!.tip)
    expect(nodes.every((n) => n.tip.length > 0)).toBe(true)
  })
})

describe('10% budget reserve rule [S2]', () => {
  it('quotes CubeSat 101 with its page, and the game value matches the quote', () => {
    const s2 = SOURCES.S2
    expect(s2.cite).toContain('p. 13')
    expect(s2.quote).toContain(`reserves of at least ${C.RESERVE_FRACTION * 100}%`)
  })
  it('a design inside the reserve scores full budget points; eating into it costs points', () => {
    const pts = (c: Choice) => evaluateMission(c, 4).breakdown.find((b) => b.label === 'Budget & reserve')!.points
    // Polar Ice, $250M: $210M leaves a 16% reserve; a heavy rocket ($280M) goes over budget.
    const base: Choice = { scenarioId: 'ice', orbitId: 'sso', instrumentId: 'radar', powerId: 'hybrid', downlinkId: 'daily', launchId: 'medium' }
    expect(budget(base).reserveFraction).toBeCloseTo(0.16, 2)
    expect(pts(base)).toBe(15)
    expect(pts({ ...base, launchId: 'heavy' })).toBe(0)
    // Crop Watch, $200M: this design costs $195M, inside the budget but with only a 2.5% reserve.
    const tight: Choice = { scenarioId: 'crops', orbitId: 'sso', instrumentId: 'hires', powerId: 'extended', downlinkId: 'polar', launchId: 'medium' }
    const b = budget(tight)
    expect(b.spentM).toBe(195)
    expect(b.reserveFraction).toBeGreaterThanOrEqual(0)
    expect(b.reserveFraction).toBeLessThan(C.RESERVE_FRACTION)
    expect(pts(tight)).toBe(9)
  })
})

describe('mission requirements (challenge item 1: define the objective and requirements)', () => {
  const req = (id: string) => missionRequirements(C.byId(C.SCENARIOS, id)!)
  const values = (id: string) => req(id).items.map((r) => r.value)

  it('shows each mission as the numbers it will be scored against', () => {
    expect(values('crops')).toEqual(['±60°', 'Global', '16 d'])
    expect(values('ice')).toEqual(['±80°', 'Global', '3 d'])
  })
  it('writes a revisit shorter than a day in hours', () => {
    expect(values('storms')).toEqual(['±40°', 'Regional', '6 h'])
    expect(req('storms').summary).toBe('observe up to 40° latitude, regional coverage, revisit every 6 hours, budget $300M')
  })
  it('tags the targets as illustrative game values', () => {
    for (const s of C.SCENARIOS) expect(missionRequirements(s).source).toBe('GAME')
  })
})

describe('About screen content', () => {
  it('every source explains how the game uses it, and agency sources link to an official site', () => {
    // nasa.gov, plus the NOAA–NASA GOES-R programme site and the European Space Agency.
    const official = { NASA: /^https:\/\/([a-z0-9-]+\.)*nasa\.gov\//, NOAA: /^https:\/\/www\.goes-r\.gov\//, ESA: /^https:\/\/www\.esa\.int\// }
    for (const s of Object.values(SOURCES)) {
      expect(s.use.length).toBeGreaterThan(20)
      if (s.id.startsWith('S')) expect(s.url).toMatch(official[s.agency ?? 'NASA'])
      // A quote always says where in the document it is.
      if (s.quote) expect(s.cite).toBeTruthy()
    }
  })
  it('names the four team members and gives each a different crew character', () => {
    expect(TEAM.map((t) => t.name)).toEqual(['Edgar Cardona', 'José Gómez', 'Thais Rodríguez', 'Belle Vásquez Machado'])
    expect(new Set(TEAM.map((t) => t.role)).size).toBe(4)
    for (const t of TEAM) expect(t.name).not.toContain('[')
  })
  it('explains the game in four steps and says who is, and is not, behind it', () => {
    expect(HOW_TO_PLAY).toHaveLength(4)
    for (const s of HOW_TO_PLAY) expect(s.text.length).toBeLessThanOrEqual(90)
    expect(DISCLAIMER).toContain('not affiliated with or endorsed by NASA')
    expect(AI_DISCLOSURE).toContain('Claude Design (Anthropic)')
  })
  it('carries the AI-use disclosure required by the Space Apps rules', () => {
    expect(AI_DISCLOSURE).toContain('Claude (Anthropic)')
    expect(AI_DISCLOSURE).toContain('reviewed, tested and adapted by the team')
  })
})

describe('resource panel (budget, mass, power, data)', () => {
  const meters = (c: Choice) => Object.fromEntries(resources(c).map((m) => [m.id, m]))

  it('shows only the budget before an orbit is chosen', () => {
    expect(resources({ scenarioId: 'ice' }).map((m) => m.id)).toEqual(['budget'])
  })
  it('limits appear as each tier is chosen', () => {
    const m = meters({ scenarioId: 'ice', orbitId: 'sso', instrumentId: 'radar' })
    expect(m.mass.used).toBe(300) // 150 kg bus + 150 kg radar
    expect(m.mass.limit).toBeNull()
    expect(m.mass.hint).toBe('pick a launch vehicle')
    expect(m.power.used).toBe(170) // 50 W bus + 400 W radar at 30% duty
    expect(m.power.limit).toBeNull()
    expect(m.data.used).toBe(200)
  })
  it('matches the numbers of a full design', () => {
    const m = meters({ scenarioId: 'ice', orbitId: 'sso', instrumentId: 'radar', powerId: 'hybrid', downlinkId: 'daily', launchId: 'medium' })
    expect(m.budget.text).toBe('$210 / $250M')
    expect(m.mass.text).toBe('390 / 1,207 kg')
    expect(m.power.used).toBe(170)
    expect(m.power.limit).toBeGreaterThan(300)
    expect(m.data.text).toBe('200 / 396 Gbit/day') // 3 passes, 22 min over the station on the reference day
    expect(Object.values(m).some((x) => x.over)).toBe(false)
  })
  it('never contradicts the locks: every viable path keeps mass, power and data within limits', () => {
    for (const s of C.SCENARIOS) {
      for (const p of viablePaths(s.id)) {
        for (const m of resources(p.c).filter((x) => x.id !== 'budget')) {
          expect(m.limit).not.toBeNull()
          expect(m.over, `${s.id} ${JSON.stringify(p.c)} ${m.id}`).toBe(false)
        }
      }
    }
  })
  it('flags an over-budget design', () => {
    // Crop Watch with radar, a relay link and a heavy rocket costs $320M against a $200M budget.
    const m = meters({ scenarioId: 'crops', orbitId: 'sso', instrumentId: 'radar', powerId: 'hybrid', downlinkId: 'continuous', launchId: 'heavy' })
    expect(m.budget.used).toBeGreaterThan(m.budget.limit!)
    expect(m.budget.over).toBe(true)
  })
})

describe('game balance', () => {
  for (const s of C.SCENARIOS) {
    it(`${s.title}: several viable paths, and the best one fits the budget with ≥10% reserve`, () => {
      const paths = viablePaths(s.id)
      expect(paths.length).toBeGreaterThanOrEqual(3)
      const best = [...paths].sort((a, b) => b.score - a.score)[0]
      expect(best.score).toBeGreaterThanOrEqual(80)
      expect(best.spent).toBeLessThanOrEqual(s.budgetM * (1 - C.RESERVE_FRACTION))
    })
  }
})


describe('CubeSat 101 lessons in lock reasons [S2]', () => {
  const nodes = (tier: C.Tier, pick: (c: Choice) => Choice[]) =>
    C.ORBITS.flatMap((o) => C.INSTRUMENTS.flatMap((i) => pick({ scenarioId: 'ice', orbitId: o.id, instrumentId: i.id })))
      .flatMap((c) => tierOptions(tier, c))
  const citesS2 = (n: { reasons: Reason[] }) => n.reasons.some((r) => reasonSources(r).includes('S2'))

  it('quotes both extra statements word for word, with their pages', () => {
    const more = SOURCES.S2.more!
    expect(more.map((m) => m.quote)).toEqual([
      'Launching with an inadequate ground station is a mission killer.',
      'deployable solar panels will nearly double the power input to the spacecraft',
    ])
    expect(more[0].cite).toContain('p. 22')
    expect(more[1].cite).toContain('p. iv')
  })

  it('every locked downlink cites the ground-station warning; every open one cites the high-data-rate guidance instead', () => {
    const dl = nodes('downlink', (c) => C.POWER.map((p) => ({ ...c, powerId: p.id })))
    expect(dl.some((n) => !n.ok)).toBe(true)
    for (const n of dl) {
      expect(citesS2(n)).toBe(!n.ok)
      expect(n.reasons.some((r) => reasonSources(r).includes('S9'))).toBe(n.ok)
      // The quote is word for word, and the capacity line keeps its own tags: the rate is not attributed to S9.
      for (const r of n.reasons.filter((r) => r.source === 'S9')) expect(r.text).toContain(SOURCES.S9.quote!)
      for (const r of n.reasons.filter((r) => r.text.includes('Gbit'))) expect(reasonSources(r)).not.toContain('S9')
    }
    expect(dl.some((n) => n.ok)).toBe(true)
  })

  it('fixed body panels that cannot power the spacecraft cite deployable panels; deployable ones never do', () => {
    const pw = nodes('power', (c) => [c])
    const short = pw.filter((n) => n.id === 'standard' && n.reasons.some((r) => r.text.startsWith('Panels make')))
    expect(short.length).toBeGreaterThan(0)
    for (const n of short) expect(citesS2(n)).toBe(true)
    for (const n of pw.filter((n) => C.byId(C.POWER, n.id)!.deployable)) expect(citesS2(n)).toBe(false)
  })
})
