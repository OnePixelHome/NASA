// Online leaderboard UI: the save form on the scorecard and the board itself (also its own screen from the landing page).
// Everything here is optional: with LEADERBOARD_URL empty nothing renders, and a dead server only shows a short notice.
import { useEffect, useState, type FormEvent } from 'react'
import * as C from '../engine/catalog'
import type { Choice } from '../engine/game'
import { fetchBoard, saveScore, type Board } from '../leaderboard/api'
import { checkName, NAME_MAX } from '../leaderboard/name'
import { honorById, HONORS, type Honor } from '../engine/achievements'
import { StarShower } from './Badges'
import { BTN_PRIMARY, BTN_SECONDARY, SourceChip } from './components'

const CARD = 'rounded-lg border border-space-border bg-space-card'

function useBoard(scenarioId: string | undefined, refresh: number) {
  // Loading is derived: the stored result belongs to an older request until its key matches the current one.
  const key = `${scenarioId ?? 'all'}:${refresh}`
  const [state, setState] = useState<{ key: string; board: Board | null } | null>(null)
  useEffect(() => {
    let live = true
    fetchBoard(scenarioId).then((board) => live && setState({ key, board }))
    return () => {
      live = false
    }
  }, [scenarioId, key])
  return { board: state?.board ?? null, loading: state?.key !== key }
}

/** Tabs: every mission, or one mission. */
function Filter({ value, onChange }: { value: string | undefined; onChange: (id: string | undefined) => void }) {
  const tabs = [{ id: undefined, label: 'All missions' }, ...C.SCENARIOS.map((s) => ({ id: s.id, label: s.title }))]
  return (
    <div role="group" aria-label="Show scores for" className="flex flex-wrap gap-2">
      {tabs.map((t) => (
        <button
          key={t.label}
          type="button"
          aria-pressed={value === t.id}
          onClick={() => onChange(t.id)}
          className={`min-h-[44px] rounded-pill border px-3 text-small font-bold ${value === t.id ? 'border-st-selected bg-space-raised text-ink' : 'border-space-border bg-space-card text-ink-2 hover:border-st-available'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

/** The honors a row holds, as known ones only: a newer server may send ids this build does not know. */
const knownHonors = (ids: string[] | undefined) => (ids ?? []).map(honorById).filter((h): h is Honor => Boolean(h))

/** An honor as a small gold tag with its name, so it never depends on color alone. */
function HonorTag({ honor }: { honor: Honor }) {
  return (
    <span title={honor.hint} className="inline-flex h-5 items-center gap-1 whitespace-nowrap rounded-pill border border-st-selected px-1.5 text-[11px] font-bold leading-none text-st-selected">
      <span aria-hidden>★</span>
      {honor.name}
    </span>
  )
}

/** What each honor means. Shown under the board, because the tags on the rows only carry the name. */
export function HonorLegend() {
  return (
    <section aria-labelledby="h-honors" className={`${CARD} flex flex-col gap-2 p-4`}>
      <h2 id="h-honors" className="text-section">
        Honors
      </h2>
      <p className="text-small text-ink-2">
        One crew holds each honor in every mission. Only successful missions count.
        <SourceChip id="GAME" />
      </p>
      <ul className="flex flex-col gap-2 text-small">
        {HONORS.map((h) => (
          <li key={h.id} className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <HonorTag honor={h} />
            <span className="text-ink-2">{h.hint}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function LeaderboardTable({ scenarioId, highlightId, refresh = 0 }: { scenarioId?: string; highlightId?: number; refresh?: number }) {
  const { board, loading } = useBoard(scenarioId, refresh)
  if (loading && !board) return <p className="text-small text-ink-muted">Loading the leaderboard…</p>
  if (!board) return <p className="text-small text-ink-muted">The leaderboard is unavailable right now. Your game is not affected.</p>
  if (board.entries.length === 0) return <p className="text-small text-ink-2">No scores yet. Be the first crew on the board.</p>
  return (
    <div>
      <ol className="flex flex-col gap-1.5">
        {board.entries.map((e, i) => {
          const mission = C.byId(C.SCENARIOS, e.scenario_id)?.title ?? e.scenario_id
          const orbit = C.byId(C.ORBITS, e.orbit_id)?.short ?? e.orbit_id
          const mine = e.id === highlightId
          return (
            <li key={e.id} className={`flex items-center gap-3 rounded-md border px-3 py-2 ${mine ? 'border-st-selected bg-space-raised' : 'border-space-border bg-space-page'}`}>
              <span className="w-7 shrink-0 text-right font-display tabular-nums text-ink-2">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-bold">
                  {e.name}
                  {mine && <span className="ml-2 text-caption text-st-selected">you</span>}
                </div>
                <div className="truncate text-caption text-ink-muted">
                  {mission} · {orbit} · {e.players === 1 ? 'solo' : `${e.players ?? 4} players`} · {e.success ? '✓ success' : '✕ failed'}
                  {e.badges && e.badges.length > 0 && ` · ★ ${e.badges.length} ${e.badges.length === 1 ? 'badge' : 'badges'}`}
                </div>
                {knownHonors(e.honors).length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {knownHonors(e.honors).map((h) => (
                      <HonorTag key={h.id} honor={h} />
                    ))}
                  </div>
                )}
              </div>
              <span className="font-display text-[1.25rem] tabular-nums">{e.score}</span>
            </li>
          )
        })}
      </ol>
      <p className="mt-2 text-caption text-ink-muted">
        Top {board.entries.length} of {board.total} saved {board.total === 1 ? 'score' : 'scores'}.
      </p>
    </div>
  )
}

/** Scorecard form: ask the player or crew name, then save. The server recomputes the score from the design. */
export function SaveScore({ choice, goVotes, players }: { choice: Choice; goVotes: number; players: number }) {
  const [name, setName] = useState('')
  const [touched, setTouched] = useState(false)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ id: number; rank: number; total: number; honors: Honor[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scope, setScope] = useState<string | undefined>(undefined)
  const check = checkName(name)
  const showCheck = touched && !check.ok

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    setTouched(true)
    if (!check.ok || busy) return
    setBusy(true)
    setError(null)
    const r = await saveScore(check.name, choice, goVotes, players)
    setBusy(false)
    if (r.ok) setResult({ id: r.id, rank: r.rank, total: r.total, honors: knownHonors(r.honors) })
    else setError(r.error)
  }

  return (
    <section aria-labelledby="h-save" className={`${CARD} mt-4 flex flex-col gap-3 p-4`}>
      <h2 id="h-save" className="text-section">
        Leaderboard
      </h2>
      {result ? (
        <div role="status" className="flex flex-col gap-2">
          <p className="font-display text-card">
            Saved! You are #{result.rank} of {result.total}.
          </p>
          {result.honors.length > 0 && (
            // A new honor is celebrated like a new badge: stars fall once and the honor pops in.
            <div className="flex flex-col gap-2 rounded-md border-2 border-st-selected bg-space-raised p-3" style={{ animation: 'pop 480ms ease-out both, badge-glow 1600ms ease-out 300ms 2' }}>
              <StarShower />
              <p className="font-display">{result.honors.length === 1 ? 'You hold a leaderboard honor!' : `You hold ${result.honors.length} leaderboard honors!`}</p>
              <ul className="flex flex-col gap-1.5 text-small">
                {result.honors.map((h) => (
                  <li key={h.id} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <HonorTag honor={h} />
                    <span className="text-ink-2">{h.hint}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-2">
          <label htmlFor="crew-name" className="text-small text-ink-2">
            Who flew this mission? Type your name, or your crew’s (for example “Ana & Luis”).
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id="crew-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              maxLength={NAME_MAX}
              autoComplete="nickname"
              aria-invalid={showCheck}
              aria-describedby="crew-name-help"
              className="min-h-[48px] flex-1 rounded-md border-2 border-space-border bg-space-page px-3 text-body text-ink placeholder:text-ink-muted focus:border-st-available"
              placeholder="Player or crew name"
            />
            <button type="submit" disabled={busy} className={BTN_PRIMARY}>
              {busy ? 'Saving…' : 'Save my score'}
            </button>
          </div>
          <p id="crew-name-help" className={`text-caption ${showCheck ? 'text-st-error' : 'text-ink-muted'}`}>
            {showCheck && !check.ok ? check.error : 'Only this name and your design are sent. Everyone can see the leaderboard.'}
          </p>
          {error && (
            <p role="alert" className="text-small text-st-error">
              {error}
            </p>
          )}
        </form>
      )}
      {result && (
        <>
          <Filter value={scope} onChange={setScope} />
          <LeaderboardTable scenarioId={scope} highlightId={result.id} refresh={result.id} />
        </>
      )}
    </section>
  )
}

/** Full-screen board, opened from the landing page. */
export function LeaderboardScreen({ onBack, onStart }: { onBack: () => void; onStart: () => void }) {
  const [scope, setScope] = useState<string | undefined>(undefined)
  return (
    <section className="flex flex-col gap-4">
      <div>
        <button type="button" onClick={onBack} className={BTN_SECONDARY}>
          ← Back
        </button>
      </div>
      <h1 className="text-screen">Leaderboard</h1>
      <p className="max-w-[62ch] text-body text-ink-2">Every score is recalculated by the game engine before it is saved, so the board only shows real missions.</p>
      <Filter value={scope} onChange={setScope} />
      <div className={`${CARD} p-4`}>
        <LeaderboardTable scenarioId={scope} />
      </div>
      <HonorLegend />
      <div>
        <button type="button" onClick={onStart} className={BTN_PRIMARY}>
          Start mission →
        </button>
      </div>
    </section>
  )
}
