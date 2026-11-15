// Phase 8B extras. React 19 + Tailwind v4, tokens from theme.css. Only <DifficultySelector> needs engine work.
import { useEffect, useRef, useState } from "react";
import { ShipSvg } from "./Ship";
import { RoleCharacter } from "./MissionTree";

/* 1 · VIDEO CARDS — no engine changes. Render at 1920×1080 or 1080×1920 and export frames. */
export function VideoCard({ kind, format }: { kind: "title" | "end"; format: "landscape" | "portrait" }) {
  const P = format === "portrait";
  const box = P ? "h-[1920px] w-[1080px] flex-col gap-20 px-20 py-30" : "h-[1080px] w-[1920px] flex-row gap-30 px-35 py-20";
  const text = P ? "items-center text-center max-w-[920px]" : "items-start text-left max-w-[820px]";
  const Team = () => <span className="rounded-pill border-[3px] border-st-selected px-7 py-3.5 font-display text-[36px] text-st-selected">One Pixel Home</span>;
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-space-page font-body text-ink ${box}`}>
      {kind === "title" ? <>
        <div className="flex flex-col items-center gap-6">
          <ShipSvg payload="prism" power="big" antenna="polar" launcher="medium" height={P ? 640 : 600} />
          <div className="flex items-end gap-4">{(["science", "spacecraft", "ground", "launch"] as const).map((r, i) =>
            <RoleCharacter key={r} role={r} mood={i % 3 === 0 ? "cheer" : "neutral"} className={P ? "size-35" : "size-30"} />)}</div>
        </div>
        <div className={`flex flex-col gap-7 ${text}`}>
          <h1 className="font-display text-[132px] leading-none font-bold">Trajectory Ladder</h1>
          <p className="font-display text-[52px] leading-tight text-ink-2 text-balance">Design a space mission and watch every choice ripple down.</p>
          <Team />
        </div>
      </> : <>
        <ScoreRing score={86} size={P ? 620 : 560} />
        <div className={`flex flex-col gap-7 ${text}`}>
          <h1 className="font-display text-[104px] leading-[1.05] font-bold text-balance">Every choice has a consequence.</h1>
          <p className="font-display text-[52px] leading-tight text-ink-2 text-balance">Built on NASA orbital data and Landsat 9 parameters.</p>
          <div className="flex flex-wrap items-center gap-5"><span className="font-display text-[36px] font-bold">Trajectory Ladder</span><Team /></div>
        </div>
      </>}
    </div>
  );
}
function ScoreRing({ score, size }: { score: number; size: number }) {
  const c = 2 * Math.PI * 52;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-space-raised)" strokeWidth="12" />
        <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-st-success)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(score / 100) * c} ${c}`} />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-display text-[220px] leading-none tabular">{score}</span><span className="font-display text-[44px] text-ink-2">of 100</span></span>
    </div>
  );
}

/* 2 · DEAD-END — no engine changes. Inside LadderStep: deadEnd = enabled && !chosen && nodes.every(n => !n.ok) */
export function DeadEndNotice({ onBackUp }: { onBackUp: () => void }) {
  return (
    <div role="status" className="flex flex-wrap items-center justify-between gap-2.5 rounded-md border-2 border-dashed border-st-warning bg-space-raised px-3.5 py-3">
      <span className="flex-[1_1_180px] text-small"><span aria-hidden className="font-bold text-st-warning">⚠ </span>Every option in this step is locked by an earlier choice. That happens to real teams too.</span>
      <button type="button" onClick={onBackUp} className="min-h-[44px] whitespace-nowrap rounded-pill bg-st-selected px-4 font-display text-space-page">↑ Change the step above</button>
    </div>
  );
}
// In LadderStep: bubble = "Nothing fits here. Go back and change an earlier choice."; RoleCharacter mood="worried".
// onBackUp = () => { onFocus(`${prevTier}:${choice[prevTier]}`); document.getElementById(`step-${num - 1}`)?.focus(); }
// (step <li> gets id="step-n" tabIndex={-1})

/* 3 · FIRST-RUN HINT — no engine changes. Non-modal; focus is never trapped. */
const TIPS = [
  { at: "options", text: "Tap an option to choose it." },
  { at: "locked", text: "A 🔒 means something above doesn’t fit — tap it to see why." },
  { at: "ship", text: "The ship builds as you choose." },
] as const;
export function useCoach(initial: boolean) {
  const [step, setStep] = useState(initial ? 0 : -1);     // -1 = closed; keep in memory only (no storage)
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setStep(-1);
    document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k);
  }, []);
  return { at: step >= 0 ? TIPS[step].at : null, step, next: () => setStep(s => (s >= 2 ? -1 : s + 1)), skip: () => setStep(-1) };
}
export function CoachTip({ step, onNext, onSkip }: { step: number; onNext: () => void; onSkip: () => void }) {
  const nextRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { nextRef.current?.focus({ preventScroll: true }); }, [step]);   // moves focus in, never traps it
  return (
    <div role="dialog" aria-modal="false" aria-labelledby="coach-text"
      className="relative flex w-full flex-col gap-2.5 rounded-md bg-ink px-3.5 py-3 text-space-page shadow-[0_0_0_3px_#FFD166,0_10px_28px_#0008] motion-safe:animate-[bubble-in_220ms_var(--ease-orbit)_both]">
      <span className="text-caption font-bold text-space-border tabular">Tip {step + 1} of 3</span>
      <p id="coach-text" className="font-display text-[16px]">{TIPS[step].text}</p>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onSkip} className="min-h-[44px] rounded-pill border-2 border-space-border px-3.5 font-display focus-visible:outline-space-page">Skip</button>
        <button ref={nextRef} type="button" onClick={onNext} className="min-h-[44px] rounded-pill bg-space-page px-4.5 font-display text-ink focus-visible:outline-st-selected">{step === 2 ? "Got it" : "Next"}</button>
      </div>
      <span aria-hidden className="absolute -bottom-1.5 left-7 size-3.5 rotate-45 bg-ink" />
    </div>
  );
}
// Placement: tips 0–1 above the step-1 option grid, tip 2 at the top of <ShipPanel>.

/* 4 · DIFFICULTY — PROPOSAL, NEEDS ENGINE WORK.
   Engine: add `difficulty` to state; Easy needs node.why (short string); Hard needs numeric facts tagged so the UI can mask them. */
export type Difficulty = "easy" | "standard" | "hard";
export function DifficultySelector({ value, onChange }: { value: Difficulty; onChange: (d: Difficulty) => void }) {
  const opts: [Difficulty, string, string][] = [
    ["easy", "Easy", "Easy: every card also explains why it works."],
    ["standard", "Standard", "Standard: numbers and locks, as designed."],
    ["hard", "Hard", "Hard: numbers stay hidden until the scorecard."],
  ];
  return (
    <div role="group" aria-labelledby="diff-label" className="flex flex-col gap-2">
      <span id="diff-label" className="font-display">Difficulty</span>
      <div className="flex max-w-[420px] gap-1 rounded-pill border border-space-border bg-space-card p-1">
        {opts.map(([id, label]) => (
          <button key={id} type="button" aria-pressed={value === id} onClick={() => onChange(id)}
            className={`min-h-[44px] flex-1 rounded-pill font-display ${value === id ? "bg-orbit-geo text-space-page" : ""}`}>{value === id ? "✓ " : ""}{label}</button>
        ))}
      </div>
      <span className="text-[13px] text-ink-2">{opts.find(o => o[0] === value)![2]}</span>
    </div>
  );
}
// OptionCard per mode: easy → render node.why inline (hide "?"); hard → facts.map(maskNumbers) e.g. "150 kg" → "?? kg".
export const maskNumbers = (s: string) => s.replace(/\d[\d.,]*/g, "??");
