import { useCallback, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import * as C from './engine/catalog'
import { budget, BUDGET_SOURCE, choose, clampPlayers, evaluateMission, isComplete, MAX_PLAYERS, missionRequirements, orbitSources, orbitStats, playerRoles, resources, SUCCESS_SCORE_MIN, TEAM_POINTS_MAX, teamPoints, TIER_ORDER, tierOptions, type Choice, type NodeState } from './engine/game'
import { missionDay } from './engine/missionDay'
import { AI_DISCLOSURE, AI_IMAGES_NOTE, DISCLAIMER, FOOTER_NOTES, HOW_TO_PLAY, PITCH, ROLES_NOTE, SOURCE_ORDER, SOURCES, TEAM, type Reason } from './engine/sources'
import { useFlownMission } from './achievements/useFlownMission'
import { BadgeCelebration, MissionBadges, MissionLogPanel } from './ui/Badges'
import { RoleCharacter } from './ui/Crew'
import { DayView } from './ui/DayView'
import { HomeHero } from './ui/HomeHero'
import { leaderboardEnabled } from './leaderboard/api'
import { LeaderboardScreen, SaveScore } from './ui/Leaderboard'
import { MissionArt, OrbitDiagram } from './ui/MissionArt'
import { MissionFilm, type FilmProgress } from './ui/MissionFilm'
import { MissionScene } from './ui/MissionScene'
import { ShipSvg } from './ui/Ship'
import { ROLE_UI, shipParts } from './ui/theme'
import { AiGeneratedLabel, Bar, BTN_GO, BTN_PRIMARY, BTN_SECONDARY, BTN_WARNING, Gauge, Meter, ReasonList, ResourcePanel, RoleTag, SourceChip, SourceChips, Sourced } from './ui/components'

type Screen = 'home' | 'board' | 'brief' | 'orbit' | 'tree' | 'go' | 'run' | 'score'
/** The landing page and the leaderboard are not steps, so they have no number. */
type Step = Exclude<Screen, 'home' | 'board'>
const SCREEN_NUMBER: Record<Step, number> = { brief: 1, orbit: 2, tree: 3, go: 4, run: 5, score: 6 }
const ORBIT_COLOR: Record<string, string> = { leo: 'var(--color-orbit-leo)', sso: 'var(--color-orbit-sso)', geo: 'var(--color-orbit-geo)' }

/** One vote per player: true = Go, false = No-Go, null = not voted yet. */
type Votes = (boolean | null)[]
const noVotes = (players: number): Votes => Array(clampPlayers(players)).fill(null)

const CARD = 'rounded-lg border border-space-border bg-space-card'
const PICK_CARD = `${CARD} border-2 p-4 text-left shadow-raised transition duration-[var(--duration-fast)] hover:border-st-available`

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [choice, setChoice] = useState<Choice>({})
  const [focus, setFocus] = useState<{ tier: C.Tier; node: NodeState } | null>(null)
  const [players, setPlayersState] = useState(1)
  const [votes, setVotes] = useState<Votes>(() => noVotes(1))
  const scenario = C.byId(C.SCENARIOS, choice.scenarioId)
  const orbit = C.byId(C.ORBITS, choice.orbitId)
  const goVotes = votes.filter((v) => v === true).length
  // A new team size needs a fresh poll with one vote per player.
  const setPlayers = (n: number) => {
    setPlayersState(clampPlayers(n))
    setVotes(noVotes(n))
  }
  const [about, setAbout] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true) // phones can fold the resource panel into one line

  // A new screen starts at its top; without this the page keeps the previous screen's scroll position.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen, about])

  const startOver = (to: Screen) => {
    setAbout(false)
    setChoice({})
    setFocus(null)
    setVotes(noVotes(players))
    setScreen(to)
  }

  return (
    <div className="min-h-dvh bg-space-page font-body text-ink">
      <header className="sticky top-0 z-10 border-b border-space-border bg-space-page/95 px-4 py-2 backdrop-blur">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-3">
            {/* The landing page shows the name in large type, so the header leaves it out there. */}
            {screen === 'home' && !about ? (
              <span />
            ) : (
              <button type="button" onClick={() => startOver('home')} className="min-h-[44px] text-left" aria-label="Status: GO — back to the start page">
                <div className="font-display text-[18px] leading-tight">Status: GO</div>
                {/* The tagline gives way to the resource panel once a mission is picked, to save phone space. */}
                {!scenario && <div className="text-caption text-ink-muted">Design a space mission. Watch every choice ripple down.</div>}
              </button>
            )}
            <div className="flex shrink-0 items-center gap-2">
              {scenario && !about && (
                <button
                  type="button"
                  onClick={() => setPanelOpen((o) => !o)}
                  aria-expanded={panelOpen}
                  aria-label={panelOpen ? 'Hide mission resources' : 'Show mission resources'}
                  className="min-h-[44px] rounded-pill border border-space-border bg-space-card px-3 text-small font-bold text-ink-2 hover:border-st-available sm:hidden"
                >
                  Resources <span aria-hidden>{panelOpen ? '▴' : '▾'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setAbout((a) => !a)}
                aria-pressed={about}
                aria-label={about ? 'Back to mission' : 'About and sources'}
                className={`flex min-h-[44px] items-center gap-1.5 rounded-pill border px-3 text-small font-bold hover:border-st-available ${about ? 'border-st-available bg-space-raised' : 'border-space-border bg-space-card'}`}
              >
                {!about && (
                  <span aria-hidden className="grid size-5 place-items-center rounded-pill border-2 border-st-available font-display text-[12px] text-st-available">
                    i
                  </span>
                )}
                {about ? '← Back' : <span className="hidden sm:inline">About</span>}
              </button>
            </div>
          </div>
          {scenario && !about && (
            <div className="mt-1">
              <ResourcePanel meters={resources(choice)} open={panelOpen} />
            </div>
          )}
        </div>
      </header>

      {/* About overlays the game without unmounting its state, so "Back" returns to the same step. */}
      {about && (
        <main className="mx-auto max-w-5xl px-4 pb-24 pt-5">
          <About onBack={() => setAbout(false)} />
        </main>
      )}
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-5" hidden={about}>
        {screen === 'home' && <Home players={players} setPlayers={setPlayers} onStart={() => setScreen('brief')} onAbout={() => setAbout(true)} onLeaderboard={() => setScreen('board')} />}
        {screen === 'board' && <LeaderboardScreen onBack={() => setScreen('home')} onStart={() => setScreen('brief')} />}
        {screen === 'brief' && (
          <Brief
            onPick={(id) => {
              setChoice({ scenarioId: id })
              setScreen('orbit')
            }}
          />
        )}
        {screen === 'orbit' && scenario && (
          <OrbitPick
            scenario={scenario}
            selected={choice.orbitId}
            onPick={(id) => {
              setChoice((c) => choose(c, 'orbit', id))
              setVotes(noVotes(players)) // a changed design needs a fresh poll
              setFocus(null)
              setScreen('tree')
            }}
          />
        )}
        {screen === 'tree' && orbit && (
          <Tree
            choice={choice}
            orbit={orbit}
            focus={focus}
            onFocus={setFocus}
            onPick={(tier, id) => {
              setChoice((c) => choose(c, tier, id))
              setVotes(noVotes(players)) // a changed design needs a fresh poll
            }}
            onChangeOrbit={() => setScreen('orbit')}
            onDone={() => setScreen('go')}
          />
        )}
        {screen === 'go' && <GoNoGo votes={votes} setVotes={setVotes} players={players} choice={choice} onBack={() => setScreen('tree')} onLaunch={() => setScreen('run')} />}
        {screen === 'run' && <MissionRun choice={choice} goVotes={goVotes} players={players} onDone={() => setScreen('score')} />}
        {screen === 'score' && <Score choice={choice} goVotes={goVotes} players={players} onReplay={() => startOver('brief')} onRevise={() => setScreen('tree')} onHome={() => startOver('home')} />}
      </main>
    </div>
  )
}

/** Screen heading: step counter, title and one line of guidance. */
function ScreenTitle({ screen, title, children }: { screen: Step; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-caption font-bold uppercase tracking-widest text-ink-muted">Screen {SCREEN_NUMBER[screen]} of 6</p>
      <h1 className="text-screen">{title}</h1>
      {children && <p className="max-w-[62ch] text-body text-ink-2">{children}</p>}
    </div>
  )
}

/** Notice box. The icon and the words carry the meaning; the border color only reinforces it. */
function Notice({ kind, children }: { kind: 'warning' | 'error'; children: ReactNode }) {
  const error = kind === 'error'
  return (
    <p role={error ? 'alert' : 'note'} className={`flex gap-2 rounded-md border-2 bg-space-raised px-3.5 py-3 text-[15px] ${error ? 'border-st-error' : 'border-st-warning'}`}>
      <span aria-hidden className={`font-bold ${error ? 'text-st-error' : 'text-st-warning'}`}>
        {error ? '✕' : '⚠'}
      </span>
      <span>{children}</span>
    </p>
  )
}

/** Team size, chosen before the game: each player holds one or more roles and casts one Go / No-Go vote. */
function PlayerPicker({ players, setPlayers }: { players: number; setPlayers: (n: number) => void }) {
  return (
    <fieldset className="flex flex-col items-center gap-2 lg:items-start">
      <legend className="mb-2 font-display text-card">How many players?</legend>
      <div className="flex gap-2">
        {Array.from({ length: MAX_PLAYERS }, (_, i) => i + 1).map((n) => (
          <label key={n} className="cursor-pointer">
            <input type="radio" name="players" value={n} checked={players === n} onChange={() => setPlayers(n)} className="peer sr-only" />
            <span className="grid size-12 place-items-center rounded-md border-2 border-space-border bg-space-card font-display text-[1.25rem] tabular-nums text-ink-2 hover:border-st-available peer-checked:border-st-selected peer-checked:bg-space-raised peer-checked:text-ink peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-focus)]">
              {n}
            </span>
          </label>
        ))}
      </div>
      <p className="text-small text-ink-muted">
        {players === 1 ? 'You hold all four roles and cast the launch vote.' : `The four roles are shared by ${players} players; each player casts one vote.`}
      </p>
    </fieldset>
  )
}

/** Landing page: the game's name, what it is, and one button to start. */
function Home({ players, setPlayers, onStart, onAbout, onLeaderboard }: { players: number; setPlayers: (n: number) => void; onStart: () => void; onAbout: () => void; onLeaderboard: () => void }) {
  return (
    <section className="flex flex-col gap-10">
      <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
          <p className="text-caption font-bold uppercase tracking-widest text-ink-muted">NASA Space Apps Challenge 2026 · Space Mission Design Game</p>
          <h1 className="font-display text-[3.25rem] leading-none sm:text-[4.5rem]">
            Status: <span className="font-semibold text-st-selected">GO</span>
          </h1>
          <p className="max-w-[46ch] text-[1.125rem] leading-relaxed text-ink-2">{PITCH}</p>
          <PlayerPicker players={players} setPlayers={setPlayers} />
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button type="button" onClick={onStart} className={`${BTN_GO} min-h-[56px] px-8 text-[1.125rem]`}>
              Start mission →
            </button>
            {leaderboardEnabled && (
              <button type="button" onClick={onLeaderboard} className={BTN_SECONDARY}>
                Leaderboard
              </button>
            )}
            <button type="button" onClick={onAbout} className={BTN_SECONDARY}>
              About & sources
            </button>
          </div>
          <p className="text-small text-ink-muted">Everyone plays on one screen · no sign-up</p>
        </div>
        <HomeHero className="order-first mx-auto max-w-[210px] sm:max-w-[300px] lg:order-none lg:max-w-[320px]" />
      </div>

      <MissionLogPanel />

      <section aria-labelledby="h-home-how">
        <h2 id="h-home-how" className="text-section">
          How to play
        </h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_TO_PLAY.map((s, i) => (
            <li key={s.title} className={`${CARD} flex gap-3 p-4`}>
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-md border border-space-border bg-space-raised font-display text-[18px]" style={{ color: HOW_ICONS[i % HOW_ICONS.length].color }}>
                {HOW_ICONS[i % HOW_ICONS.length].icon}
              </span>
              <div className="min-w-0">
                <h3 className="font-display">
                  <span className="tabular-nums text-ink-2">{i + 1} ·</span> {s.title}
                </h3>
                <p className="text-small text-ink-2">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="flex flex-col gap-1 border-t border-space-border pt-4 text-caption text-ink-muted">
        <p>Made by team One Pixel Home. Not affiliated with or endorsed by NASA.</p>
        <p>Earth image: NASA Earth Observatory, Blue Marble: Next Generation.</p>
      </footer>
    </section>
  )
}

function Brief({ onPick }: { onPick: (id: string) => void }) {
  return (
    <section>
      <ScreenTitle screen="brief" title="1 · Pick your mission">
        Every mission starts with a science goal. It decides what “success” means.
      </ScreenTitle>
      <div className="mt-4 flex items-start gap-2.5">
        <RoleCharacter role="science" decorative bg="var(--color-space-page)" className="size-12 shrink-0" />
        <p className="mt-1.5 rounded-md bg-ink px-3 py-2 text-small font-bold text-space-page">Pick the goal first. Its numbers are what your design will be scored against.</p>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {C.SCENARIOS.map((s) => {
          const req = missionRequirements(s)
          return (
            <button type="button" key={s.id} onClick={() => onPick(s.id)} aria-label={`${s.title}: ${req.summary}`} className={`${PICK_CARD} flex flex-col gap-3 p-3 pb-4`}>
              <span className="relative block">
                <MissionArt id={s.id} />
                <AiGeneratedLabel className="absolute bottom-2 right-2" />
              </span>
              <div className="flex flex-col gap-1 px-1">
                <h2 className="text-[20px] text-ink">{s.title}</h2>
                <p className="text-[15px] text-ink-2">{s.story}</p>
              </div>
              <div className="mx-1 flex flex-col gap-2 rounded-md bg-space-raised p-3">
                <p className="flex items-center justify-between gap-2 text-caption font-bold text-ink-2">
                  <span className="uppercase tracking-wide">Mission requirements</span>
                  <SourceChip id={req.source} link={false} />
                </p>
                <dl className="flex flex-wrap justify-between gap-x-3 gap-y-2">
                  {req.items.map((r) => (
                    <div key={r.id} className="flex min-w-0 flex-col-reverse">
                      <dt className="text-caption text-ink-2">{r.label}</dt>
                      <dd className="whitespace-nowrap font-display text-[19px] tabular-nums">{r.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <p className="mt-auto flex items-baseline justify-between px-1">
                <span className="text-small text-ink-2">
                  Budget
                  <SourceChip id={BUDGET_SOURCE} link={false} />
                </span>
                <span className="font-display text-[22px] tabular-nums text-st-selected">${s.budgetM}M</span>
              </p>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function OrbitPick({ scenario, selected, onPick }: { scenario: C.Scenario; selected?: string; onPick: (id: string) => void }) {
  const req = missionRequirements(scenario)
  return (
    <section>
      <ScreenTitle screen="orbit" title="2 · Choose a trajectory" />
      {/* Mission summary: the numbers each orbit card has to be checked against. */}
      <p aria-label={`Mission: ${scenario.title}, ${req.summary}`} className="mt-3 inline-flex max-w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-space-border bg-space-card px-3.5 py-2">
        <span className="font-display text-[15px]">{scenario.title}</span>
        <span className="text-[13px] tabular-nums text-ink-2">
          {req.items.map((r) => r.value).join(' · ')} · ${scenario.budgetM}M
          <SourceChip id={req.source} />
        </span>
      </p>
      <p className="mt-3 flex gap-2 text-[13px] text-ink-2">
        <span aria-hidden className="text-st-warning">
          ⚠
        </span>
        Bars are illustrative values for educational purposes, derived from the physics below.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {C.ORBITS.map((o) => {
          const st = orbitStats(o)
          const col = ORBIT_COLOR[o.id]
          const sel = selected === o.id
          const reach = st.continuousView ? 'Fixed view of one hemisphere' : `Reaches ±${st.maxLatDeg.toFixed(1)}° latitude`
          return (
            <button
              type="button"
              key={o.id}
              onClick={() => onPick(o.id)}
              aria-pressed={sel}
              aria-label={`${o.short}, ${o.name}: altitude ${o.altKm.toLocaleString()} km. Fuel cost ${st.bars.fuel} of 5, coverage ${st.bars.coverage} of 5, lifetime ${st.bars.lifetime} of 5. ${reach}.`}
              className={`${PICK_CARD} flex flex-col gap-3 ${sel ? 'bg-space-raised' : ''}`}
              style={sel ? { borderColor: col, boxShadow: `0 0 0 1px ${col}, 0 0 28px color-mix(in oklab, ${col} 27%, transparent)` } : undefined}
            >
              <div className="flex items-center gap-3.5">
                <OrbitDiagram id={o.id} short={o.short} color={col} className="size-[96px] shrink-0" />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="flex items-center gap-2 font-display text-[15px] font-bold tracking-wide" style={{ color: col }}>
                    <span className="size-3 rounded-pill border-2 border-space-page" style={{ background: col }} />
                    {o.short}
                  </span>
                  <h2 className="text-[19px] leading-tight">{o.name}</h2>
                  <span className="text-[13px] font-bold" style={{ color: sel ? col : 'var(--color-ink-2)' }}>
                    {sel ? '✓ Selected' : 'Tap to choose'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Bar label="Fuel cost" value={st.bars.fuel} color={col} />
                <Bar label="Coverage" value={st.bars.coverage} color={col} />
                <Bar label="Lifetime" value={st.bars.lifetime} color={col} />
              </div>
              <p className="text-[15px] text-ink-2">{o.blurb}</p>
              <ul className="flex flex-col gap-1.5 rounded-md bg-space-raised p-3 text-small tabular-nums">
                {[`Altitude ${o.altKm.toLocaleString()} km · ${st.periodMin.toFixed(0)} min/orbit`, reach, `+${st.extraDvKmS.toFixed(2)} km/s beyond a 200 km orbit`].map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden style={{ color: col }}>
                      •
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <span className="mt-auto flex flex-wrap items-center gap-x-1 gap-y-1 text-caption text-ink-2">
                Sources
                <SourceChips ids={orbitSources(o)} link={false} />
              </span>
            </button>
          )
        })}
      </div>
      <p className={`${CARD} mt-4 px-3.5 py-3 text-small text-ink-2`}>
        <span className="font-display text-ink">Why this matters · </span>
        Higher orbits see more of Earth at once and last longer, but cost more fuel to reach. Check each card’s latitude reach against your mission’s numbers.
      </p>
    </section>
  )
}

/** Small planet-and-orbit mark, tinted with the orbit's color. */
function OrbitIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
      <ellipse cx="16" cy="16" rx="15" ry="6" fill="none" stroke={color} strokeWidth="2.5" transform="rotate(-20 16 16)" />
      <circle cx="16" cy="16" r="8" fill="var(--color-st-available)" stroke="var(--color-space-page)" strokeWidth="2.5" />
      <circle cx="29" cy="11" r="3" fill={color} stroke="var(--color-space-page)" strokeWidth="2" />
    </svg>
  )
}

/** Node card states. Each one has its own border style and a written status, so it reads without color. */
const NODE_UI = {
  available: { cls: 'border-space-border bg-space-card shadow-raised hover:border-st-available', status: '○ Available', color: 'var(--color-st-available)' },
  selected: { cls: 'border-st-selected bg-space-raised shadow-selected', status: '◉ Selected', color: 'var(--color-st-selected)' },
  locked: { cls: 'border-dashed border-space-border bg-space-page', status: '🔒 Locked — tap for why', color: 'var(--color-ink-2)' },
}

const TIER_KEY: Record<C.Tier, keyof Choice> = { instrument: 'instrumentId', power: 'powerId', downlink: 'downlinkId', launch: 'launchId' }

function Tree(props: {
  choice: Choice
  orbit: C.Orbit
  focus: { tier: C.Tier; node: NodeState } | null
  onFocus: (f: { tier: C.Tier; node: NodeState } | null) => void
  onPick: (tier: C.Tier, id: string) => void
  onChangeOrbit: () => void
  onDone: () => void
}) {
  const { choice, orbit, focus, onFocus, onPick } = props
  const col = ORBIT_COLOR[orbit.id]
  const chosen = TIER_ORDER.filter((t) => choice[TIER_KEY[t]]).length
  // Each pick re-keys the steps below it, so they flash once: the "ripple" of the title.
  const [cascade, setCascade] = useState({ gen: 0, from: -1 })
  return (
    <section>
      <ScreenTitle screen="tree" title="3 · Build the mission tree">
        Each choice can lock the ones below it. Tap a locked option to see why.
      </ScreenTitle>

      <div className="mt-4 grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6">
        <aside aria-label="Your spacecraft" className={`${CARD} flex items-center gap-4 p-3 shadow-raised lg:sticky lg:top-36 lg:flex-col lg:self-start lg:p-4`}>
          <div className="flex shrink-0 flex-col items-center gap-2">
            <ShipSvg {...shipParts(choice)} className="h-[150px] w-auto lg:h-[340px]" />
            <AiGeneratedLabel />
          </div>
          <div className="flex w-full min-w-0 flex-1 flex-col gap-1.5">
            <span className="font-display tabular-nums">{chosen} of 4 parts</span>
            {TIER_ORDER.map((t) => {
              const role = C.TIER_ROLE[t]
              const n = tierOptions(t, choice).find((x) => x.id === choice[TIER_KEY[t]])
              return (
                <div key={t} className={`flex gap-1.5 text-[13px] ${n ? 'text-ink' : 'text-ink-2'}`}>
                  <span style={{ color: ROLE_UI[role].color }} aria-hidden>
                    {ROLE_UI[role].icon}
                  </span>
                  {n ? n.name : `${C.ROLE_LABEL[role]} · empty slot`}
                </div>
              )
            })}
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <button
              type="button"
              onClick={props.onChangeOrbit}
              aria-label={`Orbit: ${orbit.short}, ${orbit.name}. Tap to change.`}
              className="flex min-h-[44px] items-center gap-2.5 rounded-pill border-2 bg-space-card py-1.5 pl-1.5 pr-3.5"
              style={{ borderColor: col }}
            >
              <OrbitIcon color={col} />
              <span className="flex flex-col text-left leading-tight">
                <span className="font-display tabular-nums" style={{ color: col }}>
                  {orbit.short} · {orbit.altKm.toLocaleString()} km
                </span>
                <span className="text-caption text-ink-2">Orbit · tap to change</span>
              </span>
            </button>
            <span>
              <SourceChips ids={orbitSources(orbit)} />
            </span>
          </div>

          <ol className="flex flex-col gap-3">
            {TIER_ORDER.map((tier, ti) => {
              const nodes = tierOptions(tier, choice)
              const role = C.TIER_ROLE[tier]
              const selectedId = choice[TIER_KEY[tier]]
              const open = focus?.tier === tier ? focus.node : null
              const locked = nodes.filter((n) => !n.ok).length
              // The crew member for this step says what to do next, in words (never by color or pose alone).
              const bubble = !nodes.length ? `I’m waiting for step ${ti}.` : selectedId ? null : locked === nodes.length ? 'Nothing fits here. Change a step above.' : locked ? `${locked} locked. Tap 🔒 to see why.` : 'Your pick, team!'
              const mood = selectedId ? 'cheer' : nodes.length && locked === nodes.length ? 'worried' : 'neutral'
              const flash = cascade.gen > 0 && ti > cascade.from
              return (
                <li
                  key={`${tier}-${flash ? cascade.gen : 0}`}
                  aria-label={`Step ${ti + 1}: ${C.TIER_LABEL[tier]}`}
                  className={`${CARD} flex flex-col gap-3 p-3.5 ${flash ? 'motion-safe:animate-flash' : ''}`}
                  style={flash ? { animationDelay: `${(ti - cascade.from - 1) * 80}ms` } : undefined}
                >
                  <div className="flex items-start gap-2.5">
                    <RoleCharacter role={role} mood={mood} decorative className="size-11 shrink-0 lg:size-14" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <h2 className="text-card">
                          <span className="tabular-nums text-ink-2">{ti + 1} ·</span> {C.TIER_LABEL[tier]}
                        </h2>
                        <RoleTag role={role} label={C.ROLE_LABEL[role]} />
                      </div>
                      {bubble && <span className="self-start rounded-md bg-ink px-2.5 py-1.5 text-[13px] font-bold text-space-page motion-safe:animate-bubble-in">{bubble}</span>}
                    </div>
                  </div>
                  {!nodes.length ? (
                    <div aria-disabled className="flex min-h-[44px] items-center rounded-md border-2 border-dashed border-space-border px-3 text-small text-ink-2">
                      Choose the step above first
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
                      {nodes.map((n) => {
                        const sel = selectedId === n.id
                        const ui = NODE_UI[!n.ok ? 'locked' : sel ? 'selected' : 'available']
                        return (
                          <button
                            type="button"
                            key={n.id}
                            aria-pressed={sel}
                            aria-expanded={open?.id === n.id}
                            aria-label={`${n.name}: ${!n.ok ? 'locked' : sel ? 'selected' : 'available'}`}
                            title={n.tip}
                            onClick={() => {
                              onFocus({ tier, node: n })
                              // Re-tapping the current pick only shows its reasons; it must not wipe the tiers below.
                              if (n.ok && !sel) {
                                setCascade((c) => ({ gen: c.gen + 1, from: ti }))
                                onPick(tier, n.id)
                              }
                            }}
                            className={`flex min-h-24 flex-col gap-1 rounded-md border-2 p-3 pb-2.5 text-left transition duration-[var(--duration-fast)] ${ui.cls}`}
                          >
                            <span className={`font-display text-[15px] leading-tight ${n.ok ? 'text-ink' : 'text-ink-2'}`}>{n.name}</span>
                            {n.ok && (
                              <span className="text-[13px] tabular-nums text-ink-2">
                                {n.facts.join(' · ')}
                                <SourceChip id={n.factsSource} link={false} />
                              </span>
                            )}
                            <span className="mt-auto text-caption font-bold" style={{ color: ui.color }}>
                              {ui.status}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {open && (
                    <div role="region" aria-label="Explanation" className="flex flex-col gap-2 rounded-md border border-space-border bg-space-raised p-3.5">
                      <h3 className="text-card">{open.name}</h3>
                      <p className="text-[15px] text-ink">{open.tip}</p>
                      <span className={`font-display ${open.ok ? 'text-st-success' : 'text-st-warning'}`}>{open.ok ? '✓ Why it works' : '⚠ Why it is locked'}</span>
                      <ReasonList reasons={open.reasons} />
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
        <p role="status" className="flex-1 text-small font-bold text-ink-2">
          {isComplete(choice) ? '✓ All 4 steps chosen.' : `${chosen} of 4 steps chosen.`}
        </p>
        <button type="button" disabled={!isComplete(choice)} onClick={props.onDone} className={BTN_PRIMARY}>
          Go to Go / No-Go →
        </button>
      </div>
    </section>
  )
}

function GoNoGo(props: { votes: Votes; setVotes: Dispatch<SetStateAction<Votes>>; players: number; choice: Choice; onBack: () => void; onLaunch: () => void }) {
  const { votes, setVotes, players, choice } = props
  const b = budget(choice)
  const roles = playerRoles(players)
  const allVoted = votes.every((v) => v !== null)
  const goCount = votes.filter((v) => v === true).length
  const noCount = votes.filter((v) => v === false).length
  const anyNo = noCount > 0
  const solo = players === 1
  // Functional update: two players tapping at almost the same time must both be counted.
  const vote = (i: number, v: boolean) => setVotes((prev) => prev.map((x, j) => (j === i ? v : x)))
  const who = (i: number) => (solo ? 'You' : `Player ${i + 1}`)
  return (
    <section>
      <ScreenTitle screen="go" title="4 · Go / No-Go poll">
        {solo
          ? 'Like a real launch, the mission needs a Go. You hold all four roles, so your vote decides.'
          : `Like a real launch, the team is polled. Each of the ${players} players votes once for the roles they hold. A unanimous Go earns the full team score.`}
      </ScreenTitle>

      <div className="mt-5 flex items-baseline justify-between gap-2">
        <h2 className="text-section">{solo ? 'Your call' : 'Team poll'}</h2>
        <span role="status" className="font-display tabular-nums text-ink-2">
          {goCount} Go · {noCount} No-Go · {players - goCount - noCount} waiting
        </span>
      </div>
      <div className={`mt-2 grid gap-2.5 ${solo ? 'max-w-sm' : players === 2 ? 'grid-cols-2 sm:max-w-xl' : players === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {roles.map((held, i) => {
          const v = votes[i] ?? null
          const status = v === true ? '✓ GO' : v === false ? '✕ NO-GO' : '… waiting…'
          const roleNames = held.map((r) => C.ROLE_LABEL[r]).join(', ')
          return (
            <section
              key={i}
              aria-label={`${who(i)} (${roleNames}): ${v === true ? 'GO' : v === false ? 'NO-GO' : 'waiting'}`}
              className={`flex min-w-0 flex-col items-center gap-2 rounded-lg border-2 px-2.5 pb-2.5 pt-3.5 ${v === true ? 'border-st-success bg-space-raised' : v === false ? 'border-st-error bg-space-raised' : 'border-space-border bg-space-card'}`}
            >
              <span className="font-display text-card">{who(i)}</span>
              {/* Re-keyed on each vote so the characters pop once. */}
              <span key={String(v)} className={`flex flex-wrap justify-center gap-1 ${v === null ? '' : 'motion-safe:animate-pop'}`}>
                {held.map((r) => (
                  <RoleCharacter key={r} role={r} mood={v === false ? 'worried' : v === true ? 'cheer' : 'neutral'} decorative bg={v === null ? undefined : 'var(--color-space-raised)'} className={held.length > 2 ? 'size-10' : 'size-12'} />
                ))}
              </span>
              <div className="flex flex-wrap justify-center gap-1">
                {held.map((r) => (
                  <RoleTag key={r} role={r} label={C.ROLE_LABEL[r]} />
                ))}
              </div>
              <span className={`font-display text-[18px] tracking-wide ${v === true ? 'text-st-success' : v === false ? 'text-st-error' : 'text-ink-2'}`}>
                {status}
              </span>
              <div className="flex w-full gap-1.5">
                <button
                  type="button"
                  aria-pressed={v === true}
                  aria-label={`${who(i)} votes Go`}
                  onClick={() => vote(i, true)}
                  className={`min-h-12 flex-1 rounded-md border-2 font-display transition active:scale-[.92] ${v === true ? 'border-st-success bg-st-success text-space-page' : 'border-space-border bg-space-card hover:border-st-available'}`}
                >
                  ✓ Go
                </button>
                <button
                  type="button"
                  aria-pressed={v === false}
                  aria-label={`${who(i)} votes No-Go`}
                  onClick={() => vote(i, false)}
                  className={`min-h-12 flex-1 whitespace-nowrap rounded-md border-2 font-display transition active:scale-[.92] ${v === false ? 'border-st-error bg-st-error text-space-page' : 'border-space-border bg-space-card hover:border-st-available'}`}
                >
                  ✕ No-Go
                </button>
              </div>
            </section>
          )
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {b.spentM > b.totalM ? (
          <Notice kind="error">
            Over budget by ${Math.round(b.spentM - b.totalM)}M. An over-budget mission cannot succeed.
            <SourceChip id={BUDGET_SOURCE} />
          </Notice>
        ) : (
          b.reserveFraction < C.RESERVE_FRACTION && (
            <Notice kind="warning">
              Budget reserve is {Math.round(b.reserveFraction * 100)}%. NASA’s CubeSat 101 guide advises project reserves of at least {Math.round(C.RESERVE_FRACTION * 100)}% of the budget.
              <SourceChip id="S2" />
            </Notice>
          )
        )}
        {anyNo && (
          <Notice kind="error">
            {solo ? 'A No-Go means you see a problem.' : 'A No-Go means someone sees a problem.'} Go back{solo ? ' and' : ', discuss and'} change the design — or launch anyway and keep only {teamPoints(goCount, players)} of {TEAM_POINTS_MAX} team points.
            <SourceChip id="GAME" />
          </Notice>
        )}
      </div>

      {/* With a No-Go on the table, revising becomes the recommended action and launching the outlined, costly one. */}
      <div className="mt-5 flex flex-wrap justify-end gap-2.5">
        <button type="button" onClick={props.onBack} className={`flex-1 sm:flex-none ${anyNo ? BTN_PRIMARY : BTN_SECONDARY}`}>
          ← Revise design
        </button>
        {anyNo ? (
          <button type="button" disabled={!allVoted} onClick={props.onLaunch} className={`flex-1 whitespace-nowrap sm:flex-none ${BTN_WARNING}`}>
            <span aria-hidden>⚠</span> Launch anyway ({goCount} of {players} Go)
          </button>
        ) : (
          <button
            type="button"
            disabled={!allVoted}
            onClick={props.onLaunch}
            aria-label={allVoted ? 'Launch' : solo ? 'Launch, disabled until you vote' : 'Launch, disabled until every player has voted'}
            className={`flex-1 sm:flex-none ${BTN_PRIMARY} ${allVoted ? 'motion-safe:animate-launch-pulse' : ''}`}
          >
            🚀 Launch
          </button>
        )}
      </div>
    </section>
  )
}

function MissionRun({ choice, goVotes, players, onDone }: { choice: Choice; goVotes: number; players: number; onDone: () => void }) {
  const card = useMemo(() => evaluateMission(choice, goVotes, players), [choice, goVotes, players])
  const day = useMemo(() => missionDay(choice), [choice])
  // Stable references: the film's animation loop must not restart every time this screen re-renders.
  const parts = useMemo(() => shipParts(choice), [choice])
  const stepLabels = useMemo(() => card.timeline.map((e) => e.label), [card])
  const orbit = C.byId(C.ORBITS, choice.orbitId)!
  const total = card.timeline.length
  // With motion allowed, the film sets the pace and the timeline follows it. With reduced motion there is no
  // film: the steps appear on a timer beside a still picture of each one.
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const film = !reduced && day !== null
  const [step, setStep] = useState(film ? 1 : 0)
  const [dayIndex, setDayIndex] = useState<number | null>(null)
  const [filmDone, setFilmDone] = useState(false)
  const [finish, setFinish] = useState(0)
  useEffect(() => {
    if (film || step >= total) return
    const t = setTimeout(() => setStep((s) => s + 1), 1300)
    return () => clearTimeout(t)
  }, [film, step, total])
  // Once the mission has been watched to the end the scorecard stays available, even while replaying the film.
  const [watched, setWatched] = useState(false)
  const onProgress = useCallback((p: FilmProgress) => {
    setStep(p.step)
    setDayIndex(p.dayIndex)
    setFilmDone(p.done)
    if (p.done) setWatched(true)
  }, [])
  const done = film ? filmDone : step >= total
  return (
    <section>
      <ScreenTitle screen="run" title="5 · Mission simulation" />
      <div className="mt-3 flex justify-between text-small">
        <span className="text-ink-2">Mission progress</span>
        <span className="font-display tabular-nums">
          Step {step} of {total}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`Mission progress: step ${step} of ${total}`}
        aria-valuenow={step}
        aria-valuemin={0}
        aria-valuemax={total}
        className="mt-1 h-3 overflow-hidden rounded-pill border border-space-border bg-space-card"
      >
        <div className="h-full rounded-pill bg-st-warning transition-[width] duration-700 ease-linear" style={{ width: `${(100 * step) / total}%` }} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-6">
        <div className="min-w-0 lg:sticky lg:top-36 lg:self-start">
          {film && day ? (
            <MissionFilm day={day} parts={parts} color={ORBIT_COLOR[orbit.id]} scenarioId={choice.scenarioId ?? ''} stepLabels={stepLabels} finish={finish} onProgress={onProgress} />
          ) : (
            <MissionScene step={Math.max(1, step)} name={card.timeline[Math.max(1, step) - 1].label} orbit={orbit.short} color={ORBIT_COLOR[orbit.id]} />
          )}
        </div>
      <ol aria-live="polite" aria-label="Mission timeline" className="flex min-w-0 flex-col gap-2.5">
        {card.timeline.map((e, i) =>
          i < step ? (
            <li key={i} className={`flex gap-3 rounded-md border-2 px-3.5 py-3 motion-safe:animate-card-in ${i === step - 1 && !done ? 'border-st-warning bg-space-raised' : 'border-space-border bg-space-card'}`}>
              <span aria-hidden className={`grid size-8 shrink-0 place-items-center rounded-pill font-display text-space-page ${i === step - 1 && !done ? 'bg-st-warning' : 'bg-st-success'}`}>
                {i === step - 1 && !done ? i + 1 : '✓'}
              </span>
              <div className="min-w-0">
                <h3 className="font-display">
                  <span className="sr-only">
                    Step {i + 1} of {total}:{' '}
                  </span>
                  {e.label}
                </h3>
                <p className="text-[15px] tabular-nums text-ink-2">
                  <Sourced reason={e} />
                </p>
              </div>
            </li>
          ) : (
            <li key={i} aria-hidden className="flex items-center gap-3 rounded-md border-2 border-dashed border-space-border px-3.5 py-2.5 font-display text-ink-2">
              <span className="grid size-8 place-items-center rounded-pill border-2 border-space-border">{i + 1}</span>
              {e.label}
            </li>
          ),
        )}
      </ol>
      </div>
      {/* Telemetry for the same day the film shows: it follows the film's clock, or runs by itself without the film. */}
      {day && (
        <div className="mt-4">
          <DayView day={day} color={ORBIT_COLOR[orbit.id]} active={step >= 2} syncIndex={film ? dayIndex : undefined} />
        </div>
      )}
      <div className="mt-5 flex flex-wrap justify-end gap-2.5">
        {!done && !watched && (
          <button
            type="button"
            onClick={() => {
              if (film) setFinish((n) => n + 1)
              else setStep(total)
            }}
            className={BTN_SECONDARY}
          >
            Skip
          </button>
        )}
        <button type="button" disabled={!done && !watched} onClick={onDone} className={BTN_PRIMARY}>
          See scorecard →
        </button>
      </div>
    </section>
  )
}

function Score({ choice, goVotes, players, onReplay, onRevise, onHome }: { choice: Choice; goVotes: number; players: number; onReplay: () => void; onRevise: () => void; onHome: () => void }) {
  const card = evaluateMission(choice, goVotes, players)
  const mission = useFlownMission(choice, goVotes, players)
  const b = budget(choice)
  // The engine only says success or not; the screen explains which of the two rules failed.
  const failure = card.success ? null : b.spentM > b.totalM ? 'budget' : 'score'
  return (
    <section>
      <ScreenTitle screen="score" title="6 · Mission scorecard" />
      <BadgeCelebration fresh={mission.fresh} />
      <div className={`${CARD} mt-4 flex flex-col items-center gap-4 p-4 sm:flex-row sm:items-start`}>
        <div className="flex flex-col items-center gap-1">
          <Gauge score={card.score} success={card.success} />
          <div className={`font-display text-card ${card.success ? 'text-st-success' : 'text-st-error'}`}>{card.success ? '✓ Mission success' : '✕ Mission failed'}</div>
          <div className="text-caption text-ink-muted">
            Score and breakdown
            <SourceChip id={card.scoreSource} />
          </div>
        </div>
        <div className="flex w-full flex-1 flex-col gap-3">
          {card.breakdown.map((x) => (
            <Meter key={x.label} label={x.label} value={x.points} max={x.max} unit="" />
          ))}
        </div>
      </div>
      {failure && (
        <div className="mt-3">
          <Notice kind="error">
            {failure === 'budget' ? (
              <>
                The design costs ${Math.round(b.spentM)}M against a ${Math.round(b.totalM)}M budget. An over-budget mission cannot succeed.
                <SourceChip id={BUDGET_SOURCE} />
              </>
            ) : (
              <>
                A mission needs at least {SUCCESS_SCORE_MIN} points to succeed. This one scored {card.score}.
                <SourceChip id={card.scoreSource} />
              </>
            )}
          </Notice>
        </div>
      )}
      <div className="mt-4 flex flex-col gap-3">
        <Insight title="Primary constraint" reason={card.primaryConstraint} />
        <Insight title="Biggest impact" reason={card.biggestImpact} />
        <Insight title="Lesson learned" reason={card.lesson} />
      </div>
      <MissionBadges mission={mission} />
      {leaderboardEnabled && <SaveScore choice={choice} goVotes={goVotes} players={players} />}
      <details className={`${CARD} mt-4 p-3.5 text-small`}>
        <summary className="min-h-[44px] cursor-pointer content-center font-display text-card">Sources & assumptions</summary>
        <ul className="mt-2 flex flex-col gap-2 text-ink-2">
          {card.sources.map((id) => (
            <li key={id}>
              <span className="-ml-1">
                <SourceChip id={id} link={false} />
              </span>{' '}
              {SOURCES[id].url ? (
                <a className="inline-flex min-h-[44px] items-center gap-1 underline underline-offset-2 hover:text-ink" href={SOURCES[id].url} target="_blank" rel="noreferrer">
                  {SOURCES[id].title} <span aria-hidden>↗</span>
                </a>
              ) : (
                SOURCES[id].title
              )}
            </li>
          ))}
        </ul>
      </details>
      {/* After a failure the recommended action is to fix the design, not to start over. */}
      <div className="mt-5 flex flex-wrap justify-end gap-2.5">
        <button type="button" onClick={onHome} className={`w-full sm:mr-auto sm:w-auto ${BTN_SECONDARY}`}>
          <span aria-hidden>⌂</span> Home
        </button>
        <button type="button" onClick={onRevise} className={`flex-1 sm:flex-none ${card.success ? BTN_SECONDARY : BTN_PRIMARY}`}>
          ← Try another design
        </button>
        <button type="button" onClick={onReplay} className={`flex-1 sm:flex-none ${card.success ? BTN_PRIMARY : BTN_SECONDARY}`}>
          Replay mission
        </button>
      </div>
    </section>
  )
}

const HOW_ICONS = [
  { icon: '◉', color: 'var(--color-role-science)' },
  { icon: '◯', color: 'var(--color-orbit-sso)' },
  { icon: '☰', color: 'var(--color-role-spacecraft)' },
  { icon: '▲', color: 'var(--color-role-launch)' },
]

function About({ onBack }: { onBack: () => void }) {
  const nasa = SOURCE_ORDER.filter((id) => SOURCES[id].url)
  const other = SOURCE_ORDER.filter((id) => !SOURCES[id].url)
  const box = `${CARD} flex flex-col gap-3 p-4`
  return (
    <section>
      <button type="button" onClick={onBack} className={BTN_SECONDARY}>
        ← Back to mission
      </button>
      <h1 className="mt-4 text-screen">About & sources</h1>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="flex min-w-0 flex-col gap-4">
          <section aria-labelledby="h-what" className={box}>
            <h2 id="h-what" className="text-section">
              What is Status: GO?
            </h2>
            <p className="text-body text-ink-2">{PITCH}</p>
            <div className="relative flex flex-wrap items-end justify-center gap-1 pb-7 pt-2">
              <RoleCharacter role="science" mood="cheer" decorative className="size-12" />
              <RoleCharacter role="space" decorative className="size-12" />
              <ShipSvg payload="prism" power="small" antenna="polar" launcher="medium" className="h-[120px] w-auto" />
              <RoleCharacter role="ground" decorative className="size-12" />
              <RoleCharacter role="launch" mood="cheer" decorative className="size-12" />
              <AiGeneratedLabel className="absolute bottom-0 right-0" />
            </div>
          </section>

          <section aria-labelledby="h-how" className={box}>
            <h2 id="h-how" className="text-section">
              How to play
            </h2>
            <ol className="flex flex-col gap-2.5">
              {HOW_TO_PLAY.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-md border border-space-border bg-space-raised font-display text-[18px]" style={{ color: HOW_ICONS[i % HOW_ICONS.length].color }}>
                    {HOW_ICONS[i % HOW_ICONS.length].icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display">
                      <span className="tabular-nums text-ink-2">{i + 1} ·</span> {s.title}
                    </h3>
                    <p className="text-small text-ink-2">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="rounded-md bg-space-raised p-3 text-small">
              {ROLES_NOTE}
              <SourceChip id="S3" />
            </p>
          </section>

          <section aria-labelledby="h-numbers" className={box}>
            <h2 id="h-numbers" className="text-section">
              Where the numbers come from
            </h2>
            <p className="text-small text-ink-2">Every number in the game carries a tag saying where it comes from.</p>
            <ul className="flex flex-col gap-3 text-small">
              <li>
                <span className="-ml-1">
                  <SourceChip id="S1" link={false} />
                </span>{' '}
                <span className="font-bold text-ink">An official resource from NASA or a partner space agency (NOAA, ESA).</span> <span className="text-ink-2">Tap a tag with an arrow to open it.</span>
              </li>
              {other.map((id) => (
                <li key={id}>
                  <span className="-ml-1">
                    <SourceChip id={id} />
                  </span>{' '}
                  <span className="font-bold text-ink">{SOURCES[id].title}.</span> <span className="text-ink-2">{SOURCES[id].use}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <section aria-labelledby="h-sources" className={box}>
            <h2 id="h-sources" className="text-section">
              NASA and partner agency data and resources
            </h2>
            <ul className="flex flex-col">
              {nasa.map((id) => (
                <li key={id} className="border-t border-space-border py-2.5 text-small first:border-t-0 first:pt-0">
                  <a className="inline-flex min-h-[44px] items-center gap-1 font-bold text-ink underline underline-offset-2" href={SOURCES[id].url} target="_blank" rel="noreferrer" aria-label={`${SOURCES[id].title}, opens in a new tab`}>
                    {SOURCES[id].title} <span aria-hidden>↗</span>
                  </a>
                  <SourceChip id={id} link={false} />
                  <p className="text-ink-2">{SOURCES[id].use}</p>
                  {SOURCES[id].quote && (
                    <blockquote className="mt-2 border-l-2 border-space-border pl-3 text-ink-2">
                      “{SOURCES[id].quote}” <span className="text-ink-muted">— {SOURCES[id].cite}</span>
                    </blockquote>
                  )}
                  {SOURCES[id].more?.map((m) => (
                    <blockquote key={m.cite} className="mt-2 border-l-2 border-space-border pl-3 text-ink-2">
                      “{m.quote}” <span className="text-ink-muted">— {m.cite}</span>
                    </blockquote>
                  ))}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="h-ai" className="flex flex-col gap-3 rounded-lg border-2 border-st-available bg-space-raised p-4">
            <h2 id="h-ai" className="flex items-center gap-2.5 text-section">
              <span aria-hidden className="grid size-8 place-items-center rounded-[10px] bg-st-available text-space-page">
                ✦
              </span>
              Use of SI (Super Intelligence)
            </h2>
            <p className="text-[15px]">{AI_DISCLOSURE}</p>
            <p className="flex flex-wrap items-center gap-2 text-[15px]">
              {AI_IMAGES_NOTE}
              <AiGeneratedLabel />
            </p>
          </section>

          <section aria-labelledby="h-nasa" className={box}>
            <h2 id="h-nasa" className="text-section">
              Not affiliated with NASA
            </h2>
            <p className="text-[15px] text-ink-2">{DISCLAIMER}</p>
          </section>

          <section aria-labelledby="h-team" className={box}>
            <h2 id="h-team" className="text-section">
              Team · One Pixel Home
            </h2>
            <ul className="grid grid-cols-2 gap-2.5">
              {TEAM.map((t) => (
                <li key={t.name} className="flex flex-col items-center gap-1.5 rounded-md bg-space-raised px-2 py-3 text-center">
                  <RoleCharacter role={t.role} decorative bg="var(--color-space-raised)" className="size-12" />
                  <span className="font-display leading-tight">{t.name}</span>
                  <span className="text-[13px] text-ink-2">{t.title}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <footer className="mt-5 flex flex-wrap justify-between gap-x-4 gap-y-1.5 border-t border-space-border pt-4 text-[13px] text-ink-2">
        {FOOTER_NOTES.map((n) => (
          <span key={n}>{n}</span>
        ))}
      </footer>

      <div className="mt-5">
        <button type="button" onClick={onBack} className={BTN_PRIMARY}>
          ← Back to mission
        </button>
      </div>
    </section>
  )
}

function Insight({ title, reason }: { title: string; reason: Reason }) {
  return (
    <div className={`${CARD} p-3.5`}>
      <h3 className="text-caption font-bold uppercase tracking-widest text-ink-muted">{title}</h3>
      <div className="mt-1 text-[15px] text-ink">
        <Sourced reason={reason} />
      </div>
    </div>
  )
}
