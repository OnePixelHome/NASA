// One day of the finished mission, second by second: where the spacecraft is, when it is in Earth's shadow,
// what the battery holds, and how data piles up on board and comes down on each ground-station pass.
// It uses the same numbers as the tier locks and the scorecard, so the animation can never disagree with them.
import * as C from './catalog'
import { averageGenerationW, averageLoadW, downlinkCapacity, type Choice } from './game'
import * as P from './physics'
import type { SourceId } from './sources'
import { contactPlan, DAY_S, STEP_S, subPoint } from './track'

export interface DaySample {
  /** Seconds into the reference day. */
  tS: number
  latDeg: number
  lonDeg: number
  /** False while the spacecraft is in Earth's shadow. */
  sunlit: boolean
  /** True while a ground station (or the relay link) is receiving data. */
  contact: boolean
  batteryWh: number
  /** Data waiting on board, in Gbit. */
  storedGbit: number
  /** Data delivered to Earth since the day began, in Gbit. */
  deliveredGbit: number
}

export interface MissionDay {
  samples: DaySample[]
  periodMin: number
  orbitsPerDay: number
  eclipseMin: number
  /** Number of ground-station passes, or 'continuous' for a link that never drops. */
  passes: number | 'continuous'
  contactMin: number
  /** Ground station position; null for a continuous link, which has no single station. */
  station: { latDeg: number; lonDeg: number; reachDeg: number } | null
  inclDeg: number
  /** Distance from the Earth's centre to the spacecraft, in Earth radii (1 = the surface). */
  orbitRadiusEarths: number
  /** How far from the point below it the spacecraft can see, as an angle at the Earth's centre. */
  viewDeg: number
  /** Highest latitude the mission must observe, and the highest the ground track reaches. */
  needLatDeg: number
  maxLatDeg: number
  batteryCapacityWh: number
  /** Lowest battery level reached during the day. */
  batteryMinWh: number
  collectedGbit: number
  deliveredGbit: number
  /** The ground track is physics; power levels, data rates and the station are game values. */
  sources: SourceId[]
}

/** Seconds of [a, b) that fall inside any of the windows. */
function overlap(a: number, b: number, windows: { startS: number; endS: number }[]) {
  let s = 0
  for (const w of windows) s += Math.max(0, Math.min(b, w.endS) - Math.max(a, w.startS))
  return s
}

/** The reference day of a complete design, or null while the design is incomplete. */
export function missionDay(c: Choice): MissionDay | null {
  const s = C.byId(C.SCENARIOS, c.scenarioId)
  const o = C.byId(C.ORBITS, c.orbitId)
  const ins = C.byId(C.INSTRUMENTS, c.instrumentId)
  const pw = C.byId(C.POWER, c.powerId)
  const dl = C.byId(C.DOWNLINKS, c.downlinkId)
  if (!s || !o || !ins || !pw || !dl) return null

  const periodS = P.periodSec(o.altKm)
  const eclipse = P.eclipseFraction(o.altKm)
  const geo = o.altKm > 30000
  const continuous = dl.kind === 'continuous'
  const station = continuous || dl.stationLatDeg === undefined ? null : { latDeg: dl.stationLatDeg, lonDeg: dl.stationLonDeg ?? 0, reachDeg: P.stationHalfAngleDeg(o.altKm) }
  const plan = station ? contactPlan(o, station.latDeg, station.lonDeg) : null
  const windows = plan?.windows ?? []

  // Power: panels deliver their sun-facing output only in sunlight; the average over an orbit is what the lock checks.
  const loadW = averageLoadW(o, ins)
  const sunlitGenW = averageGenerationW(o, pw) / (1 - eclipse)
  // Data: collected evenly through the day; sent at the link rate while in contact.
  const collectPerS = ins.dataGbitPerDay / DAY_S
  const linkPerS = continuous ? downlinkCapacity(o, dl).gbitPerDay / DAY_S : dl.rateMbps / 1000

  /** Worst-case eclipse: the shadow arc sits opposite the point where the orbit starts each lap. */
  const sunlitAt = (tS: number) => Math.abs((tS % periodS) / periodS - 0.5) > eclipse / 2

  const batteryCapacityWh = pw.batteryWh
  // A geostationary spacecraft keeps the same point below it all day.
  const fixedPoint = geo ? { latDeg: 0, lonDeg: subPoint(o, 0).lonDeg } : null
  const pointAt = geo ? () => fixedPoint! : (tS: number) => subPoint(o, tS)

  function run(startStoredGbit: number, startBatteryWh: number) {
    const samples: DaySample[] = []
    let stored = startStoredGbit
    let battery = startBatteryWh
    let delivered = 0
    for (let t = 0; t <= DAY_S; t += STEP_S) {
      const p = pointAt(t)
      const sunlit = sunlitAt(t)
      const contactS = continuous ? STEP_S : overlap(t, t + STEP_S, windows)
      samples.push({ tS: t, latDeg: p.latDeg, lonDeg: p.lonDeg, sunlit, contact: contactS > 0, batteryWh: battery, storedGbit: stored, deliveredGbit: delivered })
      if (t === DAY_S) break
      battery = Math.max(0, Math.min(batteryCapacityWh, battery + (((sunlit ? sunlitGenW : 0) - loadW) * STEP_S) / 3600))
      stored += collectPerS * STEP_S
      const sent = Math.min(stored, linkPerS * contactS)
      stored -= sent
      delivered += sent
    }
    return { samples, stored, battery, delivered }
  }

  // Run the day once to find what is left on board at midnight, then again starting from there:
  // the second run is the steady state, where a day's data in equals a day's data out when the link can keep up.
  const warmup = run(0, batteryCapacityWh)
  const day = run(warmup.stored, warmup.battery)

  return {
    samples: day.samples,
    periodMin: periodS / 60,
    orbitsPerDay: DAY_S / periodS,
    eclipseMin: (eclipse * periodS) / 60,
    passes: continuous ? 'continuous' : (plan?.passes ?? 0),
    contactMin: continuous ? DAY_S / 60 : (plan?.contactSec ?? 0) / 60,
    station,
    inclDeg: o.inclDeg,
    orbitRadiusEarths: P.semiMajorKm(o.altKm) / P.RE_KM,
    viewDeg: P.horizonHalfAngleDeg(o.altKm),
    needLatDeg: s.needLatDeg,
    maxLatDeg: geo ? 0 : P.maxLatitudeDeg(o.inclDeg),
    batteryCapacityWh,
    batteryMinWh: Math.min(...day.samples.map((x) => x.batteryWh)),
    collectedGbit: ins.dataGbitPerDay,
    deliveredGbit: day.delivered,
    sources: ['PHYS', 'GAME'],
  }
}
