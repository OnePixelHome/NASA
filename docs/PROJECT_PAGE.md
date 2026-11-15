# Project page draft — Status: GO

Draft text for the NASA Space Apps 2026 project page. Paste each section into the matching field.
Owner: Edgar. Copy review: Belle. Status: **draft**, written Sat 2026-11-14 against the code in PRs #1 to #7.

Items marked **TODO** must be filled in or confirmed before submitting.

---

## Project name

Status: GO

## Team

One Pixel Home

## Challenge

Space Mission Design Game

## High-level summary

Real missions fail when one choice breaks another, and students rarely get to see that. Status: GO is a browser game
where one to four players design an Earth-observation mission step by step: pick a science goal, choose an orbit, then build
a dependency tree of instrument, power system, data downlink and launch vehicle. Every option is either available or locked,
and every lock explains itself with a number computed from real orbital mechanics and NASA data. A Go/No-Go poll, a mission
simulation and a scorecard close the loop, so players can change one choice and watch the consequences ripple down.

## Link to demo

**TODO:** 30-second video with English subtitles, or 7 slides at most. Paste the public link here.

## Link to final project

https://onepixelhome.github.io/NASA/ · Code: https://github.com/OnePixelHome/NASA

## Detailed description

**What it does.** The game has six steps.

1. **Mission brief.** Choose a science objective: Crop Watch, Storm Watch or Polar Ice. Each has its own budget.
2. **Trajectory.** Choose Low Earth Orbit, Sun-synchronous orbit or geostationary orbit. Each card shows period, reachable
   latitude and the extra velocity needed to get there.
3. **Mission tree.** Fill four tiers, one per team role: scientific instrument (Science), power system (Spacecraft),
   data downlink (Ground) and launch vehicle (Launch). An option that cannot work with the choices above it is locked,
   and tapping it shows why. Four live meters track budget, mass, power and data.
4. **Go/No-Go poll.** Every role votes. A unanimous Go earns the full team score; launching over a No-Go costs points.
5. **Mission simulation.** A rendered film plays the player's own mission: their rocket lifts off, their spacecraft
   unfolds its panels, takes a first picture, then circles a real image of the Earth for a day, dimming in Earth's
   shadow and sending data down on each pass over the ground station. A timeline and a telemetry plot show the numbers.
6. **Scorecard.** A 0–100 score split into science return, data delivered, budget and team, plus the primary constraint,
   the biggest point loss and a lesson. Players can revise the design and fly again.

**How it works.** A small physics engine computes orbit period, eclipse time, reachable latitude, ground resolution and
revisit time, the ground track and ground-station passes over a turning Earth, transfer velocity and the rocket
equation from the chosen design. The film and the locks use the same results, so what players watch is what the game
scored. Locks are
decided by those results, not by a lookup table. For example, a camera with 30 m pixels at 705 km would have about
1.5 km pixels from geostationary altitude, so the game locks it there and says so.

**How we know it is right.** The engine is covered by automated tests. It reproduces Landsat 9's orbit period of about
99 minutes and a revisit of about 15 days against the mission's 16, the 92.6-minute period at 400 km, and the
35,786 km geostationary altitude. A balance test checks that every mission has several workable designs.

**Honest numbers.** Every number on screen carries a tag: a NASA or partner agency source, "physics" for standard formulas, or
"illustrative" for simplified game values such as costs and masses. An About screen lists every source and how it is used.

**Who it is for.** Students with no background in space engineering. Text is plain English, locked options are marked
with an icon and words as well as color, every control works from the keyboard, and the layout is built for phones.

**Team play.** Up to four players share one screen and each owns one tier of the tree, following the four segments of a
NASA science mission. The Go/No-Go poll turns disagreement into a visible decision.

**Tools.** TypeScript, React, Vite, Tailwind CSS and Vitest. The game runs entirely in the browser; there is no backend
and no player data is collected.

## NASA data and resources

| Source | How we used it |
| --- | --- |
| [NASA Earth Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html) | Earth's radius and gravitational parameter, used by every orbit formula in the game: period, eclipse, coverage and transfers. |
| [NASA Landsat 9 mission page](https://science.nasa.gov/mission/landsat-9) | The Sun-synchronous orbit card (705 km, 98.2°) and the Multispectral Imager (30 m pixels, 185 km swath). Also our validation case: the model reproduces its orbit period and revisit time. |
| [NASA International Space Station FAQ](https://www.nasa.gov/?p=532244) | The 51.6° inclination of the Low Earth Orbit card, which is why that orbit never passes over the poles. |
| [NASA CSLI, CubeSat 101](https://www.nasa.gov/wp-content/uploads/2017/03/nasa_csli_cubesat_101_508.pdf) | The budget rule. Page 13: "When possible, project reserves of at least 10% should be part of the budget to address any unexpected events." The game warns and removes points when a design eats into that reserve. Two lock reasons also quote it: page 22, "Launching with an inadequate ground station is a mission killer" (shown when the downlink cannot carry the day's data), and page iv, deployable solar panels "will nearly double the power input to the spacecraft" (shown when fixed body panels cannot power the design). |
| [NASA, Design and Develop Science Missions](https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf) | The four mission segments (Launch, Space, Ground, User), used as the four team roles. |
| [NASA Earth Observatory, Blue Marble: Next Generation](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/) | The image of the Earth in the mission film (August 2004, with topography and bathymetry), and the spacecraft's first picture. Credit: NASA Earth Observatory. |
| [NASA Small Spacecraft Technology State-of-the-Art, Communications](https://www.nasa.gov/smallsat-institute/sst-soa/communications) | Why the Data downlink tier offers fast radio links. Section 9.2.4: "a mission with high data rate needs would select a high frequency such as X-band for downlink and a directional high-gain antenna". Shown when a downlink can carry the day's data. |
| [NASA Landsat 9 mission page](https://science.nasa.gov/mission/landsat-9) (again) | The 10-year mission in Sun-synchronous orbit: "Consumables: 10 years". |
| [NASA JPL, GRACE-FO Launch Press Kit](https://www.jpl.nasa.gov/news/press_kits/grace-fo/download/grace-fo_launch_press_kit.pdf) | The 5-year mission in Low Earth Orbit. Page 9: "Prime mission: Five years", at an orbit altitude of "Approximately 305 miles (490 kilometers)". |
| [NASA Glenn and JPL, Performance and Comparison of Lithium-Ion Batteries Under Low-Earth-Orbit Mission Profiles (NASA/TM-2007-214826)](https://ntrs.nasa.gov/citations/20080008855) | How deeply a battery may be drained on each lap in a low orbit. NASA tested 40% as "the outer envelope of possible DODs for Li-ion batteries for LEO applications"; the game allows 30%. |
| [NASA Aerospace Battery Workshop 2018, GOES-R Lithium-Ion Battery Life Test](https://www.nasa.gov/wp-content/uploads/2024/01/goes-r-lithium-ion-battery-life-test-workhorse-battery-performance.pdf) (Lockheed Martin, NASA Goddard, Saft) | The same limit in geostationary orbit. The life test ran its "Maximum eclipses at 75% DOD"; the game allows 70%. |
| [NASA and ISRO, NISAR quick facts](https://science.nasa.gov/mission/nisar/mission-overview/) | Where real imaging radars fly: 747 km. Shown when the Imaging Radar is out of range. |
| [NASA Space Place, Launch a rocket from a spinning planet](https://spaceplace.nasa.gov/launch-windows/en/) | The extra 0.4 km/s of a Sun-synchronous launch. "At the equator, Earth's surface is rotating at 1675 kilometers per hour"; at the 28.5° launch site that is 0.41 km/s that a launch towards the pole cannot use. |

Resources from the challenge page that shaped the design but supply no game value: JPL Concept Maturity Levels and the
GSFC Mission Design Lab (the brief → trade → point design → review flow), and the Webb "Build It Yourself" game
(connecting a science goal to an instrument and showing the result).

NASA's Small Spacecraft Technology State-of-the-Art, Communications chapter, is in the table above for the idea behind the
downlink tier only. Its data rates are reported by manufacturers and, as the chapter says, not independently verified by
NASA, so the game's downlink rates stay tagged "illustrative".

## Space agency partner and other data

| Source | How we used it |
| --- | --- |
| [NOAA and NASA, GOES-R Series spacecraft](https://www.goes-r.gov/spacesegment/spacecraft.html) | The 15-year mission in Geostationary Orbit: "Spacecraft on-orbit life of 15 years". GOES-R is a joint NOAA and NASA programme. |
| [ESA, Sentinel-1 facts and figures](https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-1/Facts_and_figures) | A second imaging radar, from the European Space Agency: "Orbit: Polar, Sun-synchronous at an altitude of 693 km". |
| ISRO | Partner of NASA in NISAR, listed above. |

No third-party or commercial data is used.

## Other tools, libraries and licenses

| Tool | Use | License |
| --- | --- | --- |
| React, React DOM | User interface | MIT |
| Vite, @vitejs/plugin-react, vite-plugin-singlefile | Build and development server | MIT |
| Tailwind CSS | Styling | MIT |
| TypeScript | Language and type checking | Apache-2.0 |
| Vitest | Automated tests | MIT |
| oxlint | Linting | MIT |
| pnpm | Package manager | MIT |
| Fredoka (via @fontsource/fredoka) | Font for titles and numbers, bundled with the game | SIL Open Font License 1.1 |
| Atkinson Hyperlegible (via @fontsource/atkinson-hyperlegible) | Font for body text, bundled with the game | SIL Open Font License 1.1 |
| Claude Design (Anthropic) | Visual system, screen designs and illustrations | Hosted service |
| GitHub | Source code hosting; GitHub Pages and GitHub Actions host and build the public demo | Hosted service |
| Neon (Postgres + Neon Functions) | Online leaderboard: stores the player or crew name and the design; the server recalculates every score with the game engine | Hosted service |
| pg (node-postgres) | Database driver bundled into the leaderboard function | MIT |

Our own code is released under the MIT License.

**TODO (Thais, Belle):** add the design and video tools actually used (for example Figma, a video editor, fonts and their
licenses), and any music or sound with its license.

## Use of artificial intelligence

Code scaffolding, the physics engine and documentation were drafted with Claude (Anthropic). The visual design and
illustrations were drafted with Claude Design (Anthropic). All of it was reviewed, tested and adapted by the team.
Physics formulas are covered by automated tests; illustrative values are labelled in the game.

Every illustration in the game (mission art, the spacecraft, the simulation scenes) carries a visible "AI-generated"
label, and none contains NASA logos, insignia, flags or mission patches.

**TODO:** keep the first paragraph identical to the game's About screen (`AI_DISCLOSURE` in `src/engine/sources.ts`).
If the video or slides use any AI-generated image, voice or clip, name the tool here and watermark it the same way.

## Notice

Status: GO is an independent project made by team One Pixel Home for the NASA Space Apps Challenge 2026. It is
not affiliated with or endorsed by NASA. NASA does not endorse any non-U.S. Government entity.
