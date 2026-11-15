# Copy review — Status: GO

Every player-facing string, for Belle to review. All of it is **draft** until reviewed.

- **How to edit:** change the text between the quotes in the file named in each section. Do not rename ids or fields.
- **Source of truth:** the code. This file is a snapshot taken on 2026-11-14; if they differ, the code is right.
- **Rules:** English only. Tooltips are one or two plain sentences, 170 characters at most, and contain no numbers
  (a number would need a source tag). The tests enforce those three limits.
- **After editing:** run `pnpm test`.

## 1. Node tooltips — `src/engine/catalog.ts`, field `tip` (new, highest priority)

Shown when a player taps an option in the mission tree, above the "Why it works / Why it is locked" reasons.

| Tier | id | Name | Tooltip (`tip`) |
| --- | --- | --- | --- |
| Instrument | `hires` | High-Res Camera | A telescope-like camera that sees fine detail, such as single buildings. It only captures a narrow strip of ground on each pass. |
| Instrument | `multispectral` | Multispectral Imager | A camera that records several colors of light, including some our eyes cannot see. Those extra colors reveal how healthy plants are. |
| Instrument | `radar` | Imaging Radar | It sends out radio pulses and listens for the echo, so it can see at night and through clouds. It needs a lot of power. |
| Instrument | `weather` | Weather Imager | A wide-angle camera that watches a whole side of the Earth at once. It trades fine detail for a constant view. |
| Power | `standard` | Standard Power | Solar cells fixed to the spacecraft body, with a small battery. Light and cheap, but they rarely face the Sun directly. |
| Power | `extended` | Extended Power | Large solar wings that turn to follow the Sun. Plenty of power in sunlight, with a medium battery for the shadow. |
| Power | `hybrid` | Solar + Battery Hybrid | Sun-tracking solar wings plus a big battery. The battery keeps a power-hungry instrument running through Earth's shadow. |
| Downlink | `daily` | Daily Pass (1 ground station) | One ground antenna that talks to the spacecraft whenever it flies overhead. Simple and cheap, but contact time is short. |
| Downlink | `polar` | Polar Station Network | Antennas near the pole, where satellites on polar orbits fly over on almost every lap. More contacts mean more data. |
| Downlink | `continuous` | Continuous Link | A link that never drops. It comes naturally from an orbit that hovers over one spot; lower orbits need a relay satellite to pass the signal on. |
| Launch | `small` | Small Launcher | A small rocket for light spacecraft. The cheapest ride, but it cannot lift much or push it far. |
| Launch | `medium` | Medium Launcher | A mid-size rocket with room to spare for most Earth-observation spacecraft. |
| Launch | `heavy` | Heavy Launcher | A large rocket that can carry heavy spacecraft to distant orbits. The most expensive option. |

## 2. Mission briefs — `src/engine/catalog.ts`, `SCENARIOS`

| id | Title (`title`) | Brief (`story`) |
| --- | --- | --- |
| `crops` | Crop Watch | Track the health of farmland worldwide (up to 60° latitude) every couple of weeks. |
| `storms` | Storm Watch | Follow hurricanes over the Americas with a new image every few minutes. |
| `ice` | Polar Ice | Measure Arctic sea ice up to 80° latitude — including during the months-long polar night. |

## 3. Lessons — `src/engine/catalog.ts`, `SCENARIOS[].instrumentFit[].why`

One sentence shown as "Lesson learned" on the scorecard, for the instrument the player flew in that mission.

| Mission | Instrument | Lesson (`why`) |
| --- | --- | --- |
| Crop Watch | Multispectral Imager | Multispectral bands reveal plant health — the same reason Landsat supports agriculture and water use. |
| Crop Watch | Imaging Radar | Radar sees through clouds, but has no color bands to measure plant health. |
| Crop Watch | High-Res Camera | Very sharp, but its narrow swath takes months to cover all farmland. |
| Crop Watch | Weather Imager | Kilometre-scale pixels are far too coarse to see individual fields. |
| Storm Watch | Weather Imager | A weather imager staring at the same hemisphere sees storms evolve minute by minute. |
| Storm Watch | Imaging Radar | Radar sees inside clouds, but only when it happens to fly over the storm. |
| Storm Watch | Multispectral Imager | Good images, but a storm moves far between passes. |
| Storm Watch | High-Res Camera | Its tiny swath cannot frame a storm hundreds of km wide. |
| Polar Ice | Imaging Radar | Radar brings its own illumination, so it works in polar night and through clouds. |
| Polar Ice | Multispectral Imager | Cameras need sunlight — they go blind for months during polar night. |
| Polar Ice | High-Res Camera | Needs sunlight and covers a tiny area of a huge ice sheet. |
| Polar Ice | Weather Imager | From the equator it sees the Arctic only at a very low angle. |

## 4. Trajectory cards — `src/engine/catalog.ts`, `ORBITS`

| id | Short (`short`) | Name (`name`) | Blurb (`blurb`) |
| --- | --- | --- | --- |
| `leo` | LEO | Low Earth Orbit | Close to Earth and cheap to reach. Same 51.6° tilt as the Space Station, so it never flies over the poles. |
| `sso` | SSO | Sun-Synchronous Orbit | Near-polar orbit that passes every place at the same local time. Landsat 9 flies here. |
| `geo` | GEO | Geostationary Orbit | One orbit per day, so it hovers over the same spot — but it is ~36,000 km away. |

## 5. Role and tier labels — `src/engine/catalog.ts`, `ROLE_LABEL` and `TIER_LABEL`

| Kind | Key | Label |
| --- | --- | --- |
| Role | `science` | Science |
| Role | `space` | Spacecraft |
| Role | `ground` | Ground |
| Role | `launch` | Launch |
| Tier | `instrument` | Scientific instrument |
| Tier | `power` | Power system |
| Tier | `downlink` | Data downlink |
| Tier | `launch` | Launch vehicle |

## 6. About screen — `src/engine/sources.ts`

| Constant | Text |
| --- | --- |
| `PITCH` | Design a space mission and watch every choice ripple down — the game calculates the orbit and resources your mission needs to succeed. |
| `AI_DISCLOSURE` | Code scaffolding, the physics engine and documentation were drafted with Claude (Anthropic). The visual design and illustrations were drafted with Claude Design (Anthropic). All of it was reviewed, tested and adapted by the team. Physics formulas are covered by automated tests; illustrative values are labelled in the game. |
| `DISCLAIMER` | Status: GO is a hackathon project by team One Pixel Home for the NASA Space Apps Challenge 2026. It is not affiliated with or endorsed by NASA. |

`AI_DISCLOSURE` must match the project page. The tests check that it names Claude (Anthropic) and says the team reviewed the work.

S2 also has `cite` and `quote`, plus two more in `more`: the exact pages and wording from CubeSat 101. Do not edit the quotes; they are word for word.

Source descriptions, field `use` in `SOURCES` (also reusable for the "NASA Data" field of the project page):

| Tag | Title (`title`) | How the game uses it (`use`) |
| --- | --- | --- |
| S1 | NASA Earth Fact Sheet (radius, GM, solar irradiance) | Earth's radius and gravitational parameter behind every orbit formula: period, eclipse, coverage, transfers. |
| S2 | NASA CSLI — CubeSat 101 (budget reserve, ground stations, deployable solar panels) | The budget rule: keep at least 10% in reserve. The budget meter turns amber and the budget score drops when a design eats into it. It also backs two lock reasons: a downlink too small for the data, and fixed body panels that cannot power the spacecraft. |
| S3 | NASA — Design and Develop Science Missions (Launch, Space, Ground, User segments) | The four mission segments, used as the four team roles: Science, Spacecraft, Ground and Launch. |
| S6 | NASA — Landsat 9 mission (705 km, 98.2°, 185 km swath, 16-day revisit, 10 years of consumables) | The Sun-synchronous orbit card and the Multispectral Imager (30 m pixels, 185 km swath). The model reproduces its ~99-minute orbit and ~16-day revisit. Its 10 years of consumables set the 10-year mission in this orbit. |
| S9 | NASA Small Spacecraft Technology State-of-the-Art — Communications | Background reading on spacecraft radio links. No game value is taken from it yet. |
| S10 | NASA — International Space Station FAQ (51.6° inclination) | The 51.6° inclination of the Low Earth Orbit card, which is why it never flies over the poles. |
| S13 | NASA JPL — GRACE-FO Launch Press Kit (490 km orbit, five-year prime mission) | The 5-year mission in Low Earth Orbit: a real NASA mission at almost the same altitude (490 km) was planned for five years. |
| S14 (tag "NOAA S14") | NOAA and NASA — GOES-R Series spacecraft (15 years of on-orbit life in geostationary orbit) | The 15-year mission in Geostationary Orbit, the on-orbit life required of the GOES-R weather satellites. |
| S15 | NASA Glenn and JPL — Performance and Comparison of Lithium-Ion Batteries Under Low-Earth-Orbit Mission Profiles (NASA/TM-2007-214826) | How deeply the battery may be drained on every lap in low orbits. The game allows 30%, inside the range NASA tested for low Earth orbit, where 40% is the outer limit. |
| S16 | NASA Aerospace Battery Workshop 2018 — GOES-R Lithium-Ion Battery Life Test (Lockheed Martin, NASA Goddard, Saft) | How deeply the battery may be drained in geostationary orbit. The game allows 70%, below the 75% of the longest eclipses in the GOES-R life test. Eclipses there come once a day in two seasons a year, so the battery cycles far less than in a low orbit. |
| S17 | NASA and ISRO — NISAR mission quick facts (imaging radar at 747 km) | Where real imaging radars fly. It supports the 700 km reference altitude of the Imaging Radar; the 1,000 km limit itself stays an illustrative value. |
| S18 (tag "ESA S18") | ESA — Sentinel-1 facts and figures (imaging radar at 693 km) | A second imaging radar, from the European Space Agency, flying at almost the same altitude as NISAR. |
| S19 | NASA Space Place — Launch a rocket from a spinning planet (Earth turns at 1,675 km/h at the equator) | The extra 0.4 km/s a Sun-synchronous launch costs. 1,675 km/h is 0.47 km/s; at the 28.5° latitude of the launch site that is 0.41 km/s of eastward push, which a launch towards the pole cannot use. |
| PHYS | Standard orbital mechanics (Kepler, Hohmann, rocket equation, radar equation) | Textbook formulas computed live from your design. They are covered by automated tests. |
| GAME | Illustrative game value for educational purposes (simplified) | Costs, masses, power levels, data rates and scores. Plausible but simplified, chosen to keep the game balanced. |

## 7. Screen text — `src/App.tsx` (inside the JSX, lower priority)

These strings sit in the screen code. Edit only the words; leave tags, braces and `className` alone, or ask José or Edgar.

| Screen (function) | String |
| --- | --- |
| Header (`App`) | Status: GO |
| Header (`App`) | Design a space mission. Watch every choice ripple down. |
| Header (`App`) | About / ← Back / Resources |
| Landing (`Home`) | NASA Space Apps Challenge 2026 · Space Mission Design Game |
| Landing (`Home`) | Status: GO (pitch below it is `PITCH`; the steps are `HOW_TO_PLAY`) |
| Landing (`Home`) | Start mission → / About & sources |
| Landing (`Home`) | How many players? / You hold all four roles and cast the launch vote. / The four roles are shared by N players; each player casts one vote. |
| Landing (`Home`) | Everyone plays on one screen · no sign-up |
| Landing (`Home`) | How to play |
| Landing (`Home`) | Made by team One Pixel Home. Not affiliated with or endorsed by NASA. |
| Landing (`Home`) | Earth image: NASA Earth Observatory, Blue Marble: Next Generation. |
| Landing (`Home`) | Leaderboard (button) |
| Leaderboard (`src/ui/Leaderboard.tsx`) | Leaderboard / Who flew this mission? Type your name, or your crew’s (for example “Ana & Luis”). / Player or crew name / Save my score / Saving… |
| Leaderboard | Only this name and your design are sent. Everyone can see the leaderboard. |
| Leaderboard | Saved! You are #N of M. / All missions / Top N of M saved scores. / No scores yet. Be the first crew on the board. |
| Leaderboard | Loading the leaderboard… / The leaderboard is unavailable right now. Your game is not affected. |
| Leaderboard screen | Every score is recalculated by the game engine before it is saved, so the board only shows real missions. |
| Name errors (`src/leaderboard/name.ts`) | Type a crew name. / Use at least 2 characters. / Use at most 24 characters. / Use letters, numbers, spaces and . ' _ - only. / Please choose a different name. |
| 1 (`Brief`) | 1 · Pick your mission |
| 1 (`Brief`) | Every mission starts with a science goal. It decides what “success” means. |
| 2 (`OrbitPick`) | 2 · Choose a trajectory |
| 2 (`OrbitPick`) | Bars are illustrative values for educational purposes, derived from the physics below. |
| 2 (`OrbitPick`) | Bar labels: Fuel cost / Coverage / Lifetime |
| 1 (`Brief`) | Pick the goal first. Its numbers are what your design will be scored against. |
| 1 (`Brief`) | Mission requirements / Budget |
| 2 (`OrbitPick`) | Fixed view of one hemisphere |
| 2 (`OrbitPick`) | Tap to choose / ✓ Selected / Sources |
| 2 (`OrbitPick`) | Why this matters · Higher orbits see more of Earth at once and last longer, but cost more fuel to reach. Check each card’s latitude reach against your mission’s numbers. |
| 3 (`Tree`) | 3 · Build the mission tree |
| 3 (`Tree`) | Each choice can lock the ones below it. Tap a locked option to see why. |
| 3 (`Tree`) | ○ Available / ◉ Selected / Orbit · tap to change / … of 4 steps chosen. |
| 3 (`Tree`) | Choose the step above first |
| 3 (`Tree`) | Locked — tap for why |
| 3 (`Tree`) | Why it works / Why it is locked |
| 3 (`Tree`) | Go to Go / No-Go → |
| 4 (`GoNoGo`) | 4 · Go / No-Go poll |
| 4 (`GoNoGo`) | Solo: Like a real launch, the mission needs a Go. You hold all four roles, so your vote decides. / Team: Like a real launch, the team is polled. Each of the N players votes once for the roles they hold. A unanimous Go earns the full team score. |
| 4 (`GoNoGo`) | Your call / Team poll / You / Player N / A No-Go means you see a problem. / A No-Go means someone sees a problem. |
| 4 (`GoNoGo`) | … waiting… / ✓ GO / ✕ NO-GO / ✓ Go / ✕ No-Go |
| 4 (`GoNoGo`) | Over budget by $…M. An over-budget mission cannot succeed. |
| 4 (`GoNoGo`) | Budget reserve is …%. NASA’s CubeSat 101 guide advises project reserves of at least 10% of the budget. |
| 4 (`GoNoGo`) | A No-Go means someone sees a problem. Go back, discuss and change the design — or launch anyway and keep only … of 15 team points. |
| 4 (`GoNoGo`) | Team poll / … Go · … No-Go · … waiting |
| 4 (`GoNoGo`) | ← Revise design / 🚀 Launch / ⚠ Launch anyway (… of 4 Go) |
| 5 (`MissionRun`) | 5 · Mission simulation |
| 5 (`MissionRun`) | Skip / See scorecard → |
| 6 (`Score`) | 6 · Mission scorecard |
| 6 (`Score`) | ✓ Mission success / ✕ Mission failed |
| 6 (`Score`) | The design costs $…M against a $…M budget. An over-budget mission cannot succeed. |
| 6 (`Score`) | A mission needs at least 50 points to succeed. This one scored …. |
| 6 (`Score`) | Score and breakdown |
| 6 (`Score`) | Primary constraint / Biggest impact / Lesson learned |
| 6 (`Score`) | Sources & assumptions |
| 6 (`Score`) | ← Try another design / Replay mission |
| About (`About`) | About & sources |
| About (`About`) | How to read the source tags |
| About (`About`) | Every number in the game carries a tag saying where it comes from. |
| About (`About`) | NASA and partner agency data and resources / Use of AI |
| About (`About`) | An official resource from NASA or a partner space agency (NOAA, ESA). (new 2026-11-15, was "An official NASA resource.") |

Resource panel words, in `src/ui/components.tsx`: ok / low reserve / over limit / waiting.

About screen text added with the design, in `src/engine/sources.ts` (**Belle: please review "How to play"**):

| Constant | Text |
| --- | --- |
| `HOW_TO_PLAY` 1 | Pick a mission — Choose a science goal. Its requirements set what success means. |
| `HOW_TO_PLAY` 2 | Choose a trajectory — Compare the three orbits and pick the one that fits the mission. |
| `HOW_TO_PLAY` 3 | Build the ladder — Pick instrument, power, downlink and launcher. Each choice can lock the next. |
| `HOW_TO_PLAY` 4 | Vote Go / No-Go and watch the simulation — Every player votes. Then follow the mission and read your scorecard. |
| `ROLES_NOTE` | Four roles, one for each of NASA’s four mission segments: Science, Spacecraft, Ground, Launch. |
| `AI_IMAGES_NOTE` | Images marked “AI-generated” were drafted with AI and then checked and adapted by the team. |
| `DISCLAIMER` | Status: GO is an independent project made by team One Pixel Home for the NASA Space Apps Challenge 2026. It is not affiliated with or endorsed by NASA. NASA does not endorse any non-U.S. Government entity. |
| `TEAM` | Edgar Cardona, Software architect · José Gómez, Full-stack developer · Thais Rodríguez, Product designer · Belle Vásquez Machado, MarTech specialist |
| `FOOTER_NOTES` | MIT License · No accounts, no cookies, no analytics. · Saving a score sends only the name you type and your mission design to our leaderboard (a Neon database). |

About headings, in `src/App.tsx`: What is Status: GO? / How to play / Where the numbers come from / NASA and partner agency data and resources / Use of AI / Not affiliated with NASA / Team · One Pixel Home.

Mission film on screen 5, in `src/ui/MissionFilm.tsx` and `src/ui/film/scenes.ts`: 3 / 2 / 1 / Liftoff / Mission complete / Sunlight / Earth’s shadow / Sending data / No contact / Always connected / Earth image: NASA Earth Observatory, Blue Marble / Orbit height drawn to scale / Rocket and spacecraft drawings / Pause / Play / Replay the film.

"A day in orbit" on screen 5, in `src/ui/DayView.tsx`: A day in orbit / In sunlight / In Earth’s shadow / Always connected / Pass … of …: sending data / Waiting for the next pass / All passes done today / Battery / Delivered to Earth / Waiting on board / Shadow each lap / Path over the ground / Mission needs ±…° / Never seen from this orbit / Ground station and its range / Equator / Replay the day / Pause / Play. The one-sentence day summary and the note under it are generated there too; send wording changes to Edgar.

Requirement labels, in `src/engine/game.ts` (`missionRequirements`): latitude reach / coverage / revisit, and the values Global / Regional.

## 8. Generated sentences — `src/engine/game.ts` (ask Edgar before changing)

The lock and unlock reasons, the simulation steps, the resource panel labels and hints, and the scorecard breakdown labels are built in code
with live numbers, for example “From 35,786 km each pixel would cover 511 m — too blurry (needs ≤ 50 m).”
Each one carries source tags that must stay correct, so send wording changes for these to Edgar instead of editing them.

Two fixed sentences quote CubeSat 101 [S2] (added 2026-11-15; the quoted part must stay word for word):

- Locked downlink: NASA's CubeSat 101 warns: "Launching with an inadequate ground station is a mission killer."
- Imaging Radar out of range (added 2026-11-15, cites NISAR [S17] and Sentinel-1 [ESA S18]; for Belle's review): Real imaging radars fly much lower: NISAR at 747 km and Sentinel-1 at 693 km.
- Standard Power locked for lack of power: These panels are fixed to the body. NASA's CubeSat 101 describes deployable solar panels that "will nearly double the power input to the spacecraft".