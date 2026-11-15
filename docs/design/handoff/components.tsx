// Trajectory Ladder — base components (React 19 + Tailwind v4, tokens from theme.css)
import { useState, type ReactNode } from "react";

const SOURCES: Record<string, { label: string; href?: string }> = {
  S1: { label: "NASA S1" }, S2: { label: "NASA S2" }, S3: { label: "NASA S3" },
  S6: { label: "NASA S6" }, S10: { label: "NASA S10" },
  PHYS: { label: "physics" }, GAME: { label: "illustrative" },
};

export function SourceChip({ id, href }: { id: string; href?: string }) {
  const s = SOURCES[id] ?? { label: id };
  const link = href ?? s.href;
  const base = "inline-flex items-center gap-1 rounded-pill border border-space-border bg-space-raised px-2 text-caption font-bold text-ink-2 tabular align-middle";
  return link ? (
    <a href={link} target="_blank" rel="noreferrer"
       className={`${base} min-h-[44px] -my-3 underline-offset-2 hover:text-ink hover:underline`}>
      {s.label} <span aria-hidden>↗</span>
    </a>
  ) : <span className={`${base} h-6`}>{s.label}</span>;
}

export function Bar({ label, value, max = 5, color = "var(--color-orbit-leo)" }:
  { label: string; value: number; max?: number; color?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 shrink-0 text-small text-ink-2">{label}</span>
      <div className="flex flex-1 gap-1" role="meter" aria-valuenow={value} aria-valuemax={max} aria-label={label}>
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className="h-3 flex-1 rounded-sm"
                style={{ background: i < value ? color : "var(--color-space-raised)" }} />
        ))}
      </div>
      <span className="w-10 text-right font-display text-card text-ink tabular">{value}/{max}</span>
    </div>
  );
}

export function Meter({ label, value, max, unit, warnAt }:
  { label: string; value: number; max: number; unit: string; warnAt: number }) {
  const state = value > max ? "over" : value >= warnAt ? "warn" : "ok";
  const ui = {
    ok:   { c: "var(--color-st-success)", icon: "✓", text: "Within limit" },
    warn: { c: "var(--color-st-warning)", icon: "⚠", text: "Close to limit" },
    over: { c: "var(--color-st-error)",   icon: "✕", text: "Over limit" },
  }[state];
  return (
    <div className="rounded-lg bg-space-card p-4">
      <div className="flex justify-between text-small">
        <span className="text-ink-2">{label}</span>
        <span className="font-display text-ink tabular">{value} / {max} {unit}</span>
      </div>
      <div className="relative mt-2 h-3 rounded-pill bg-space-raised">
        <div className="h-full rounded-pill transition-[width] duration-[var(--duration-base)] ease-[var(--ease-orbit)]"
             style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: ui.c }} />
        <span className="absolute -top-1 h-5 w-0.5 bg-ink-muted" style={{ left: `${(warnAt / max) * 100}%` }} />
      </div>
      <p className="mt-2 text-caption font-bold" style={{ color: ui.c }}>{ui.icon} {ui.text}</p>
    </div>
  );
}

export function Gauge({ score, success }: { score: number; success: boolean }) {
  const r = 52, c = 2 * Math.PI * r, col = success ? "var(--color-st-success)" : "var(--color-st-warning)";
  return (
    <figure className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 120 120" className="size-36 -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-space-raised)" strokeWidth="12" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={col} strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${(score / 100) * c} ${c}`} />
      </svg>
      <span className="-mt-[104px] mb-12 font-display text-score text-ink tabular">{score}</span>
      <figcaption className="text-small font-bold" style={{ color: col }}>
        {success ? "✓ Mission success" : "⚠ Fell short"}
      </figcaption>
    </figure>
  );
}

export function ReasonList({ reasons }: { reasons: { text: string; source: string }[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {reasons.map((r, i) => (
        <li key={i} className="flex gap-2 text-body text-ink-2">
          <span aria-hidden className="text-ink-muted">•</span>
          <span>{r.text} <SourceChip id={r.source} /></span>
        </li>
      ))}
    </ul>
  );
}

type NodeState = "available" | "selected" | "locked";
export function NodeCard({ name, facts, role, roleColor, state, why, reasons }: {
  name: string; facts: string[]; role: string; roleColor: string; state: NodeState;
  why?: ReactNode; reasons: { text: string; source: string }[];
}) {
  const [open, setOpen] = useState(false);
  const locked = state === "locked";
  return (
    <div>
      <button type="button" aria-pressed={state === "selected"} aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={`w-full min-h-[44px] rounded-lg border-2 p-4 text-left transition duration-[var(--duration-fast)]
          ${state === "selected" ? "border-st-selected bg-space-raised shadow-selected" : "border-space-border bg-space-card shadow-raised"}
          ${locked ? "border-dashed bg-space-page" : ""}`}>
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-display text-card ${locked ? "text-ink-2" : "text-ink"}`}>{name}</h3>
          <span className="text-caption font-bold" style={{ color: roleColor }}>● {role}</span>
        </div>
        <ul className="mt-1 text-small text-ink-2">{facts.map(f => <li key={f}>{f}</li>)}</ul>
        <p className="mt-3 text-caption font-bold"
           style={{ color: locked ? "var(--color-st-locked)" : state === "selected" ? "var(--color-st-selected)" : "var(--color-st-available)" }}>
          {locked ? "🔒 Locked — tap for why" : state === "selected" ? "◉ Selected" : "○ Available"}
        </p>
      </button>
      {open && (
        <div className="mt-2 rounded-lg border border-space-border bg-space-raised p-4">
          <h4 className="font-display text-card text-ink">{locked ? "Why it is locked" : "Why it works"}</h4>
          {why}
          <div className="mt-3"><ReasonList reasons={reasons} /></div>
        </div>
      )}
    </div>
  );
}
