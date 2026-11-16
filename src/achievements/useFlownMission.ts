import { useEffect, useMemo, useState } from 'react'
import { ALL_BADGES, missionBadges, recordMission, type Badge, type MissionBadgeId, type MissionLog } from '../engine/achievements'
import type { Choice } from '../engine/game'
import { loadLog, saveLog } from './store'

export interface FlownMission {
  /** Badges this mission earned. */
  earned: MissionBadgeId[]
  /** The log before and after this mission. */
  before: MissionLog
  after: MissionLog
  /** Badges this browser did not have before this mission, mission badges first. */
  fresh: Badge[]
}

/** Adds the mission on screen to this browser's log and says what is new. Call it once, on the scorecard. */
export function useFlownMission(choice: Choice, goVotes: number, players: number): FlownMission {
  // Read once, add this mission, then store: recording is idempotent, so a second render or effect run changes nothing.
  const [before] = useState(loadLog)
  const after = useMemo(() => recordMission(before, choice, goVotes, players), [before, choice, goVotes, players])
  useEffect(() => saveLog(after), [after])
  const fresh = ALL_BADGES.filter((b) => after.badges.includes(b.id) && !before.badges.includes(b.id))
  return { earned: missionBadges(choice, goVotes, players), before, after, fresh }
}
