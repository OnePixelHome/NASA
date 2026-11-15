// Pure orbital-mechanics helpers. Constants from NASA Earth Fact Sheet [S1]; formulas are standard physics [PHYS].
export const RE_KM = 6378.137 // equatorial radius [S1]
export const MU_KM3_S2 = 398600.4418 // GM Earth [S1: 0.39860e6]
export const SOLAR_W_M2 = 1361.0 // solar irradiance at Earth [S1]
export const G0 = 9.80665 // m/s²
export const SIDEREAL_DAY_S = 86164.0905
export const EARTH_CIRCUMFERENCE_KM = 40075

const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI

/** Altitude of a geostationary orbit, from the sidereal day. ≈ 35,786 km */
export const GEO_ALTITUDE_KM = Math.cbrt(MU_KM3_S2 * (SIDEREAL_DAY_S / (2 * Math.PI)) ** 2) - RE_KM

export const semiMajorKm = (altKm: number) => RE_KM + altKm
export const periodSec = (altKm: number) => 2 * Math.PI * Math.sqrt(semiMajorKm(altKm) ** 3 / MU_KM3_S2)
export const orbitsPerDay = (altKm: number) => 86400 / periodSec(altKm)
export const circularVelocity = (altKm: number) => Math.sqrt(MU_KM3_S2 / semiMajorKm(altKm))

/** Worst-case fraction of each orbit spent in Earth's shadow (Sun in the orbit plane). */
export const eclipseFraction = (altKm: number) => Math.asin(RE_KM / semiMajorKm(altKm)) / Math.PI

/** Highest latitude the ground track reaches. */
export const maxLatitudeDeg = (inclDeg: number) => (inclDeg <= 90 ? inclDeg : 180 - inclDeg)

/** Fraction of Earth's surface between ±lat (what a ground track can eventually see). */
export const latBandFraction = (latDeg: number) => Math.sin(rad(Math.min(latDeg, 90)))

/** Fraction of Earth's surface visible at once from altitude h (spherical cap). */
export const instantFootprintFraction = (altKm: number) => (1 - RE_KM / semiMajorKm(altKm)) / 2

/** Coplanar Hohmann transfer Δv (km/s) between two circular orbits. */
export function hohmannDvKmS(fromAltKm: number, toAltKm: number): number {
  const r1 = semiMajorKm(fromAltKm)
  const r2 = semiMajorKm(toAltKm)
  const at = (r1 + r2) / 2
  const v1 = Math.sqrt(MU_KM3_S2 / r1)
  const v2 = Math.sqrt(MU_KM3_S2 / r2)
  const vp = Math.sqrt(MU_KM3_S2 * (2 / r1 - 1 / at))
  const va = Math.sqrt(MU_KM3_S2 * (2 / r2 - 1 / at))
  return Math.abs(vp - v1) + Math.abs(v2 - va)
}

/** Hohmann transfer where the apogee burn also removes a plane change of `incChangeDeg` (combined burn). */
export function hohmannWithPlaneChangeKmS(fromAltKm: number, toAltKm: number, incChangeDeg: number): number {
  const r1 = semiMajorKm(fromAltKm)
  const r2 = semiMajorKm(toAltKm)
  const at = (r1 + r2) / 2
  const v1 = Math.sqrt(MU_KM3_S2 / r1)
  const v2 = Math.sqrt(MU_KM3_S2 / r2)
  const vp = Math.sqrt(MU_KM3_S2 * (2 / r1 - 1 / at))
  const va = Math.sqrt(MU_KM3_S2 * (2 / r2 - 1 / at))
  const burn2 = Math.sqrt(va ** 2 + v2 ** 2 - 2 * va * v2 * Math.cos(rad(incChangeDeg)))
  return vp - v1 + burn2
}

/** Tsiolkovsky: fraction of initial mass left after a burn of dvKmS with engine Isp (s). */
export const massRatioAfterBurn = (dvKmS: number, ispS: number) => Math.exp(-(dvKmS * 1000) / (ispS * G0))

/** Ground sample distance scales linearly with altitude for the same optics. */
export const scaleWithAltitude = (valueAtRef: number, refAltKm: number, altKm: number) => (valueAtRef * altKm) / refAltKm

/** Days between looks at the same spot (single satellite, nadir swath). */
export const revisitDays = (swathKm: number, altKm: number, latDeg = 0) =>
  (EARTH_CIRCUMFERENCE_KM * Math.cos(rad(latDeg))) / orbitsPerDay(altKm) / swathKm

/** Earth-central half-angle in view of a ground station above minimum elevation. */
export function stationHalfAngleDeg(altKm: number, minElevDeg = 10): number {
  const e = rad(minElevDeg)
  return deg(Math.acos((RE_KM * Math.cos(e)) / semiMajorKm(altKm)) - e)
}

/** Average usable pass length (s): max pass × 0.7 [GAME factor for non-overhead passes]. */
export const avgPassSec = (altKm: number, minElevDeg = 10) =>
  ((periodSec(altKm) * stationHalfAngleDeg(altKm, minElevDeg)) / 180) * 0.7

/** Half-angle, at the Earth's centre, of the cap of ground the satellite can see down to its horizon. */
export const horizonHalfAngleDeg = (altKm: number) => deg(Math.acos(RE_KM / semiMajorKm(altKm)))
