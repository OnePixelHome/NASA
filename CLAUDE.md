@BACKUP.md
@AGENTS.md

# Trajectory Ladder — One Pixel Home (NASA Space Apps 2026 · Space Mission Design Game)

Browser game: pick a mission brief → choose a trajectory (LEO / SSO / GEO) → build a live dependency tree
(instrument → power → downlink → launch vehicle) where options turn green or lock with a sourced reason →
Go/No-Go poll → mission simulation → scorecard. Up to 4 players share one screen, one role per tier.

## Stack
Vite + React 19 + TypeScript, Tailwind v4, Vitest. pnpm. Deploy: Vercel. No backend.

## Layout
- `src/engine/` — pure TS, no React. `physics.ts` (formulas), `catalog.ts` (all game data),
  `game.ts` (tree viability, budget, scoring, mission timeline), `sources.ts` (citations).
- `src/engine/engine.test.ts` — physics sanity checks + balance test (every scenario must keep ≥3 viable paths
  and a best path ≥80 pts within budget with 10% reserve). Run after ANY catalog change.
- `src/App.tsx` — screens. `src/ui/components.tsx` — Bar, Gauge, Meter, SourceChip, ReasonList.

## Rules
- UI, code and docs in English.
- Every number shown carries a source: NASA (S1–S10), PHYS (standard physics) or GAME (illustrative).
- Every lock/unlock is a `Reason { text, source }` — never a bare string.
- No NASA logos/insignia. AI-generated images need a visible "AI-generated" watermark.
- Keep the engine free of UI code; UI only calls `orbitStats`, `tierOptions`, `choose`, `budget`, `evaluateMission`.

## Commands
`pnpm dev` · `pnpm test` · `pnpm build` · `pnpm build:single` (one self-contained HTML for quick previews)
