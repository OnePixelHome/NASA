// Layered spacecraft that assembles as the mission tree is filled.
// Drawing from docs/design/handoff/Ship.tsx (Claude Design export). The design's "conflict" state is left out:
// choose() clears everything below a changed tier, so a chosen part can never stop fitting.
import type { ReactNode } from 'react'
import type { ShipParts } from './theme'

const O = '#0B1026'
const s = { stroke: O, strokeWidth: 4, strokeLinejoin: 'round' as const }
const IN = 'motion-safe:animate-ship-in'

/** Dashed outline of a part that has not been chosen yet. */
function Ghost({ children }: { children: ReactNode }) {
  return (
    <g strokeWidth={2.5} strokeDasharray="6 6" fill="none">
      {children}
    </g>
  )
}

const WORDS = {
  payload: { camera: 'high-resolution camera', prism: 'multispectral imager', radar: 'imaging radar', weather: 'weather imager' },
  power: { small: 'body-mounted solar cells', big: 'large solar wings', hybrid: 'solar wings and a big battery' },
  antenna: { small: 'a small antenna', polar: 'a polar-network dish', relay: 'a relay dish' },
  launcher: { small: 'a small rocket', medium: 'a medium rocket', heavy: 'a heavy rocket' },
}

export function ShipSvg({ payload, power, antenna, launcher, className }: ShipParts & { className?: string }) {
  const parts = [payload && WORDS.payload[payload], power && WORDS.power[power], antenna && WORDS.antenna[antenna], launcher && WORDS.launcher[launcher]].filter(Boolean)
  const label = parts.length ? `Your spacecraft so far: ${parts.join(', ')}.` : 'Your spacecraft: no parts chosen yet.'
  const panel = (x: number, y: number, w: number, h: number) => <rect x={x} y={y} width={w} height={h} rx={7} fill="#62B4FF" {...s} />
  const struts = (
    <>
      <rect x={72} y={122} width={22} height={8} rx={3} fill="#C3CAEE" {...s} strokeWidth={3} />
      <rect x={146} y={122} width={22} height={8} rx={3} fill="#C3CAEE" {...s} strokeWidth={3} />
    </>
  )
  const mast = (x: number, y: number) => (
    <>
      <path d={`M142 100 L${x} ${y}`} stroke={O} strokeWidth={7} strokeLinecap="round" />
      <path d={`M142 100 L${x} ${y}`} stroke="#C3CAEE" strokeWidth={3} strokeLinecap="round" />
    </>
  )
  return (
    <svg viewBox="0 0 240 320" role="img" aria-label={label} className={className} style={{ overflow: 'visible' }}>
      <g id="launcher">
        {!launcher && (
          <Ghost>
            <rect x={98} y={180} width={44} height={110} rx={14} stroke="#FF8552" />
          </Ghost>
        )}
        {launcher === 'small' && (
          <g className={IN}>
            <polygon points="104,176 136,176 142,190 98,190" fill="#C3CAEE" {...s} />
            <path d="M106 270 L94 290 L106 286 Z M134 270 L146 290 L134 286 Z" fill="#FF8552" {...s} />
            <rect x={106} y={190} width={28} height={90} rx={10} fill="#F2F4FF" {...s} />
            <rect x={106} y={222} width={28} height={10} fill="#FF8552" />
          </g>
        )}
        {launcher === 'medium' && (
          <g className={IN}>
            <polygon points="100,176 140,176 146,190 94,190" fill="#C3CAEE" {...s} />
            <path d="M100 270 L84 300 L100 294 Z M140 270 L156 300 L140 294 Z" fill="#FF8552" {...s} />
            <rect x={100} y={190} width={40} height={106} rx={12} fill="#F2F4FF" {...s} />
            <rect x={100} y={222} width={40} height={12} fill="#FF8552" />
          </g>
        )}
        {launcher === 'heavy' && (
          <g className={IN}>
            <polygon points="100,176 140,176 146,190 94,190" fill="#C3CAEE" {...s} />
            <path d="M72 228 Q72 210 84 206 Q96 210 96 228 L96 300 L72 300 Z" fill="#F2F4FF" {...s} />
            <path d="M144 228 Q144 210 156 206 Q168 210 168 228 L168 300 L144 300 Z" fill="#F2F4FF" {...s} />
            <rect x={98} y={190} width={44} height={116} rx={12} fill="#F2F4FF" {...s} />
            <rect x={98} y={222} width={44} height={12} fill="#FF8552" />
          </g>
        )}
      </g>

      <g id="power">
        {!power && (
          <Ghost>
            <rect x={40} y={108} width={34} height={38} rx={8} stroke="#62B4FF" />
            <rect x={166} y={108} width={34} height={38} rx={8} stroke="#62B4FF" />
          </Ghost>
        )}
        {power === 'small' && (
          <g className={IN}>
            {struts}
            {panel(40, 108, 34, 38)}
            {panel(166, 108, 34, 38)}
          </g>
        )}
        {power === 'big' && (
          <g className={IN}>
            {struts}
            {panel(6, 102, 68, 50)}
            {panel(166, 102, 68, 50)}
          </g>
        )}
        {power === 'hybrid' && (
          <g className={IN}>
            {struts}
            {panel(22, 104, 52, 46)}
            {panel(166, 104, 52, 46)}
            <rect x={100} y={158} width={40} height={18} rx={6} fill="#62B4FF" {...s} />
          </g>
        )}
      </g>

      <g id="bus">
        <rect x={92} y={96} width={56} height={64} rx={16} fill="#F2F4FF" {...s} />
        <circle cx={120} cy={118} r={9} fill="#1F2852" {...s} strokeWidth={3} />
      </g>

      <g id="antenna">
        {!antenna && (
          <Ghost>
            <circle cx={176} cy={66} r={20} stroke="#FF93B8" />
          </Ghost>
        )}
        {antenna === 'small' && (
          <g className={IN}>
            {mast(170, 68)}
            <circle cx={173} cy={64} r={8} fill="#FF93B8" {...s} />
          </g>
        )}
        {antenna === 'polar' && (
          <g className={IN}>
            {mast(164, 78)}
            <path d="M150 74 Q172 96 194 58 Z" fill="#FF93B8" {...s} />
          </g>
        )}
        {antenna === 'relay' && (
          <g className={IN}>
            {mast(160, 82)}
            <path d="M140 76 Q174 112 212 44 Z" fill="#FF93B8" {...s} />
          </g>
        )}
      </g>

      <g id="payload">
        {!payload && (
          <Ghost>
            <rect x={98} y={46} width={44} height={46} rx={12} stroke="#7FE28E" />
          </Ghost>
        )}
        {payload === 'camera' && (
          <g className={IN}>
            <rect x={102} y={70} width={36} height={28} rx={7} fill="#7FE28E" {...s} />
            <circle cx={120} cy={64} r={16} fill="#1F2852" {...s} />
            <circle cx={120} cy={64} r={8} fill="#4FD8C8" {...s} strokeWidth={3} />
          </g>
        )}
        {payload === 'prism' && (
          <g className={IN}>
            <rect x={100} y={80} width={40} height={18} rx={6} fill="#7FE28E" {...s} />
            <path d="M120 42 L142 80 L98 80 Z" fill="#F2F4FF" {...s} />
          </g>
        )}
        {payload === 'radar' && (
          <g className={IN}>
            <rect x={114} y={74} width={12} height={24} rx={4} fill="#7FE28E" {...s} strokeWidth={3.5} />
            <path d="M94 58 Q120 96 146 58 Z" fill="#7FE28E" {...s} />
          </g>
        )}
        {payload === 'weather' && (
          <g className={IN}>
            <rect x={102} y={56} width={36} height={42} rx={11} fill="#7FE28E" {...s} />
            <circle cx={120} cy={76} r={10} fill="#1F2852" {...s} strokeWidth={3} />
            <rect x={96} y={48} width={48} height={10} rx={5} fill="#F2F4FF" {...s} strokeWidth={3.5} />
          </g>
        )}
      </g>
    </svg>
  )
}
