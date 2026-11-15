// Badges: what a flown mission earned, and what a device has collected over several missions.
// Pure functions of the design, the votes and the team size, like the score, so the leaderboard server can
// recompute them and a forged request cannot claim one. Thresholds are game values [GAME] unless a badge says otherwise.
import * as C from './catalog'
import { clampPlayers, evaluateMission, isComplete, TIER_ORDER, tierOptions, type Choice } from './game'
import type { SourceId } from './sources'

export type MissionBadgeId = 'right-tool' | 'full-science' | 'full-downlink' | 'reserve-keeper' | 'unanimous-go' | 'full-crew' | 'solo-commander' | 'small-rocket' | 'perfect-mission'
export type CollectionBadgeId = 'all-missions' | 'orbit-explorer' | 'comeback' | 'badge-collector'
export type BadgeId = MissionBadgeId | CollectionBadgeId

export interface Badge {
  id: BadgeId
  name: string
  /** How to earn it, in one plain sentence. Copy owner: Belle (see docs/COPY.md). */
  hint: string
  /** Where the rule behind the badge comes from. */
  source: SourceId
}

/** Earned by one successful mission. */
export const MISSION_BADGES: (Badge & { id: MissionBadgeId })[] = [
  { id: 'right-tool', name: 'Right tool', hint: 'Fly the instrument that fits the mission best.', source: 'GAME' },
  { id: 'full-science', name: 'Full science', hint: 'Earn every Science return point.', source: 'GAME' },
  { id: 'full-downlink', name: 'Full downlink', hint: 'Bring all of the data collected each day down to Earth.', source: 'GAME' },
  { id: 'reserve-keeper', name: 'Reserve keeper', hint: 'Keep at least 10% of the budget in reserve.', source: 'S2' },
  { id: 'unanimous-go', name: 'Unanimous Go', hint: 'Launch with a Go from every player, in a crew of two or more.', source: 'GAME' },
  { id: 'full-crew', name: 'Full crew', hint: 'Succeed with a crew of four.', source: 'GAME' },
  { id: 'solo-commander', name: 'Solo commander', hint: 'Succeed on your own.', source: 'GAME' },
  { id: 'small-rocket', name: 'Small rocket', hint: 'Succeed with the Small Launcher.', source: 'GAME' },
  { id: 'perfect-mission', name: 'Perfect mission', hint: 'Score 100 out of 100.', source: 'GAME' },
]

/** Earned across several missions flown on the same device. */
export const COLLECTION_BADGES: (Badge & { id: CollectionBadgeId })[] = [
  { id: 'all-missions', name: 'Mission planner', hint: 'Succeed in every mission.', source: 'GAME' },
  { id: 'orbit-explorer', name: 'Orbit explorer', hint: 'Succeed in every orbit.', source: 'GAME' },
  { id: 'comeback', name: 'Comeback', hint: 'Succeed in a mission after failing it.', source: 'GAME' },
  { id: 'badge-collector', name: 'Badge collector', hint: 'Earn every mission badge.', source: 'GAME' },
]

export const ALL_BADGES: Badge[] = [...MISSION_BADGES, ...COLLECTION_BADGES]
export const badgeById = (id: string) => ALL_BADGES.find((b) => b.id === id)

const TIER_FIELD: Record<C.Tier, keyof Choice> = { instrument: 'instrumentId', power: 'powerId', downlink: 'downlinkId', launch: 'launchId' }

const designKey = (c: Choice) => [c.scenarioId, c.orbitId, c.instrumentId, c.powerId, c.downlinkId, c.launchId].join('|')
// Both answers depend only on catalog ids, so they are kept: the leaderboard asks again for every row it lists.
const viable = new Map<string, boolean>()
const earnedBy = new Map<string, MissionBadgeId[]>()

/** A design the game lets a player build: complete, and every chosen option unlocked. */
export function isViable(c: Choice) {
  if (!isComplete(c) || !C.byId(C.SCENARIOS, c.scenarioId) || !C.byId(C.ORBITS, c.orbitId)) return false
  const key = designKey(c)
  let ok = viable.get(key)
  if (ok === undefined) {
    ok = TIER_ORDER.every((tier) => tierOptions(tier, c).some((n) => n.id === c[TIER_FIELD[tier]] && n.ok))
    viable.set(key, ok)
  }
  return ok
}

/**
 * Badges earned by one mission, in display order. Only a successful mission with a design the game allows earns any:
 * a failed or over-budget mission, or a hand-made request with a locked option, earns none.
 */
export function missionBadges(c: Choice, goVotes: number, players: number): MissionBadgeId[] {
  if (!isViable(c)) return []
  const team = clampPlayers(players)
  const key = [designKey(c), goVotes, team].join('|')
  const known = earnedBy.get(key)
  if (known) return known
  const list = computeBadges(c, goVotes, team)
  earnedBy.set(key, list)
  return list
}

function computeBadges(c: Choice, goVotes: number, team: number): MissionBadgeId[] {
  const card = evaluateMission(c, goVotes, team)
  if (!card.success) return []
  const full = (id: string) => card.breakdown.some((x) => x.id === id && x.points === x.max)
  const fit = C.byId(C.SCENARIOS, c.scenarioId)!.instrumentFit[c.instrumentId!]
  const earned: Record<MissionBadgeId, boolean> = {
    'right-tool': fit?.fit === 1,
    'full-science': full('science'),
    'full-downlink': full('data'),
    'reserve-keeper': full('budget'), // full budget points mean the 10% reserve was kept [S2]
    'unanimous-go': team >= 2 && goVotes === team,
    'full-crew': team === 4,
    'solo-commander': team === 1,
    'small-rocket': c.launchId === 'small',
    'perfect-mission': card.score === 100,
  }
  return MISSION_BADGES.map((b) => b.id).filter((id) => earned[id])
}

// ---------------- The mission log: what one device has collected ----------------
export interface MissionLog {
  /** Every badge earned so far, mission and collection. */
  badges: BadgeId[]
  /** Missions flown to a success, by scenario id. */
  succeeded: string[]
  /** Missions that failed at least once, by scenario id. */
  failed: string[]
  /** Orbits flown to a success, by orbit id. */
  orbits: string[]
}

export const EMPTY_LOG: MissionLog = { badges: [], succeeded: [], failed: [], orbits: [] }

const union = <T>(list: T[], more: T[]) => [...new Set([...list, ...more])]

/**
 * The log after one more flown mission. Recording the same mission twice changes nothing, so the screen can call it
 * on every render of the scorecard.
 */
export function recordMission(log: MissionLog, c: Choice, goVotes: number, players: number): MissionLog {
  if (!isViable(c)) return log
  const success = evaluateMission(c, goVotes, clampPlayers(players)).success
  if (!success) return log.failed.includes(c.scenarioId!) ? log : { ...log, failed: [...log.failed, c.scenarioId!] }
  const next: MissionLog = {
    ...log,
    badges: union(log.badges, missionBadges(c, goVotes, players)),
    succeeded: union(log.succeeded, [c.scenarioId!]),
    orbits: union(log.orbits, [c.orbitId!]),
  }
  const collected: Record<CollectionBadgeId, boolean> = {
    'all-missions': C.SCENARIOS.every((s) => next.succeeded.includes(s.id)),
    'orbit-explorer': C.ORBITS.every((o) => next.orbits.includes(o.id)),
    // Only a success that comes after the failure counts, so it is decided here and then kept.
    comeback: log.failed.includes(c.scenarioId!),
    'badge-collector': MISSION_BADGES.every((b) => next.badges.includes(b.id)),
  }
  return { ...next, badges: union(next.badges, COLLECTION_BADGES.map((b) => b.id).filter((id) => collected[id])) }
}

/** Read a stored log safely: anything that is not a known id is dropped, so old or edited data cannot break the game. */
export function sanitizeLog(raw: unknown): MissionLog {
  if (!raw || typeof raw !== 'object') return EMPTY_LOG
  const r = raw as Record<string, unknown>
  const pick = <T extends string>(value: unknown, known: readonly string[]) => (Array.isArray(value) ? ([...new Set(value.filter((x) => typeof x === 'string' && known.includes(x)))] as T[]) : [])
  const scenarios = C.SCENARIOS.map((s) => s.id)
  return {
    badges: pick<BadgeId>(r.badges, ALL_BADGES.map((b) => b.id)),
    succeeded: pick(r.succeeded, scenarios),
    failed: pick(r.failed, scenarios),
    orbits: pick(r.orbits, C.ORBITS.map((o) => o.id)),
  }
}
