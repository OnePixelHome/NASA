// About & sources + AppHeader + AiGeneratedLabel. React 19 + Tailwind v4, tokens from theme.css. No game rules.
import { RoleCharacter } from "./MissionTree";
import { ShipSvg } from "./Ship";

export const SOURCES = [   // keep in sync with src/engine/sources.ts
  { id: "S1", chip: "NASA S1", title: "NASA Earth Fact Sheet", url: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html" },
  { id: "S2", chip: "NASA S2", title: "NASA CubeSat 101", url: "https://www.nasa.gov/wp-content/uploads/2017/03/nasa_csli_cubesat_101_508.pdf" },
  { id: "S3", chip: "NASA S3", title: "NASA Design and Develop Science Missions", url: "https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf" },
  { id: "S6", chip: "NASA S6", title: "NASA Landsat 9", url: "https://science.nasa.gov/mission/landsat-9" },
  { id: "S9", chip: "NASA S9", title: "NASA Small Spacecraft Technology State-of-the-Art, Communications", url: "https://www.nasa.gov/smallsat-institute/sst-soa/communications" },
  { id: "S10", chip: "NASA S10", title: "NASA International Space Station FAQ", url: "https://www.nasa.gov/?p=532244" },
  { id: "PHYS", chip: "physics", title: "Standard orbital mechanics (Kepler, Hohmann, rocket equation)." },
  { id: "GAME", chip: "illustrative", title: "Simplified game value for educational purposes." },
];

export function AiGeneratedLabel({ className = "" }: { className?: string }) {
  return (
    <span role="note" aria-label="AI-generated image"
      className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-pill border-[1.5px] border-ink bg-space-page pr-2.5 pl-2 text-caption font-bold tracking-wide text-ink ${className}`}>
      <svg viewBox="0 0 12 12" className="size-[11px]" aria-hidden><path d="M6 0 L7.4 4.6 L12 6 L7.4 7.4 L6 12 L4.6 7.4 L0 6 L4.6 4.6 Z" fill="currentColor" /></svg>
      AI-generated
    </span>
  );
}
// Usage: <div className="relative"><img … /><AiGeneratedLabel className="absolute right-2 bottom-2" /></div>

export function AppHeader({ onAbout, active = false }: { onAbout: () => void; active?: boolean }) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-space-border bg-space-page py-1.5 pr-2 pl-4">
      <span className="font-display text-[16px] whitespace-nowrap">Trajectory Ladder</span>
      <button type="button" onClick={onAbout} aria-label="About and sources" aria-current={active ? "page" : undefined}
        className={`flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-pill border px-3 text-small font-bold hover:border-st-available ${active ? "border-st-available bg-space-raised" : "border-space-border bg-space-card"}`}>
        <span aria-hidden className="grid size-5 place-items-center rounded-pill border-2 border-st-available font-display text-[12px] text-st-available">i</span>About
      </button>
    </header>
  );
}

const STEPS = [
  { icon: "◉", color: "var(--color-role-science)", title: "Pick a mission", text: "Choose a science goal. It sets what success means." },
  { icon: "◯", color: "var(--color-orbit-sso)", title: "Choose a trajectory", text: "Compare LEO, SSO and GEO and pick the orbit." },
  { icon: "☰", color: "var(--color-role-spacecraft)", title: "Build the ladder", text: "Pick instrument, power, downlink and launcher. Each choice can lock the next." },
  { icon: "▲", color: "var(--color-role-launch)", title: "Vote Go / No-Go and watch the simulation", text: "Every role must say Go. Then follow the mission and read your scorecard." },
];
const TEAM = [
  { role: "science", name: "[Name]", title: "Software architect" },
  { role: "spacecraft", name: "[Name]", title: "Full-stack developer" },
  { role: "ground", name: "[Name]", title: "Product designer" },
  { role: "launch", name: "[Name]", title: "MarTech specialist" },
] as const;
const CARD = "flex flex-col gap-3 rounded-lg border border-space-border bg-space-card p-4.5";
const H2 = "font-display text-[22px] leading-tight";

export function About({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-dvh bg-space-page font-body text-ink motion-safe:animate-[about-in_240ms_ease-out_both]">
      <AppHeader onAbout={() => {}} active />
      <main className="mx-auto flex max-w-[1280px] flex-col gap-5 px-4 pt-4 lg:px-10 lg:pt-6">
        <button type="button" onClick={onBack} className="min-h-[44px] self-start rounded-pill border-2 border-space-border bg-space-card px-4 font-display hover:border-st-available">← Back to the game</button>
        <h1 className="font-display text-screen">About &amp; sources</h1>
        <div className="grid items-start gap-4 lg:grid-cols-2 lg:gap-6">
          <div className="flex min-w-0 flex-col gap-4">
            <section aria-labelledby="h-what" className={CARD}>
              <h2 id="h-what" className={H2}>What is Trajectory Ladder?</h2>
              <p className="text-body text-ink-2">Design a space mission and watch every choice ripple down. The game calculates the orbit and resources your mission needs to succeed.</p>
              <div className="flex flex-wrap items-end justify-center gap-1 pt-2">
                <RoleCharacter role="science" mood="cheer" className="size-12" /><RoleCharacter role="spacecraft" className="size-12" />
                <ShipSvg payload="prism" power="small" antenna="polar" launcher="medium" height={120} />
                <RoleCharacter role="ground" className="size-12" /><RoleCharacter role="launch" mood="cheer" className="size-12" />
              </div>
            </section>
            <section aria-labelledby="h-how" className={CARD}>
              <h2 id="h-how" className={H2}>How to play</h2>
              <ol className="flex flex-col gap-2.5">
                {STEPS.map((s, i) => (
                  <li key={s.title} className="flex gap-3">
                    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-md border border-space-border bg-space-raised font-display text-[18px]" style={{ color: s.color }}>{s.icon}</span>
                    <div className="min-w-0"><h3 className="font-display"><span className="text-ink-2 tabular">{i + 1} ·</span> {s.title}</h3><p className="text-small text-ink-2">{s.text}</p></div>
                  </li>
                ))}
              </ol>
              <p className="rounded-md bg-space-raised p-3 text-small">Four roles, one for each of NASA’s four mission segments: Science, Spacecraft, Ground, Launch.</p>
            </section>
            <section aria-labelledby="h-numbers" className={CARD}>
              <h2 id="h-numbers" className={H2}>Where the numbers come from</h2>
              <dl className="flex flex-col gap-2.5 text-small">
                <div className="flex gap-3"><dt className="w-24 shrink-0"><Chip label="NASA S1 ↗" /></dt><dd>An official NASA resource. Tap the chip to open it.</dd></div>
                <div className="flex gap-3"><dt className="w-24 shrink-0"><Chip label="physics" dashed /></dt><dd>Standard orbital mechanics, calculated by the game.</dd></div>
                <div className="flex gap-3"><dt className="w-24 shrink-0"><Chip label="illustrative" dashed /></dt><dd>A simplified game value, used to make an idea easy to see.</dd></div>
              </dl>
            </section>
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <section aria-labelledby="h-sources" className={CARD}>
              <h2 id="h-sources" className={H2}>Sources</h2>
              <ul>
                {SOURCES.map(s => (
                  <li key={s.id} className="flex items-start gap-2.5 border-t border-space-border py-2">
                    <span className="w-21 shrink-0"><Chip label={s.chip} /></span>
                    {s.url
                      ? <a href={s.url} target="_blank" rel="noreferrer" aria-label={`${s.title}, opens in a new tab`} className="-my-2.5 flex min-h-[44px] flex-1 items-center gap-1.5 text-small text-st-available underline-offset-2 hover:text-ink">{s.title} <span aria-hidden>↗</span></a>
                      : <span className="flex-1 text-small">{s.title} <span className="text-ink-2">No link.</span></span>}
                  </li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="h-ai" className="flex flex-col gap-3 rounded-lg border-2 border-st-available bg-space-raised p-4.5">
              <h2 id="h-ai" className={`${H2} flex items-center gap-2.5`}><span aria-hidden className="grid size-8 place-items-center rounded-[10px] bg-st-available text-space-page">✦</span>AI use</h2>
              <p className="text-[15px]">Code scaffolding, the physics engine and documentation were drafted with Claude (Anthropic) and reviewed, tested and adapted by the team. Physics formulas are covered by automated tests; illustrative values are labelled in the game.</p>
              <p className="text-[15px]">Images marked 'AI-generated' were made with AI.</p>
              <figure className="relative grid h-30 place-items-center rounded-md border border-space-border bg-[repeating-linear-gradient(135deg,#151C3D_0_10px,#1A2247_10px_20px)]">
                <span className="font-mono text-caption text-ink-2">background image</span>
                <AiGeneratedLabel className="absolute right-2 bottom-2" />
              </figure>
            </section>
            <section aria-labelledby="h-nasa" className={CARD}>
              <h2 id="h-nasa" className={H2}>Not affiliated with NASA</h2>
              <p className="text-[15px] text-ink-2">Trajectory Ladder is an independent project made for the NASA Space Apps Challenge 2026. It is not affiliated with or endorsed by NASA. NASA does not endorse any non-U.S. Government entity.</p>
            </section>
            <section aria-labelledby="h-team" className={CARD}>
              <h2 id="h-team" className={H2}>Team · One Pixel Home</h2>
              <ul className="grid grid-cols-2 gap-2.5">
                {TEAM.map(t => (
                  <li key={t.title} className="flex flex-col items-center gap-1.5 rounded-md bg-space-raised px-2 py-3 text-center">
                    <RoleCharacter role={t.role} className="size-13" /><span className="font-display">{t.name}</span><span className="text-[13px] text-ink-2">{t.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
      <footer className="mt-5 flex flex-wrap justify-between gap-x-4 gap-y-1.5 border-t border-space-border px-4 pt-4 pb-6 text-[13px] text-ink-2 lg:px-10">
        <span>MIT License</span><span>No accounts, no cookies, no analytics.</span>
      </footer>
    </div>
  );
}

function Chip({ label, dashed = false }: { label: string; dashed?: boolean }) {
  return <span className={`inline-flex h-6 items-center whitespace-nowrap rounded-pill border border-space-border px-2.5 text-caption font-bold text-ink-2 ${dashed ? "border-dashed" : "bg-space-raised"}`}>{label}</span>;
}
/* theme.css: @keyframes about-in { from { opacity: 0 } } */
