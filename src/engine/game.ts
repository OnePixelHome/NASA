import * as P from './physics'
import * as C from './catalog'
import type { Reason } from './sources'

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

// ---------------- Act 2: per-option viability ----------------
export interface NodeState {
  id: string
  name: string
  ok: boolean
  reasons: Reason[]
  facts: string[]
}

const orbitOf = (c: Choice) => C.byId(C.ORBITS, c.orbitId)
const isGeo = (o: C.Orbit) => o.altKm > 30000

function instrumentNode(o: C.Orbit, ins: C.Instrument): NodeState {
  const gsd = P.scaleWithAltitude(ins.gsdRefM, ins.refAltKm, o.altKm)
  const reasons: Reason[] = []
  let ok = true
  if (gsd > ins.maxUsefulGsdM) {
    ok = false
    reasons.push({ text: `From ${fmt(o.altKm)} km each pixel would cover ${fmtM(gsd)} — too blurry (needs ≤ ${fmtM(ins.maxUsefulGsdM)}).`, source: 'PHYS' })
  }
  if (ins.maxRangeKm && o.altKm > ins.maxRangeKm) {
    ok = false
    const weaker = (o.altKm / ins.maxRangeKm) ** 4
    reasons.push({ text: `Radar echoes fade with distance⁴: at ${fmt(o.altKm)} km the signal is ~${fmt(weaker)}× weaker than at ${fmt(ins.maxRangeKm)} km.`, source: 'PHYS' })
  }
  if (ins.needsContinuousView && !isGeo(o)) {
    ok = false
    reasons.push({ text: `Weather tracking needs a non-stop view; in ${o.short} the satellite flies past each place in minutes.`, source: 'PHYS' })
  }
  if (ok) reasons.push({ text: `Works from ${o.short}: ${fmtM(gsd)} per pixel.`, source: ins.source })
  return { id: ins.id, name: ins.name, ok, reasons, facts: [`${fmtM(gsd)}/pixel`, `${ins.powerW} W`, `${ins.massKg} kg`, `$${ins.costM}M`] }
}

export function powerBudget(o: C.Orbit, ins: C.Instrument, pw: C.PowerSystem) {
  const geo = isGeo(o)
  const duty = geo ? 1 : 0.3 // LEO imagers only work over targets in daylight [GAME]
  const avgLoadW = C.BUS_POWER_W + ins.powerW * duty
  const ecl = P.eclipseFraction(o.altKm)
  const genW = pw.peakW * pw.sunFactor * (1 - ecl)
  const eclipseH = (ecl * P.periodSec(o.altKm)) / 3600
  const peakLoadW = C.BUS_POWER_W + ins.powerW * (geo ? 1 : 0.6)
  const batteryNeedWh = (peakLoadW * eclipseH) / C.maxDepthOfDischarge(o.altKm)
  return { avgLoadW, genW, batteryNeedWh, eclipseMin: eclipseH * 60 }
}

function powerNode(o: C.Orbit, ins: C.Instrument, pw: C.PowerSystem): NodeState {
  const b = powerBudget(o, ins, pw)
  const reasons: Reason[] = []
  let ok = true
  if (b.genW < b.avgLoadW) {
    ok = false
    reasons.push({ text: `Panels make ~${fmt(b.genW)} W on average, but the spacecraft needs ${fmt(b.avgLoadW)} W.`, source: 'PHYS' })
  }
  if (pw.batteryWh < b.batteryNeedWh) {
    ok = false
    reasons.push({ text: `Each ${fmt(b.eclipseMin)}-min eclipse needs a ${fmt(b.batteryNeedWh)} Wh battery; this one has ${fmt(pw.batteryWh)} Wh.`, source: 'PHYS' })
  }
  if (ok) reasons.push({ text: `${fmt(b.genW)} W generated vs ${fmt(b.avgLoadW)} W used; battery covers the ${fmt(b.eclipseMin)}-min eclipse.`, source: 'PHYS' })
  return { id: pw.id, name: pw.name, ok, reasons, facts: [`${pw.peakW} W peak`, `${pw.batteryWh} Wh`, `${pw.massKg} kg`, `$${pw.costM}M`] }
}

export function downlinkCapacity(o: C.Orbit, dl: C.Downlink): { gbitPerDay: number; note: Reason } {
  if (dl.kind === 'continuous') {
    const g = (dl.rateMbps * 86400 * 0.9) / 1000
    return isGeo(o)
      ? { gbitPerDay: g, note: { text: 'GEO is always in view of its ground station.', source: 'PHYS' } }
      : { gbitPerDay: g, note: { text: `From ${o.short} a non-stop link needs a relay satellite (+$${C.RELAY_COST_PER_YEAR_M}M/yr).`, source: 'GAME' } }
  }
  if (isGeo(o)) return { gbitPerDay: 0, note: { text: 'A GEO satellite never "passes" a station — it is always in view. Use Continuous Link.', source: 'PHYS' } }
  const lat = dl.stationLatDeg ?? 0
  const reach = P.maxLatitudeDeg(o.inclDeg) + P.stationHalfAngleDeg(o.altKm)
  if (lat > reach) return { gbitPerDay: 0, note: { text: `A ${fmt(lat)}° station is out of reach: ${o.short} never goes beyond ${fmt(P.maxLatitudeDeg(o.inclDeg), 1)}°.`, source: 'S10' } }
  const passes = dl.kind === 'polar-network' ? 10 : 4 // [GAME, verify with mentor]
  const sec = passes * P.avgPassSec(o.altKm)
  return { gbitPerDay: (sec * dl.rateMbps) / 1000, note: { text: `${passes} passes/day × ${fmt(P.avgPassSec(o.altKm) / 60, 1)} min each.`, source: 'PHYS' } }
}

function downlinkNode(o: C.Orbit, ins: C.Instrument, dl: C.Downlink): NodeState {
  const cap = downlinkCapacity(o, dl)
  const ok = cap.gbitPerDay >= ins.dataGbitPerDay
  const reasons: Reason[] = [cap.note]
  if (cap.gbitPerDay > 0 && !ok)
    reasons.push({ text: `Only ${fmt((100 * cap.gbitPerDay) / ins.dataGbitPerDay)}% of the ${fmt(ins.dataGbitPerDay)} Gbit collected per day reaches Earth.`, source: 'PHYS' })
  if (ok) reasons.push({ text: `${fmt(cap.gbitPerDay)} Gbit/day capacity ≥ ${fmt(ins.dataGbitPerDay)} Gbit/day collected.`, source: 'PHYS' })
  return { id: dl.id, name: dl.name, ok, reasons, facts: [`${fmt(cap.gbitPerDay)} Gbit/day`, `$${downlinkCostPerYear(o, dl)}M/yr`] }
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
  const reasons: Reason[] = [
    { text: `Rocket equation: reaching ${o.short} costs ${fmt(orbitStats(o).extraDvKmS, 2)} km/s beyond a 200 km orbit, so ${fmt(lv.leoCapacityKg)} kg shrinks to ${fmt(cap)} kg.`, source: 'PHYS' },
  ]
  reasons.push(ok ? { text: `Your ${fmt(mass)} kg spacecraft fits.`, source: 'PHYS' } : { text: `Your spacecraft is ${fmt(mass)} kg — too heavy for this rocket.`, source: 'PHYS' })
  return { id: lv.id, name: lv.name, ok, reasons, facts: [`${fmt(cap)} kg to ${o.short}`, `$${lv.costM}M`] }
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

// ---------------- Mission run + scorecard ----------------
export interface Scorecard {
  score: number
  success: boolean
  breakdown: { label: string; points: number; max: number }[]
  primaryConstraint: string
  biggestImpact: string
  lesson: string
  timeline: { label: string; detail: string }[]
}

export function evaluateMission(c: Choice, goVotes: number): Scorecard {
  const s = C.byId(C.SCENARIOS, c.scenarioId)!
  const o = orbitOf(c)!
  const ins = C.byId(C.INSTRUMENTS, c.instrumentId)!
  const dl = C.byId(C.DOWNLINKS, c.downlinkId)!
  const lv = C.byId(C.LAUNCHERS, c.launchId)!
  const st = orbitStats(o)
  const b = budget(c)

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
  const teamPts = Math.round((15 * goVotes) / 4)
  const score = Math.min(100, sciencePts + dataPts + budgetPts + teamPts)

  const factors = [
    { name: `instrument fit (${ins.name})`, loss: 1 - fit.fit },
    { name: `coverage (${o.short} reaches ${fmt(st.maxLatDeg, 1)}°, target needs ${s.needLatDeg}°)`, loss: 1 - Math.min(1, coverage) },
    { name: `revisit (${revisit < 0.1 ? 'continuous' : fmt(revisit, 1) + ' days'} vs ${s.targetRevisitDays} wanted)`, loss: (1 - revisitFactor) / 2 },
  ].sort((a, b2) => b2.loss - a.loss)

  return {
    score,
    success: !overBudget && score >= 50,
    breakdown: [
      { label: 'Science return', points: sciencePts, max: 50 },
      { label: 'Data delivered', points: dataPts, max: 20 },
      { label: 'Budget & reserve', points: budgetPts, max: 15 },
      { label: 'Team Go/No-Go', points: teamPts, max: 15 },
    ],
    primaryConstraint:
      `Choosing ${o.short} (${fmt(o.altKm)} km, ${o.inclDeg}°) set everything else: ` +
      (isGeo(o) ? 'it gave a non-stop view but put the spacecraft so far away that only coarse imagers work and a heavy rocket is needed.' : `the ground track reaches ${fmt(st.maxLatDeg, 1)}° and each look covers a ${fmt(swath)} km swath.`),
    biggestImpact: factors[0].loss > 0.01 ? `Biggest point loss: ${factors[0].name}.` : 'No major losses — every choice fit the objective.',
    lesson: fit.why,
    timeline: [
      { label: 'Launch', detail: `${lv.name} lifts ${fmt(spacecraftMassKg(c))} kg (capacity ${fmt(launchCapacityKg(o, lv))} kg to ${o.short}).` },
      { label: 'Orbit reached', detail: `${o.name}: one lap every ${fmt(st.periodMin, 1)} min, ${fmt(st.eclipseMin)} min in shadow.` },
      { label: 'First light', detail: `${ins.name} sees ${fmtM(P.scaleWithAltitude(ins.gsdRefM, ins.refAltKm, o.altKm))} per pixel.` },
      { label: 'Daily operations', detail: `${fmt(Math.min(ins.dataGbitPerDay, downlinkCapacity(o, dl).gbitPerDay))} of ${fmt(ins.dataGbitPerDay)} Gbit/day reach Earth.` },
      { label: 'Coverage', detail: revisit < 0.1 ? 'Same hemisphere in view all the time.' : `Revisits each spot about every ${fmt(revisit, 1)} days.` },
      { label: 'End of mission', detail: `~${o.lifetimeYears} years of operations. Budget used: $${fmt(b.spentM)}M of $${b.totalM}M.` },
    ],
  }
}
