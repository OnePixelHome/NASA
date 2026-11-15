// Crew characters: one base body recolored per role, plus one accessory each.
// Drawing from docs/design/pages/Character.dc.html (Claude Design export).
import type { Role } from '../engine/catalog'
import { ROLE_UI } from './theme'

export type Mood = 'neutral' | 'cheer' | 'worried'

const OUTLINE = '#0B1026'
const LABEL: Record<Role, string> = {
  science: 'Science lead with goggles',
  space: 'Spacecraft engineer with wrench',
  ground: 'Ground operator with headset',
  launch: 'Launch chief with hard hat',
}
const POSE: Record<Mood, { armLx: number; armRx: number; armY: number; wrench: string; mouth: string; mouthFill: string }> = {
  neutral: { armLx: 11, armRx: 53, armY: 44, wrench: '', mouth: 'M28 37.5 Q32 40.5 36 37.5', mouthFill: 'none' },
  cheer: { armLx: 8, armRx: 56, armY: 16, wrench: 'translate(3 -28)', mouth: 'M27 36.5 Q32 42 37 36.5 Z', mouthFill: '#F2F4FF' },
  worried: { armLx: 15, armRx: 49, armY: 51, wrench: 'translate(-4 7)', mouth: 'M28 39.5 Q32 36.5 36 39.5', mouthFill: 'none' },
}

/**
 * `bg` is the color behind the character; the wrench uses it to cut its jaw.
 * Pass `decorative` when a text label next to it already names the role.
 */
export function RoleCharacter({ role, mood = 'neutral', className, bg = 'var(--color-space-card)', decorative = false }: { role: Role; mood?: Mood; className?: string; bg?: string; decorative?: boolean }) {
  const color = ROLE_UI[role].color
  const p = POSE[mood]
  return (
    <svg viewBox="0 0 64 64" className={className} style={{ overflow: 'visible' }} {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': `${LABEL[role]}${mood === 'neutral' ? '' : mood === 'cheer' ? ', cheering' : ', worried'}` })}>
      {role === 'ground' && (
        <g>
          <path d="M13 34 Q12 9 32 10 Q52 9 51 34" fill="none" stroke={OUTLINE} strokeWidth="7" strokeLinecap="round" />
          <path d="M13 34 Q12 9 32 10 Q52 9 51 34" fill="none" stroke="#F2F4FF" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      <circle cx={p.armLx} cy={p.armY} r="5.5" fill={color} stroke={OUTLINE} strokeWidth="3" />
      <circle cx={p.armRx} cy={p.armY} r="5.5" fill={color} stroke={OUTLINE} strokeWidth="3" />
      <circle cx="32" cy="36" r="21" fill={color} stroke={OUTLINE} strokeWidth="3.5" />
      <rect x="19" y="25" width="26" height="17" rx="8.5" fill="#1F2852" stroke={OUTLINE} strokeWidth="3" />
      <circle cx="27" cy="33" r="2.4" fill="#F2F4FF" />
      <circle cx="37" cy="33" r="2.4" fill="#F2F4FF" />
      <path d={p.mouth} fill={p.mouthFill} stroke="#F2F4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {mood === 'worried' && (
        <g>
          <path d="M24 29 L29 30.5 M40 29 L35 30.5" stroke="#F2F4FF" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M50 18 Q53 23 50 25 Q47 23 50 18 Z" fill="#62B4FF" stroke={OUTLINE} strokeWidth="2" />
        </g>
      )}
      <rect x="26" y="49" width="12" height="6" rx="3" fill="#F2F4FF" stroke={OUTLINE} strokeWidth="2.5" />
      {role === 'science' && (
        <g>
          <rect x="12" y="18" width="40" height="5" rx="2.5" fill={OUTLINE} />
          <circle cx="24" cy="19" r="6.5" fill="#4FD8C8" stroke={OUTLINE} strokeWidth="3" />
          <circle cx="40" cy="19" r="6.5" fill="#4FD8C8" stroke={OUTLINE} strokeWidth="3" />
          <circle cx="22" cy="17" r="1.8" fill="#F2F4FF" />
          <circle cx="38" cy="17" r="1.8" fill="#F2F4FF" />
        </g>
      )}
      {role === 'space' && (
        <g transform={p.wrench}>
          <path d="M54 43 L61 30" stroke={OUTLINE} strokeWidth="7" strokeLinecap="round" />
          <path d="M54 43 L61 30" stroke="#C3CAEE" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="62" cy="27" r="5" fill="none" stroke={OUTLINE} strokeWidth="6" />
          <circle cx="62" cy="27" r="5" fill="none" stroke="#C3CAEE" strokeWidth="3" />
          <rect x="60" y="20" width="5" height="5" fill={bg} />
        </g>
      )}
      {role === 'ground' && (
        <g>
          <rect x="7" y="29" width="9" height="14" rx="4" fill="#F2F4FF" stroke={OUTLINE} strokeWidth="3" />
          <rect x="48" y="29" width="9" height="14" rx="4" fill="#F2F4FF" stroke={OUTLINE} strokeWidth="3" />
          <path d="M12 43 Q14 50 22 50" fill="none" stroke={OUTLINE} strokeWidth="3" strokeLinecap="round" />
          <circle cx="23" cy="50" r="3" fill="#F2F4FF" stroke={OUTLINE} strokeWidth="2.5" />
        </g>
      )}
      {role === 'launch' && (
        <g>
          <path d="M15 21 Q15 5 32 5 Q49 5 49 21 Z" fill="#FFD166" stroke={OUTLINE} strokeWidth="3" strokeLinejoin="round" />
          <rect x="30" y="4" width="4" height="17" rx="2" fill={OUTLINE} opacity="0.25" />
          <rect x="10" y="19" width="44" height="6" rx="3" fill="#FFD166" stroke={OUTLINE} strokeWidth="3" />
        </g>
      )}
    </svg>
  )
}
