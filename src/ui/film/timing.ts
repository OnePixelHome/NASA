// The film's script: five acts in a fixed order, and which of the six timeline steps each moment belongs to.
export type ActId = 'launch' | 'deploy' | 'firstLight' | 'day' | 'end'

export const ACTS: { id: ActId; seconds: number }[] = [
  { id: 'launch', seconds: 7 },
  { id: 'deploy', seconds: 5 },
  { id: 'firstLight', seconds: 4.5 },
  { id: 'day', seconds: 20 },
  { id: 'end', seconds: 3.5 },
]
export const FILM_SECONDS = ACTS.reduce((a, x) => a + x.seconds, 0)
/** How long the 24-hour day lasts on screen. The telemetry plot under the film plays at the same speed. */
export const DAY_ACT_SECONDS = ACTS.find((a) => a.id === 'day')!.seconds
/** Part of the day act after which the timeline moves from "Daily operations" to "Coverage". */
const COVERAGE_FROM = 0.5

export interface FilmMoment {
  act: ActId
  /** Seconds into the current act. */
  t: number
  /** 0–1 through the current act. */
  progress: number
  /** Timeline step this moment illustrates, 1–6. */
  step: number
  done: boolean
}

/** Where the film is, `elapsed` seconds after it started. Past the end it holds the last frame. */
export function momentAt(elapsed: number): FilmMoment {
  let start = 0
  for (const a of ACTS) {
    if (elapsed < start + a.seconds) {
      const t = Math.max(0, elapsed - start)
      const progress = t / a.seconds
      const step = a.id === 'launch' ? 1 : a.id === 'deploy' ? 2 : a.id === 'firstLight' ? 3 : a.id === 'day' ? (progress < COVERAGE_FROM ? 4 : 5) : 6
      return { act: a.id, t, progress, step, done: false }
    }
    start += a.seconds
  }
  const last = ACTS[ACTS.length - 1]
  return { act: last.id, t: last.seconds, progress: 1, step: 6, done: true }
}

/** Smooth start and stop, 0–1. */
export const ease = (x: number) => {
  const c = Math.max(0, Math.min(1, x))
  return c * c * (3 - 2 * c)
}
