import { describe, expect, it } from 'vitest'
import * as C from '../../engine/catalog'
import type { Choice } from '../../engine/game'
import { missionDay } from '../../engine/missionDay'
import * as P from '../../engine/physics'
import { subPoint } from '../../engine/track'
import { groundDirection, hiddenByEarth, inShadow, orbitDirection, project, scale, SUN, unprojectSphere, type Vec3 } from './geometry'
import { ACTS, FILM_SECONDS, momentAt } from './timing'

const ICE: Choice = { scenarioId: 'ice', orbitId: 'sso', instrumentId: 'radar', powerId: 'hybrid', downlinkId: 'daily', launchId: 'medium' }
const STORMS: Choice = { scenarioId: 'storms', orbitId: 'geo', instrumentId: 'weather', powerId: 'extended', downlinkId: 'continuous', launchId: 'heavy' }
const CROPS_LEO: Choice = { scenarioId: 'crops', orbitId: 'leo', instrumentId: 'multispectral', powerId: 'standard', downlinkId: 'daily', launchId: 'small' }
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

describe('the film shows what the engine computed', () => {
  it('puts the spacecraft over the same ground point as the engine, all day', () => {
    for (const id of ['leo', 'sso']) {
      const o = C.byId(C.ORBITS, id)!
      for (const t of [0, 600, 3000, 20000, 61234, 86000]) {
        const sat = orbitDirection(o.inclDeg, (2 * Math.PI * t) / P.periodSec(o.altKm))
        const p = subPoint(o, t)
        // The ground point straight below must be the same direction as the spacecraft.
        expect(dot(sat, groundDirection(p.latDeg, p.lonDeg, t)), `${id} t=${t}`).toBeGreaterThan(0.999999)
      }
    }
  })
  it('darkens the spacecraft exactly when the engine says it is in Earth’s shadow', () => {
    for (const c of [ICE, CROPS_LEO, STORMS]) {
      const o = C.byId(C.ORBITS, c.orbitId)!
      const day = missionDay(c)!
      const r = 1 + o.altKm / P.RE_KM
      let mismatches = 0
      for (const s of day.samples) {
        const shadow = inShadow(scale(orbitDirection(o.inclDeg, (2 * Math.PI * s.tS) / P.periodSec(o.altKm)), r))
        if (shadow === s.sunlit) mismatches++
      }
      // Only the samples that land right on a shadow edge may differ: two edges per lap.
      expect(mismatches, c.orbitId).toBeLessThanOrEqual(Math.ceil(day.orbitsPerDay) * 2 + 2)
      expect(day.samples.some((s) => !s.sunlit)).toBe(true)
    }
  })
  it('keeps the Sun in the orbit plane, the worst case the engine assumes', () => {
    for (const incl of [0, 51.6, 98.2]) {
      // The orbit's normal is perpendicular to every position on it.
      const a = orbitDirection(incl, 0)
      const b = orbitDirection(incl, Math.PI / 2)
      const normal: Vec3 = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
      expect(dot(normal, SUN)).toBeCloseTo(0, 9)
    }
  })
})

describe('camera', () => {
  it('projects and un-projects points on the near side of the Earth', () => {
    for (const [x, y] of [[0, 0], [0.5, -0.3], [-0.7, 0.6], [0.99, 0]]) {
      const v = project(unprojectSphere(x, y))
      expect(v.x).toBeCloseTo(x, 9)
      expect(v.y).toBeCloseTo(y, 9)
      expect(v.depth).toBeGreaterThanOrEqual(0)
    }
  })
  it('hides what is behind the Earth and shows what is beside or in front of it', () => {
    expect(hiddenByEarth({ x: 0.2, y: 0.1, depth: -1.1 })).toBe(true)
    expect(hiddenByEarth({ x: 0.2, y: 0.1, depth: 1.1 })).toBe(false)
    expect(hiddenByEarth({ x: 1.05, y: 0, depth: -0.4 })).toBe(false)
  })
  it('shows the north pole in the upper half of the screen', () => {
    expect(project([0, 0, 1]).y).toBeLessThan(0)
    expect(project([0, 0, 1]).depth).toBeGreaterThan(0)
  })
})

describe('film script', () => {
  it('walks the six timeline steps in order and never goes back', () => {
    let prev = 0
    const seen = new Set<number>()
    for (let t = 0; t <= FILM_SECONDS + 1; t += 0.1) {
      const m = momentAt(t)
      expect(m.step).toBeGreaterThanOrEqual(prev)
      prev = m.step
      seen.add(m.step)
    }
    expect([...seen]).toEqual([1, 2, 3, 4, 5, 6])
  })
  it('holds the last frame once it is over', () => {
    expect(momentAt(FILM_SECONDS + 30)).toMatchObject({ act: 'end', progress: 1, step: 6, done: true })
    expect(momentAt(0)).toMatchObject({ act: 'launch', step: 1, done: false })
  })
  it('lasts under a minute, so it never holds the player back long', () => {
    expect(FILM_SECONDS).toBeLessThan(60)
    expect(ACTS.map((a) => a.id)).toEqual(['launch', 'deploy', 'firstLight', 'day', 'end'])
  })
})
