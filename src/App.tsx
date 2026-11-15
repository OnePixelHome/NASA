import { useEffect, useMemo, useState, type ReactNode } from 'react'
import * as C from './engine/catalog'
import { budget, BUDGET_SOURCE, choose, evaluateMission, isComplete, missionRequirements, orbitSources, orbitStats, resources, SUCCESS_SCORE_MIN, TEAM_POINTS_MAX, TEAM_ROLES, teamPoints, TIER_ORDER, tierOptions, type Choice, type NodeState } from './engine/game'
import { AI_DISCLOSURE, DISCLAIMER, PITCH, SOURCE_ORDER, SOURCES, type Reason } from './engine/sources'
import { RoleCharacter } from './ui/Crew'
import { MissionArt, OrbitDiagram } from './ui/MissionArt'
import { MissionScene } from './ui/MissionScene'
import { ShipSvg } from './ui/Ship'
import { ROLE_UI, shipParts } from './ui/theme'
import { Bar, BTN_PRIMARY, BTN_SECONDARY, BTN_WARNING, Gauge, Meter, ReasonList, ResourcePanel, RoleTag, SourceChip, SourceChips, Sourced } from './ui/components'

type Screen = 'brief' | 'orbit' | 'tree' | 'go' | 'run' | 'score'
const SCREEN_NUMBER: Record<Screen, number> = { brief: 1, orbit: 2, tree: 3, go: 4, run: 5, score: 6 }
const ORBIT_COLOR: Record<string, string> = { leo: 'var(--color-orbit-leo)', sso: 'var(--color-orbit-sso)', geo: 'var(--color-orbit-geo)' }

type Votes = Record<C.Role, boolean | null>
const NO_VOTES: Votes = { science: null, space: null, ground: null, launch: null }

const CARD = 'rounded-lg border border-space-border bg-space-card'
const PICK_CARD = `${CARD} border-2 p-4 text-left shadow-raised transition duration-[var(--duration-fast)] hover:border-st-available`

export default function App() {
  const [screen, setScreen] = useState<Screen>('brief')
  const [choice, setChoice] = useState<Choice>({})
  const [focus, setFocus] = useState<{ tier: C.Tier; node: NodeState } | null>(null)
  const [votes, setVotes] = useState<Votes>(NO_VOTES)
  const scenario = C.byId(C.SCENARIOS, choice.scenarioId)
  const orbit = C.byId(C.ORBITS, choice.orbitId)
  const goVotes = Object.values(votes).filter((v) => v === true).length
  const [about, setAbout] = useState(false)
  const [panelOpen, setPanelOpen] = useState(true) // phones can fold the resource panel into one line

  // A new screen starts at its top; without this the page keeps the previous screen's scroll position.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [screen, about])

  const restart = () => {
    setAbout(false)
    setChoice({})
    setFocus(null)
    setVotes(NO_VOTES)
    setScreen('brief')
  }

  return (
    <div className="min-h-dvh bg-space-page font-body text-ink">
      <header className="sticky top-0 z-10 border-b border-space-border bg-space-page/95 px-4 py-2 backdrop-blur">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={restart} className="min-h-[44px] text-left" aria-label="Trajectory Ladder: start over">
              <div className="font-display text-[18px] leading-tight">Trajectory Ladder</div>
              {/* The tagline gives way to the resource panel once a mission is picked, to save phone space. */}
              {!scenario && <div className="text-caption text-ink-muted">Design a space mission. Watch every choice ripple down.</div>}
            </button>
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
              setVotes(NO_VOTES) // a changed design needs a fresh poll
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
              setVotes(NO_VOTES) // a changed design needs a fresh poll
            }}
            onChangeOrbit={() => setScreen('orbit')}
            onDone={() => setScreen('go')}
          />
        )}
        {screen === 'go' && <GoNoGo votes={votes} setVotes={setVotes} choice={choice} onBack={() => setScreen('tree')} onLaunch={() => setScreen('run')} />}
        {screen === 'run' && <MissionRun choice={choice} goVotes={goVotes} onDone={() => setScreen('score')} />}
        {screen === 'score' && <Score choice={choice} goVotes={goVotes} onReplay={restart} onRevise={() => setScreen('tree')} />}
      </main>
    </div>
  )
}

/** Screen heading: step counter, title and one line of guidance. */
function ScreenTitle({ screen, title, children }: { screen: Screen; title: string; children?: ReactNode }) {
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
              <MissionArt id={s.id} />
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
          <ShipSvg {...shipParts(choice)} className="h-[150px] w-auto shrink-0 lg:h-[340px]" />
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

function GoNoGo(props: { votes: Votes; setVotes: (v: Votes) => void; choice: Choice; onBack: () => void; onLaunch: () => void }) {
  const { votes, setVotes, choice } = props
  const b = budget(choice)
  const cast = Object.values(votes)
  const allVoted = cast.every((v) => v !== null)
  const goCount = cast.filter((v) => v === true).length
  const noCount = cast.filter((v) => v === false).length
  const anyNo = noCount > 0
  return (
    <section>
      <ScreenTitle screen="go" title="4 · Go / No-Go poll">
        Like a real launch, every role is polled. Playing as a team? Each player votes for their role. A unanimous Go earns the full team score.
      </ScreenTitle>

      <div className="mt-5 flex items-baseline justify-between gap-2">
        <h2 className="text-section">Team poll</h2>
        <span role="status" className="font-display tabular-nums text-ink-2">
          {goCount} Go · {noCount} No-Go · {TEAM_ROLES - goCount - noCount} waiting
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {(Object.keys(votes) as C.Role[]).map((r) => {
          const v = votes[r]
          const status = v === true ? '✓ GO' : v === false ? '✕ NO-GO' : '… waiting…'
          return (
            <section
              key={r}
              aria-label={`${C.ROLE_LABEL[r]}: ${v === true ? 'GO' : v === false ? 'NO-GO' : 'waiting'}`}
              className={`flex min-w-0 flex-col items-center gap-2 rounded-lg border-2 px-2.5 pb-2.5 pt-3.5 ${v === true ? 'border-st-success bg-space-raised' : v === false ? 'border-st-error bg-space-raised' : 'border-space-border bg-space-card'}`}
            >
              {/* Re-keyed on each vote so the character pops once. */}
              <span key={String(v)} className={v === null ? '' : 'motion-safe:animate-pop'}>
                <RoleCharacter role={r} mood={v === false ? 'worried' : v === true ? 'cheer' : 'neutral'} decorative bg={v === null ? undefined : 'var(--color-space-raised)'} className="size-14" />
              </span>
              <RoleTag role={r} label={C.ROLE_LABEL[r]} />
              <span className={`font-display text-[18px] tracking-wide ${v === true ? 'text-st-success' : v === false ? 'text-st-error' : 'text-ink-2'}`}>
                {status}
              </span>
              <div className="flex w-full gap-1.5">
                <button
                  type="button"
                  aria-pressed={v === true}
                  aria-label={`${C.ROLE_LABEL[r]} votes Go`}
                  onClick={() => setVotes({ ...votes, [r]: true })}
                  className={`min-h-12 flex-1 rounded-md border-2 font-display transition active:scale-[.92] ${v === true ? 'border-st-success bg-st-success text-space-page' : 'border-space-border bg-space-card hover:border-st-available'}`}
                >
                  ✓ Go
                </button>
                <button
                  type="button"
                  aria-pressed={v === false}
                  aria-label={`${C.ROLE_LABEL[r]} votes No-Go`}
                  onClick={() => setVotes({ ...votes, [r]: false })}
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
            A No-Go means someone sees a problem. Go back, discuss and change the design — or launch anyway and keep only {teamPoints(goCount)} of {TEAM_POINTS_MAX} team points.
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
            <span aria-hidden>⚠</span> Launch anyway ({goCount} of {TEAM_ROLES} Go)
          </button>
        ) : (
          <button
            type="button"
            disabled={!allVoted}
            onClick={props.onLaunch}
            aria-label={allVoted ? 'Launch' : 'Launch, disabled until all four roles have voted'}
            className={`flex-1 sm:flex-none ${BTN_PRIMARY} ${allVoted ? 'motion-safe:animate-launch-pulse' : ''}`}
          >
            🚀 Launch
          </button>
        )}
      </div>
    </section>
  )
}

function MissionRun({ choice, goVotes, onDone }: { choice: Choice; goVotes: number; onDone: () => void }) {
  const card = useMemo(() => evaluateMission(choice, goVotes), [choice, goVotes])
  const orbit = C.byId(C.ORBITS, choice.orbitId)!
  const total = card.timeline.length
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (step >= total) return
    const t = setTimeout(() => setStep((s) => s + 1), 1300)
    return () => clearTimeout(t)
  }, [step, total])
  const done = step >= total
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
          <MissionScene step={Math.max(1, step)} name={card.timeline[Math.max(1, step) - 1].label} orbit={orbit.short} color={ORBIT_COLOR[orbit.id]} />
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
      <div className="mt-5 flex flex-wrap justify-end gap-2.5">
        {!done && (
          <button type="button" onClick={() => setStep(total)} className={BTN_SECONDARY}>
            Skip
          </button>
        )}
        <button type="button" disabled={!done} onClick={onDone} className={BTN_PRIMARY}>
          See scorecard →
        </button>
      </div>
    </section>
  )
}

function Score({ choice, goVotes, onReplay, onRevise }: { choice: Choice; goVotes: number; onReplay: () => void; onRevise: () => void }) {
  const card = evaluateMission(choice, goVotes)
  const b = budget(choice)
  // The engine only says success or not; the screen explains which of the two rules failed.
  const failure = card.success ? null : b.spentM > b.totalM ? 'budget' : 'score'
  return (
    <section>
      <ScreenTitle screen="score" title="6 · Mission scorecard" />
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

function About({ onBack }: { onBack: () => void }) {
  const nasa = SOURCE_ORDER.filter((id) => SOURCES[id].url)
  const other = SOURCE_ORDER.filter((id) => !SOURCES[id].url)
  return (
    <section>
      <h1 className="text-screen">About & sources</h1>
      <p className="mt-2 text-body text-ink-2">{PITCH}</p>

      <h2 className="mt-6 text-section">How to read the source tags</h2>
      <p className="mt-1 text-small text-ink-2">Every number in the game carries a tag saying where it comes from.</p>
      <ul className="mt-3 flex flex-col gap-3">
        {other.map((id) => (
          <li key={id} className={`${CARD} p-3.5 text-small`}>
            <div className="font-bold text-ink">
              <span className="-ml-1">
                <SourceChip id={id} />
              </span>{' '}
              {SOURCES[id].title}
            </div>
            <p className="mt-1 text-ink-2">{SOURCES[id].use}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-6 text-section">NASA data and resources</h2>
      <ul className="mt-3 flex flex-col gap-3">
        {nasa.map((id) => (
          <li key={id} className={`${CARD} p-3.5 text-small`}>
            <a className="inline-flex min-h-[44px] items-center gap-1 font-bold text-ink underline underline-offset-2" href={SOURCES[id].url} target="_blank" rel="noreferrer">
              {SOURCES[id].title} <span aria-hidden>↗</span>
            </a>
            <SourceChip id={id} link={false} />
            <p className="mt-1 text-ink-2">{SOURCES[id].use}</p>
            {SOURCES[id].quote && (
              <blockquote className="mt-2 border-l-2 border-space-border pl-3 text-ink-2">
                “{SOURCES[id].quote}” <span className="whitespace-nowrap text-ink-muted">— {SOURCES[id].cite}</span>
              </blockquote>
            )}
          </li>
        ))}
      </ul>

      <h2 className="mt-6 text-section">Use of AI</h2>
      <p className={`${CARD} mt-2 p-3.5 text-small text-ink-2`}>{AI_DISCLOSURE}</p>

      <p className="mt-6 text-caption text-ink-muted">{DISCLAIMER}</p>

      <div className="mt-6">
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
