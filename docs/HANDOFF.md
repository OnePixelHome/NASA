# HANDOFF — One Pixel Home · Trajectory Ladder (full context for Claude Code)

Read this whole file before doing anything. It is the single source of truth for decisions made by the team and
with Claude (chat) up to Sat 2026-11-14 14:50 Lima time. If code and this file disagree, this file wins — then fix the code.

---

## 1. Event facts
- **Event:** NASA Space Apps Challenge 2026, Lima local event (Miraflores, Calle Junín 355). Sat Nov 14 – Sun Nov 15.
- **Hard deadline:** Sun Nov 15, 23:59 (submission is final, late = not eligible). **Team target: submit Sun 20:00.**
- **Mentors** are available at the venue (they guide, they don't code).
- **Team "One Pixel Home"**
  - **Edgar Cardona** — software architect. Phone only (no laptop at the venue). Drives Claude Code by Remote Control
    on his home PC (Windows 10, 16 GB, PowerShell, GitHub CLI logged in) or Claude Code on the web. Owns engine, sources, QA, project-page text.
  - **José Gómez** — full-stack dev, has a laptop. Owns repo, Vercel deploy, UI implementation.
  - **Thais Rodríguez** — product designer (Figma). Owns visual design, video visuals.
  - **Belle Vásquez Machado** — MarTech specialist. Owns copy (briefs, lessons, tooltips), pitch script, video.
- Repo: `github.com/belleavm/NASA` (private as of Sat afternoon; it must be public before submission, see `docs/SUBMISSION.md`). License: MIT.

## 2. The challenge (official statement — Space Mission Design Game)
Create an interactive game where participants design, manage and simulate a complete space mission, making engineering
decisions, managing limited resources and evaluating how each choice shapes mission success. Target users: students.

Players must be able to:
1. Define the mission objective and requirements.
2. Design the spacecraft and scientific payload.
3. Select the launch vehicle and orbit.
4. Manage constraints on budget, mass, power, communications, data and duration.
5. Simulate the mission and evaluate the result.

Required solution elements: clear UI · mission configuration system · resource management mechanics ·
single-player and/or multiplayer (up to 4) · simulation and evaluation/scoring system.
The game should reward: mission performance · scientific value · efficient use of resources · quality of decisions · team collaboration.
Suggested considerations: accessibility for different skill levels, distinct team roles, clear success/failure feedback,
modify designs and rerun, difficulty levels, orbits explained simply, launch vehicle ↔ mass ↔ orbit compatibility check.

Resources tab (NASA): Design and Develop Science Missions (4 segments: Launch, Space, Ground, User), JPL Concept Maturity
Levels, GSFC Mission Design Lab, CubeSat 101, Webb "Build it yourself" game, GMAT, NASA Mission Viz.

## 3. Submission rules that change what we build
- **Demo = video ≤ 30 s with English subtitles, or ≤ 7 slides incl. title.** Longer = NOT eligible for Global Judging.
  (The Miro PRD said "2-minute video" — that is WRONG. Use 30 s.)
- **Everything in English** (UI, project page, video).
- **NASA data/resources are required** for Global Award eligibility. Cite every source used.
- **AI disclosure:** AI-generated code/text must be acknowledged on the project page. AI images need a visible
  "AI-generated" watermark. No NASA logos, insignia, flags or mission patches in AI-generated content.
- Judging criteria: **Impact, Creativity, Validity, Relevance, Presentation.**

## 4. What we decided (concept history → final)
- Team sticky (Miro, Spanish): *"Un juego que ayude a diseñar y simular misiones de viajes al espacio, que calcule la órbita
  y recursos necesarios para que la misión del viaje sea completada con éxito."*
  → EN: "A game that helps design and simulate space missions, calculating the orbit and resources needed for the mission to succeed."
- Team PRD from Miro: **"Escalera de Trayectorias / Trajectory Ladder"** — Act 1: pick a trajectory card (LEO, SSO, GEO,
  elliptical optional) with Fuel / Coverage / Lifetime bars; Act 2: live dependency tree (instrument → hardware → downlink)
  where nodes turn green or grey; end: scorecard (0–100 meter + critical dependencies text). Shared-screen play, no backend.
- **ADOPTED: the PRD + these 10 adjustments** (confirmed by Edgar):
  1. Video 30 s max (not 2 min).
  2. Use NASA data: values stay "illustrative" where needed, but every rule cites a NASA resource or standard physics.
  3. Add what the challenge requires and the PRD missed: **mission brief first** (objective), **launch vehicle tier**,
     **budget + mass** meters, short **mission simulation** before the scorecard.
  4. Honor the team sticky: tree colors are decided by **real formulas** (resolution vs altitude, period, eclipse, passes/day,
     rocket equation), not an arbitrary lookup table.
  5. Compressed timeline (event is ~39 h, not 48 h) — see §8.
  6. Edgar's role: engine + sources + project page + QA (from phone).
  7. Accessibility: lock icon + text, not color only; keyboard-focusable nodes.
  8. Collaboration: each tree tier labelled with a role (Science, Spacecraft, Ground, Launch — NASA's 4 segments) + **Go/No-Go poll**.
  9. UI in English, product name "Trajectory Ladder".
  10. No Google Analytics/Mixpanel.
- **DROPPED / post-hackathon:** Mars & interplanetary level, 3D (React Three Fiber), the earlier CubeSat-only spec
  (`engine-spec.md` from Friday is superseded), real-time multiplayer, accounts, backend.
- **ACCEPTED after the §6-A validation** (confirmed by Edgar, Sat 2026-11-14 afternoon):
  1. **Repo is `belleavm/NASA`.** The prototype was imported there; `edgarcardona872/one-pixel-home` is no longer used.
  2. **Workflow:** one concern per PR, stacked, merged in order. `main` stays deployable.
  3. **Go/No-Go:** Launch is enabled once all four roles have voted. A unanimous Go earns the full 15 team points.
     With any No-Go the button reads "Launch anyway" and the mission keeps only the agreeing share (2 of 4 Go → 8 of 15).
     Changing the design resets the poll.
  4. **Re-tapping a selected node is non-destructive:** it shows the node's reasons and keeps the tiers below it.
  5. **Phone header:** the tagline hides once a mission is picked, to make room for the resource panel.
  6. **Non-affiliation line** on the About screen: the project is not affiliated with or endorsed by NASA.
  7. **Languages:** `BACKUP.md` stays in Spanish because it is internal only. Everything judges can see
     (UI, README, project page, video, PR-facing docs) stays in English.
  8. **Scope:** §6-B4 (difficulty) and §6-B5 (stretch) are skipped unless Edgar says otherwise.
     §6-B6 waits for the mentor answers.

## 5. Current state of the code (prototype v0.1 — playable end to end)
Stack: Vite + React 19 + TS, Tailwind v4, Vitest, pnpm. `pnpm build:single` makes one self-contained HTML (preview).
- `src/engine/physics.ts` — constants from NASA Earth Fact Sheet (R=6378.137 km, GM=398600.4418, S=1361 W/m²);
  period, eclipse fraction, max latitude, footprint, Hohmann (+combined plane change), rocket equation, GSD/swath scaling,
  revisit, station visibility & pass length.
- `src/engine/catalog.ts` — scenarios (Crop Watch / Storm Watch / Polar Ice with budgets 200/300/250 $M), orbits
  (LEO 500 km 51.6° [ISS S10], SSO 705 km 98.2° [Landsat 9 S6], GEO 35,786 km), instruments (High-Res Camera,
  Multispectral Imager [Landsat-class], Imaging Radar, Weather Imager), power (Standard / Extended / Solar+Battery Hybrid),
  downlinks (Daily Pass / Polar Station Network / Continuous Link, relay cost from LEO), launchers (Small/Medium/Heavy),
  10% budget reserve [S2].
- `src/engine/game.ts` — `orbitStats`, `tierOptions(tier, choice)` → nodes with `ok` + `reasons[]` (each reason has a source),
  `choose` (clears downstream), `budget`, `evaluateMission` (score: science 50, data 20, budget 15, team 15;
  primary constraint / biggest impact / lesson; 6-step timeline).
- `src/engine/engine.test.ts` — 15 tests: ISS period 92.6 min, GEO altitude, Landsat 9 period ~99 min & revisit ~16 d,
  LEO→GEO Δv ~4.3 km/s, cascade rules (GEO only allows weather imager; LEO radar needs hybrid power; polar station
  unreachable from 51.6°), and a **balance test**: every scenario has ≥3 viable paths and a best path ≥80 pts within budget with ≥10% reserve.
- `src/App.tsx` — screens: Brief → Orbit cards → Tree → Go/No-Go → Mission run → Scorecard (gauge, breakdown, insights, sources, replay).
- Best paths today: Crops = SSO/Multispectral/Standard/Daily/Small (100 pts, $105M); Storms = GEO/Weather/Extended/Continuous/Heavy
  (100, $250M); Ice = SSO/Radar/Hybrid/Daily/Medium (86, $210M).

## 6. YOUR JOB (Claude Code) — validate, then fix, in this order
**A. Validate (report a checklist with ✅/❌ before changing anything)**
1. `pnpm install && pnpm test && pnpm build` all pass.
2. Every challenge requirement in §2 maps to a screen/feature (write the mapping table into `docs/REQUIREMENTS.md`).
3. Every number on screen has a source chip (NASA Sx / physics / illustrative). No NASA logos anywhere.
4. All UI text is English. Locked nodes show 🔒 + text. All buttons keyboard-focusable.
5. Mobile (≈390 px wide) layout is usable — judges will open the link on phones.

**B. Close the known gaps (small PRs, tests green after each)**
1. **Resource panel** (challenge item 4): add Mass (kg vs launcher capacity), Power (W generated vs used), Data
   (Gbit/day collected vs downlinked) meters next to Budget, updating live as the tree is filled.
2. **Node tooltips**: 1–2 plain-English sentences per node (Belle provides copy; put it in `catalog.ts`, not in JSX).
3. **About / Sources screen** with the AI-use disclosure text from §9 and all sources.
4. **Difficulty** (cheap): "Easy" shows why-reasons for green nodes too; "Hard" hides numbers until the scorecard. Optional.
5. Stretch only if A+B are done by Sun 12:00: elliptical (Molniya-like) orbit card; localStorage leaderboard (wrap in try/catch).
6. After mentor answers (§7), update catalog values, change their tag in comments to `MENTOR`, re-run the balance test.

**Rules:** keep `src/engine` free of React; never show a number without a source; don't weaken tests to make them pass —
re-balance the catalog instead; conventional commits; one concern per PR; run `pnpm test` before every push.

## 7. Values still to confirm with a mentor (Edgar asks Sat afternoon)
1. Mission lifetime by orbit: LEO 500 km ≈ 5 yr, SSO 705 km ≈ 10 yr, GEO ≈ 15 yr (station-keeping fuel). Reasonable?
2. Battery max depth of discharge: LEO ~30% vs GEO ~70% (cycle count). Reasonable?
3. Ground passes per day at 500–700 km, 10° min elevation: mid-latitude station ≈ 4, polar station network ≈ 10 for SSO?
4. Imaging radar practical max altitude ~1,000 km for a small mission? SSO launch penalty ~0.4 km/s (no Earth-rotation boost)?

## 8. Timeline & owners
| When | José | Thais | Belle | Edgar (+Claude Code) |
|---|---|---|---|---|
| Sat 15:00–17:00 | Repo + Vercel deploy | Figma style: cards, node states, scorecard | Copy: briefs, lessons, tooltips (EN) | Mentor questions §7; run §6-A validation |
| Sat 17:00–21:00 | Apply design, mobile polish | Hand-off + orbit mini-illustrations (optional) | 30-s video script + project page summary | §6-B1 resource panel, §6-B3 About screen |
| Sun 09:00–12:00 | Bug fixes | Video visuals | Record voice-over | Tooltips wiring, mentor values, QA on phone |
| Sun 12:00 | **Full team playtest** | | | |
| Sun 14:00–17:00 | Final deploy | Edit video | Subtitles (EN) | Project page text, sources, AI disclosure |
| Sun 18:00 | **Code freeze** | | | |
| Sun 20:00 | **SUBMIT** (keep 4 h buffer before 23:59) | | | |

## 9. Ready-to-use text
**Pitch line:** "Trajectory Ladder: design a space mission and watch every choice ripple down — the game calculates the
orbit and resources your mission needs to succeed."

**30-s video script (draft, EN):**
- 0–5 s: "Real missions fail when one choice breaks another. Students rarely get to see that."
- 5–22 s (screen recording): pick Polar Ice → tap GEO: cameras and radar lock ("36 m per pixel — too blurry")
  → switch to SSO → radar + hybrid power turn green → Go/No-Go → score 86.
- 22–30 s: "Built on NASA orbital data and Landsat 9 parameters. Trajectory Ladder — every choice has a consequence."

**AI disclosure (project page and About screen; updated Sat night to cover the visual design):** "Code scaffolding, the physics engine and documentation were drafted with Claude (Anthropic). The visual design and illustrations were drafted with Claude Design (Anthropic). All of it was reviewed, tested and adapted by the team. Physics formulas are covered by automated tests; illustrative values are labelled in the game."

**Sources:** S1 NASA Earth Fact Sheet · S2 NASA CubeSat 101 · S3 NASA Design and Develop Science Missions · S6 NASA Landsat 9 ·
S9 NASA SST State-of-the-Art Communications · S10 NASA ISS FAQ (URLs in `src/engine/sources.ts` and README).
