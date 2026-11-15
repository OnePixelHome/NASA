// Ground track and ground-station contacts over one reference day. Pure geometry [PHYS]:
// a circular orbit of the given altitude and inclination over a rotating, spherical Earth.
// The starting longitude and the station longitudes are game choices [GAME]; they fix which day is "the reference day".
import type { Orbit } from './catalog'
import * as P from './physics'

export const DAY_S = 86400
/** Time step of the reference-day simulation. 20 s keeps each pass within about ±3% of its true length. */
export const STEP_S = 20
/** Sub-satellite longitude at the start of the reference day [GAME]. */
export const START_LON_DEG = -75

const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI
/** Wrap a longitude into [-180, 180). */
export const wrapLon = (lon: number) => ((((lon + 180) % 360) + 360) % 360) - 180

/** Point on the ground directly below the satellite, `tS` seconds into the reference day. */
export function subPoint(o: Orbit, tS: number): { latDeg: number; lonDeg: number } {
  const u = (2 * Math.PI * tS) / P.periodSec(o.altKm) // angle travelled along the orbit from the equator crossing
  const i = rad(o.inclDeg)
  const latDeg = deg(Math.asin(Math.sin(i) * Math.sin(u)))
  // Longitude along the orbit plane, minus how far the Earth has turned underneath (one turn per sidereal day).
  const lonDeg = START_LON_DEG + deg(Math.atan2(Math.cos(i) * Math.sin(u), Math.cos(u))) - (360 * tS) / P.SIDEREAL_DAY_S
  return { latDeg, lonDeg: wrapLon(lonDeg) }
}

/** Angle at the Earth's centre between two ground points, in degrees. */
export function centralAngleDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const c = Math.sin(rad(lat1)) * Math.sin(rad(lat2)) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.cos(rad(lon1 - lon2))
  return deg(Math.acos(Math.max(-1, Math.min(1, c))))
}

export interface ContactPlan {
  /** Number of separate passes over the station on the reference day. */
  passes: number
  /** Total time above the station's minimum elevation, in seconds. */
  contactSec: number
  /** Each pass as [start, end) seconds into the day. */
  windows: { startS: number; endS: number }[]
}

const plans = new Map<string, ContactPlan>()

/**
 * When a ground station can see the satellite during the reference day: the satellite is in view while the
 * angle between the station and the sub-satellite point is within `stationHalfAngleDeg` (10° minimum elevation).
 */
export function contactPlan(o: Orbit, stationLatDeg: number, stationLonDeg: number): ContactPlan {
  const key = `${o.altKm}|${o.inclDeg}|${stationLatDeg}|${stationLonDeg}`
  const cached = plans.get(key)
  if (cached) return cached
  const reach = P.stationHalfAngleDeg(o.altKm)
  const windows: ContactPlan['windows'] = []
  let open: number | null = null
  for (let t = 0; t <= DAY_S; t += STEP_S) {
    const p = subPoint(o, t)
    const inView = t < DAY_S && centralAngleDeg(p.latDeg, p.lonDeg, stationLatDeg, stationLonDeg) <= reach
    if (inView && open === null) open = t
    if (!inView && open !== null) {
      windows.push({ startS: open, endS: t })
      open = null
    }
  }
  const plan = { passes: windows.length, contactSec: windows.reduce((a, w) => a + (w.endS - w.startS), 0), windows }
  plans.set(key, plan)
  return plan
}
