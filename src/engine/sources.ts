// Every number shown to players carries one of these source ids.
// NASA-* = official NASA resource · PHYS = standard physics · GAME = simplified game value (shown as "illustrative").
export type SourceId = 'S1' | 'S2' | 'S3' | 'S6' | 'S9' | 'S10' | 'PHYS' | 'GAME'

export interface Source {
  id: SourceId
  title: string
  url?: string
  /** How the game uses this source, shown on the About screen. */
  use: string
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
    title: 'NASA CSLI — CubeSat 101 (budget reserves, development timeline)',
    url: 'https://www.nasa.gov/wp-content/uploads/2017/03/nasa_csli_cubesat_101_508.pdf',
    use: 'The rule of keeping at least 10% of the budget in reserve.',
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
  'Code scaffolding, the physics engine and documentation were drafted with Claude (Anthropic) and reviewed, tested and adapted by the team. ' +
  'Physics formulas are covered by automated tests; illustrative values are labelled in the game.'

export const DISCLAIMER =
  'Trajectory Ladder is a hackathon project by team One Pixel Home for the NASA Space Apps Challenge 2026. It is not affiliated with or endorsed by NASA.'

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
