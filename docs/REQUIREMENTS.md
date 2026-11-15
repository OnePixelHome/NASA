# Requirements mapping — Status: GO v0.1

Maps every item of the official challenge statement (HANDOFF §2) to the screen or engine function that covers it.
Audited against prototype v0.1 on Sat 2026-11-14; updated that night after PRs #1 to #14. Status: ✅ covered · 🟡 partial · ❌ missing.

## What players must be able to do

| # | Challenge requirement | Where it lives | Status | Gap |
|---|---|---|---|---|
| 1 | Define the mission objective and requirements | Screen 1 "Pick your mission": each brief lists its requirements as numbers (`missionRequirements()`: latitude reach, coverage, revisit) and its budget; screen 2 repeats them in a summary chip | ✅ | — |
| 2 | Design the spacecraft and scientific payload | Screen 3 tree: Science tier (instrument), Spacecraft tier (power) — `tierOptions()` | ✅ | The spacecraft bus is fixed (150 kg, 50 W, $30M); only payload and power are chosen. |
| 3 | Select the launch vehicle and orbit | Screen 2 "Choose a trajectory" (`ORBITS`, `orbitStats()`); Screen 3 Launch tier (`launchNode()`) | ✅ | — |
| 4 | Manage constraints: budget | Header budget meter (`budget()`), 10% reserve warning on Go/No-Go | ✅ | — |
| 4 | Manage constraints: mass | Header resource panel (`resources()`): spacecraft mass vs launcher capacity to the chosen orbit. Also enforced as a lock in the Launch tier | ✅ | — |
| 4 | Manage constraints: power | Header resource panel: orbit-average power used vs generated. Also enforced as a lock in the Spacecraft tier (`powerBudget()`) | ✅ | — |
| 4 | Manage constraints: communications and data | Header resource panel: data collected vs downlinked per day. Also enforced as a lock in the Ground tier (`downlinkCapacity()`) | ✅ | — |
| 4 | Manage constraints: duration | `lifetimeYears` per orbit, shown as the "Lifetime" bar and in the last timeline step | 🟡 | Lifetime only multiplies the downlink cost. It is not a requirement of any scenario and does not affect the score. |
| 5 | Simulate the mission and evaluate the result | Screen 5 "Mission simulation" (6-step timeline) and Screen 6 scorecard (`evaluateMission()`) | ✅ | Screen 5 plays a rendered mission film of the player's design (launch, panels unfolding, first picture, a day in orbit over NASA's Blue Marble image). It also plays "A day in orbit" (`missionDay()`) as telemetry: the ground track, shadow crossings, battery level and data downlinked on each ground-station pass, computed from the design. Deterministic; there are no random in-flight events. |

## Required solution elements

| Element | Where it lives | Status | Gap |
|---|---|---|---|
| Clear user interface | Six numbered screens in `src/App.tsx` | ✅ | — |
| Mission configuration system | `Choice` + `choose()` (an upstream change clears downstream tiers) | ✅ | — |
| Resource management mechanics | Four live meters (budget, mass, power, data) with written states; the same numbers drive the locks | ✅ | — |
| Single-player and/or multiplayer (up to 4) | Shared screen; each tier is labelled with a role; Go/No-Go poll with four votes | 🟡 | Roles are labels only. A solo player casts all four votes. |
| Simulation and evaluation/scoring system | `evaluateMission()`: science 50, data 20, budget 15, team 15 | ✅ | See "team collaboration" below. |

## What the game should reward

| Reward | Where it lives | Status | Gap |
|---|---|---|---|
| Mission performance | Total score and success flag (score ≥ 50 and within budget) | ✅ | — |
| Scientific value | "Science return": instrument fit × coverage × revisit | ✅ | — |
| Efficient use of resources | "Budget & reserve": 15 with ≥10% reserve, 9 within budget, 0 over | ✅ | — |
| Quality of decisions | Scorecard insights: primary constraint, biggest impact, lesson learned, each with its source tags | ✅ | — |
| Team collaboration | "Team Go/No-Go": a unanimous Go earns 15 points; launching over No-Go votes keeps only the agreeing share (`teamPoints()`) | ✅ | A solo player casts all four votes. |

## Suggested considerations

| Consideration | Where it lives | Status | Gap |
|---|---|---|---|
| Accessibility for different skill levels | Plain-language reasons on every node | 🟡 | No difficulty setting. HANDOFF §6-B4. |
| Distinct team roles | `TIER_ROLE`: Science, Spacecraft, Ground, Launch (NASA's four segments, S3) | ✅ | — |
| Clear success/failure feedback | Locked nodes with reasons; scorecard gauge with "Mission success" or "Mission failed" and which rule failed | ✅ | — |
| Modify designs and rerun | "Try another design" (back to the tree) and "Replay mission". Changing the design resets the Go/No-Go poll | ✅ | — |
| Difficulty levels | — | ❌ | HANDOFF §6-B4 (optional). |
| Orbits explained simply | Orbit cards: one-sentence blurb, three bars, three facts | ✅ | — |
| Launch vehicle ↔ mass ↔ orbit compatibility check | `launchNode()`: rocket equation shrinks capacity by the Δv to the chosen orbit | ✅ | — |

## Submission rules (HANDOFF §3)

| Rule | Status | Note |
|---|---|---|
| Everything in English | ✅ | All UI strings are English. |
| NASA data used and cited | ✅ | S1, S2, S3, S6, S9, S10, S12, S13, S15, S16, S17 and S19 (NASA), S14 (NOAA–NASA) and S18 (ESA) are cited in the game, on the About screen and in the README. S2, S6, S9 and S13–S19 carry their exact quote. |
| AI disclosure on the project page | ✅ | The About screen shows `AI_DISCLOSURE`; the same text is in `docs/PROJECT_PAGE.md`. |
| No NASA logos, insignia, flags or patches | ✅ | No NASA marks in `public/` or `src/`. `public/favicon.svg` is the team's own drawing (planet, orbit, satellite). |
