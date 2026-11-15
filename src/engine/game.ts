import * as P from './physics'
import * as C from './catalog'
import { reason, reasonSources, SOURCE_ORDER, type Reason, type SourceId } from './sources'
import { contactPlan } from './track'

export interface Choice {
  scenarioId?: string
  orbitId?: string
  instrumentId?: string
  powerId?: string
  downlinkId?: string
  launchId?: string
}

export const TIER_ORDER: C.Tier[] = ['instrument', 'power', 'downlink', 'launch']
const TIER_KEY: Record<C.Tier, keyof Choice> = { instrument: 'instrumentId', power: 'powerId', downlink: 'downlinkId', launch: 'launchId' }

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d })
const fmtM = (m: number) => (m >= 1000 ? `${fmt(m / 1000, 1)} km` : `${fmt(m)} m`)

// ---------------- Act 1: orbit facts + 1–5 bars ----------------
export interface OrbitStats {
  periodMin: number
  maxLatDeg: number
  eclipseMin: number
  extraDvKmS: number // beyond a 200 km parking orbit
  coverageFraction: number
  continuousView: boolean
  bars: { fuel: number; coverage: number; lifetime: number }
}

export function orbitStats(o: C.Orbit): OrbitStats {
  const geo = o.altKm > 30000
  const extraDvKmS = geo
    ? P.hohmannWithPlaneChangeKmS(C.PARKING_ALT_KM, o.altKm, C.LAUNCH_SITE_LAT_DEG)
    : P.hohmannDvKmS(C.PARKING_ALT_KM, o.altKm) + (o.inclDeg > 90 ? C.SSO_ROTATION_PENALTY_KMS : 0)
  const coverageFraction = geo ? P.instantFootprintFraction(o.altKm) : P.latBandFraction(P.maxLatitudeDeg(o.inclDeg))
  const fuel = extraDvKmS < 0.3 ? 1 : extraDvKmS < 1 ? 2 : extraDvKmS < 2.5 ? 3 : extraDvKmS < 4 ? 4 : 5
  return {
    periodMin: P.periodSec(o.altKm) / 60,
    maxLatDeg: geo ? 0 : P.maxLatitudeDeg(o.inclDeg),
    eclipseMin: (P.eclipseFraction(o.altKm) * P.periodSec(o.altKm)) / 60,
    extraDvKmS,
    coverageFraction,
    continuousView: geo,
    bars: {
      fuel,
      coverage: Math.max(1, Math.min(5, Math.round(1 + 4 * coverageFraction))),
      lifetime: Math.max(1, Math.min(5, Math.round(o.lifetimeYears / 3))),
    },
  }
}

/** A Sun-synchronous launch flies towards the pole, so it cannot use Earth's eastward spin [S19]. */
const rotationSources = (o: C.Orbit): SourceId[] => (o.inclDeg > 90 ? [C.SSO_ROTATION_SOURCE] : [])

/** Sources behind an orbit card: its catalog sources, the mission its lifetime comes from, and the physics used for period, coverage and Δv. */
export const orbitSources = (o: C.Orbit): SourceId[] => sortSources([...o.sources, o.lifetimeSource, ...rotationSources(o), 'PHYS'])

/** The NASA resource(s) an orbit's altitude and inclination come from (empty for a purely physical orbit like GEO). */
const orbitNasaSources = (o: C.Orbit) => o.sources.filter((s) => s !== 'GAME' && s !== 'PHYS')

function sortSources(ids: SourceId[]): SourceId[] {
  const set = new Set(ids)
  return SOURCE_ORDER.filter((id) => set.has(id))
}

// ---------------- Mission requirements ----------------
export interface MissionRequirement {
  id: 'latitude' | 'coverage' | 'revisit'
  value: string
  label: string
}

/** A revisit target as short text: hours below one day, days otherwise. */
const fmtRevisit = (days: number) => (days < 1 ? `${fmt(days * 24)} h` : `${fmt(days)} d`)

/**
 * What a mission asks for, as the numbers the scorecard later measures against:
 * how far from the equator it must see, whether it needs the whole globe, and how often it must look again.
 * These targets are game values [GAME].
 */
export function missionRequirements(s: C.Scenario): { items: MissionRequirement[]; summary: string; source: SourceId } {
  const items: MissionRequirement[] = [
    { id: 'latitude', value: `±${fmt(s.needLatDeg)}°`, label: 'latitude reach' },
    { id: 'coverage', value: s.coverage === 'global' ? 'Global' : 'Regional', label: 'coverage' },
    { id: 'revisit', value: fmtRevisit(s.targetRevisitDays), label: 'revisit' },
  ]
  return {
    items,
    summary: `observe up to ${fmt(s.needLatDeg)}° latitude, ${s.coverage} coverage, revisit every ${s.targetRevisitDays < 1 ? `${fmt(s.targetRevisitDays * 24)} hours` : `${fmt(s.targetRevisitDays)} days`}, budget $${fmt(s.budgetM)}M`,
    source: 'GAME',
  }
}

// ---------------- Act 2: per-option viability ----------------
export interface NodeState {
  id: string
  name: string
  /** Plain-English description of the option, from the catalog. Contains no numbers, so it needs no source chip. */
  tip: string
  ok: boolean
  reasons: Reason[]
  facts: string[]
  /** Source of the numbers in `facts` (catalog values, so usually illustrative). */
  factsSource: SourceId
}

const orbitOf = (c: Choice) => C.byId(C.ORBITS, c.orbitId)
const isGeo = (o: C.Orbit) => o.altKm > 30000

function instrumentNode(o: C.Orbit, ins: C.Instrument): NodeState {
  const gsd = P.scaleWithAltitude(ins.gsdRefM, ins.refAltKm, o.altKm)
  const reasons: Reason[] = []
  let ok = true
  if (gsd > ins.maxUsefulGsdM) {
    ok = false
    // The scaling is physics; the "useful" threshold is a game value.
    reasons.push(reason(`From ${fmt(o.altKm)} km each pixel would cover ${fmtM(gsd)} — too blurry (needs ≤ ${fmtM(ins.maxUsefulGsdM)}).`, 'PHYS', 'GAME'))
  }
  if (ins.maxRangeKm && o.altKm > ins.maxRangeKm) {
    ok = false
    const weaker = (o.altKm / ins.maxRangeKm) ** 4
    // The distance⁴ law is physics; the practical range limit is a game value; where real radars fly is sourced.
    reasons.push(reason(`Radar echoes fade with distance⁴: at ${fmt(o.altKm)} km the signal is ~${fmt(weaker)}× weaker than at ${fmt(ins.maxRangeKm)} km.`, 'PHYS', 'GAME'))
    reasons.push(reason('Real imaging radars fly much lower: NISAR at 747 km and Sentinel-1 at 693 km.', C.RADAR_ORBIT_SOURCES[0], ...C.RADAR_ORBIT_SOURCES.slice(1)))
  }
  if (ins.needsContinuousView && !isGeo(o)) {
    ok = false
    reasons.push(reason(`Weather tracking needs a non-stop view; in ${o.short} the satellite flies past each place in minutes.`, 'PHYS'))
  }
  if (ok) reasons.push(reason(`Works from ${o.short}: ${fmtM(gsd)} per pixel.`, ins.source, 'PHYS'))
  return { id: ins.id, name: ins.name, tip: ins.tip, ok, reasons, facts: [`${fmtM(gsd)}/pixel`, `${ins.powerW} W`, `${ins.massKg} kg`, `$${ins.costM}M`], factsSource: 'GAME' }
}

/** Orbit-average electrical load: the bus plus the instrument at its duty cycle. */
export function averageLoadW(o: C.Orbit, ins?: C.Instrument) {
  const duty = isGeo(o) ? 1 : 0.3 // LEO imagers only work over targets in daylight [GAME]
  return C.BUS_POWER_W + (ins?.powerW ?? 0) * duty
}

/** Orbit-average generation: panels only produce power outside Earth's shadow. */
export const averageGenerationW = (o: C.Orbit, pw: C.PowerSystem) => pw.peakW * pw.sunFactor * (1 - P.eclipseFraction(o.altKm))

export function powerBudget(o: C.Orbit, ins: C.Instrument, pw: C.PowerSystem) {
  const geo = isGeo(o)
  const avgLoadW = averageLoadW(o, ins)
  const ecl = P.eclipseFraction(o.altKm)
  const genW = averageGenerationW(o, pw)
  const eclipseH = (ecl * P.periodSec(o.altKm)) / 3600
  const peakLoadW = C.BUS_POWER_W + ins.powerW * (geo ? 1 : 0.6)
  const batteryNeedWh = (peakLoadW * eclipseH) / C.maxDepthOfDischarge(o.altKm)
  return { avgLoadW, genW, batteryNeedWh, eclipseMin: eclipseH * 60 }
}

function powerNode(o: C.Orbit, ins: C.Instrument, pw: C.PowerSystem): NodeState {
  const b = powerBudget(o, ins, pw)
  const reasons: Reason[] = []
  let ok = true
  // Eclipse time is physics; panel output and loads are game values; the depth of discharge follows NASA battery tests.
  const dod = C.depthOfDischargeSource(o.altKm)
  if (b.genW < b.avgLoadW) {
    ok = false
    reasons.push(reason(`Panels make ~${fmt(b.genW)} W on average, but the spacecraft needs ${fmt(b.avgLoadW)} W.`, 'PHYS', 'GAME'))
    if (!pw.deployable)
      reasons.push(reason(`These panels are fixed to the body. NASA's CubeSat 101 describes deployable solar panels that "will nearly double the power input to the spacecraft".`, 'S2'))
  }
  if (pw.batteryWh < b.batteryNeedWh) {
    ok = false
    reasons.push(reason(`Each ${fmt(b.eclipseMin)}-min eclipse needs a ${fmt(b.batteryNeedWh)} Wh battery; this one has ${fmt(pw.batteryWh)} Wh.`, 'PHYS', dod, 'GAME'))
  }
  if (ok) reasons.push(reason(`${fmt(b.genW)} W generated vs ${fmt(b.avgLoadW)} W used; battery covers the ${fmt(b.eclipseMin)}-min eclipse.`, 'PHYS', dod, 'GAME'))
  return { id: pw.id, name: pw.name, tip: pw.tip, ok, reasons, facts: [`${pw.peakW} W peak`, `${pw.batteryWh} Wh`, `${pw.massKg} kg`, `$${pw.costM}M`], factsSource: 'GAME' }
}

export function downlinkCapacity(o: C.Orbit, dl: C.Downlink): { gbitPerDay: number; note: Reason } {
  if (dl.kind === 'continuous') {
    const g = (dl.rateMbps * 86400 * 0.9) / 1000
    return isGeo(o)
      ? { gbitPerDay: g, note: reason('GEO is always in view of its ground station.', 'PHYS') }
      : { gbitPerDay: g, note: reason(`From ${o.short} a non-stop link needs a relay satellite (+$${C.RELAY_COST_PER_YEAR_M}M/yr).`, 'GAME') }
  }
  if (isGeo(o)) return { gbitPerDay: 0, note: reason('A GEO satellite never "passes" a station — it is always in view. Use Continuous Link.', 'PHYS') }
  const lat = dl.stationLatDeg ?? 0
  const reach = P.maxLatitudeDeg(o.inclDeg) + P.stationHalfAngleDeg(o.altKm)
  if (lat > reach)
    return {
      gbitPerDay: 0,
      // Geometry is physics; the orbit's inclination comes from its NASA source; the station latitude is a game value.
      note: reason(`A ${fmt(lat)}° station is out of reach: ${o.short} never goes beyond ${fmt(P.maxLatitudeDeg(o.inclDeg), 1)}°.`, 'PHYS', ...orbitNasaSources(o), 'GAME'),
    }
  // Passes are not assumed: they come from the orbit's ground track over the station on the reference day [PHYS].
  // The station's position and the downlink rate are game values [GAME].
  const plan = contactPlan(o, lat, dl.stationLonDeg ?? 0)
  return {
    gbitPerDay: (plan.contactSec * dl.rateMbps) / 1000,
    note: reason(`${plan.passes} passes a day over the station, ${fmt(plan.contactSec / 60)} min in contact in total.`, 'PHYS', 'GAME'),
  }
}

function downlinkNode(o: C.Orbit, ins: C.Instrument, dl: C.Downlink): NodeState {
  const cap = downlinkCapacity(o, dl)
  const ok = cap.gbitPerDay >= ins.dataGbitPerDay
  const reasons: Reason[] = [cap.note]
  if (cap.gbitPerDay > 0 && !ok)
    reasons.push(reason(`Only ${fmt((100 * cap.gbitPerDay) / ins.dataGbitPerDay)}% of the ${fmt(ins.dataGbitPerDay)} Gbit collected per day reaches Earth.`, 'GAME', 'PHYS'))
  if (ok) reasons.push(reason(`${fmt(cap.gbitPerDay)} Gbit/day capacity ≥ ${fmt(ins.dataGbitPerDay)} Gbit/day collected.`, 'GAME', 'PHYS'))
  else reasons.push(reason(`NASA's CubeSat 101 warns: "Launching with an inadequate ground station is a mission killer."`, 'S2'))
  return { id: dl.id, name: dl.name, tip: dl.tip, ok, reasons, facts: [`${fmt(cap.gbitPerDay)} Gbit/day`, `$${downlinkCostPerYear(o, dl)}M/yr`], factsSource: 'GAME' }
}

const downlinkCostPerYear = (o: C.Orbit, dl: C.Downlink) => (dl.kind === 'continuous' && !isGeo(o) ? C.RELAY_COST_PER_YEAR_M : dl.costPerYearM)

export function launchCapacityKg(o: C.Orbit, lv: C.LaunchVehicle) {
  return lv.leoCapacityKg * P.massRatioAfterBurn(orbitStats(o).extraDvKmS, C.UPPER_STAGE_ISP_S)
}

export function spacecraftMassKg(c: Choice) {
  return C.BUS_MASS_KG + (C.byId(C.INSTRUMENTS, c.instrumentId)?.massKg ?? 0) + (C.byId(C.POWER, c.powerId)?.massKg ?? 0)
}

function launchNode(o: C.Orbit, c: Choice, lv: C.LaunchVehicle): NodeState {
  const cap = launchCapacityKg(o, lv)
  const mass = spacecraftMassKg(c)
  const ok = cap >= mass
  // The rocket equation is physics; rocket capacity, engine efficiency and component masses are game values.
  const reasons: Reason[] = [
    reason(`Rocket equation: reaching ${o.short} costs ${fmt(orbitStats(o).extraDvKmS, 2)} km/s beyond a 200 km orbit, so ${fmt(lv.leoCapacityKg)} kg shrinks to ${fmt(cap)} kg.`, 'PHYS', ...rotationSources(o), 'GAME'),
    ok ? reason(`Your ${fmt(mass)} kg spacecraft fits.`, 'GAME') : reason(`Your spacecraft is ${fmt(mass)} kg — too heavy for this rocket.`, 'GAME'),
  ]
  return { id: lv.id, name: lv.name, tip: lv.tip, ok, reasons, facts: [`${fmt(cap)} kg to ${o.short}`, `$${lv.costM}M`], factsSource: 'GAME' }
}

/** Options for a tier given upstream choices. Empty if upstream not chosen yet. */
export function tierOptions(tier: C.Tier, c: Choice): NodeState[] {
  const o = orbitOf(c)
  if (!o) return []
  if (tier === 'instrument') return C.INSTRUMENTS.map((i) => instrumentNode(o, i))
  const ins = C.byId(C.INSTRUMENTS, c.instrumentId)
  if (!ins) return []
  if (tier === 'power') return C.POWER.map((p) => powerNode(o, ins, p))
  if (!c.powerId) return []
  if (tier === 'downlink') return C.DOWNLINKS.map((d) => downlinkNode(o, ins, d))
  if (!c.downlinkId) return []
  return C.LAUNCHERS.map((l) => launchNode(o, c, l))
}

/** Picking an upstream node clears everything below it. */
export function choose(c: Choice, tier: C.Tier | 'orbit', id: string): Choice {
  if (tier === 'orbit') return { scenarioId: c.scenarioId, orbitId: id }
  const next: Choice = { ...c, [TIER_KEY[tier]]: id }
  for (const t of TIER_ORDER.slice(TIER_ORDER.indexOf(tier) + 1)) delete next[TIER_KEY[t]]
  return next
}

export const isComplete = (c: Choice) => Boolean(c.scenarioId && c.orbitId && c.instrumentId && c.powerId && c.downlinkId && c.launchId)

// ---------------- Budget meter ----------------
/** Budgets and costs are illustrative game values. */
export const BUDGET_SOURCE: SourceId = 'GAME'

export function budget(c: Choice) {
  const s = C.byId(C.SCENARIOS, c.scenarioId)
  const o = orbitOf(c)
  const items: { label: string; costM: number }[] = []
  if (o && c.instrumentId) items.push({ label: 'Spacecraft bus', costM: C.BUS_COST_M })
  const ins = C.byId(C.INSTRUMENTS, c.instrumentId)
  if (ins) items.push({ label: ins.name, costM: ins.costM })
  const pw = C.byId(C.POWER, c.powerId)
  if (pw) items.push({ label: pw.name, costM: pw.costM })
  const dl = C.byId(C.DOWNLINKS, c.downlinkId)
  if (o && dl) items.push({ label: `${dl.name} × ${o.lifetimeYears} yr`, costM: downlinkCostPerYear(o, dl) * o.lifetimeYears })
  const lv = C.byId(C.LAUNCHERS, c.launchId)
  if (lv) items.push({ label: lv.name, costM: lv.costM })
  const spentM = items.reduce((a, b) => a + b.costM, 0)
  const totalM = s?.budgetM ?? 0
  return { items, spentM, totalM, reserveFraction: totalM ? (totalM - spentM) / totalM : 0 }
}

// ---------------- Resource panel ----------------
export interface ResourceMeter {
  id: 'budget' | 'mass' | 'power' | 'data'
  label: string
  used: number
  /** What `used` must stay under. Null until the tier that sets it has been chosen. */
  limit: number | null
  /** Ready-to-show value, e.g. "390 / 1,207 kg". */
  text: string
  /** What to pick to get a limit, shown while `limit` is null. */
  hint?: string
  /** Above this the meter turns amber (still within the limit). */
  warnAbove?: number
  over: boolean
  sources: SourceId[]
}

/**
 * The four resources the challenge asks players to manage, recomputed from the current design.
 * They use the same numbers as the tier locks, so a meter can never disagree with a lock.
 */
export function resources(c: Choice): ResourceMeter[] {
  const o = orbitOf(c)
  const ins = C.byId(C.INSTRUMENTS, c.instrumentId)
  const pw = C.byId(C.POWER, c.powerId)
  const dl = C.byId(C.DOWNLINKS, c.downlinkId)
  const lv = C.byId(C.LAUNCHERS, c.launchId)
  const b = budget(c)

  const meter = (id: ResourceMeter['id'], label: string, used: number, limit: number | null, unit: string, hint: string, sources: SourceId[]): ResourceMeter => ({
    id,
    label,
    used,
    limit,
    text: limit === null ? `${fmt(used)} ${unit}` : `${fmt(used)} / ${fmt(limit)} ${unit}`,
    hint: limit === null ? hint : undefined,
    over: limit !== null && used > limit,
    sources,
  })

  const out: ResourceMeter[] = [
    {
      id: 'budget',
      label: 'Budget',
      used: b.spentM,
      limit: b.totalM,
      text: `$${fmt(b.spentM)} / $${fmt(b.totalM)}M`,
      warnAbove: b.totalM * (1 - C.RESERVE_FRACTION), // eating into the 10% reserve [S2]
      over: b.spentM > b.totalM,
      sources: [BUDGET_SOURCE],
    },
  ]
  if (!o) return out
  out.push(
    // Capacity to orbit comes from the rocket equation; component and rocket masses are game values.
    meter('mass', 'Mass', spacecraftMassKg(c), lv ? launchCapacityKg(o, lv) : null, 'kg', 'pick a launch vehicle', lv ? ['PHYS', 'GAME'] : ['GAME']),
    // Used vs generated, both averaged over one orbit including the eclipse.
    meter('power', 'Power', averageLoadW(o, ins), pw ? averageGenerationW(o, pw) : null, 'W', 'pick a power system', pw ? ['PHYS', 'GAME'] : ['GAME']),
    // Collected by the instrument vs what the downlink can deliver per day.
    meter('data', 'Data', ins?.dataGbitPerDay ?? 0, dl ? downlinkCapacity(o, dl).gbitPerDay : null, 'Gbit/day', 'pick a downlink', dl ? ['GAME', 'PHYS'] : ['GAME']),
  )
  return out
}

// ---------------- Go/No-Go poll ----------------
export const TEAM_ROLES = 4
export const TEAM_POINTS_MAX = 15
/** One to four people share the screen; each player holds one or more of the four roles and casts one vote. */
export const MAX_PLAYERS = TEAM_ROLES
export const clampPlayers = (players: number) => Math.max(1, Math.min(MAX_PLAYERS, Math.round(players) || 1))

/** Which roles each player holds, by team size. Every role belongs to exactly one player [GAME]. */
export function playerRoles(players: number): C.Role[][] {
  switch (clampPlayers(players)) {
    case 1:
      return [['science', 'space', 'ground', 'launch']]
    case 2:
      return [['science', 'space'], ['ground', 'launch']]
    case 3:
      return [['science', 'space'], ['ground'], ['launch']]
    default:
      return [['science'], ['space'], ['ground'], ['launch']]
  }
}

/**
 * Collaboration points: a unanimous Go earns them all, whatever the team size. A mission launched over No-Go votes
 * keeps only the share of players that agreed, so overriding a teammate has a visible cost [GAME].
 */
export function teamPoints(goVotes: number, players: number = TEAM_ROLES) {
  const n = clampPlayers(players)
  return Math.round((TEAM_POINTS_MAX * Math.max(0, Math.min(n, goVotes))) / n)
}

// ---------------- Mission run + scorecard ----------------
/** A mission succeeds when it stays within budget and scores at least this many points [GAME]. */
export const SUCCESS_SCORE_MIN = 50

export interface TimelineStep extends Reason {
  label: string
}

export interface Scorecard {
  score: number
  success: boolean
  /** The score and its breakdown are an illustrative game formula. */
  scoreSource: SourceId
  breakdown: { label: string; points: number; max: number }[]
  primaryConstraint: Reason
  biggestImpact: Reason
  lesson: Reason
  timeline: TimelineStep[]
  /** Every source cited anywhere in this mission (design reasons, simulation, scorecard), in display order. */
  sources: SourceId[]
}

export function evaluateMission(c: Choice, goVotes: number, players: number = TEAM_ROLES): Scorecard {
  const s = C.byId(C.SCENARIOS, c.scenarioId)!
  const o = orbitOf(c)!
  const ins = C.byId(C.INSTRUMENTS, c.instrumentId)!
  const dl = C.byId(C.DOWNLINKS, c.downlinkId)!
  const lv = C.byId(C.LAUNCHERS, c.launchId)!
  const st = orbitStats(o)
  const b = budget(c)
  const nasa = orbitNasaSources(o)

  const fit = s.instrumentFit[ins.id]
  const coverage = isGeo(o)
    ? s.coverage === 'regional' ? 1 : st.coverageFraction / P.latBandFraction(s.needLatDeg)
    : Math.min(1, st.maxLatDeg / s.needLatDeg)
  const swath = P.scaleWithAltitude(ins.swathRefKm, ins.refAltKm, o.altKm)
  const revisit = isGeo(o) ? 0.01 : P.revisitDays(swath, o.altKm, Math.min(s.revisitLatDeg, st.maxLatDeg))
  const revisitFactor = Math.min(1, s.targetRevisitDays / revisit)
  const dataFactor = Math.min(1, downlinkCapacity(o, dl).gbitPerDay / ins.dataGbitPerDay)
  const overBudget = b.spentM > b.totalM
  const budgetPts = overBudget ? 0 : b.reserveFraction >= C.RESERVE_FRACTION ? 15 : 9

  const sciencePts = Math.round(50 * fit.fit * Math.min(1, coverage) * (0.5 + 0.5 * revisitFactor))
  const dataPts = Math.round(20 * dataFactor)
  const teamPts = teamPoints(goVotes, players)
  const score = Math.min(100, sciencePts + dataPts + budgetPts + teamPts)

  const factors = [
    { name: `instrument fit (${ins.name})`, loss: 1 - fit.fit },
    { name: `coverage (${o.short} reaches ${fmt(st.maxLatDeg, 1)}°, target needs ${s.needLatDeg}°)`, loss: 1 - Math.min(1, coverage) },
    { name: `revisit (${revisit < 0.1 ? 'continuous' : fmt(revisit, 1) + ' days'} vs ${s.targetRevisitDays} wanted)`, loss: (1 - revisitFactor) / 2 },
  ].sort((a, b2) => b2.loss - a.loss)

  const primaryConstraint = reason(
    `Choosing ${o.short} (${fmt(o.altKm)} km, ${o.inclDeg}°) set everything else: ` +
      (isGeo(o) ? 'it gave a non-stop view but put the spacecraft so far away that only coarse imagers work and a heavy rocket is needed.' : `the ground track reaches ${fmt(st.maxLatDeg, 1)}° and each look covers a ${fmt(swath)} km swath.`),
    'PHYS',
    ...nasa,
    ins.source,
  )
  const biggestImpact = reason(factors[0].loss > 0.01 ? `Biggest point loss: ${factors[0].name}.` : 'No major losses — every choice fit the objective.', 'GAME')
  const lesson = reason(fit.why, fit.source)

  const delivered = Math.min(ins.dataGbitPerDay, downlinkCapacity(o, dl).gbitPerDay)
  const timeline: TimelineStep[] = [
    { label: 'Launch', ...reason(`${lv.name} lifts ${fmt(spacecraftMassKg(c))} kg (capacity ${fmt(launchCapacityKg(o, lv))} kg to ${o.short}).`, 'PHYS', 'GAME') },
    { label: 'Orbit reached', ...reason(`${o.name}: one lap every ${fmt(st.periodMin, 1)} min, ${fmt(st.eclipseMin)} min in shadow.`, 'PHYS', ...nasa) },
    { label: 'First light', ...reason(`${ins.name} sees ${fmtM(P.scaleWithAltitude(ins.gsdRefM, ins.refAltKm, o.altKm))} per pixel.`, ins.source, 'PHYS') },
    { label: 'Daily operations', ...reason(`${fmt(delivered)} of ${fmt(ins.dataGbitPerDay)} Gbit/day reach Earth.`, 'GAME', 'PHYS') },
    { label: 'Coverage', ...reason(revisit < 0.1 ? 'Same hemisphere in view all the time.' : `Revisits each spot about every ${fmt(revisit, 1)} days.`, 'PHYS', ins.source) },
    { label: 'End of mission', ...reason(`~${o.lifetimeYears} years of operations. Budget used: $${fmt(b.spentM)}M of $${b.totalM}M.`, o.lifetimeSource, 'GAME') },
  ]

  // Collect every source the player saw on the way here, so the scorecard list is never out of date.
  const chosen = TIER_ORDER.flatMap((tier) => tierOptions(tier, c).filter((n) => n.id === c[TIER_KEY[tier]]))
  const cited: SourceId[] = [
    'S1', // physical constants behind every formula
    'S3', // the four mission segments used as team roles
    'S2', // 10% budget reserve rule
    'S12', // the Earth image in the mission film
    ...orbitSources(o),
    ...chosen.flatMap((n) => [n.factsSource, ...n.reasons.flatMap(reasonSources)]),
    ...[primaryConstraint, biggestImpact, lesson, ...timeline].flatMap(reasonSources),
  ]

  return {
    score,
    success: !overBudget && score >= SUCCESS_SCORE_MIN,
    scoreSource: 'GAME',
    breakdown: [
      { label: 'Science return', points: sciencePts, max: 50 },
      { label: 'Data delivered', points: dataPts, max: 20 },
      { label: 'Budget & reserve', points: budgetPts, max: 15 },
      { label: 'Team Go/No-Go', points: teamPts, max: TEAM_POINTS_MAX },
    ],
    primaryConstraint,
    biggestImpact,
    lesson,
    timeline,
    sources: sortSources(cited),
  }
}
