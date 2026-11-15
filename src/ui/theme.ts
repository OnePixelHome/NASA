// Shared visual constants that are not components (kept apart so React fast refresh keeps working).
import type { Role } from '../engine/catalog'
import type { Choice } from '../engine/game'

/** Each role has a color, an icon and a label, so color is never the only signal. */
export const ROLE_UI: Record<Role, { icon: string; color: string }> = {
  science: { icon: '◎', color: 'var(--color-role-science)' },
  space: { icon: '◆', color: 'var(--color-role-spacecraft)' },
  ground: { icon: '▲', color: 'var(--color-role-ground)' },
  launch: { icon: '▮', color: 'var(--color-role-launch)' },
}

// ---------- Spacecraft drawing ----------
export interface ShipParts {
  payload: 'camera' | 'prism' | 'radar' | 'weather' | null
  power: 'small' | 'big' | 'hybrid' | null
  antenna: 'small' | 'polar' | 'relay' | null
  launcher: 'small' | 'medium' | 'heavy' | null
}

const PAYLOAD: Record<string, ShipParts['payload']> = { hires: 'camera', multispectral: 'prism', radar: 'radar', weather: 'weather' }
const POWER: Record<string, ShipParts['power']> = { standard: 'small', extended: 'big', hybrid: 'hybrid' }
const ANTENNA: Record<string, ShipParts['antenna']> = { daily: 'small', polar: 'polar', continuous: 'relay' }
const LAUNCHER: Record<string, ShipParts['launcher']> = { small: 'small', medium: 'medium', heavy: 'heavy' }

/** Which drawing each catalog id uses (docs/design/IMPLEMENTATION-GUIDE.md). An unchosen tier draws its ghost outline. */
export function shipParts(c: Choice): ShipParts {
  return {
    payload: (c.instrumentId && PAYLOAD[c.instrumentId]) || null,
    power: (c.powerId && POWER[c.powerId]) || null,
    antenna: (c.downlinkId && ANTENNA[c.downlinkId]) || null,
    launcher: (c.launchId && LAUNCHER[c.launchId]) || null,
  }
}