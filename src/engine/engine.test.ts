import { describe, expect, it } from 'vitest'
import * as P from './physics'
import * as C from './catalog'
import { budget, choose, evaluateMission, orbitStats, tierOptions, type Choice } from './game'

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

