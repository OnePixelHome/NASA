// Every number shown to players carries one of these source ids.
// S* = official resource from NASA or a partner space agency · PHYS = standard physics · GAME = simplified game value (shown as "illustrative").
export type SourceId = 'S1' | 'S2' | 'S3' | 'S6' | 'S9' | 'S10' | 'S12' | 'S13' | 'S14' | 'S15' | 'S16' | 'S17' | 'S18' | 'S19' | 'PHYS' | 'GAME'

export interface Source {
  id: SourceId
  title: string
  url?: string
  /** The agency that publishes the resource, shown on its tag. NASA when omitted. */
  agency?: 'NOAA' | 'ESA'
  /** How the game uses this source, shown on the About screen. */
  use: string
  /** Where in the document the cited statement is, when it has been checked. */
  cite?: string
  /** The cited statement, word for word. */
  quote?: string
  /** Further statements from the same document that the game also uses, word for word. */
  more?: { cite: string; quote: string }[]
}

export const SOURCES: Record<SourceId, Source> = {
  S1: {
    id: 'S1',
    title: 'NASA Earth Fact Sheet (radius, GM, solar irradiance)',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html',
    use: "Earth's radius and gravitational parameter behind every orbit formula: period, eclipse, coverage, transfers.",
  },
  S2: {
    id: 'S2',
    title: 'NASA CSLI — CubeSat 101 (budget reserve, ground stations, deployable solar panels)',
    url: 'https://www.nasa.gov/wp-content/uploads/2017/03/nasa_csli_cubesat_101_508.pdf',
    use: 'The budget rule: keep at least 10% in reserve. The budget meter turns amber and the budget score drops when a design eats into it. It also backs two lock reasons: a downlink too small for the data, and fixed body panels that cannot power the spacecraft.',
    // Verified against the PDF text on 2026-11-14 (search for "reserve": this is the only match in the document).
    cite: 'Chapter 2, p. 13 (page 21 of the PDF)',
    quote: 'When possible, project reserves of at least 10% should be part of the budget to address any unexpected events.',
    // Verified against the PDF text on 2026-11-15. The solar statement is a caption about the student CubeSat ChargerSat-1.
    more: [
      { cite: 'Chapter 2.10, p. 22 (page 30 of the PDF)', quote: 'Launching with an inadequate ground station is a mission killer.' },
      { cite: 'Contents, p. iv (page 6 of the PDF), ChargerSat-1 caption', quote: 'deployable solar panels will nearly double the power input to the spacecraft' },
    ],
  },
  S3: {
    id: 'S3',
    title: 'NASA — Design and Develop Science Missions (Launch, Space, Ground, User segments)',
    url: 'https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf',
    use: 'The four mission segments, used as the four team roles: Science, Spacecraft, Ground and Launch.',
  },
  S6: {
    id: 'S6',
    title: 'NASA — Landsat 9 mission (705 km, 98.2°, 185 km swath, 16-day revisit, 10 years of consumables)',
    url: 'https://science.nasa.gov/mission/landsat-9',
    use: 'The Sun-synchronous orbit card and the Multispectral Imager (30 m pixels, 185 km swath). The model reproduces its ~99-minute orbit and ~16-day revisit. Its 10 years of consumables set the 10-year mission in this orbit.',
    // Verified against the page text on 2026-11-15 (quick facts list).
    cite: 'Mission page, quick facts',
    quote: 'Consumables: 10 years',
    more: [{ cite: 'Mission page, quick facts (the design life is shorter)', quote: 'Design Life: 5 years' }],
  },
  S9: {
    id: 'S9',
    title: 'NASA Small Spacecraft Technology State-of-the-Art — Communications (high data rates call for X-band and a high-gain antenna)',
    url: 'https://www.nasa.gov/smallsat-institute/sst-soa/communications',
    use: 'Why the Data downlink tier offers fast radio links to ground stations: a mission with a lot of data picks a high-frequency link. Shown when a downlink can carry the data. The data rates themselves stay illustrative values.',
    // Verified against the page text on 2026-11-15 (2025 edition of the chapter).
    cite: 'Section 9.2.4, Design Considerations',
    quote: 'a mission with high data rate needs would select a high frequency such as X-band for downlink and a directional high-gain antenna',
    more: [{ cite: 'Section 9.2.1, Frequency Bands', quote: 'NASA spacecraft, which use the government bands of S-band, X-band, and Ka-band, may use the NASA Near Space Network (NSN).' }],
  },
  S10: {
    id: 'S10',
    title: 'NASA — International Space Station FAQ (51.6° inclination)',
    url: 'https://www.nasa.gov/?p=532244',
    use: 'The 51.6° inclination of the Low Earth Orbit card, which is why it never flies over the poles.',
  },
  S12: {
    id: 'S12',
    title: 'NASA Earth Observatory — Blue Marble: Next Generation (August 2004, with topography and bathymetry)',
    url: 'https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/',
    use: 'The picture of the Earth in the mission film and the first image the spacecraft takes. Credit: NASA Earth Observatory.',
  },
  // S13–S19 answer the values that were waiting for a mentor (docs/HANDOFF.md §7). Every quote was checked
  // word for word against the published page or PDF on 2026-11-15.
  S13: {
    id: 'S13',
    title: 'NASA JPL — GRACE-FO Launch Press Kit (490 km orbit, five-year prime mission)',
    url: 'https://www.jpl.nasa.gov/news/press_kits/grace-fo/download/grace-fo_launch_press_kit.pdf',
    use: 'The 5-year mission in Low Earth Orbit: a real NASA mission at almost the same altitude (490 km) was planned for five years.',
    cite: 'Quick Facts, Mission (page 9 of the PDF)',
    quote: 'Prime mission: Five years',
    more: [{ cite: 'Quick Facts, Mission (page 9 of the PDF)', quote: 'Orbit altitude: Approximately 305 miles (490 kilometers)' }],
  },
  S14: {
    id: 'S14',
    agency: 'NOAA',
    title: 'NOAA and NASA — GOES-R Series spacecraft (15 years of on-orbit life in geostationary orbit)',
    url: 'https://www.goes-r.gov/spacesegment/spacecraft.html',
    use: 'The 15-year mission in Geostationary Orbit, the on-orbit life required of the GOES-R weather satellites.',
    cite: 'Satellite Driving Requirements',
    quote: 'Spacecraft on-orbit life of 15 years with orbit east-west and north-south position maintained to within +/-0.1 degree',
  },
  S15: {
    id: 'S15',
    title: 'NASA Glenn and JPL — Performance and Comparison of Lithium-Ion Batteries Under Low-Earth-Orbit Mission Profiles (NASA/TM-2007-214826)',
    url: 'https://ntrs.nasa.gov/citations/20080008855',
    use: 'How deeply the battery may be drained on every lap in low orbits. The game allows 30%, inside the range NASA tested for low Earth orbit, where 40% is the outer limit.',
    cite: 'Page 11 of the PDF',
    quote: 'A 40 percent depth-of-discharge (DOD) was chosen for this testing in order to test the outer envelope of possible DODs for Li-ion batteries for LEO applications.',
  },
  S16: {
    id: 'S16',
    title: 'NASA Aerospace Battery Workshop 2018 — GOES-R Lithium-Ion Battery Life Test (Lockheed Martin, NASA Goddard, Saft)',
    url: 'https://www.nasa.gov/wp-content/uploads/2024/01/goes-r-lithium-ion-battery-life-test-workhorse-battery-performance.pdf',
    use: 'How deeply the battery may be drained in geostationary orbit. The game allows 70%, below the 75% of the longest eclipses in the GOES-R life test. Eclipses there come once a day in two seasons a year, so the battery cycles far less than in a low orbit.',
    cite: 'Conclusions (slide 16)',
    quote: 'Maximum eclipses at 75% DOD',
    more: [{ cite: 'Life Test Description (slide 9)', quote: 'Eclipse season is 44 days; Eclipse discharge once per day' }],
  },
  S17: {
    id: 'S17',
    title: 'NASA and ISRO — NISAR mission quick facts (imaging radar at 747 km)',
    url: 'https://science.nasa.gov/mission/nisar/mission-overview/',
    use: 'Where real imaging radars fly. It supports the 700 km reference altitude of the Imaging Radar; the 1,000 km limit itself stays an illustrative value.',
    cite: 'Quick facts, “Orbit Altitude”',
    quote: '747 km',
  },
  S18: {
    id: 'S18',
    agency: 'ESA',
    title: 'ESA — Sentinel-1 facts and figures (imaging radar at 693 km)',
    url: 'https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-1/Facts_and_figures',
    use: 'A second imaging radar, from the European Space Agency, flying at almost the same altitude as NISAR.',
    cite: 'Facts and figures',
    quote: 'Orbit: Polar, Sun-synchronous at an altitude of 693 km',
  },
  S19: {
    id: 'S19',
    title: 'NASA Space Place — Launch a rocket from a spinning planet (Earth turns at 1,675 km/h at the equator)',
    url: 'https://spaceplace.nasa.gov/launch-windows/en/',
    use: 'The extra 0.4 km/s a Sun-synchronous launch costs. 1,675 km/h is 0.47 km/s; at the 28.5° latitude of the launch site that is 0.41 km/s of eastward push, which a launch towards the pole cannot use.',
    cite: 'Launch windows article',
    quote: "At the equator, Earth's surface is rotating at 1675 kilometers per hour (1041 miles per hour)!",
  },
  PHYS: {
    id: 'PHYS',
    title: 'Standard orbital mechanics (Kepler, Hohmann, rocket equation, radar equation)',
    use: 'Textbook formulas computed live from your design. They are covered by automated tests.',
  },
  GAME: {
    id: 'GAME',
    title: 'Illustrative game value for educational purposes (simplified)',
    use: 'Costs, masses, power levels, data rates and scores. Plausible but simplified, chosen to keep the game balanced.',
  },
}

/** One-line pitch, shown on the About screen. */
export const PITCH =
  'Design a space mission and watch every choice ripple down — the game calculates the orbit and resources your mission needs to succeed.'

/** AI-use disclosure required by the Space Apps rules (HANDOFF §9). Keep in sync with the project page. */
export const AI_DISCLOSURE =
  'Code scaffolding, the physics engine and documentation were drafted with Claude (Anthropic). ' +
  'The visual design and illustrations were drafted with Claude Design (Anthropic). ' +
  'All of it was reviewed, tested and adapted by the team. ' +
  'Physics formulas are covered by automated tests; illustrative values are labelled in the game.'

/** Second line of the SI notice: every illustration in the game carries the visible "SI content" watermark it refers to. */
export const AI_IMAGES_NOTE = 'Images marked “SI content” were drafted with Super Intelligence (SI) tools and then checked and adapted by the team.'

export const DISCLAIMER =
  'Status: GO is an independent project made by team One Pixel Home for the NASA Space Apps Challenge 2026. ' +
  'It is not affiliated with or endorsed by NASA. NASA does not endorse any non-U.S. Government entity.'

/** "How to play" on the About screen. Copy owner: Belle (see docs/COPY.md). */
export const HOW_TO_PLAY: { title: string; text: string }[] = [
  { title: 'Pick a mission', text: 'Choose a science goal. Its requirements set what success means.' },
  { title: 'Choose a trajectory', text: 'Compare the three orbits and pick the one that fits the mission.' },
  { title: 'Build the ladder', text: 'Pick instrument, power, downlink and launcher. Each choice can lock the next.' },
  { title: 'Vote Go / No-Go and watch the simulation', text: 'Every player votes. Then follow the mission and read your scorecard.' },
]
export const ROLES_NOTE = 'Four roles, one for each of NASA’s four mission segments: Science, Spacecraft, Ground, Launch.'

/** Team One Pixel Home. `role` only picks which crew character stands next to the name. */
export const TEAM: { name: string; title: string; role: 'science' | 'space' | 'ground' | 'launch' }[] = [
  { name: 'Edgar Cardona', title: 'Software architect', role: 'science' },
  { name: 'José Gómez', title: 'Full-stack developer', role: 'space' },
  { name: 'Thais Rodríguez', title: 'Product designer', role: 'ground' },
  { name: 'Belle Vásquez Machado', title: 'MarTech specialist', role: 'launch' },
]
export const FOOTER_NOTES = ['MIT License', 'No accounts, no cookies, no analytics.', 'Saving a score sends only the name you type and your mission design to our leaderboard (an Azure database).']

export interface Reason {
  text: string
  source: SourceId
  /** Extra sources when a statement mixes kinds, e.g. a physics formula fed with an illustrative catalog value. */
  also?: SourceId[]
}

/** Build a Reason; extra ids become `also` (duplicates of the main source are dropped). */
export function reason(text: string, source: SourceId, ...also: SourceId[]): Reason {
  const extra = [...new Set(also)].filter((id) => id !== source)
  return extra.length ? { text, source, also: extra } : { text, source }
}

/** All source ids a reason cites, main one first. */
export const reasonSources = (r: Reason): SourceId[] => [r.source, ...(r.also ?? [])]

/** Display order for source lists: NASA resources first, then physics, then illustrative values. */
export const SOURCE_ORDER = Object.keys(SOURCES) as SourceId[]
