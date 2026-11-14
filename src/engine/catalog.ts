import { GEO_ALTITUDE_KM } from './physics'
import type { SourceId } from './sources'

// Roles follow NASA's four mission segments [S3].
export type Role = 'science' | 'space' | 'ground' | 'launch'
export type Tier = 'instrument' | 'power' | 'downlink' | 'launch'

export const TIER_ROLE: Record<Tier, Role> = { instrument: 'science', power: 'space', downlink: 'ground', launch: 'launch' }
export const ROLE_LABEL: Record<Role, string> = { science: 'Science', space: 'Spacecraft', ground: 'Ground', launch: 'Launch' }
export const TIER_LABEL: Record<Tier, string> = {
  instrument: 'Scientific instrument',
  power: 'Power system',
  downlink: 'Data downlink',
  launch: 'Launch vehicle',
}

// ---------- Mission briefs (objective comes first, as the challenge asks) ----------
export interface Scenario {
  id: string
  title: string
  story: string
  needLatDeg: number // highest latitude that must be observed
  coverage: 'global' | 'regional'
  targetRevisitDays: number
  revisitLatDeg: number // latitude where revisit matters most
  budgetM: number // $M [GAME]
  instrumentFit: Record<string, { fit: number; why: string; source: SourceId }>
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'crops',
    title: 'Crop Watch',
    story: 'Track the health of farmland worldwide (up to 60° latitude) every couple of weeks.',
    needLatDeg: 60,
    coverage: 'global',
    targetRevisitDays: 16,
    revisitLatDeg: 30,
    budgetM: 200,
    instrumentFit: {
      multispectral: { fit: 1, why: 'Multispectral bands reveal plant health — the same reason Landsat supports agriculture and water use.', source: 'S6' },
      radar: { fit: 0.6, why: 'Radar sees through clouds, but has no color bands to measure plant health.', source: 'GAME' },
      hires: { fit: 0.5, why: 'Very sharp, but its narrow swath takes months to cover all farmland.', source: 'GAME' },
      weather: { fit: 0.1, why: 'Kilometre-scale pixels are far too coarse to see individual fields.', source: 'GAME' },
    },
  },
  {
    id: 'storms',
    title: 'Storm Watch',
    story: 'Follow hurricanes over the Americas with a new image every few minutes.',
    needLatDeg: 40,
    coverage: 'regional',
    targetRevisitDays: 0.25,
    revisitLatDeg: 25,
    budgetM: 300,
    instrumentFit: {
      weather: { fit: 1, why: 'A weather imager staring at the same hemisphere sees storms evolve minute by minute.', source: 'GAME' },
      radar: { fit: 0.4, why: 'Radar sees inside clouds, but only when it happens to fly over the storm.', source: 'GAME' },
      multispectral: { fit: 0.3, why: 'Good images, but a storm moves far between passes.', source: 'GAME' },
      hires: { fit: 0.1, why: 'Its tiny swath cannot frame a storm hundreds of km wide.', source: 'GAME' },
    },
  },
  {
    id: 'ice',
    title: 'Polar Ice',
    story: 'Measure Arctic sea ice up to 80° latitude — including during the months-long polar night.',
    needLatDeg: 80,
    coverage: 'global',
    targetRevisitDays: 3,
    revisitLatDeg: 75,
    budgetM: 250,
    instrumentFit: {
      radar: { fit: 1, why: 'Radar brings its own illumination, so it works in polar night and through clouds.', source: 'PHYS' },
      multispectral: { fit: 0.5, why: 'Cameras need sunlight — they go blind for months during polar night.', source: 'PHYS' },
      hires: { fit: 0.3, why: 'Needs sunlight and covers a tiny area of a huge ice sheet.', source: 'GAME' },
      weather: { fit: 0.2, why: 'From the equator it sees the Arctic only at a very low angle.', source: 'GAME' },
    },
  },
]

// ---------- Act 1: trajectories ----------
export interface Orbit {
  id: string
  name: string
  short: string
  altKm: number
  inclDeg: number
  lifetimeYears: number
  blurb: string
  sources: SourceId[]
}

export const ORBITS: Orbit[] = [
  {
    id: 'leo',
    name: 'Low Earth Orbit',
    short: 'LEO',
    altKm: 500,
    inclDeg: 51.6,
    lifetimeYears: 5,
    blurb: 'Close to Earth and cheap to reach. Same 51.6° tilt as the Space Station, so it never flies over the poles.',
    sources: ['S10', 'GAME'],
  },
  {
    id: 'sso',
    name: 'Sun-Synchronous Orbit',
    short: 'SSO',
    altKm: 705,
    inclDeg: 98.2,
    lifetimeYears: 10,
    blurb: 'Near-polar orbit that passes every place at the same local time. Landsat 9 flies here.',
    sources: ['S6', 'GAME'],
  },
  {
    id: 'geo',
    name: 'Geostationary Orbit',
    short: 'GEO',
    altKm: Math.round(GEO_ALTITUDE_KM),
    inclDeg: 0,
    lifetimeYears: 15,
    blurb: 'One orbit per day, so it hovers over the same spot — but it is ~36,000 km away.',
    sources: ['PHYS', 'GAME'],
  },
]

// ---------- Tier 2: instruments (Science role) ----------
export interface Instrument {
  id: string
  name: string
  /** Plain-English tooltip: what this option is, in one or two sentences. Copy owner: Belle (see docs/COPY.md). */
  tip: string
  gsdRefM: number
  swathRefKm: number
  refAltKm: number
  maxUsefulGsdM: number
  maxRangeKm?: number // active sensors lose signal with distance
  needsContinuousView?: boolean
  powerW: number
  massKg: number
  dataGbitPerDay: number
  costM: number
  source: SourceId
}

export const INSTRUMENTS: Instrument[] = [
  { id: 'hires', name: 'High-Res Camera', gsdRefM: 0.5, swathRefKm: 15, refAltKm: 500, maxUsefulGsdM: 5, powerW: 80, massKg: 80, dataGbitPerDay: 500, costM: 60, source: 'GAME', tip: "A telescope-like camera that sees fine detail, such as single buildings. It only captures a narrow strip of ground on each pass." },
  { id: 'multispectral', name: 'Multispectral Imager', gsdRefM: 30, swathRefKm: 185, refAltKm: 705, maxUsefulGsdM: 100, powerW: 60, massKg: 70, dataGbitPerDay: 150, costM: 40, source: 'S6', tip: "A camera that records several colors of light, including some our eyes cannot see. Those extra colors reveal how healthy plants are." },
  { id: 'radar', name: 'Imaging Radar', gsdRefM: 10, swathRefKm: 100, refAltKm: 700, maxUsefulGsdM: 50, maxRangeKm: 1000, powerW: 400, massKg: 150, dataGbitPerDay: 200, costM: 90, source: 'GAME', tip: "It sends out radio pulses and listens for the echo, so it can see at night and through clouds. It needs a lot of power." },
  { id: 'weather', name: 'Weather Imager', gsdRefM: 1000, swathRefKm: 2000, refAltKm: 35786, maxUsefulGsdM: 4000, needsContinuousView: true, powerW: 150, massKg: 200, dataGbitPerDay: 100, costM: 70, source: 'GAME', tip: "A wide-angle camera that watches a whole side of the Earth at once. It trades fine detail for a constant view." },
]

// ---------- Tier 3: power (Spacecraft role) ----------
export interface PowerSystem {
  id: string
  name: string
  /** Plain-English tooltip: what this option is, in one or two sentences. Copy owner: Belle (see docs/COPY.md). */
  tip: string
  peakW: number
  sunFactor: number // body-mounted panels rarely face the Sun; deployable arrays track it
  batteryWh: number
  massKg: number
  costM: number
}

export const POWER: PowerSystem[] = [
  { id: 'standard', name: 'Standard Power', peakW: 400, sunFactor: 0.35, batteryWh: 300, massKg: 20, costM: 5, tip: "Solar cells fixed to the spacecraft body, with a small battery. Light and cheap, but they rarely face the Sun directly." },
  { id: 'extended', name: 'Extended Power', peakW: 800, sunFactor: 0.8, batteryWh: 500, massKg: 60, costM: 15, tip: "Large solar wings that turn to follow the Sun. Plenty of power in sunlight, with a medium battery for the shadow." },
  { id: 'hybrid', name: 'Solar + Battery Hybrid', peakW: 600, sunFactor: 0.8, batteryWh: 2000, massKg: 90, costM: 20, tip: "Sun-tracking solar wings plus a big battery. The battery keeps a power-hungry instrument running through Earth's shadow." },
]
export const BUS_POWER_W = 50
export const BUS_MASS_KG = 150
export const BUS_COST_M = 30
/** Max battery depth of discharge: LEO batteries cycle ~15×/day, GEO only in eclipse seasons [GAME, verify with mentor]. */
export const maxDepthOfDischarge = (altKm: number) => (altKm > 20000 ? 0.7 : 0.3)

// ---------- Tier 4: downlink (Ground role) ----------
export interface Downlink {
  id: string
  name: string
  /** Plain-English tooltip: what this option is, in one or two sentences. Copy owner: Belle (see docs/COPY.md). */
  tip: string
  rateMbps: number
  kind: 'single-station' | 'polar-network' | 'continuous'
  costPerYearM: number
  stationLatDeg?: number
}

export const DOWNLINKS: Downlink[] = [
  { id: 'daily', name: 'Daily Pass (1 ground station)', rateMbps: 300, kind: 'single-station', costPerYearM: 2, stationLatDeg: 35, tip: "One ground antenna that talks to the spacecraft whenever it flies overhead. Simple and cheap, but contact time is short." },
  { id: 'polar', name: 'Polar Station Network', rateMbps: 300, kind: 'polar-network', costPerYearM: 4, stationLatDeg: 78, tip: "Antennas near the pole, where satellites on polar orbits fly over on almost every lap. More contacts mean more data." },
  { id: 'continuous', name: 'Continuous Link', rateMbps: 150, kind: 'continuous', costPerYearM: 1, tip: "A link that never drops. It comes naturally from an orbit that hovers over one spot; lower orbits need a relay satellite to pass the signal on." },
]
/** Continuous link from LEO/SSO needs a relay satellite — much more expensive per year [GAME]. */
export const RELAY_COST_PER_YEAR_M = 6

// ---------- Tier 5: launch (Launch role) ----------
export interface LaunchVehicle {
  id: string
  name: string
  /** Plain-English tooltip: what this option is, in one or two sentences. Copy owner: Belle (see docs/COPY.md). */
  tip: string
  leoCapacityKg: number // to a 200 km parking orbit
  costM: number
}

export const LAUNCHERS: LaunchVehicle[] = [
  { id: 'small', name: 'Small Launcher', leoCapacityKg: 300, costM: 10, tip: "A small rocket for light spacecraft. The cheapest ride, but it cannot lift much or push it far." },
  { id: 'medium', name: 'Medium Launcher', leoCapacityKg: 1500, costM: 50, tip: "A mid-size rocket with room to spare for most Earth-observation spacecraft." },
  { id: 'heavy', name: 'Heavy Launcher', leoCapacityKg: 8000, costM: 120, tip: "A large rocket that can carry heavy spacecraft to distant orbits. The most expensive option." },
]
export const PARKING_ALT_KM = 200
export const UPPER_STAGE_ISP_S = 320 // typical storable-propellant upper stage [GAME]
export const LAUNCH_SITE_LAT_DEG = 28.5 // a GEO launch must remove this inclination [PHYS]
/** Retrograde (SSO) launches lose Earth's eastward rotation boost (~0.4 km/s) [PHYS, simplified]. */
export const SSO_ROTATION_PENALTY_KMS = 0.4
export const RESERVE_FRACTION = 0.1 // "project reserves of at least 10%" [S2, CubeSat 101 p. 13 — verified, see sources.ts]

export const byId = <T extends { id: string }>(list: T[], id?: string) => list.find((x) => x.id === id)
