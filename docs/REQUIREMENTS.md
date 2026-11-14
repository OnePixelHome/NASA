# Requirements mapping — Trajectory Ladder v0.1

Maps every item of the official challenge statement (HANDOFF §2) to the screen or engine function that covers it.
Audited against prototype v0.1 on Sat 2026-11-14. Status: ✅ covered · 🟡 partial · ❌ missing.

## What players must be able to do

| # | Challenge requirement | Where it lives | Status | Gap |
|---|---|---|---|---|
| 1 | Define the mission objective and requirements | Screen 1 "Pick your mission" (`SCENARIOS` in `catalog.ts`) | 🟡 | The objective is chosen, but its requirements (`needLatDeg`, `targetRevisitDays`, `coverage`) are only implied by the story text; they are never listed as numbers. |
| 2 | Design the spacecraft and scientific payload | Screen 3 tree: Science tier (instrument), Spacecraft tier (power) — `tierOptions()` | ✅ | The spacecraft bus is fixed (150 kg, 50 W, $30M); only payload and power are chosen. |
| 3 | Select the launch vehicle and orbit | Screen 2 "Choose a trajectory" (`ORBITS`, `orbitStats()`); Screen 3 Launch tier (`launchNode()`) | ✅ | — |
| 4 | Manage constraints: budget | Header budget meter (`budget()`), 10% reserve warning on Go/No-Go | ✅ | — |
| 4 | Manage constraints: mass | Checked in the Launch tier (`spacecraftMassKg()` vs `launchCapacityKg()`) | 🟡 | No live meter; the player sees mass only inside the launch reason text. HANDOFF §6-B1. |
| 4 | Manage constraints: power | Checked in the Spacecraft tier (`powerBudget()`) | 🟡 | No live meter. HANDOFF §6-B1. |
| 4 | Manage constraints: communications and data | Checked in the Ground tier (`downlinkCapacity()`) | 🟡 | No live meter. HANDOFF §6-B1. |
| 4 | Manage constraints: duration | `lifetimeYears` per orbit, shown as the "Lifetime" bar and in the last timeline step | 🟡 | Lifetime only multiplies the downlink cost. It is not a requirement of any scenario and does not affect the score. |
| 5 | Simulate the mission and evaluate the result | Screen 5 "Mission simulation" (6-step timeline) and Screen 6 scorecard (`evaluateMission()`) | ✅ | The simulation is a deterministic replay of the design; there are no in-flight events. |

## Required solution elements

| Element | Where it lives | Status | Gap |
|---|---|---|---|
| Clear user interface | Six numbered screens in `src/App.tsx` | ✅ | — |
| Mission configuration system | `Choice` + `choose()` (an upstream change clears downstream tiers) | ✅ | — |
| Resource management mechanics | Budget meter; mass, power and data enforced as locks | 🟡 | Only budget is visible as a resource. HANDOFF §6-B1. |
| Single-player and/or multiplayer (up to 4) | Shared screen; each tier is labelled with a role; Go/No-Go poll with four votes | 🟡 | Roles are labels only. A solo player casts all four votes. |
| Simulation and evaluation/scoring system | `evaluateMission()`: science 50, data 20, budget 15, team 15 | ✅ | See "team collaboration" below. |

## What the game should reward

| Reward | Where it lives | Status | Gap |
|---|---|---|---|
| Mission performance | Total score and success flag (score ≥ 50 and within budget) | ✅ | — |
| Scientific value | "Science return": instrument fit × coverage × revisit | ✅ | — |
| Efficient use of resources | "Budget & reserve": 15 with ≥10% reserve, 9 within budget, 0 over | ✅ | — |
| Quality of decisions | Scorecard insights: primary constraint, biggest impact, lesson learned | ✅ | Insights are plain strings without a source chip. |
| Team collaboration | "Team Go/No-Go": 15 × Go votes / 4 | ❌ | Launch is only enabled when all four roles vote Go, so this is always 15/15. It rewards nothing. |

## Suggested considerations

| Consideration | Where it lives | Status | Gap |
|---|---|---|---|
| Accessibility for different skill levels | Plain-language reasons on every node | 🟡 | No difficulty setting. HANDOFF §6-B4. |
| Distinct team roles | `TIER_ROLE`: Science, Spacecraft, Ground, Launch (NASA's four segments, S3) | ✅ | — |
| Clear success/failure feedback | Locked nodes with reasons; scorecard gauge and "Mission success / fell short" | ✅ | — |
| Modify designs and rerun | "Try another design" (back to the tree) and "Replay mission" | 🟡 | "Try another design" keeps the previous Go votes, so a changed design can launch without a new poll. |
| Difficulty levels | — | ❌ | HANDOFF §6-B4 (optional). |
| Orbits explained simply | Orbit cards: one-sentence blurb, three bars, three facts | ✅ | — |
| Launch vehicle ↔ mass ↔ orbit compatibility check | `launchNode()`: rocket equation shrinks capacity by the Δv to the chosen orbit | ✅ | — |

## Submission rules (HANDOFF §3)

| Rule | Status | Note |
|---|---|---|
| Everything in English | ✅ | All UI strings are English. |
| NASA data used and cited | ✅ | S1, S2, S3, S6, S10 are cited in the scorecard and README. S9 is defined in `sources.ts` but never used. |
| AI disclosure on the project page | 🟡 | Present in the README; no in-game About screen yet. HANDOFF §6-B3. |
| No NASA logos, insignia, flags or patches | ✅ | No NASA marks in `public/` or `src/`. `public/favicon.svg` and `public/icons.svg` are the Vite template defaults. |
