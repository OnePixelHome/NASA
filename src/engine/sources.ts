// Every number shown to players carries one of these source ids.
// NASA-* = official NASA resource · PHYS = standard physics · GAME = simplified game value (shown as "illustrative").
export type SourceId = 'S1' | 'S2' | 'S3' | 'S6' | 'S9' | 'S10' | 'S12' | 'PHYS' | 'GAME'

export interface Source {
  id: SourceId
  title: string
  url?: string
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
    title: 'NASA — Landsat 9 mission (705 km, 98.2°, 185 km swath, 16-day revisit)',
    url: 'https://science.nasa.gov/mission/landsat-9',
    use: 'The Sun-synchronous orbit card and the Multispectral Imager (30 m pixels, 185 km swath). The model reproduces its ~99-minute orbit and ~16-day revisit.',
  },
  S9: {
    id: 'S9',
    title: 'NASA Small Spacecraft Technology State-of-the-Art — Communications',
    url: 'https://www.nasa.gov/smallsat-institute/sst-soa/communications',
    use: 'Background reading on spacecraft radio links. No game value is taken from it yet.',
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

/** Second line of the AI notice: every illustration in the game carries the visible "AI-generated" label it refers to. */
export const AI_IMAGES_NOTE = 'Images marked “AI-generated” were drafted with AI and then checked and adapted by the team.'

export const DISCLAIMER =
  'Trajectory Ladder is an independent project made by team One Pixel Home for the NASA Space Apps Challenge 2026. ' +
  'It is not affiliated with or endorsed by NASA. NASA does not endorse any non-U.S. Government entity.'

/** "How to play" on the About screen. Copy owner: Belle (see docs/COPY.md). */
export const HOW_TO_PLAY: { title: string; text: string }[] = [
  { title: 'Pick a mission', text: 'Choose a science goal. Its requirements set what success means.' },
  { title: 'Choose a trajectory', text: 'Compare the three orbits and pick the one that fits the mission.' },
  { title: 'Build the ladder', text: 'Pick instrument, power, downlink and launcher. Each choice can lock the next.' },
  { title: 'Vote Go / No-Go and watch the simulation', text: 'Every role votes. Then follow the mission and read your scorecard.' },
]
export const ROLES_NOTE = 'Four roles, one for each of NASA’s four mission segments: Science, Spacecraft, Ground, Launch.'

/** Team One Pixel Home. `role` only picks which crew character stands next to the name. */
export const TEAM: { name: string; title: string; role: 'science' | 'space' | 'ground' | 'launch' }[] = [
  { name: 'Edgar Cardona', title: 'Software architect', role: 'science' },
  { name: 'José Gómez', title: 'Full-stack developer', role: 'space' },
  { name: 'Thais Rodríguez', title: 'Product designer', role: 'ground' },
  { name: 'Belle Vásquez Machado', title: 'MarTech specialist', role: 'launch' },
]
export const FOOTER_NOTES = ['MIT License', 'No accounts, no cookies, no analytics.']

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
