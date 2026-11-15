// Client for the online leaderboard (server/leaderboard.ts). The game never depends on it: every call has a timeout
// and returns null on any failure, and the UI simply says the leaderboard is unavailable.
import type { Choice } from '../engine/game'

/** Kill switch: an empty URL hides every leaderboard button and form. */
export const LEADERBOARD_URL = ''
export const leaderboardEnabled = Boolean(LEADERBOARD_URL)

const TIMEOUT_MS = 6000

export interface BoardEntry {
  id: number
  name: string
  score: number
  success: boolean
  scenario_id: string
  orbit_id: string
  created_at: string
}

export interface Board {
  entries: BoardEntry[]
  total: number
}

export type SaveResult = { ok: true; id: number; score: number; rank: number; total: number } | { ok: false; error: string }

async function call(path: string, init?: RequestInit): Promise<Response | null> {
  if (!LEADERBOARD_URL) return null
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    return await fetch(LEADERBOARD_URL + path, { ...init, signal: ctrl.signal })
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchBoard(scenarioId?: string): Promise<Board | null> {
  const res = await call(scenarioId ? `?scenario=${encodeURIComponent(scenarioId)}` : '')
  if (!res?.ok) return null
  return (await res.json().catch(() => null)) as Board | null
}

/** The server recomputes the score from the design; only the name, the design and the votes are sent. */
export async function saveScore(name: string, choice: Choice, goVotes: number): Promise<SaveResult> {
  const res = await call('', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name, choice, goVotes }) })
  if (!res) return { ok: false, error: 'The leaderboard is unavailable right now. Your game is not affected.' }
  const body = (await res.json().catch(() => null)) as { id: number; score: number; rank: number; total: number; error?: string } | null
  if (!res.ok || !body) return { ok: false, error: body?.error ?? 'The leaderboard is unavailable right now. Your game is not affected.' }
  return { ok: true, id: body.id, score: body.score, rank: body.rank, total: body.total }
}
