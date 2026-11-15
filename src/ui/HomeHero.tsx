// Landing-page hero: NASA's Blue Marble map wrapped on a spinning disc, with the favicon's tilted orbit and a
// satellite riding it. Our own drawing plus a NASA image, so no "AI-generated" label is needed (credit is on the page).
// Under prefers-reduced-motion the globe and the satellite stand still.
import { useMemo } from 'react'
import earthUrl from '../assets/earth-bmng-200408-1024.jpg'

const ORBIT = 'M 20 150 A 130 46 0 1 1 280 150 A 130 46 0 1 1 20 150'
const STARS: [number, number, number][] = [
  [30, 40, 1.4], [70, 20, 1], [250, 30, 1.6], [280, 90, 1], [18, 230, 1.2], [60, 280, 1], [240, 270, 1.4], [290, 210, 1], [150, 14, 1], [120, 288, 1.2],
]

export function HomeHero({ className = '' }: { className?: string }) {
  const reduced = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  return (
    <div className={`relative aspect-square w-full ${className}`} aria-hidden>
      <svg viewBox="0 0 300 300" className="absolute inset-0 size-full">
        {STARS.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="var(--color-ink-2)" opacity="0.7" />
        ))}
      </svg>
      <div
        className="absolute left-1/2 top-1/2 aspect-square w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          backgroundImage: `url(${earthUrl})`,
          backgroundSize: 'auto 100%',
          backgroundRepeat: 'repeat-x',
          boxShadow: 'inset -18px -10px 36px rgba(0,0,0,0.6), 0 0 48px rgba(98,180,255,0.35)',
          animation: reduced ? undefined : 'home-spin 48s linear infinite',
        }}
      />
      <svg viewBox="0 0 300 300" className="absolute inset-0 size-full">
        <g transform="rotate(-22 150 150)">
          <path d={ORBIT} fill="none" stroke="var(--color-orbit-sso)" strokeWidth="5" strokeLinecap="round" />
          <g transform={reduced ? 'translate(250 120)' : undefined}>
            {!reduced && <animateMotion dur="9s" repeatCount="indefinite" path={ORBIT} />}
            <rect x="-9" y="-9" width="18" height="18" rx="3" fill="var(--color-ink)" stroke="var(--color-space-page)" strokeWidth="3" />
            <rect x="-24" y="-4" width="12" height="8" rx="1.5" fill="var(--color-role-spacecraft)" />
            <rect x="12" y="-4" width="12" height="8" rx="1.5" fill="var(--color-role-spacecraft)" />
          </g>
        </g>
      </svg>
    </div>
  )
}
