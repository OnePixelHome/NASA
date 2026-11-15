// Screens 1–2 — Brief + OrbitPick. React 19 + Tailwind v4, tokens from theme.css.
// Props unchanged: Brief({ onPick }), OrbitPick({ scenario, selected, onPick }).
import { Bar, SourceChip } from "./components";
import { RoleCharacter } from "./MissionTree";

type MissionId = "crop" | "storm" | "ice";
type OrbitId = "LEO" | "SSO" | "GEO";

export const MISSIONS: Record<MissionId, {
  title: string; story: string; reqs: { value: string; label: string }[]; budget: string; illustrative?: boolean; aria: string;
}> = {
  crop: { title: "Crop Watch", story: "Track the health of farmland worldwide (up to 60° latitude) every couple of weeks.",
    reqs: [{ value: "±60°", label: "latitude reach" }, { value: "Global", label: "coverage" }, { value: "16 d", label: "revisit" }], budget: "$200M",
    aria: "Crop Watch: observe up to 60° latitude, global coverage, revisit every 16 days, budget $200M" },
  storm: { title: "Storm Watch", story: "Follow hurricanes over the Americas with a new image every few minutes.",
    reqs: [{ value: "±40°", label: "latitude reach" }, { value: "Regional", label: "coverage" }, { value: "6 h", label: "revisit" }], budget: "$300M",
    aria: "Storm Watch: observe up to 40° latitude, regional coverage, revisit every 6 hours, budget $300M" },
  ice: { title: "Polar Ice", story: "Measure how polar ice grows and shrinks through the seasons.", illustrative: true,
    reqs: [{ value: "±82°", label: "latitude reach" }, { value: "Polar", label: "coverage" }, { value: "3 d", label: "revisit" }], budget: "$250M",
    aria: "Polar Ice: observe up to 82° latitude, polar coverage, revisit every 3 days, budget $250M (illustrative numbers)" },
};

export const ORBITS: Record<OrbitId, {
  name: string; color: string; alt: string; fuel: number; cov: number; life: number; source: string; blurb: string; facts: string[];
}> = {
  LEO: { name: "Low Earth Orbit", color: "var(--color-orbit-leo)", alt: "500 km", fuel: 1, cov: 2, life: 2, source: "S10",
    blurb: "Close to Earth, so it is cheap to reach and sees sharp detail, but air drag shortens its life.",
    facts: ["Altitude 500 km · 93 min/orbit", "Reaches ±51.6° latitude", "+0.10 km/s beyond a 200 km orbit"] },
  SSO: { name: "Sun-Synchronous Orbit", color: "var(--color-orbit-sso)", alt: "705 km", fuel: 2, cov: 5, life: 4, source: "S6",
    blurb: "Passes near both poles and crosses each place at the same local time, so the lighting stays the same.",
    facts: ["Altitude 705 km · 99 min/orbit", "Reaches ±81.8° latitude", "+0.28 km/s beyond a 200 km orbit"] },
  GEO: { name: "Geostationary Orbit", color: "var(--color-orbit-geo)", alt: "35,786 km", fuel: 5, cov: 3, life: 5, source: "PHYS",
    blurb: "Turns with Earth, so it watches the same region nonstop, from very far away.",
    facts: ["Altitude 35,786 km · 24 h/orbit", "Fixed view of one hemisphere", "+3.9 km/s beyond a 200 km orbit"] },
};

const LIFT = "transition duration-[var(--duration-base)] ease-[var(--ease-orbit)] motion-safe:hover:-translate-y-1 motion-safe:focus-visible:-translate-y-1 motion-safe:active:-translate-y-px hover:border-st-available hover:shadow-[0_2px_0_#0006,0_12px_32px_#0007,0_0_24px_#62B4FF33] focus-visible:shadow-[0_2px_0_#0006,0_12px_32px_#0007,0_0_24px_#62B4FF33]";

export function Brief({ onPick }: { onPick: (id: MissionId) => void }) {
  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-5 bg-space-page px-4 pt-5 pb-8 text-ink lg:px-10 lg:pt-8">
      <header className="flex flex-col gap-1.5">
        <p className="text-caption font-bold uppercase tracking-widest text-ink-muted">Screen 1 of 5</p>
        <h1 className="font-display text-screen">1 · Pick your mission</h1>
        <p className="max-w-[60ch] text-body text-ink-2">Every mission starts with a science goal. It decides what 'success' means.</p>
      </header>
      <div className="flex items-start gap-2.5">
        <RoleCharacter role="science" className="size-13 shrink-0" />
        <p className="relative mt-1.5 rounded-md bg-ink px-3 py-2 text-small font-bold text-space-page">Pick the goal first. It decides what success means.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {(Object.keys(MISSIONS) as MissionId[]).map(id => {
          const m = MISSIONS[id];
          return (
            <button key={id} type="button" aria-label={m.aria} onClick={() => onPick(id)}
              className={`flex min-h-[44px] flex-col gap-3 rounded-lg border-2 border-space-border bg-space-card p-3 pb-4 text-left shadow-raised ${LIFT}`}>
              <MissionArt id={id} />
              <div className="flex flex-col gap-1 px-1">
                <h2 className="font-display text-[20px] text-ink">{m.title}</h2>
                <p className="text-[15px] text-ink-2">{m.story}</p>
              </div>
              <div className="mx-1 flex flex-col gap-2 rounded-md bg-space-raised p-3">
                <p className="flex items-center justify-between text-caption font-bold uppercase tracking-wide text-ink-2">
                  Mission requirements {m.illustrative && <SourceChip id="GAME" />}
                </p>
                <dl className="grid grid-cols-3 gap-2">
                  {m.reqs.map(r => <div key={r.label} className="flex min-w-0 flex-col-reverse">
                    <dt className="text-caption text-ink-2">{r.label}</dt><dd className="font-display text-[22px] tabular">{r.value}</dd>
                  </div>)}
                </dl>
              </div>
              <p className="flex items-baseline justify-between px-1">
                <span className="text-small text-ink-2">Budget</span>
                <span className="font-display text-[22px] text-st-selected tabular">{m.budget}</span>
              </p>
            </button>
          );
        })}
      </div>
    </main>
  );
}

export function OrbitPick({ scenario, selected, onPick }: { scenario: MissionId; selected: OrbitId | null; onPick: (id: OrbitId) => void }) {
  const m = MISSIONS[scenario];
  return (
    <main className="mx-auto flex max-w-[1280px] flex-col gap-4 bg-space-page px-4 pt-5 pb-8 text-ink lg:px-10 lg:pt-8">
      <header className="flex flex-col gap-1.5">
        <p className="text-caption font-bold uppercase tracking-widest text-ink-muted">Screen 2 of 5</p>
        <h1 className="font-display text-screen">2 · Choose a trajectory</h1>
      </header>
      <p aria-label={`Mission: ${m.aria}`} className="flex max-w-full flex-wrap items-center gap-x-3 gap-y-1 self-start rounded-pill border border-space-border bg-space-card px-3.5 py-2">
        <span className="font-display text-[15px]">{m.title}</span>
        <span className="text-[13px] text-ink-2 tabular">{m.reqs.map(r => r.value).join(" · ")} · {m.budget}</span>
      </p>
      <p className="flex gap-2 text-[13px] text-st-warning"><span aria-hidden>⚠</span>Bars are illustrative values for educational purposes, derived from the physics below.</p>
      <div className="grid gap-4 lg:grid-cols-3">
        {(Object.keys(ORBITS) as OrbitId[]).map(id => {
          const o = ORBITS[id], on = selected === id;
          return (
            <button key={id} type="button" aria-pressed={on} onClick={() => onPick(id)}
              aria-label={`${id}, ${o.name}: altitude ${o.alt}. Fuel cost ${o.fuel} of 5, coverage ${o.cov} of 5, lifetime ${o.life} of 5. ${o.facts[1]}.`}
              className={`flex min-h-[44px] flex-col gap-3 rounded-lg p-4 text-left transition ${on ? "border-[3px] bg-space-raised" : "border-2 border-space-border bg-space-card shadow-raised"}`}
              style={on ? { borderColor: o.color, boxShadow: `0 0 0 1px ${o.color}, 0 0 28px color-mix(in oklab, ${o.color} 27%, transparent)` } : undefined}>
              <div className="flex items-center gap-3.5">
                <OrbitDiagram orbitId={id} className="size-[104px] shrink-0 lg:size-30" />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="flex items-center gap-2 font-display text-[15px] font-bold tracking-wide" style={{ color: o.color }}>
                    <span className="size-3 rounded-pill border-2 border-space-page" style={{ background: o.color }} />{id}
                  </span>
                  <h2 className="font-display text-[19px]">{o.name}</h2>
                  <span className="text-[13px] font-bold" style={{ color: on ? o.color : "var(--color-ink-2)" }}>{on ? "✓ Selected" : "Tap to choose"}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Bar label="Fuel cost" value={o.fuel} color={o.color} />
                <Bar label="Coverage" value={o.cov} color={o.color} />
                <Bar label="Lifetime" value={o.life} color={o.color} />
              </div>
              <p className="text-[15px] text-ink-2">{o.blurb}</p>
              <ul className="flex flex-col gap-1.5 rounded-md bg-space-raised p-3 text-small tabular">
                {o.facts.map(f => <li key={f} className="flex gap-2"><span aria-hidden style={{ color: o.color }}>•</span>{f}</li>)}
              </ul>
              {/* Inside a button the chip renders static (no nested link). Put the link in the WhyPanel/footer if needed. */}
              <span className="mt-auto flex items-center gap-2 text-caption text-ink-2">Source <SourceChip id={o.source} /></span>
            </button>
          );
        })}
      </div>
      <p className="rounded-md border border-space-border bg-space-card px-3.5 py-3 text-small text-ink-2">
        <span className="font-display text-ink">Why this matters · </span>
        Higher orbits see more of Earth at once and last longer, but cost more fuel to reach. Check each card’s latitude reach against your mission’s numbers.
      </p>
    </main>
  );
}

// Reusable orbit diagram. Shape differs per orbit (small circle / polar ellipse / wide dotted ring), not just color.
const DIAGRAM = {
  LEO: { r: 31, dur: "8s", outer: undefined },
  SSO: { r: 36, dur: "10s", outer: "translate(80 80) rotate(8) scale(0.36 1) translate(-80 -80)" },
  GEO: { r: 66, dur: "40s", outer: undefined },
};
export function OrbitDiagram({ orbitId, className }: { orbitId: OrbitId; className?: string }) {
  const d = DIAGRAM[orbitId], c = ORBITS[orbitId].color;
  return (
    <svg viewBox="0 0 160 160" className={`overflow-visible ${className ?? ""}`} role="img" aria-label={`${orbitId} orbit diagram, not to scale`}>
      {orbitId === "GEO" && <circle cx="80" cy="80" r="66" fill="none" stroke={c} strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />}
      {orbitId === "LEO" && <circle cx="80" cy="80" r="31" fill="none" stroke={c} strokeWidth="3" />}
      {orbitId === "SSO" && <ellipse cx="80" cy="80" rx="13" ry="36" fill="none" stroke={c} strokeWidth="3" transform="rotate(8 80 80)" />}
      <circle cx="80" cy="80" r="24" fill="#62B4FF" stroke="#0B1026" strokeWidth="3.5" />
      <path d="M64 72 Q70 62 80 66 Q86 74 78 80 Q68 84 64 72 Z M84 88 Q94 84 98 92 Q96 100 88 100 Q82 96 84 88 Z" fill="#7FE28E" stroke="#0B1026" strokeWidth="2.5" />
      <g transform={d.outer}>
        <g className="origin-[80px_80px] motion-safe:animate-[spin_var(--d)_linear_infinite]" style={{ ["--d" as any]: d.dur }}>
          <g transform={`translate(80 ${80 - d.r})`}>
            <rect x="-11" y="-4" width="7" height="8" rx="1.5" fill={c} stroke="#0B1026" strokeWidth="2" />
            <rect x="4" y="-4" width="7" height="8" rx="1.5" fill={c} stroke="#0B1026" strokeWidth="2" />
            <rect x="-4.5" y="-4.5" width="9" height="9" rx="2.5" fill="#F2F4FF" stroke="#0B1026" strokeWidth="2" />
          </g>
        </g>
      </g>
    </svg>
  );
}

// MissionArt: copy the three <g> groups (crop / storm / ice) from MissionArt.dc.html, viewBox 0 0 320 160.
export function MissionArt({ id }: { id: MissionId }) {
  const label = { crop: "Farmland patchwork seen from above", storm: "Hurricane swirl over the ocean", ice: "Polar ice sheet with floating floes" }[id];
  return <svg viewBox="0 0 320 160" className="block h-auto w-full rounded-md" role="img" aria-label={label}>
    <rect width="320" height="160" fill="#1F2852" />{/* paste group for `id` */}
  </svg>;
}
