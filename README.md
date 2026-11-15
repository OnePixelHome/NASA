# Trajectory Ladder

*One Pixel Home · NASA Space Apps Challenge 2026 · Space Mission Design Game*

A game where you design a space mission and it calculates the orbit and resources your journey needs to succeed.
Pick a science goal, choose a trajectory, then watch a live dependency tree show which instruments, power systems,
data links and rockets still work — and exactly why the others are locked.

## Run
```bash
pnpm install
pnpm dev        # local
pnpm test       # physics + balance tests
pnpm build
```

## How it works
- Orbit period, eclipse, coverage, ground-station passes, Hohmann transfers and the rocket equation are computed
  with standard formulas and NASA constants (`src/engine/physics.ts`).
- Instrument, power, downlink and launch catalog values are illustrative and labelled as such in the UI.
- Sanity checks: the model reproduces Landsat 9's ~99-min orbit and ~16-day revisit, the ~92.6-min orbit at 400 km,
  and the ~35,786 km geostationary altitude (`src/engine/engine.test.ts`).

## NASA data & resources
- S1 NASA Earth Fact Sheet — https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html
- S2 NASA CubeSat 101 (p. 13: project reserves of at least 10%) — https://www.nasa.gov/wp-content/uploads/2017/03/nasa_csli_cubesat_101_508.pdf
- S3 NASA Design and Develop Science Missions — https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf
- S6 NASA Landsat 9 — https://science.nasa.gov/mission/landsat-9
- S9 NASA SST State-of-the-Art: Communications — https://www.nasa.gov/smallsat-institute/sst-soa/communications
- S10 NASA ISS FAQ — https://www.nasa.gov/?p=532244
- S12 NASA Earth Observatory, Blue Marble: Next Generation (the Earth image in the mission film; credit NASA Earth Observatory) — https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/

## Use of AI
Code scaffolding, the physics engine and documentation were drafted with Claude (Anthropic) and reviewed by the team.
Formulas are covered by automated tests; illustrative values are labelled in the UI.

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
