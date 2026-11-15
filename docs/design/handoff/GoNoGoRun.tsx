// Screens 4–5 — GoNoGo + MissionRun. React 19 + Tailwind v4, tokens from theme.css. No new game rules.
import { useEffect, useState } from "react";
import { Meter, SourceChip } from "./components";
import { ShipSvg } from "./Ship";
import { RoleCharacter } from "./MissionTree";

type Vote = boolean | null;
type Votes = { science: Vote; space: Vote; ground: Vote; launch: Vote };
const ROLES = [
  { key: "science", char: "science", label: "Science", icon: "◎", color: "var(--color-role-science)" },
  { key: "space", char: "spacecraft", label: "Spacecraft", icon: "◆", color: "var(--color-role-spacecraft)" },
  { key: "ground", char: "ground", label: "Ground", icon: "▲", color: "var(--color-role-ground)" },
  { key: "launch", char: "launch", label: "Launch", icon: "▮", color: "var(--color-role-launch)" },
] as const;

const PRIMARY = "min-h-[52px] max-w-[260px] flex-1 whitespace-nowrap rounded-pill border-2 border-st-selected bg-st-selected px-3 font-display text-[16px] text-space-page disabled:border-space-border disabled:bg-space-raised disabled:text-ink-2";
const SECONDARY = "min-h-[52px] max-w-[260px] flex-1 whitespace-nowrap rounded-pill border-2 border-space-border bg-space-card px-3 font-display text-[16px] hover:border-st-available";

export function GoNoGo({ votes, setVotes, choice, onBack, onLaunch, budget }: {
  votes: Votes; setVotes: (v: Votes) => void; choice: any; onBack: () => void; onLaunch: () => void;
  budget: { value: number; max: number };            // from budget(choice)
}) {
  const [pops, setPops] = useState<Record<string, number>>({});
  const vals = ROLES.map(r => votes[r.key]);
  const go = vals.filter(v => v === true).length, no = vals.filter(v => v === false).length;
  const allGo = go === 4;
  const reserve = Math.round(((budget.max - budget.value) / budget.max) * 100);
  const vote = (k: keyof Votes, v: boolean) => { setVotes({ ...votes, [k]: v }); setPops(p => ({ ...p, [k]: (p[k] ?? 0) + 1 })); };

  return (
    <div className="min-h-dvh bg-space-page font-body text-ink">
      <header className="flex flex-col gap-1.5 px-4 pt-5 lg:px-10 lg:pt-7">
        <p className="text-caption font-bold uppercase tracking-widest text-ink-muted">Screen 4 of 6</p>
        <h1 className="font-display text-screen">4 · Go / No-Go poll</h1>
        <p className="max-w-[62ch] text-body text-ink-2">Like a real launch: every role must say 'Go'. Playing as a team? Each player votes for their role.</p>
      </header>
      <div className="grid gap-4 p-4 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-8 lg:px-10">
        <aside aria-label="Design under review" className="flex min-w-0 flex-col gap-3 rounded-lg border border-space-border bg-space-card p-3.5">
          <DesignRecap choice={choice} />
          <Meter label="Budget" value={budget.value} max={budget.max} unit="$M" warnAt={budget.max * 0.9} />
          {reserve < 10 && (
            <p role="note" className="flex flex-wrap items-center gap-2 rounded-md border-2 border-st-warning px-3 py-2.5 text-small">
              <span><span aria-hidden className="text-st-warning">⚠ </span>Budget reserve is {reserve}%. NASA guidance recommends keeping at least 10% in reserve.</span>
              <SourceChip id="S2" href="https://www.nasa.gov/wp-content/uploads/2017/03/nasa_csli_cubesat_101_508.pdf" />
            </p>
          )}
        </aside>
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-section">Team poll</h2>
            <span role="status" className="font-display tabular">{go} Go · {no} No-Go · {4 - go - no} waiting</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            {ROLES.map(r => {
              const v = votes[r.key];
              const status = v === true ? "✓ GO" : v === false ? "✕ NO-GO" : "… waiting…";
              return (
                <section key={r.key} aria-label={`${r.label}: ${v === true ? "GO" : v === false ? "NO-GO" : "waiting"}`}
                  className={`flex min-w-0 flex-col items-center gap-2 rounded-lg border-2 px-2.5 pt-3.5 pb-2.5 ${v === true ? "border-st-success bg-space-raised" : v === false ? "border-st-error bg-space-raised" : "border-space-border bg-space-card"}`}>
                  <span key={pops[r.key] ?? 0} className={pops[r.key] ? "motion-safe:animate-[pop_420ms_var(--ease-orbit)]" : ""}>
                    <RoleCharacter role={r.char} mood={v === false ? "worried" : v === true ? "cheer" : "neutral"} className="size-14" />
                  </span>
                  <span className="text-caption font-bold" style={{ color: r.color }}>{r.icon} {r.label}</span>
                  <span className={`font-display text-[18px] tracking-wide ${v === true ? "text-st-success" : v === false ? "text-st-error" : "text-ink-2"}`}>{status}</span>
                  <div className="flex w-full gap-1.5">
                    <button type="button" aria-pressed={v === true} aria-label={`${r.label} votes Go`} onClick={() => vote(r.key, true)}
                      className={`min-h-12 flex-1 rounded-md border-2 font-display transition active:scale-[.92] ${v === true ? "border-st-success bg-st-success text-space-page" : "border-space-border bg-space-card"}`}>✓ Go</button>
                    <button type="button" aria-pressed={v === false} aria-label={`${r.label} votes No-Go`} onClick={() => vote(r.key, false)}
                      className={`min-h-12 flex-1 whitespace-nowrap rounded-md border-2 font-display transition active:scale-[.92] ${v === false ? "border-st-error bg-st-error text-space-page" : "border-space-border bg-space-card"}`}>✕ No-Go</button>
                  </div>
                </section>
              );
            })}
          </div>
          {no > 0 && (
            <p role="alert" className="flex gap-2 rounded-md border-2 border-st-error bg-space-raised px-3.5 py-3 text-[15px]">
              <span aria-hidden className="font-bold text-st-error">✕</span>A No-Go means someone sees a problem. Go back, discuss and change the design.
            </p>
          )}
        </div>
      </div>
      <footer className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2.5 border-t border-space-border bg-space-page p-4 lg:px-10">
        <button type="button" onClick={onBack} className={SECONDARY}>← Revise design</button>
        <button type="button" onClick={onLaunch} disabled={!allGo}
          aria-label={allGo ? "Launch" : "Launch, disabled until all four roles say Go"}
          className={`${PRIMARY} ${allGo ? "motion-safe:animate-[launch-pulse_900ms_ease-out_2]" : ""}`}>🚀 Launch</button>
      </footer>
    </div>
  );
}

export function MissionRun({ choice, onDone, timeline, orbitId }: {
  choice: any; onDone: () => void;
  timeline: { label: string; detail: string }[];      // evaluateMission(choice).timeline — 6 items
  orbitId: "LEO" | "SSO" | "GEO";
}) {
  const [step, setStep] = useState(1);
  const running = step < timeline.length;
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setStep(s => s + 1), 1300);
    return () => clearTimeout(t);
  }, [step, running]);

  return (
    <div className="min-h-dvh bg-space-page font-body text-ink">
      <header className="flex flex-col gap-2.5 px-4 pt-5 lg:px-10 lg:pt-7">
        <p className="text-caption font-bold uppercase tracking-widest text-ink-muted">Screen 5 of 6</p>
        <h1 className="font-display text-screen">5 · Mission simulation</h1>
        <div className="flex justify-between text-small"><span className="text-ink-2">Mission progress</span><span className="font-display tabular">Step {step} of 6</span></div>
        <div role="progressbar" aria-label={`Mission progress: step ${step} of 6`} aria-valuenow={step} aria-valuemin={0} aria-valuemax={6}
          className="h-3 overflow-hidden rounded-pill border border-space-border bg-space-card">
          <div className="h-full rounded-pill bg-st-warning transition-[width] duration-[1200ms] ease-linear" style={{ width: `${(step / 6) * 100}%` }} />
        </div>
      </header>
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8 lg:px-10">
        <div className="min-w-0 lg:sticky lg:top-4 lg:self-start"><MissionScene step={step} orbitId={orbitId} /></div>
        <ol aria-live="polite" aria-label="Mission timeline" className="flex min-w-0 flex-col gap-2.5">
          {timeline.map((s, i) => i < step ? (
            <li key={i} className={`flex gap-3 rounded-md border-2 px-3.5 py-3 motion-safe:animate-[card-in_400ms_var(--ease-orbit)_both] ${i === step - 1 ? "border-st-warning bg-space-raised" : "border-space-border bg-space-card"}`}>
              <span aria-hidden className={`grid size-8 shrink-0 place-items-center rounded-pill font-display text-space-page ${i === step - 1 && running ? "bg-st-warning" : "bg-st-success"}`}>{i === step - 1 && running ? i + 1 : "✓"}</span>
              <div className="min-w-0"><h3 className="font-display"><span className="sr-only">Step {i + 1} of 6: </span>{s.label}</h3><p className="text-[15px] text-ink-2 tabular">{s.detail}</p></div>
            </li>
          ) : (
            <li key={i} aria-hidden className="flex items-center gap-3 rounded-md border-2 border-dashed border-space-border px-3.5 py-2.5 font-display text-ink-2">
              <span className="grid size-8 place-items-center rounded-pill border-2 border-space-border">{i + 1}</span>{s.label}
            </li>
          ))}
        </ol>
      </div>
      <footer className="sticky bottom-0 flex flex-wrap justify-end gap-2.5 border-t border-space-border bg-space-page p-4 lg:px-10">
        {running && <button type="button" onClick={() => setStep(timeline.length)} className={SECONDARY}>Skip</button>}
        <button type="button" onClick={onDone} disabled={running} className={PRIMARY}>See scorecard →</button>
      </footer>
    </div>
  );
}

// MissionScene: one <g id="step-n"> per step, only the current one rendered, so its CSS animation plays once on mount.
// Copy the SVG groups from MissionScene.dc.html. Step 6 overlays 4× <RoleCharacter mood="cheer" /> waving twice.
export function MissionScene({ step, orbitId }: { step: number; orbitId: "LEO" | "SSO" | "GEO" }) {
  const names = ["Launch", "Orbit reached", "First light", "Daily operations", "Coverage", "End of mission"];
  return (
    <div role="img" aria-label={`Step ${step} of 6: ${names[step - 1]}`} className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-space-border bg-space-card">
      <svg key={step} viewBox="0 0 320 200" className="absolute inset-0 size-full" aria-hidden>
        {step === 1 && <g id="step-1">{/* pad, smoke, rocket: animate-[ms-lift_2.6s_both] */}</g>}
        {step === 2 && <g id="step-2">{/* planet + orbit ellipse in orbit color, satellite one lap */}</g>}
        {step === 3 && <g id="step-3">{/* satellite, flash, photo pops in */}</g>}
        {step === 4 && <g id="step-4">{/* data beam draws to ground station */}</g>}
        {step === 5 && <g id="step-5">{/* coverage band sweeps clipped planet */}</g>}
      </svg>
      <span className="absolute top-2.5 left-2.5 rounded-pill border border-space-border bg-space-page px-2.5 py-0.5 text-caption font-bold tabular">{step} · {names[step - 1]}</span>
    </div>
  );
}

function DesignRecap({ choice }: { choice: any }) { /* ShipSvg + orbit chip + 4 parts; see GoNoGo.dc.html */ return null; }

/* theme.css keyframes:
@keyframes pop { 0%{transform:scale(.7);opacity:.4} 70%{transform:scale(1.1);opacity:1} }
@keyframes launch-pulse { 0%{box-shadow:0 0 0 0 #FFD166aa} 60%{box-shadow:0 0 0 14px #FFD16600} }
@keyframes card-in { from{opacity:0;transform:translateY(10px)} }
plus ms-lift, ms-flame, ms-smoke, ms-lap, ms-flash, ms-photo, ms-beam, ms-sweep, ms-wave from MissionScene.dc.html.
@media (prefers-reduced-motion: reduce) → animations off = still frame of each scene. */
