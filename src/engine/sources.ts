// Every number shown to players carries one of these source ids.
// NASA-* = official NASA resource · PHYS = standard physics · GAME = simplified game value (shown as "illustrative").
export type SourceId = 'S1' | 'S2' | 'S3' | 'S6' | 'S9' | 'S10' | 'PHYS' | 'GAME'

export interface Source {
  id: SourceId
  title: string
  url?: string
}

export const SOURCES: Record<SourceId, Source> = {
  S1: { id: 'S1', title: 'NASA Earth Fact Sheet (radius, GM, solar irradiance)', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html' },
  S2: { id: 'S2', title: 'NASA CSLI — CubeSat 101 (budget reserves, development timeline)', url: 'https://www.nasa.gov/wp-content/uploads/2017/03/nasa_csli_cubesat_101_508.pdf' },
  S3: { id: 'S3', title: 'NASA — Design and Develop Science Missions (Launch, Space, Ground, User segments)', url: 'https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf' },
  S6: { id: 'S6', title: 'NASA — Landsat 9 mission (705 km, 98.2°, 185 km swath, 16-day revisit)', url: 'https://science.nasa.gov/mission/landsat-9' },
  S9: { id: 'S9', title: 'NASA Small Spacecraft Technology State-of-the-Art — Communications', url: 'https://www.nasa.gov/smallsat-institute/sst-soa/communications' },
  S10: { id: 'S10', title: 'NASA — International Space Station FAQ (51.6° inclination)', url: 'https://www.nasa.gov/?p=532244' },
  PHYS: { id: 'PHYS', title: 'Standard orbital mechanics (Kepler, Hohmann, rocket equation, radar equation)' },
  GAME: { id: 'GAME', title: 'Illustrative game value for educational purposes (simplified)' },
}

export interface Reason {
  text: string
  source: SourceId
}
