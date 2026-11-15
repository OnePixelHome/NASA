// Screen 3 — Build the mission tree. React 19 + Tailwind v4 (tokens: theme.css).
// Engine contract unchanged: node.ok comes from src/engine; this file adds no rules.
import { useState } from "react";
import { Meter, SourceChip } from "./components";
import { ShipSvg, type Layer } from "./Ship";

type Reason = { text: string; source: string };
type Node = { id: string; name: string; ok: boolean; facts: string[]; reasons: Reason[]; reason?: Reason; fix?: string };
type TierKey = "instrument" | "power" | "downlink" | "launch";
type Orbit = "LEO" | "SSO" | "GEO";

export const TIERS: { key: TierKey; title: string; role: Role; layer: Layer }[] = [
  { key: "instrument", title: "Scientific instrument", role: "science", layer: "payload" },
  { key: "power", title: "Power system", role: "spacecraft", layer: "power" },
  { key: "downlink", title: "Data downlink", role: "ground", layer: "antenna" },
  { key: "launch", title: "Launch vehicle", role: "launch", layer: "launcher" },
];
type Role = "science" | "spacecraft" | "ground" | "launch";
export const ROLE = {
  science:    { label: "Science",    icon: "◎", color: "var(--color-role-science)" },
  spacecraft: { label: "Spacecraft", icon: "◆", color: "var(--color-role-spacecraft)" },
  ground:     { label: "Ground",     icon: "▲", color: "var(--color-role-ground)" },
  launch:     { label: "Launch",     icon: "▮", color: "var(--color-role-launch)" },
};
const ORBIT = {
  LEO: { name: "Low Earth orbit", color: "var(--color-orbit-leo)" },
  SSO: { name: "Sun-synchronous", color: "var(--color-orbit-sso)" },
  GEO: { name: "Geostationary",   color: "var(--color-orbit-geo)" },
};

type NodeState = "available" | "selected" | "locked" | "conflict";
const nodeState = (n: Node, chosen?: string): NodeState =>
  chosen === n.id ? (n.ok ? "selected" : "conflict") : n.ok ? "available" : "locked";

export function MissionTreeScreen({ choice, orbit, focus, onFocus, onPick, onChangeOrbit, onDone, nodes, budget, toShipVariant }: {
  choice: Partial<Record<TierKey, string>>; orbit: Orbit; focus: string | null;
  onFocus: (key: string | null) => void; onPick: (tier: TierKey, id: string) => void;
  onChangeOrbit: () => void; onDone: () => void;
  nodes: Record<TierKey, Node[]>; budget: { value: number; max: number; warnAt: number };
  toShipVariant: (tier: TierKey, id?: string) => any;
}) {
  const [cascade, setCascade] = useState({ gen: 0, from: -1 });
  const conflictTier = TIERS.find(t => nodes[t.key].some(n => nodeState(n, choice[t.key]) === "conflict"));
  const allChosen = TIERS.every(t => choice[t.key]);
  const pick = (ti: number, id: string) => { setCascade(c => ({ gen: c.gen + 1, from: ti })); onPick(TIERS[ti].key, id); };

  return (
    <div className="min-h-dvh bg-space-page font-body text-ink">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-space-border p-4 lg:px-10 lg:py-6">
        <div><p className="text-caption font-bold uppercase tracking-widest text-ink-muted">Screen 3 of 5</p>
          <h1 className="font-display text-screen">Build the mission tree</h1></div>
        <div className="w-full lg:w-[360px]"><Meter label="Budget" unit="$M" {...budget} /></div>
      </header>

      <div className="grid gap-4 p-4 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-8 lg:px-10">
        <aside aria-label="Your spacecraft"
          className="sticky top-0 z-10 flex items-center gap-4 rounded-lg border border-space-border bg-space-card p-3 shadow-raised lg:flex-col lg:self-start">
          <div className="h-[150px] lg:h-[380px]">
            <ShipSvg height={380}
              payload={toShipVariant("instrument", choice.instrument)} power={toShipVariant("power", choice.power)}
              antenna={toShipVariant("downlink", choice.downlink)} launcher={toShipVariant("launch", choice.launch)}
              bad={conflictTier?.layer ?? null} />
          </div>
          <PartsList choice={choice} nodes={nodes} />
        </aside>

        <div className="flex min-w-0 flex-col gap-3">
          <OrbitChip orbit={orbit} onChange={onChangeOrbit} />
          <ol className="flex flex-col gap-3">
            {TIERS.map((t, ti) => {
              const enabled = ti === 0 || !!choice[TIERS[ti - 1].key];
              const flash = cascade.gen > 0 && ti > cascade.from;
              return (
                <LadderStep key={`${t.key}-${flash ? cascade.gen : 0}`} num={ti + 1} tier={t} enabled={enabled}
                  flashDelay={flash ? (ti - cascade.from - 1) * 80 : null}
                  nodes={nodes[t.key]} chosen={choice[t.key]} focus={focus} onFocus={onFocus} onPick={id => pick(ti, id)} />
              );
            })}
          </ol>
        </div>
      </div>

      <footer className="sticky bottom-0 flex flex-wrap items-center justify-end gap-3 border-t border-space-border bg-space-page p-4 lg:px-10">
        <p role="status" className="flex-1 text-small font-bold text-ink-2">
          {allChosen ? (conflictTier ? `⚠ 1 part no longer fits. Check ${conflictTier.title}.` : "✓ All 4 steps chosen.") : "Choose all 4 steps."}
        </p>
        <button type="button" disabled={!allChosen} onClick={onDone}
          className="min-h-[52px] max-w-[360px] grow rounded-pill border-2 border-st-selected bg-st-selected px-6 font-display text-[18px] text-space-page
                     disabled:border-space-border disabled:bg-space-raised disabled:text-ink-2">
          Go to Go / No-Go →
        </button>
      </footer>
    </div>
  );
}

function OrbitChip({ orbit, onChange }: { orbit: Orbit; onChange: () => void }) {
  const [spin, setSpin] = useState(0);
  const o = ORBIT[orbit];
  return (
    <button type="button" aria-label={`Orbit: ${orbit}, ${o.name}. Tap to change.`}
      onClick={() => { setSpin(n => n + 1); onChange(); }}
      className="flex min-h-[44px] items-center gap-2.5 self-start rounded-pill border-2 bg-space-card py-1.5 pr-3.5 pl-1.5" style={{ borderColor: o.color }}>
      <span key={spin} className={spin ? "motion-safe:animate-[spin_600ms_var(--ease-orbit)_1]" : ""} aria-hidden>
        <svg viewBox="0 0 32 32" className="size-8">
          <ellipse cx="16" cy="16" rx="15" ry="6" fill="none" stroke={o.color} strokeWidth="2.5" transform="rotate(-20 16 16)" />
          <circle cx="16" cy="16" r="8" fill="#62B4FF" stroke="#0B1026" strokeWidth="2.5" />
          <circle cx="29" cy="11" r="3" fill={o.color} stroke="#0B1026" strokeWidth="2" />
        </svg>
      </span>
      <span className="flex flex-col text-left leading-tight">
        <span className="font-display" style={{ color: o.color }}>{orbit} · {o.name}</span>
        <span className="text-caption text-ink-2">Orbit · tap to change</span>
      </span>
    </button>
  );
}

function PartsList({ choice, nodes }: { choice: Partial<Record<TierKey, string>>; nodes: Record<TierKey, Node[]> }) {
  const count = TIERS.filter(t => choice[t.key]).length;
  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-1.5">
      <span className="font-display tabular">{count} of 4 parts</span>
      {TIERS.map(t => {
        const n = nodes[t.key].find(x => x.id === choice[t.key]);
        return <div key={t.key} className={`flex gap-1.5 text-[13px] ${n ? "text-ink" : "text-ink-2"}`}>
          <span style={{ color: ROLE[t.role].color }} aria-hidden>{ROLE[t.role].icon}</span>{n ? n.name : `${ROLE[t.role].label} · empty slot`}
        </div>;
      })}
    </div>
  );
}

function LadderStep({ num, tier, enabled, nodes, chosen, focus, onFocus, onPick, flashDelay }: {
  num: number; tier: (typeof TIERS)[number]; enabled: boolean; nodes: Node[]; chosen?: string;
  focus: string | null; onFocus: (k: string | null) => void; onPick: (id: string) => void; flashDelay: number | null;
}) {
  const r = ROLE[tier.role];
  const states = nodes.map(n => nodeState(n, chosen));
  const locked = states.filter(s => s === "locked").length;
  const conflict = states.includes("conflict");
  const bubble = !enabled ? `I’m waiting for step ${num - 1}.` : conflict ? "Uh-oh, our pick no longer fits!"
    : !chosen && locked ? `${locked} locked. Tap 🔒 to see why.` : !chosen ? "Your pick, team!" : null;
  const open = nodes.find(n => focus === `${tier.key}:${n.id}`);
  let flip = 0;
  return (
    <li aria-label={`Step ${num}: ${tier.title}`}
      className={`flex flex-col gap-3 rounded-lg border border-space-border bg-space-card p-3.5 ${flashDelay != null ? "motion-safe:animate-[flash_600ms_ease-out]" : ""}`}
      style={flashDelay != null ? { animationDelay: `${flashDelay}ms` } : undefined}>
      <div className="flex items-start gap-2.5">
        <RoleCharacter role={tier.role} className="size-11 shrink-0 lg:size-14" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-2">
            <h2 className="font-display text-card"><span className="text-ink-2 tabular">{num} ·</span> {tier.title}</h2>
            <span className="text-caption font-bold" style={{ color: r.color }}>{r.icon} {r.label}</span>
          </div>
          {bubble && <span className="relative self-start rounded-md bg-ink px-2.5 py-1.5 text-[13px] font-bold text-space-page motion-safe:animate-[bubble-in_220ms_var(--ease-orbit)_both]">{bubble}</span>}
        </div>
      </div>
      {!enabled ? (
        <div aria-disabled className="flex min-h-[44px] items-center rounded-md border-2 border-dashed border-space-border px-3 text-small text-ink-2">
          {nodes.length} options waiting · Choose the step above first
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
          {nodes.map((n, i) => (
            <OptionCard key={n.id} node={n} state={states[i]} expanded={open?.id === n.id}
              flipDelay={flashDelay != null && states[i] === "locked" ? 120 + flip++ * 80 : null}
              onMain={() => (states[i] === "locked" || states[i] === "conflict" ? onFocus(`${tier.key}:${n.id}`) : onPick(n.id))}
              onWhy={() => onFocus(open?.id === n.id ? null : `${tier.key}:${n.id}`)} />
          ))}
        </div>
      )}
      {open && <WhyPanel node={open} state={nodeState(open, chosen)} />}
    </li>
  );
}

const CARD: Record<NodeState, { cls: string; status: string; color: string }> = {
  available: { cls: "border-space-border bg-space-card shadow-raised", status: "○ Available", color: "var(--color-st-available)" },
  selected:  { cls: "border-st-selected bg-space-raised shadow-selected", status: "◉ Selected", color: "var(--color-st-selected)" },
  locked:    { cls: "border-dashed border-space-border bg-space-page", status: "🔒 Locked — tap for why", color: "var(--color-ink-2)" },
  conflict:  { cls: "border-st-warning bg-space-raised", status: "⚠ No longer fits — tap for why", color: "var(--color-st-warning)" },
};

function OptionCard({ node, state, expanded, onMain, onWhy, flipDelay }: {
  node: Node; state: NodeState; expanded: boolean; onMain: () => void; onWhy: () => void; flipDelay: number | null;
}) {
  const c = CARD[state];
  return (
    <div className={`relative flex ${flipDelay != null ? "motion-safe:animate-[flip_420ms_ease-in-out_both]" : ""}`}
         style={flipDelay != null ? { animationDelay: `${flipDelay}ms` } : undefined}>
      <button type="button" onClick={onMain} aria-pressed={state === "selected" || state === "conflict"} aria-expanded={expanded}
        aria-label={`${node.name}: ${state === "conflict" ? "chosen but no longer fits" : state}`}
        className={`flex min-h-24 flex-1 flex-col gap-1 rounded-md border-2 p-3 pb-2.5 text-left transition duration-[var(--duration-fast)] hover:border-st-available ${c.cls}`}>
        <span className={`pr-7 font-display text-[15px] leading-tight ${state === "locked" ? "text-ink-2" : "text-ink"}`}>{node.name}</span>
        <span className="text-[13px] text-ink-2">{node.facts.join(" · ")}</span>
        <span className="mt-auto text-caption font-bold" style={{ color: c.color }}>{c.status}</span>
      </button>
      {(state === "available" || state === "selected") && (
        <button type="button" onClick={onWhy} aria-label={`Why ${node.name} works`} aria-expanded={expanded}
          className="absolute top-0 right-0 grid size-11 place-items-center rounded-md">
          <span className="grid size-[22px] place-items-center rounded-pill border border-space-border bg-space-raised font-display text-[13px] text-ink-2">?</span>
        </button>
      )}
    </div>
  );
}

function WhyPanel({ node, state }: { node: Node; state: NodeState }) {
  const bad = state === "locked" || state === "conflict";
  const reasons = bad && node.reason ? [node.reason] : node.reasons;
  return (
    <div role="region" aria-label="Explanation" className="flex flex-col gap-2 rounded-md border border-space-border bg-space-raised p-3.5">
      <span className={`font-display ${bad ? "text-st-warning" : "text-st-success"}`}>
        {state === "conflict" ? "⚠ Why it no longer fits" : bad ? "⚠ Why it is locked" : "✓ Why it works"}
      </span>
      {reasons.map((r, i) => <p key={i} className="text-[15px] text-ink-2">{r.text} <SourceChip id={r.source} /></p>)}
      {bad && node.fix && <p className="text-small text-ink">To unlock: {node.fix}</p>}
    </div>
  );
}

// RoleCharacter: one base SVG (viewBox 0 0 64 64), recolored per role, plus one accessory group.
// Copy paths from Character.dc.html: body/visor/arms shared; <g> goggles | wrench | headset | hard hat.
export function RoleCharacter({ role, className }: { role: Role; className?: string }) {
  const color = ROLE[role].color;
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={`${ROLE[role].label} crew`}>
      <circle cx="11" cy="44" r="5.5" fill={color} stroke="#0B1026" strokeWidth="3" />
      <circle cx="53" cy="44" r="5.5" fill={color} stroke="#0B1026" strokeWidth="3" />
      <circle cx="32" cy="36" r="21" fill={color} stroke="#0B1026" strokeWidth="3.5" />
      <rect x="19" y="25" width="26" height="17" rx="8.5" fill="#1F2852" stroke="#0B1026" strokeWidth="3" />
      <circle cx="27" cy="33" r="2.4" fill="#F2F4FF" /><circle cx="37" cy="33" r="2.4" fill="#F2F4FF" />
      {/* accessory group per role here */}
    </svg>
  );
}

/* Add to theme.css:
@keyframes ship-in { 0%{opacity:0;transform:translateY(-16px)} 70%{opacity:1;transform:translateY(2px)} 100%{transform:none} }
@keyframes ship-shake { 0%,100%{transform:none} 20%{transform:translateX(-5px) rotate(-2deg)} 40%{transform:translateX(5px) rotate(2deg)} 60%{transform:translateX(-3px)} 80%{transform:translateX(2px)} }
@keyframes flash { 30% { box-shadow:0 0 0 3px #FFD166aa; background:var(--color-space-raised) } }
@keyframes flip { 50% { transform: perspective(600px) rotateX(90deg) } }
@keyframes bubble-in { from { opacity:0; transform: translateY(4px) scale(.96) } }
Re-keying LadderStep on each pick (key includes cascade.gen) restarts the flash/flip animations. */
