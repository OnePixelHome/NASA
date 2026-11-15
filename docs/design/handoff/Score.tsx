// Screen 6 — Mission scorecard. React 19 + Tailwind v4, tokens from theme.css.
// Props: Score({ choice, goVotes, onReplay, onRevise }). Data from evaluateMission(); this file adds no rules.
import { useState } from "react";
import { evaluateMission } from "../engine";          // existing
import { SOURCES } from "../engine/sources";           // S1 earthfact, S2 cubesat_101 PDF, S3 design-and-develop PDF, S6 science.nasa.gov/mission/landsat-9, S10 nasa.gov/?p=532244; PHYS/GAME no url
import { SourceChip } from "./components";
import { ShipSvg } from "./Ship";
import { ROLE, TIERS } from "./MissionTree";

type Mood = "neutral" | "cheer" | "worried";
type Result = {
  score: number; success: boolean; breakdown: { label: string; points: number; max: number }[];
  primaryConstraint: string; biggestImpact: string; lesson: string; timeline: { label: string; detail: string }[];
};

export function Score({ choice, goVotes, onReplay, onRevise }: { choice: any; goVotes: any; onReplay: () => void; onRevise: () => void }) {
  const r: Result & { overBudget: boolean } = evaluateMission(choice, goVotes);
  // Engine rule only: success = !overBudget && score >= 50
  const failureReason: "budget" | "score" | null = r.success ? null : r.overBudget ? "budget" : "score";
  const tone = r.success ? "text-st-success" : "text-st-error";
  const primary = "min-h-[52px] max-w-[280px] flex-1 whitespace-nowrap rounded-pill border-2 border-st-selected bg-st-selected px-3 font-display text-[16px] text-space-page";
  const secondary = "min-h-[52px] max-w-[280px] flex-1 whitespace-nowrap rounded-pill border-2 border-space-border bg-space-card px-3 font-display text-[16px] hover:border-st-available";
  return (
    <div className="min-h-dvh bg-space-page font-body text-ink">
      <header className="px-4 pt-5 lg:px-10 lg:pt-8">
        <p className="text-caption font-bold uppercase tracking-widest text-ink-muted">Screen 6 of 6</p>
        <h1 className="font-display text-screen">Mission scorecard</h1>
      </header>
      <div className="grid gap-4 p-4 lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-8 lg:px-10">
        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <ResultBanner r={r} choice={choice} failureReason={failureReason} />
          <section aria-label="Score" className="flex flex-col items-center gap-2 rounded-lg border border-space-border bg-space-card px-4 py-5">
            <ScoreGauge score={r.score} success={r.success} />
            <span className={`text-small font-bold ${tone}`}>{r.success ? "✓ Mission success" : failureReason === "budget" ? "✕ Mission failed · over budget" : "✕ Mission failed · low score"}</span>
            <span className="text-[13px] text-ink-2">Illustrative score</span>
          </section>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <Breakdown items={r.breakdown} />
          <div className="grid gap-3 sm:grid-cols-2">
            <InsightCard icon="⚖" title="Primary constraint" text={r.primaryConstraint} speaker="ground" />
            <InsightCard icon="↯" title="Biggest impact" text={r.biggestImpact} speaker="spacecraft" />
          </div>
          <LessonCard text={r.lesson} mood={r.success ? "cheer" : "worried"} onRevise={r.success ? undefined : onRevise} />
          <DesignRecap choice={choice} />
          <SourcesDisclosure />
        </div>
      </div>
      <footer className="sticky bottom-0 flex flex-wrap justify-end gap-2.5 border-t border-space-border bg-space-page p-4 lg:px-10">
        {r.success ? <>
          <button type="button" onClick={onRevise} className={secondary}>← Try another design</button>
          <button type="button" onClick={onReplay} className={primary}>Replay mission</button>
        </> : <>
          <button type="button" onClick={onReplay} className={secondary}>Replay mission</button>
          <button type="button" onClick={onRevise} className={primary}>← Try another design</button>
        </>}
      </footer>
    </div>
  );
}

const FAIL_COPY = {
  budget: "The design cost more than the budget, so the mission was cancelled before launch.",
  score: "The ship reached orbit, but it sent back too little useful science for the mission goal.",
};
function ResultBanner({ r, choice, failureReason }: { r: Result; choice: any; failureReason: "budget" | "score" | null }) {
  const ship = toShip(choice);   // { payload, power, antenna, launcher, bad } — bad = layer responsible (from engine)
  const responsible = TIERS.findIndex(t => t.layer === ship.bad);
  return (
    <section aria-label="Result" className={`relative flex flex-col items-center gap-3 overflow-hidden rounded-xl border-2 bg-space-card px-4 pt-5 pb-4 ${r.success ? "border-st-success" : "border-st-error"}`}>
      {r.success && <Stars />}
      <div className="flex flex-col items-center">
        <ShipSvg {...ship} height={200} />
        {failureReason === "budget" && <><div className="-mt-1 h-3.5 w-[220px] rounded-pill border-[3px] border-space-page bg-space-border" />
          <span className="mt-1.5 text-caption font-bold text-ink-2">▮ On the launch pad · not launched</span></>}
      </div>
      {!r.success && responsible >= 0 && <p role="note" className="max-w-[300px] rounded-md bg-ink px-3 py-2 text-center text-small font-bold text-space-page">{/* speaker + bubble text from engine */}</p>}
      <div className="flex items-end justify-center gap-1.5">
        {TIERS.map((t, i) => (
          <span key={t.key} className="motion-safe:animate-[crew-pop_520ms_var(--ease-orbit)_both]" style={{ animationDelay: `${400 + i * 90}ms` }}>
            <span className={i === responsible && !r.success ? "block -translate-y-2 scale-[1.18]" : "block"}>
              <RoleCharacter role={t.role} mood={r.success ? "cheer" : "worried"} className="size-13 lg:size-15" />
            </span>
          </span>
        ))}
      </div>
      <h2 className={`flex items-center gap-2.5 font-display text-[28px] ${r.success ? "text-st-success" : "text-st-error"}`}>
        <span aria-hidden className={`grid size-8.5 place-items-center rounded-pill text-[20px] text-space-page ${r.success ? "bg-st-success" : "bg-st-error"}`}>{r.success ? "✓" : "✕"}</span>
        {r.success ? "Mission success" : "Mission failed"}
      </h2>
      {!r.success && <p className="font-display text-[16px]">Every real mission learns from this.</p>}
      <p className="font-display text-[17px] tabular">Score {r.score} of 100{failureReason === "budget" ? " · over budget" : ""}</p>
      <p className="max-w-[40ch] text-center text-[15px] text-ink-2">
        {r.success ? "Your ship reached orbit and sent back the data your mission needed." : FAIL_COPY[failureReason!]}
      </p>
    </section>
  );
}

function ScoreGauge({ score, success }: { score: number; success: boolean }) {
  const c = 2 * Math.PI * 52;
  return (
    <div className="relative size-42" aria-hidden>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-space-raised)" strokeWidth="12" />
        <circle cx="60" cy="60" r="52" fill="none" strokeWidth="12" strokeLinecap="round"
          stroke={success ? "var(--color-st-success)" : "var(--color-st-warning)"} strokeDasharray={`${(score / 100) * c} ${c}`}
          className="motion-safe:animate-[gauge-fill_1200ms_var(--ease-orbit)_200ms_both]" />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-display text-[56px] leading-none tabular">{score}</span><span className="text-[13px] text-ink-2">of 100</span></span>
    </div>
  );
}

function Breakdown({ items }: { items: Result["breakdown"] }) {
  const col = (p: number, m: number) => (p / m >= 0.7 ? "var(--color-st-success)" : p / m >= 0.5 ? "var(--color-st-warning)" : "var(--color-st-error)");
  return (
    <section aria-label="Score breakdown" className="flex flex-col gap-2.5 rounded-lg border border-space-border bg-space-card p-4">
      <h2 className="font-display text-section">Breakdown</h2>
      {items.map((b, i) => (
        <div key={b.label} role="meter" aria-label={`${b.label}: ${b.points} of ${b.max}`} aria-valuenow={b.points} aria-valuemin={0} aria-valuemax={b.max} className="flex flex-col gap-1.5">
          <div className="flex justify-between text-small"><span className="text-ink-2">{b.label}</span><span className="font-display tabular">{b.points} / {b.max}</span></div>
          <div className="h-3 rounded-pill bg-space-page">
            <div className="h-full rounded-pill motion-safe:animate-[meter-fill_600ms_var(--ease-orbit)_both]"
              style={{ width: `${(b.points / b.max) * 100}%`, background: col(b.points, b.max), animationDelay: `${300 + i * 180}ms` }} />
          </div>
        </div>
      ))}
    </section>
  );
}

function InsightCard({ icon, title, text, speaker }: { icon: string; title: string; text: string; speaker: keyof typeof ROLE }) {
  return (
    <section className="flex items-start gap-3 rounded-lg border border-space-border bg-space-card p-3.5">
      <RoleCharacter role={speaker} className="size-11 shrink-0" />
      <div className="min-w-0"><h3 className="flex gap-1.5 font-display"><span aria-hidden className="text-st-selected">{icon}</span>{title}</h3><p className="text-[15px] text-ink-2">{text}</p></div>
    </section>
  );
}

function LessonCard({ text, mood, onRevise }: { text: string; mood: Mood; onRevise?: () => void }) {
  return (
    <section aria-label="Lesson learned" className="flex items-start gap-3.5 rounded-xl border-2 border-st-selected bg-space-raised p-4.5 shadow-[0_0_0_2px_#FFD16633,0_0_28px_#FFD16633]">
      <RoleCharacter role="science" mood={mood} className="size-16 shrink-0" />
      <div className="min-w-0"><h3 className="flex gap-2 font-display text-[20px] text-st-selected"><span aria-hidden>★</span>Lesson learned</h3>
        <p className="font-display text-[19px] font-medium leading-snug">{text}</p>
        {onRevise && <button type="button" onClick={onRevise} className="mt-1.5 min-h-12 rounded-pill bg-st-selected px-5 font-display text-space-page">Try another design</button>}</div>
    </section>
  );
}

function DesignRecap({ choice }: { choice: any }) { /* orbit chip + 4 parts with ROLE icon/label; see Score.dc.html */ return null; }

function SourcesDisclosure() {
  const [open, setOpen] = useState(false);
  return (
    <section aria-label="Sources and assumptions" className="rounded-lg border border-space-border bg-space-card">
      <button type="button" aria-expanded={open} aria-controls="sources-list" onClick={() => setOpen(o => !o)}
        className="flex min-h-[52px] w-full items-center justify-between rounded-lg px-4">
        <span className="font-display text-[18px]">Sources &amp; assumptions</span><span className="text-[13px] font-bold text-st-available">{open ? "Hide" : "Show"}</span>
      </button>
      {open && <ul id="sources-list" className="flex flex-col gap-0.5 px-4 pb-4">
        {SOURCES.map((s: { id: string; title: string; url?: string }) => (
          <li key={s.id} className="flex min-h-[44px] items-center gap-2.5"><SourceChip id={s.id} href={s.url} /><span className="text-small">{s.title}</span></li>
        ))}
      </ul>}
    </section>
  );
}

function Stars() { /* 4 four-point stars + 5 dots, static, token colors — copy from Score.dc.html */ return null; }
declare function toShip(choice: any): any;
declare function RoleCharacter(p: { role: string; mood?: Mood; className?: string }): JSX.Element;
// RoleCharacter mood: arms (cx,cy) neutral 11/53,44 · cheer 8/56,16 · worried 15/49,51; mouth + worry brows/sweat drop in Character.dc.html.

/* theme.css keyframes:
@keyframes gauge-fill { from { stroke-dasharray: 0 327 } }
@keyframes meter-fill { from { width: 0 } }
@keyframes crew-pop { 0%{opacity:0;transform:translateY(10px) scale(.6)} 70%{opacity:1;transform:translateY(-3px) scale(1.06)} 100%{transform:none} } */
