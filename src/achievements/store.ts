// The mission log lives only in this browser (localStorage): no account, nothing sent anywhere.
// Storage can be missing or blocked (private windows, embedded previews), so every access is guarded and the game
// simply behaves as if the log were empty.
import { EMPTY_LOG, sanitizeLog, type MissionLog } from '../engine/achievements'

const KEY = 'status-go:mission-log:v1'

export function loadLog(): MissionLog {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? sanitizeLog(JSON.parse(raw)) : EMPTY_LOG
  } catch {
    return EMPTY_LOG
  }
}

export function saveLog(log: MissionLog) {
  try {
    localStorage.setItem(KEY, JSON.stringify(log))
  } catch {
    // Nothing to do: the badges of this mission still show on the scorecard.
  }
}

export function clearLog() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Same as above.
  }
}
