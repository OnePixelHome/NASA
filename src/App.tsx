import { useEffect, useMemo, useState } from 'react'
import * as C from './engine/catalog'
import { budget, BUDGET_SOURCE, choose, evaluateMission, isComplete, orbitSources, orbitStats, TIER_ORDER, tierOptions, type Choice, type NodeState } from './engine/game'
import { SOURCES, type Reason } from './engine/sources'
import { Bar, Gauge, Meter, ReasonList, SourceChip, SourceChips, Sourced } from './ui/components'

type Screen = 'brief' | 'orbit' | 'tree' | 'go' | 'run' | 'score'
const ORBIT_COLOR: Record<string, string> = { leo: 'bg-sky-400', sso: 'bg-violet-400', geo: 'bg-amber-400' }
const ROLE_COLOR: Record<C.Role, string> = { science: 'bg-pink-600', space: 'bg-indigo-600', ground: 'bg-teal-600', launch: 'bg-orange-600' }

export default function App() {
  const [screen, setScreen] = useState<Screen>('brief')
  const [choice, setChoice] = useState<Choice>({})
  const [focus, setFocus] = useState<{ tier: C.Tier; node: NodeState } | null>(null)
  const [votes, setVotes] = useState<Record<C.Role, boolean | null>>({ science: null, space: null, ground: null, launch: null })
  const scenario = C.byId(C.SCENARIOS, choice.scenarioId)
  const orbit = C.byId(C.ORBITS, choice.orbitId)

  const restart = () => {
    setChoice({})
    setFocus(null)
    setVotes({ science: null, space: null, ground: null, launch: null })
    setScreen('brief')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <button onClick={restart} className="text-left">
            <div className="text-lg font-bold tracking-tight">Trajectory Ladder</div>
            <div className="text-xs text-slate-400">Design a space mission. Watch every choice ripple down.</div>
          </button>
          {scenario && <div className="w-44 shrink-0"><BudgetMeter choice={choice} /></div>}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-6">
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
            onPick={(tier, id) => setChoice((c) => choose(c, tier, id))}
            onChangeOrbit={() => setScreen('orbit')}
            onDone={() => setScreen('go')}
          />
        )}
        {screen === 'go' && (
          <GoNoGo votes={votes} setVotes={setVotes} choice={choice} onBack={() => setScreen('tree')} onLaunch={() => setScreen('run')} />
        )}
        {screen === 'run' && <MissionRun choice={choice} onDone={() => setScreen('score')} />}
        {screen === 'score' && <Score choice={choice} goVotes={Object.values(votes).filter(Boolean).length} onReplay={restart} onRevise={() => setScreen('tree')} />}
      </main>
    </div>
  )
}

function BudgetMeter({ choice }: { choice: Choice }) {
  const b = budget(choice)
  return <Meter label="Budget" value={b.spentM} max={b.totalM} unit="$" warnAt={b.totalM * (1 - C.RESERVE_FRACTION)} source={BUDGET_SOURCE} />
}

function Brief({ onPick }: { onPick: (id: string) => void }) {
  return (
    <section>
      <h1 className="text-2xl font-bold">1 · Pick your mission</h1>
      <p className="mt-1 text-slate-400">Every mission starts with a science goal. It decides what “success” means.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {C.SCENARIOS.map((s) => (
          <button key={s.id} onClick={() => onPick(s.id)} className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-left transition hover:border-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
            <div className="text-lg font-semibold">{s.title}</div>
            <p className="mt-1 text-sm text-slate-300">{s.story}</p>
            <div className="mt-3 text-xs text-slate-400">
              Budget ${s.budgetM}M
              <SourceChip id={BUDGET_SOURCE} link={false} />
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function OrbitPick({ scenario, selected, onPick }: { scenario: C.Scenario; selected?: string; onPick: (id: string) => void }) {
  return (
    <section>
      <h1 className="text-2xl font-bold">2 · Choose a trajectory</h1>
      <p className="mt-1 text-slate-400">
        Mission: <span className="text-slate-200">{scenario.story}</span>
      </p>
      <p className="mt-2 inline-block rounded bg-slate-800 px-2 py-1 text-xs text-amber-300">Bars are illustrative values for educational purposes, derived from the physics below.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {C.ORBITS.map((o) => {
          const st = orbitStats(o)
          const col = ORBIT_COLOR[o.id]
          return (
            <button
              key={o.id}
              onClick={() => onPick(o.id)}
              className={`rounded-xl border bg-slate-900 p-4 text-left transition hover:border-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${selected === o.id ? 'border-sky-400' : 'border-slate-700'}`}
            >
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-semibold">{o.short}</span>
                <span className={`h-3 w-3 rounded-full ${col}`} />
              </div>
              <div className="text-sm text-slate-400">{o.name}</div>
              <div className="mt-3 space-y-1.5">
                <Bar label="Fuel cost" value={st.bars.fuel} color={col} />
                <Bar label="Coverage" value={st.bars.coverage} color={col} />
                <Bar label="Lifetime" value={st.bars.lifetime} color={col} />
              </div>
              <p className="mt-3 text-xs text-slate-300">{o.blurb}</p>
              <ul className="mt-2 space-y-0.5 text-xs text-slate-400">
                <li>Altitude {o.altKm.toLocaleString()} km · {st.periodMin.toFixed(0)} min/orbit</li>
                <li>{st.continuousView ? 'Fixed view of one hemisphere' : `Reaches ±${st.maxLatDeg.toFixed(1)}° latitude`}</li>
                <li>+{st.extraDvKmS.toFixed(2)} km/s beyond a 200 km orbit</li>
              </ul>
              <div className="mt-2 -ml-1">
                <SourceChips ids={orbitSources(o)} link={false} />
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

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
  const key: Record<C.Tier, keyof Choice> = { instrument: 'instrumentId', power: 'powerId', downlink: 'downlinkId', launch: 'launchId' }
  return (
    <section>
      <h1 className="text-2xl font-bold">3 · Build the mission tree</h1>
      <p className="mt-1 text-slate-400">Green options work with everything above them. Tap a locked one to see why.</p>

      <div className="mt-5 flex flex-col items-center">
        <button onClick={props.onChangeOrbit} className={`rounded-full px-5 py-2 font-semibold text-slate-950 ${ORBIT_COLOR[orbit.id]}`} title="Change trajectory">
          {orbit.short} · {orbit.altKm.toLocaleString()} km ↺
        </button>
        <div className="mt-1">
          <SourceChips ids={orbitSources(orbit)} />
        </div>

        {TIER_ORDER.map((tier) => {
          const nodes = tierOptions(tier, choice)
          const role = C.TIER_ROLE[tier]
          const selectedId = choice[key[tier]]
          return (
            <div key={tier} className="flex w-full flex-col items-center">
              <div className="h-6 w-px bg-slate-600" />
              <div className={`w-full rounded-xl border p-3 ${nodes.length ? 'border-slate-700 bg-slate-900' : 'border-dashed border-slate-800 bg-slate-950'}`}>
                <div className="mb-2 flex items-center gap-2 text-sm">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${ROLE_COLOR[role]}`}>{C.ROLE_LABEL[role]}</span>
                  <span className="font-medium">{C.TIER_LABEL[tier]}</span>
                  {!nodes.length && <span className="text-slate-500">— choose the step above first</span>}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {nodes.map((n) => {
                    const sel = selectedId === n.id
                    return (
                      <button
                        key={n.id}
                        aria-pressed={sel}
                        aria-label={`${n.name}: ${n.ok ? 'available' : 'locked'}`}
                        onClick={() => {
                          onFocus({ tier, node: n })
                          if (n.ok) onPick(tier, n.id)
                        }}
                        className={`rounded-lg border p-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                          n.ok
                            ? sel
                              ? 'border-emerald-300 bg-emerald-600 text-white'
                              : 'border-emerald-700 bg-emerald-950 hover:bg-emerald-900'
                            : 'border-slate-700 bg-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="font-medium">
                          {n.ok ? (sel ? '✓ ' : '') : '🔒 '}
                          {n.name}
                        </div>
                        <div className="mt-1 text-[11px] opacity-80">
                          {n.ok ? (
                            <>
                              {n.facts.join(' · ')}
                              <SourceChip id={n.factsSource} link={false} />
                            </>
                          ) : (
                            'Locked — tap for why'
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
                {focus?.tier === tier && (
                  <div className={`mt-3 rounded-lg p-3 ${focus.node.ok ? 'bg-emerald-950/60' : 'bg-slate-800'}`}>
                    <div className="mb-1 text-sm font-semibold">
                      {focus.node.ok ? 'Why it works' : 'Why it is locked'}: {focus.node.name}
                    </div>
                    <ReasonList reasons={focus.node.reasons} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex justify-end">
        <button disabled={!isComplete(choice)} onClick={props.onDone} className="rounded-lg bg-sky-500 px-5 py-2.5 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">
          Go to Go / No-Go →
        </button>
      </div>
    </section>
  )
}

function GoNoGo(props: {
  votes: Record<C.Role, boolean | null>
  setVotes: (v: Record<C.Role, boolean | null>) => void
  choice: Choice
  onBack: () => void
  onLaunch: () => void
}) {
  const { votes, setVotes, choice } = props
  const b = budget(choice)
  const all = Object.values(votes).every((v) => v === true)
  const anyNo = Object.values(votes).some((v) => v === false)
  return (
    <section>
      <h1 className="text-2xl font-bold">4 · Go / No-Go poll</h1>
      <p className="mt-1 text-slate-400">Like a real launch: every role must say “Go”. Playing as a team? Each player votes for their role.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {(Object.keys(votes) as C.Role[]).map((r) => (
          <div key={r} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
            <div className="flex items-center justify-between">
              <span className={`rounded px-2 py-0.5 text-xs font-semibold ${ROLE_COLOR[r]}`}>{C.ROLE_LABEL[r]}</span>
              <span className="text-sm">{votes[r] === null ? 'waiting…' : votes[r] ? 'GO' : 'NO-GO'}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setVotes({ ...votes, [r]: true })} className={`flex-1 rounded-lg py-2 font-semibold ${votes[r] === true ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}>
                Go
              </button>
              <button onClick={() => setVotes({ ...votes, [r]: false })} className={`flex-1 rounded-lg py-2 font-semibold ${votes[r] === false ? 'bg-red-500 text-slate-950' : 'bg-slate-800'}`}>
                No-Go
              </button>
            </div>
          </div>
        ))}
      </div>
      {b.reserveFraction < C.RESERVE_FRACTION && (
        <p className="mt-4 rounded-lg bg-amber-950 p-3 text-sm text-amber-200">
          Budget reserve is {Math.round(b.reserveFraction * 100)}%. NASA guidance recommends keeping at least 10% in reserve.
          <SourceChip id="S2" />
        </p>
      )}
      {anyNo && <p className="mt-4 rounded-lg bg-red-950 p-3 text-sm text-red-200">A No-Go means someone sees a problem. Go back, discuss and change the design.</p>}
      <div className="mt-6 flex justify-between">
        <button onClick={props.onBack} className="rounded-lg bg-slate-800 px-4 py-2.5">
          ← Revise design
        </button>
        <button disabled={!all} onClick={props.onLaunch} className="rounded-lg bg-sky-500 px-5 py-2.5 font-semibold text-slate-950 disabled:opacity-40">
          🚀 Launch
        </button>
      </div>
    </section>
  )
}

function MissionRun({ choice, onDone }: { choice: Choice; onDone: () => void }) {
  const card = useMemo(() => evaluateMission(choice, 4), [choice])
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (step >= card.timeline.length) return
    const t = setTimeout(() => setStep((s) => s + 1), 1300)
    return () => clearTimeout(t)
  }, [step, card.timeline.length])
  const done = step >= card.timeline.length
  return (
    <section>
      <h1 className="text-2xl font-bold">5 · Mission simulation</h1>
      <div className="mt-4 h-2 rounded bg-slate-800">
        <div className="h-2 rounded bg-sky-400 transition-all duration-700" style={{ width: `${(100 * step) / card.timeline.length}%` }} />
      </div>
      <ol className="mt-5 space-y-3">
        {card.timeline.slice(0, step).map((e, i) => (
          <li key={i} className="rounded-lg border border-slate-700 bg-slate-900 p-3">
            <div className="text-sm font-semibold text-sky-300">{e.label}</div>
            <div className="text-sm text-slate-200">
              <Sourced reason={e} />
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex justify-end gap-2">
        {!done && (
          <button onClick={() => setStep(card.timeline.length)} className="rounded-lg bg-slate-800 px-4 py-2.5">
            Skip
          </button>
        )}
        <button disabled={!done} onClick={onDone} className="rounded-lg bg-sky-500 px-5 py-2.5 font-semibold text-slate-950 disabled:opacity-40">
          See scorecard →
        </button>
      </div>
    </section>
  )
}

function Score({ choice, goVotes, onReplay, onRevise }: { choice: Choice; goVotes: number; onReplay: () => void; onRevise: () => void }) {
  const card = evaluateMission(choice, goVotes)
  return (
    <section>
      <h1 className="text-2xl font-bold">6 · Mission scorecard</h1>
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center">
          <Gauge score={card.score} success={card.success} />
          <div className={`mt-1 font-semibold ${card.success ? 'text-emerald-400' : 'text-orange-400'}`}>{card.success ? 'Mission success' : 'Mission fell short'}</div>
          <div className="text-[11px] text-slate-400">
            Score and breakdown
            <SourceChip id={card.scoreSource} />
          </div>
        </div>
        <div className="w-full flex-1 space-y-2">
          {card.breakdown.map((b) => (
            <Meter key={b.label} label={b.label} value={b.points} max={b.max} unit="" />
          ))}
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <Insight title="Primary constraint" reason={card.primaryConstraint} />
        <Insight title="Biggest impact" reason={card.biggestImpact} />
        <Insight title="Lesson learned" reason={card.lesson} />
      </div>
      <details className="mt-6 rounded-lg bg-slate-900 p-3 text-sm">
        <summary className="cursor-pointer font-semibold">Sources & assumptions</summary>
        <ul className="mt-2 space-y-1 text-slate-300">
          {card.sources.map((id) => (
            <li key={id}>
              <SourceChip id={id} /> {SOURCES[id].url ? <a className="underline" href={SOURCES[id].url} target="_blank" rel="noreferrer">{SOURCES[id].title}</a> : SOURCES[id].title}
            </li>
          ))}
        </ul>
      </details>
      <div className="mt-6 flex justify-between">
        <button onClick={onRevise} className="rounded-lg bg-slate-800 px-4 py-2.5">
          ← Try another design
        </button>
        <button onClick={onReplay} className="rounded-lg bg-sky-500 px-5 py-2.5 font-semibold text-slate-950">
          Replay mission
        </button>
      </div>
    </section>
  )
}

function Insight({ title, reason }: { title: string; reason: Reason }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</div>
      <div className="mt-1 text-sm">
        <Sourced reason={reason} />
      </div>
    </div>
  )
}
