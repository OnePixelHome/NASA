// Shared visual constants that are not components (kept apart so React fast refresh keeps working).
import type { Role } from '../engine/catalog'

/** Each role has a color, an icon and a label, so color is never the only signal. */
export const ROLE_UI: Record<Role, { icon: string; color: string }> = {
  science: { icon: '◎', color: 'var(--color-role-science)' },
  space: { icon: '◆', color: 'var(--color-role-spacecraft)' },
  ground: { icon: '▲', color: 'var(--color-role-ground)' },
  launch: { icon: '▮', color: 'var(--color-role-launch)' },
}
