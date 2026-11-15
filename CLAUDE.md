@BACKUP.md
@AGENTS.md

# Status: GO — One Pixel Home (NASA Space Apps 2026 · Space Mission Design Game)

Browser game. Start page (team size 1–4) → pick a mission brief → choose a trajectory (LEO / SSO / GEO) → build a live
dependency tree (instrument → power → downlink → launch vehicle) where options turn green or lock with a sourced reason
→ Go/No-Go poll (one vote per player) → mission simulation (rendered film + day-in-orbit telemetry) → scorecard
(save to the online leaderboard, try another design, replay, Home). The four roles are split among the players
(`playerRoles()`); a solo player holds all four and needs a single Go.

Live: https://victorious-pebble-0fcf34b10.6.azurestaticapps.net/ · Repo: `OnePixelHome/NASA`.

## Stack
Vite + React 19 + TypeScript, Tailwind v4, Vitest, oxlint. pnpm. Deploy: Azure Static Web Apps only
(`.github/workflows/azure-static-web-apps.yml`, every push to `main`; secret `AZURE_STATIC_WEB_APPS_API_TOKEN`). Only backend: the leaderboard API, a managed
function of the same Static Web App (`server/azure/`, `/api/leaderboard`), with the table `scores` (`server/schema.ts`, created by the API on first use) in
Azure Database for PostgreSQL (`statusgo-db`, resource group `Nasa`). The old Neon Function (`server/leaderboard.ts`) is
no longer used by the game.

## Layout
- `src/engine/` — pure TS, no React. `physics.ts` (formulas), `catalog.ts` (all game data),
  `game.ts` (tree viability, budget, resources, scoring, team size, mission timeline), `track.ts` (ground track and
  station passes), `missionDay.ts` (battery and data second by second), `sources.ts` (citations and About copy).
- `src/engine/engine.test.ts` — physics sanity checks + balance test (every scenario must keep ≥3 viable paths
  and a best path ≥80 pts within budget with 10% reserve). Run after ANY catalog change. `day.test.ts` checks the
  mission day against the locks.
- `src/App.tsx` — screens (Home, Brief, Orbit, Tree, GoNoGo, MissionRun, Score, About, leaderboard screen).
- `src/ui/` — `components.tsx` (Bar, Gauge, Meter, SourceChip, ReasonList…), `HomeHero.tsx`, `Leaderboard.tsx`,
  `MissionFilm.tsx` + `film/` (canvas film), `DayView.tsx`, `MissionScene.tsx`, `Ship.tsx`, `Crew.tsx`, `MissionArt.tsx`.
- `src/leaderboard/` — `api.ts` (client, `LEADERBOARD_URL` kill switch, 6 s timeout) and `name.ts` (name rules shared
  with the server).
- `server/` — `handler.ts` (API logic), `azure/` (Azure Functions entry + build), `schema.ts`, `README.md`;
  `leaderboard.ts` + `deploy.sh` are the old Neon Function.

## Rules
- UI, code and docs in English (`BACKUP.md` stays in Spanish: internal log).
- Every number shown carries a source: NASA or a partner agency (S1–S19; NOAA and ESA set `agency`), PHYS (standard
  physics) or GAME (illustrative).
- A new source needs an official agency URL and a quote checked word for word against the page or PDF (`cite` +
  `quote` in `sources.ts`).
- Every lock/unlock is a `Reason { text, source }` — never a bare string.
- No NASA logos/insignia. AI-generated images need a visible "AI-generated" label (`AiGeneratedLabel`).
- Keep the engine free of UI code; the UI calls engine functions (`orbitStats`, `tierOptions`, `choose`, `budget`,
  `resources`, `evaluateMission`, `playerRoles`, `teamPoints`…) and never re-implements game rules.
- Leaderboard: the server recalculates every score with `evaluateMission(choice, goVotes, players)`; the client never
  sends a score. The API ships with every push to `main`, so scoring and catalog changes reach it automatically.
  No secrets in the repo: `DATABASE_URL` is an app setting of the Static Web App.
- The game must work with the leaderboard down; `LEADERBOARD_URL = ''` hides every leaderboard control.

## Commands
`pnpm dev` · `pnpm test` · `pnpm lint` · `pnpm build` · `pnpm build:single` (one self-contained HTML for quick
previews) · `bash server/deploy.sh` (leaderboard function)
