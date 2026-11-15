# Status: GO

*One Pixel Home · NASA Space Apps Challenge 2026 · Space Mission Design Game*

A game where you design a space mission and it calculates the orbit and resources your journey needs to succeed.
Pick a science goal, choose a trajectory, then watch a live dependency tree show which instruments, power systems,
data links and rockets still work — and exactly why the others are locked.

**Play it:** https://victorious-pebble-0fcf34b10.6.azurestaticapps.net/

## How to play
1. **Choose the team.** On the start page, pick 1 to 4 players. The four mission roles (Science, Spacecraft, Ground,
   Launch) are shared among them; a solo player holds all four.
2. **Pick a mission:** Crop Watch, Storm Watch or Polar Ice. Each has requirements in numbers (latitude reach, coverage,
   revisit) and a budget.
3. **Choose a trajectory:** LEO, SSO or GEO, compared by period, reach, extra launch energy and lifetime.
4. **Build the ladder:** instrument → power → downlink → launch vehicle. Options turn green or lock, and tapping one
   shows why, with its source. Live meters track budget, mass, power and data.
5. **Go / No-Go:** every player votes once. A unanimous Go earns the full team score; launching over a No-Go costs points.
6. **Watch the mission:** a film of your own design, from liftoff to a day in orbit over NASA's Blue Marble image,
   with telemetry (shadow, battery, data downlinked on each ground-station pass).
7. **Scorecard:** a 0–100 score (science return, data delivered, budget and reserve, team vote), the primary constraint,
   the biggest point loss and the lesson learned. Save the score to the online leaderboard, try another design, replay,
   or go back Home.

## Run
```bash
pnpm install
pnpm dev           # local dev server
pnpm test          # physics, balance and leaderboard-name tests
pnpm lint
pnpm build         # production build in dist/
pnpm build:single  # one self-contained HTML file for quick previews
```

## How it works
- Orbit period, eclipse, coverage, ground-station passes (from the ground track over the station), Hohmann transfers
  and the rocket equation are computed with standard formulas and NASA constants (`src/engine/physics.ts`,
  `src/engine/track.ts`).
- Instrument, power, downlink and launch catalog values are illustrative and labelled as such in the UI; values backed
  by a NASA or partner-agency document carry its source tag and quote.
- Sanity checks: the model reproduces Landsat 9's ~99-min orbit and ~16-day revisit, the ~92.6-min orbit at 400 km,
  and the ~35,786 km geostationary altitude (`src/engine/engine.test.ts`). A balance test keeps at least three viable
  designs per mission.

## Online leaderboard
Saving a score sends only the name the player types and the mission design. The server (a Neon Function next to a
Neon Postgres database, `server/leaderboard.ts`) **recalculates every score with the game engine**, so a forged
request cannot post a fake result. Names are checked (2–24 characters, short English/Spanish blocklist) and saves are
rate-limited. If the leaderboard is unreachable, the game keeps working. Deploy and kill switch: `server/README.md`.

## Project structure
- `src/engine/` — pure TypeScript game logic: physics, catalog, scoring, mission day, sources.
- `src/ui/` and `src/App.tsx` — screens and components (React + Tailwind v4).
- `src/leaderboard/` — leaderboard client and the shared name rules.
- `server/` — the leaderboard function and its deploy script.
- Every push to `main` is tested, built and published to Azure Static Web Apps by `.github/workflows/azure-static-web-apps.yml`.

## NASA and partner agency data & resources
- S1 NASA Earth Fact Sheet — https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html
- S2 NASA CubeSat 101 (p. 13: project reserves of at least 10%; p. 22: ground stations; p. iv: deployable solar panels) — https://www.nasa.gov/wp-content/uploads/2017/03/nasa_csli_cubesat_101_508.pdf
- S3 NASA Design and Develop Science Missions — https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf
- S6 NASA Landsat 9 (orbit, imager and "Consumables: 10 years" for the 10-year SSO mission) — https://science.nasa.gov/mission/landsat-9
- S9 NASA SST State-of-the-Art: Communications (section 9.2.4: a mission with high data rate needs picks X-band and a high-gain antenna; shown when a downlink can carry the data) — https://www.nasa.gov/smallsat-institute/sst-soa/communications
- S10 NASA ISS FAQ — https://www.nasa.gov/?p=532244
- S12 NASA Earth Observatory, Blue Marble: Next Generation (the Earth image in the mission film; credit NASA Earth Observatory) — https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/
- S13 NASA JPL GRACE-FO Launch Press Kit (490 km, "Prime mission: Five years": the 5-year LEO mission) — https://www.jpl.nasa.gov/news/press_kits/grace-fo/download/grace-fo_launch_press_kit.pdf
- S14 NOAA and NASA, GOES-R Series spacecraft ("Spacecraft on-orbit life of 15 years": the 15-year GEO mission) — https://www.goes-r.gov/spacesegment/spacecraft.html
- S15 NASA Glenn and JPL, Performance and Comparison of Lithium-Ion Batteries Under Low-Earth-Orbit Mission Profiles, NASA/TM-2007-214826 (40% depth of discharge is the outer limit in LEO; the game uses 30%) — https://ntrs.nasa.gov/citations/20080008855
- S16 NASA Aerospace Battery Workshop 2018, GOES-R Lithium-Ion Battery Life Test ("Maximum eclipses at 75% DOD"; the game uses 70% in GEO) — https://www.nasa.gov/wp-content/uploads/2024/01/goes-r-lithium-ion-battery-life-test-workhorse-battery-performance.pdf
- S17 NASA and ISRO, NISAR quick facts (imaging radar at 747 km) — https://science.nasa.gov/mission/nisar/mission-overview/
- S18 ESA, Sentinel-1 facts and figures (imaging radar at 693 km) — https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-1/Facts_and_figures
- S19 NASA Space Place, Launch a rocket from a spinning planet (Earth turns at 1,675 km/h at the equator: the 0.4 km/s SSO launch penalty) — https://spaceplace.nasa.gov/launch-windows/en/

## Use of AI
Code scaffolding, the physics engine and documentation were drafted with Claude (Anthropic). The visual design and
illustrations were drafted with Claude Design (Anthropic). All of it was reviewed, tested and adapted by the team.
Physics formulas are covered by automated tests; illustrative values are labelled in the game. Every SI-generated
illustration carries a small visible "SI content" watermark.

## Credits
- Earth image: NASA Earth Observatory, Blue Marble: Next Generation.
- Fonts: Fredoka and Atkinson Hyperlegible (SIL Open Font License 1.1), bundled via Fontsource.

## Team — One Pixel Home
Edgar Cardona (software architect) · José Gómez (full-stack developer) · Thais Rodríguez (product designer) ·
Belle Vásquez Machado (MarTech specialist).

Status: GO is an independent project for the NASA Space Apps Challenge 2026. It is not affiliated with or endorsed by NASA.

## License
MIT

## Challenge Resources

The challenge's [Resources tab](https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/?tab=resources)
lists the following references for research and inspiration:

### NASA data and resources

- [Design and Develop Science Missions](https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf?emrc=a454cf) — introduces the systems-engineering process and the launch, space, ground, and user segments of a science mission.
- [General Mission Analysis Tool (GMAT)](https://software.nasa.gov/software/GSC-19468-1) — open-source software for modelling, analysing, optimising, and navigating mission trajectories and spacecraft.
- [Concept Maturity Levels (CMLs)](https://dataverse.jpl.nasa.gov/dataset.xhtml?persistentId=hdl:2014/44299) — JPL's framework for assessing mission-concept maturity, especially early feasibility and trade-study stages.
- [Mission Design Lab (MDL)](https://etd.gsfc.nasa.gov/capabilities/integrated-design-center/mission-design-lab/) — an example of collaborative mission-concept development, from brainstorming and trade studies to detailed point designs.
- [NASA Mission Viz](https://nasa.github.io/mission-viz/) — an interactive 3D environment for visualizing mission concepts, celestial bodies, spacecraft, and trajectories.
- [A Learning Game About Telescopes](https://science.nasa.gov/mission/webb/game-build-it-yourself/) — an educational design game connecting scientific goals to wavelengths, instruments, and telescope configurations, then showing mission results.
- [CubeSat 101: Basic Concepts and Processes for First-Time CubeSat Developers](https://www3.nasa.gov/sites/default/files/atoms/files/nasa_csli_cubesat_101_508.pdf) — a guide to CubeSat mission phases, from concept of operations through launch and operations.
- [Visualize a Space Mission Using Virtual Reality](https://www.spaceappschallenge.org/2023/challenges/visualize-a-space-mission-using-virtual-reality/) — a 2023 challenge reference for visualizing mission concepts, trajectories, timelines, and 3D spatial relationships.

### Space agency partner resources

- **Canadian Space Agency (CSA):** [Digital Games and Activities](https://www.asc-csa.gc.ca/eng/youth-educators/digital-games-and-activities.asp) — educational games, videos, e-books, and activities for learners of all ages.

NASA's disclaimer: "NASA does not endorse any non-U.S. Government entity and is not responsible for information contained on non-U.S. Government websites. For non-U.S. Government websites, participants must comply with any data use parameters of that specific website."
