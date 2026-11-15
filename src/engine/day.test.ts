import { describe, expect, it } from 'vitest'
import * as C from './catalog'
import { choose, downlinkCapacity, evaluateMission, tierOptions, type Choice } from './game'
import { missionDay } from './missionDay'
import * as P from './physics'
import { centralAngleDeg, contactPlan, DAY_S, subPoint } from './track'

const orbit = (id: string) => C.byId(C.ORBITS, id)!
const downlink = (id: string) => C.byId(C.DOWNLINKS, id)!
const ICE: Choice = { scenarioId: 'ice', orbitId: 'sso', instrumentId: 'radar', powerId: 'hybrid', downlinkId: 'daily', launchId: 'medium' }

describe('ground track (physics sanity checks)', () => {
  it('never goes beyond the latitude set by the inclination', () => {
    for (const o of [orbit('leo'), orbit('sso')]) {
      let max = 0
      for (let t = 0; t < DAY_S; t += 30) max = Math.max(max, Math.abs(subPoint(o, t).latDeg))
      expect(max).toBeLessThanOrEqual(P.maxLatitudeDeg(o.inclDeg) + 1e-9)
      expect(max).toBeGreaterThan(P.maxLatitudeDeg(o.inclDeg) - 0.1)
    }
  })
  it('each lap crosses the equator about 25° further west for Landsat 9’s orbit (Earth turns underneath)', () => {
    const o = orbit('sso')
    const T = P.periodSec(o.altKm)
    const shift = subPoint(o, 0).lonDeg - subPoint(o, T).lonDeg
    // 360° × (98.9 min / 1436 min) for Earth's rotation.
    expect(((shift % 360) + 360) % 360).toBeCloseTo((360 * T) / P.SIDEREAL_DAY_S, 1)
    expect((360 * T) / P.SIDEREAL_DAY_S).toBeGreaterThan(24)
    expect((360 * T) / P.SIDEREAL_DAY_S).toBeLessThan(26)
  })
  it('measures the angle between two ground points', () => {
    expect(centralAngleDeg(0, 0, 0, 90)).toBeCloseTo(90, 6)
    expect(centralAngleDeg(90, 0, -90, 0)).toBeCloseTo(180, 6)
    expect(centralAngleDeg(35, -150, 35, -150)).toBeCloseTo(0, 4) // acos loses precision near zero
  })
})

describe('ground-station passes come from geometry, not from an assumed number', () => {
  it('a mid-latitude station sees a ~700 km orbit about 4 times a day, 5 to 9 minutes each', () => {
    const d = downlink('daily')
    const plan = contactPlan(orbit('sso'), d.stationLatDeg!, d.stationLonDeg!)
    expect(plan.passes).toBeGreaterThanOrEqual(3)
    expect(plan.passes).toBeLessThanOrEqual(6)
    for (const w of plan.windows) {
      expect(w.endS - w.startS).toBeGreaterThan(60)
      // No pass can outlast a straight overhead one.
      expect(w.endS - w.startS).toBeLessThanOrEqual((P.periodSec(705) * P.stationHalfAngleDeg(705)) / 180 + 20)
    }
  })
  it('a station near the pole sees a polar orbit on most of its ~14.6 laps', () => {
    const d = downlink('polar')
    const plan = contactPlan(orbit('sso'), d.stationLatDeg!, d.stationLonDeg!)
    expect(plan.passes).toBeGreaterThanOrEqual(10)
    expect(plan.passes).toBeLessThanOrEqual(15)
  })
  it('a 51.6° orbit never comes within reach of a 78° station', () => {
    const d = downlink('polar')
    expect(contactPlan(orbit('leo'), d.stationLatDeg!, d.stationLonDeg!).passes).toBe(0)
    expect(downlinkCapacity(orbit('leo'), d).gbitPerDay).toBe(0)
  })
  it('downlink capacity is contact time × link rate', () => {
    const d = downlink('daily')
    const plan = contactPlan(orbit('sso'), d.stationLatDeg!, d.stationLonDeg!)
    expect(downlinkCapacity(orbit('sso'), d).gbitPerDay).toBeCloseTo((plan.contactSec * d.rateMbps) / 1000, 6)
  })
})

/** Every fully viable design of every mission. */
function viableDesigns(): Choice[] {
  const out: Choice[] = []
  for (const s of C.SCENARIOS)
    for (const o of C.ORBITS) {
      const c0: Choice = { scenarioId: s.id, orbitId: o.id }
      for (const i of tierOptions('instrument', c0).filter((n) => n.ok)) {
        const c1 = choose(c0, 'instrument', i.id)
        for (const p of tierOptions('power', c1).filter((n) => n.ok)) {
          const c2 = choose(c1, 'power', p.id)
          for (const d of tierOptions('downlink', c2).filter((n) => n.ok)) {
            const c3 = choose(c2, 'downlink', d.id)
            for (const l of tierOptions('launch', c3).filter((n) => n.ok)) out.push(choose(c3, 'launch', l.id))
          }
        }
      }
    }
  return out
}

describe('a day in orbit (the simulation the player watches)', () => {
  it('is not available until the design is complete enough to fly', () => {
    expect(missionDay({ scenarioId: 'ice', orbitId: 'sso' })).toBeNull()
    expect(missionDay(ICE)).not.toBeNull()
  })
  it('counts the laps, shadow time and passes of the Polar Ice reference design', () => {
    const d = missionDay(ICE)!
    expect(d.orbitsPerDay).toBeCloseTo(14.56, 1)
    expect(d.periodMin).toBeCloseTo(98.9, 1)
    expect(d.eclipseMin).toBeCloseTo(35, 0)
    expect(d.passes).toBe(3) // over the 35°N station on the reference day
    expect(d.maxLatDeg).toBeCloseTo(81.8, 1)
    expect(d.needLatDeg).toBe(80)
    // One shadow crossing per lap: count the sunlit → shadow transitions.
    const entries = d.samples.filter((x, i) => i > 0 && !x.sunlit && d.samples[i - 1].sunlit).length
    expect(entries).toBeGreaterThanOrEqual(14)
    expect(entries).toBeLessThanOrEqual(15)
  })
  it('delivers what the scorecard says: a day’s data in equals a day’s data out', () => {
    const d = missionDay(ICE)!
    expect(d.collectedGbit).toBe(200)
    expect(d.deliveredGbit).toBeCloseTo(200, 0)
    expect(evaluateMission(ICE, 4).timeline.find((x) => x.label === 'Daily operations')!.text).toContain('200 of 200 Gbit/day')
    // Data only comes down during a pass.
    for (let i = 1; i < d.samples.length; i++) if (!d.samples[i - 1].contact) expect(d.samples[i].deliveredGbit).toBeCloseTo(d.samples[i - 1].deliveredGbit, 9)
  })
  it('a geostationary spacecraft stays over one spot with a link that never drops', () => {
    const d = missionDay({ scenarioId: 'storms', orbitId: 'geo', instrumentId: 'weather', powerId: 'extended', downlinkId: 'continuous', launchId: 'heavy' })!
    expect(d.passes).toBe('continuous')
    expect(d.station).toBeNull()
    expect(new Set(d.samples.map((x) => `${x.latDeg},${x.lonDeg}`)).size).toBe(1)
    expect(d.samples.every((x) => x.contact)).toBe(true)
  })
  it('never contradicts the locks: every viable design keeps its battery above empty and delivers its data', () => {
    const designs = viableDesigns()
    expect(designs.length).toBeGreaterThan(20)
    for (const c of designs) {
      const d = missionDay(c)!
      const label = JSON.stringify(c)
      expect(d.batteryMinWh, label).toBeGreaterThan(0)
      // The power lock sizes the battery for the eclipse at a limited depth of discharge.
      const o = C.byId(C.ORBITS, c.orbitId)!
      expect(1 - d.batteryMinWh / d.batteryCapacityWh, label).toBeLessThanOrEqual(C.maxDepthOfDischarge(o.altKm) + 0.01)
      expect(d.deliveredGbit, label).toBeGreaterThan(d.collectedGbit * 0.98)
      expect(d.samples.every((x) => x.storedGbit >= -1e-9), label).toBe(true)
    }
  })
})
