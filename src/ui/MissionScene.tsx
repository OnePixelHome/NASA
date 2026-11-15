// One animated scene per simulation step. Drawing from docs/design/pages/MissionScene.dc.html (Claude Design export).
// Only the current step is mounted, so its CSS animation plays once. Keyframes (ms-*) live in src/index.css;
// under prefers-reduced-motion each scene shows its final still frame.
import type { CSSProperties } from 'react'
import type { Role } from '../engine/catalog'
import { RoleCharacter } from './Crew'

const O = '#0B1026'
const fillBox = (origin: string, animation: string): CSSProperties => ({ transformBox: 'fill-box', transformOrigin: origin, animation })

/** What each scene shows, for screen readers. `orbit` is the short orbit name, e.g. "SSO". */
const describe = (orbit: string) => [
  'Rocket lifts off from the pad',
  `Spacecraft circles the planet on its ${orbit} orbit`,
  'Camera flash and the first image',
  'Data line from the spacecraft to a ground station',
  'Coverage band sweeps the planet',
  'The crew waves goodbye to a finished mission',
]
const CREW: Role[] = ['science', 'space', 'ground', 'launch']

/** `step` is 1–6 and `name` its timeline label; `color` is the orbit's color token. */
export function MissionScene({ step, name, orbit, color }: { step: number; name: string; orbit: string; color: string }) {
  const n = Math.max(1, Math.min(6, step))
  return (
    <div role="img" aria-label={`Step ${n} of 6, ${name}: ${describe(orbit)[n - 1]}`} className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-space-border bg-space-card">
      <svg key={n} viewBox="0 0 320 200" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 size-full" aria-hidden>
        <g fill="#F2F4FF" opacity="0.7">
          <circle cx="24" cy="20" r="1.5" />
          <circle cx="70" cy="44" r="1" />
          <circle cx="288" cy="28" r="1.5" />
          <circle cx="250" cy="70" r="1" />
          <circle cx="140" cy="14" r="1" />
          <circle cx="200" cy="36" r="1.2" />
          <circle cx="300" cy="120" r="1" />
          <circle cx="16" cy="110" r="1" />
        </g>

        {n === 1 && (
          <g>
            <rect x="0" y="176" width="320" height="24" fill="#1F2852" />
            <path d="M0 176 H320" stroke="#34407A" strokeWidth="3" />
            <rect x="196" y="74" width="10" height="102" rx="3" fill="#34407A" stroke={O} strokeWidth="3" />
            <path d="M180 100 H196 M180 130 H196" stroke="#34407A" strokeWidth="4" strokeLinecap="round" />
            <g style={fillBox('center bottom', 'ms-smoke 2.6s ease-out both')}>
              <circle cx="140" cy="180" r="16" fill="#C3CAEE" />
              <circle cx="180" cy="182" r="14" fill="#C3CAEE" />
              <circle cx="160" cy="186" r="18" fill="#F2F4FF" />
            </g>
            <g style={{ animation: 'ms-lift 2.6s cubic-bezier(.5,0,.75,0) both' }}>
              <path d="M152 168 Q160 196 168 168 Z" fill="#FFD166" stroke="#FF8552" strokeWidth="3" style={fillBox('center top', 'ms-flame 2.6s ease-out both')} />
              <path d="M146 150 L136 170 L146 166 Z M174 150 L184 170 L174 166 Z" fill="#FF8552" stroke={O} strokeWidth="3" strokeLinejoin="round" />
              <rect x="146" y="92" width="28" height="76" rx="10" fill="#F2F4FF" stroke={O} strokeWidth="3.5" />
              <rect x="146" y="120" width="28" height="9" fill="#FF8552" />
              <path d="M146 98 Q160 64 174 98 Z" fill="#62B4FF" stroke={O} strokeWidth="3.5" strokeLinejoin="round" />
            </g>
          </g>
        )}

        {n === 2 && (
          <g>
            <ellipse cx="160" cy="104" rx="120" ry="44" fill="none" stroke={color} strokeWidth="3" strokeDasharray="4 6" strokeLinecap="round" />
            <circle cx="160" cy="104" r="46" fill="#62B4FF" stroke={O} strokeWidth="4" />
            <path d="M130 92 Q142 74 160 82 Q170 96 156 104 Q138 110 130 92 Z M168 116 Q186 108 192 122 Q188 136 174 134 Q164 128 168 116 Z" fill="#7FE28E" stroke={O} strokeWidth="3" />
            <path d="M138 70 Q160 62 182 70" fill="none" stroke="#F2F4FF" strokeWidth="4" strokeLinecap="round" />
            <g transform="translate(160 104) scale(1 0.3667) translate(-160 -104)">
              <g style={{ transformOrigin: '160px 104px', animation: 'ms-lap 2.8s cubic-bezier(.4,0,.3,1) both' }}>
                <g transform="translate(160 -16) scale(1 2.727)">
                  <rect x="-14" y="-4" width="9" height="8" rx="2" fill={color} stroke={O} strokeWidth="2" />
                  <rect x="5" y="-4" width="9" height="8" rx="2" fill={color} stroke={O} strokeWidth="2" />
                  <rect x="-5.5" y="-5.5" width="11" height="11" rx="3" fill="#F2F4FF" stroke={O} strokeWidth="2" />
                </g>
              </g>
            </g>
          </g>
        )}

        {n === 3 && (
          <g>
            <path d="M-20 200 Q160 120 340 200 Z" fill="#62B4FF" stroke={O} strokeWidth="4" />
            <path d="M40 190 Q80 170 120 176 L130 200 L30 200 Z M190 172 Q230 162 270 182 L280 200 L200 200 Z" fill="#7FE28E" stroke={O} strokeWidth="3" />
            <path d="M116 66 L92 168 L188 168 L164 66 Z" fill="#FFD166" opacity="0.18" />
            <g transform="translate(140 50)">
              <rect x="-22" y="-7" width="14" height="14" rx="3" fill={color} stroke={O} strokeWidth="2.5" />
              <rect x="8" y="-7" width="14" height="14" rx="3" fill={color} stroke={O} strokeWidth="2.5" />
              <rect x="-9" y="-10" width="18" height="20" rx="5" fill="#F2F4FF" stroke={O} strokeWidth="2.5" />
              <circle cx="0" cy="12" r="5" fill="#1F2852" stroke={O} strokeWidth="2.5" />
            </g>
            <circle cx="140" cy="62" r="14" fill="#F2F4FF" style={fillBox('center', 'ms-flash 1.4s ease-out both')} />
            <g style={fillBox('center', 'ms-photo 2.2s cubic-bezier(.3,1.3,.5,1) both')}>
              <rect x="212" y="30" width="80" height="72" rx="8" fill="#F2F4FF" stroke={O} strokeWidth="3.5" />
              <rect x="220" y="38" width="30" height="24" rx="3" fill="#7FE28E" />
              <rect x="254" y="38" width="30" height="24" rx="3" fill="#FFB547" />
              <rect x="220" y="66" width="30" height="16" rx="3" fill="#FFD166" />
              <rect x="254" y="66" width="30" height="16" rx="3" fill="#66E39A" />
              <rect x="220" y="88" width="40" height="6" rx="3" fill="#C3CAEE" />
            </g>
          </g>
        )}

        {n === 4 && (
          <g>
            <path d="M-20 200 Q160 130 340 200 Z" fill="#62B4FF" stroke={O} strokeWidth="4" />
            <g transform="translate(70 46)">
              <rect x="-20" y="-6" width="13" height="12" rx="3" fill={color} stroke={O} strokeWidth="2.5" />
              <rect x="7" y="-6" width="13" height="12" rx="3" fill={color} stroke={O} strokeWidth="2.5" />
              <rect x="-8" y="-8" width="16" height="16" rx="4" fill="#F2F4FF" stroke={O} strokeWidth="2.5" />
            </g>
            <path d="M78 56 L234 148" fill="none" stroke="#FF93B8" strokeWidth="4" strokeLinecap="round" strokeDasharray="260" style={{ animation: 'ms-beam 1.8s ease-out both' }} />
            <path d="M78 56 L234 148" fill="none" stroke="#F2F4FF" strokeWidth="1.5" strokeDasharray="3 9" strokeLinecap="round" opacity="0.8" />
            <rect x="222" y="160" width="40" height="22" rx="4" fill="#C3CAEE" stroke={O} strokeWidth="3" />
            <path d="M226 152 Q242 170 262 140 Z" fill="#FF93B8" stroke={O} strokeWidth="3" strokeLinejoin="round" />
            <path d="M244 150 L242 162" stroke={O} strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {n === 5 && (
          <g>
            <defs>
              <clipPath id="ms-planet">
                <circle cx="160" cy="102" r="70" />
              </clipPath>
            </defs>
            <circle cx="160" cy="102" r="70" fill="#62B4FF" stroke={O} strokeWidth="4" />
            <g clipPath="url(#ms-planet)">
              <path
                d="M110 70 Q130 50 160 62 Q174 84 150 96 Q120 104 110 70 Z M170 120 Q200 108 214 128 Q206 154 182 150 Q164 140 170 120 Z M96 120 Q110 112 120 124 Q114 140 100 136 Z"
                fill="#7FE28E"
                stroke={O}
                strokeWidth="3"
              />
              <rect x="90" y="20" width="70" height="170" fill={color} opacity="0.2" style={fillBox('left center', 'ms-swept 2.6s ease-in-out both')} />
              <g style={{ animation: 'ms-sweep 2.6s ease-in-out both' }}>
                <rect x="136" y="20" width="48" height="170" fill={color} opacity="0.45" />
                <path d="M136 20 V190 M184 20 V190" stroke={color} strokeWidth="3" />
              </g>
            </g>
            <circle cx="160" cy="102" r="70" fill="none" stroke={O} strokeWidth="4" />
          </g>
        )}
      </svg>

      {n === 6 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5" aria-hidden>
          <div className="flex items-end gap-1">
            {CREW.map((role, i) => (
              <div key={role} style={{ transformOrigin: '50% 90%', animation: `ms-in 400ms ease-out ${i * 120}ms both, ms-wave 700ms ease-in-out ${500 + i * 120}ms 2` }}>
                <RoleCharacter role={role} mood="cheer" decorative className="size-14" />
              </div>
            ))}
          </div>
          <span className="font-display text-[16px] text-ink" style={{ animation: 'ms-in 400ms ease-out 900ms both' }}>
            Mission complete
          </span>
        </div>
      )}

      <span className="absolute left-2.5 top-2.5 rounded-pill border border-space-border bg-space-page px-2.5 py-0.5 text-caption font-bold tabular-nums text-ink" aria-hidden>
        {n} · {name}
      </span>
    </div>
  )
}
