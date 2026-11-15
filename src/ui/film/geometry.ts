// 3D geometry for the mission film: where the spacecraft, the Sun and points on the ground are, and how the
// camera sees them. Pure functions, no drawing. Lengths are in Earth radii.
//
// It uses the same reference day as src/engine/track.ts, so what the film shows is what the engine computed:
// the spacecraft is over the same ground point at the same second, and it enters Earth's shadow exactly when
// missionDay() says it does.
import { SIDEREAL_DAY_S } from '../../engine/physics'
import { START_LON_DEG } from '../../engine/track'

export type Vec3 = [number, number, number]

const rad = (d: number) => (d * Math.PI) / 180

/** Direction of the orbit's ascending node (where it crosses the equator going north), measured from the X axis. */
export const NODE_DEG = -60
/** The camera sits this many degrees above the equator, looking at the Earth's centre from the +X side. */
export const CAMERA_ELEV_DEG = 18
/** How far the Earth has turned at the start of the day, chosen so the spacecraft starts over START_LON_DEG. */
export const EARTH_ANGLE0_DEG = NODE_DEG - START_LON_DEG

/**
 * The Sun lies in the orbit plane, along the node line. That is the worst case for eclipses, and the one the
 * engine's eclipseFraction() assumes, so the shadow drawn here has exactly the engine's length.
 */
export const SUN: Vec3 = [Math.cos(rad(NODE_DEG)), Math.sin(rad(NODE_DEG)), 0]

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

/** Unit vector to the spacecraft, `u` radians along its orbit from the ascending node. */
export function orbitDirection(inclDeg: number, u: number): Vec3 {
  const O = rad(NODE_DEG)
  const i = rad(inclDeg)
  return [Math.cos(O) * Math.cos(u) - Math.sin(O) * Math.sin(u) * Math.cos(i), Math.sin(O) * Math.cos(u) + Math.cos(O) * Math.sin(u) * Math.cos(i), Math.sin(u) * Math.sin(i)]
}

/** Unit vector to a point on the ground, `tS` seconds into the day: the Earth turns once per sidereal day. */
export function groundDirection(latDeg: number, lonDeg: number, tS: number): Vec3 {
  const a = rad(lonDeg + EARTH_ANGLE0_DEG + (360 * tS) / SIDEREAL_DAY_S)
  const lat = rad(latDeg)
  return [Math.cos(lat) * Math.cos(a), Math.cos(lat) * Math.sin(a), Math.sin(lat)]
}

/** True when a point (in Earth radii) is inside the Earth's shadow: behind the Earth as seen from the Sun. */
export function inShadow(p: Vec3): boolean {
  const along = dot(p, SUN)
  if (along >= 0) return false
  const perp2 = dot(p, p) - along * along
  return perp2 < 1
}

// Camera axes: `toward` points from the Earth to the camera, `right` and `up` span the screen.
const e = rad(CAMERA_ELEV_DEG)
const TOWARD: Vec3 = [Math.cos(e), 0, Math.sin(e)]
const RIGHT: Vec3 = [0, 1, 0]
const UP: Vec3 = [-Math.sin(e), 0, Math.cos(e)]

/** Orthographic view: x to the right, y down, depth positive toward the camera. All in Earth radii. */
export function project(p: Vec3): { x: number; y: number; depth: number } {
  return { x: dot(p, RIGHT), y: -dot(p, UP), depth: dot(p, TOWARD) }
}

/** The reverse of project() for a point on the visible face of the unit sphere (x² + y² ≤ 1). */
export function unprojectSphere(x: number, y: number): Vec3 {
  const z = Math.sqrt(Math.max(0, 1 - x * x - y * y))
  return [x * RIGHT[0] - y * UP[0] + z * TOWARD[0], x * RIGHT[1] - y * UP[1] + z * TOWARD[1], x * RIGHT[2] - y * UP[2] + z * TOWARD[2]]
}

/** True when a projected point is behind the Earth's disc. */
export const hiddenByEarth = (v: { x: number; y: number; depth: number }) => v.depth < 0 && v.x * v.x + v.y * v.y < 1

export const scale = (p: Vec3, k: number): Vec3 => [p[0] * k, p[1] * k, p[2] * k]
export const sunDot = (p: Vec3) => dot(p, SUN)
