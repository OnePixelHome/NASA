// Mission illustrations and orbit diagrams for screens 1 and 2.
// Drawings from docs/design/pages/MissionArt.dc.html and docs/design/handoff/BriefOrbit.tsx (Claude Design export).
const O = '#0B1026'

const ART_LABEL: Record<string, string> = {
  crops: 'Farmland patchwork seen from above',
  storms: 'Hurricane swirl over the ocean',
  ice: 'Polar ice sheet with floating floes',
}

/** `id` is a scenario id from the catalog. An unknown id draws the plain backdrop. */
export function MissionArt({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 320 160" className="block h-auto w-full rounded-md" role="img" aria-label={ART_LABEL[id] ?? 'Mission illustration'}>
      <rect width="320" height="160" fill="#1F2852" />
      {id === 'crops' && (
        <g>
          <g transform="rotate(-8 160 80)">
            <rect x="20" y="10" width="70" height="52" rx="8" fill="#7FE28E" stroke={O} strokeWidth="4" />
            <rect x="96" y="10" width="54" height="52" rx="8" fill="#FFB547" stroke={O} strokeWidth="4" />
            <rect x="156" y="10" width="86" height="52" rx="8" fill="#66E39A" stroke={O} strokeWidth="4" />
            <rect x="248" y="10" width="60" height="52" rx="8" fill="#FFD166" stroke={O} strokeWidth="4" />
            <rect x="20" y="96" width="56" height="58" rx="8" fill="#FFD166" stroke={O} strokeWidth="4" />
            <rect x="82" y="96" width="92" height="58" rx="8" fill="#7FE28E" stroke={O} strokeWidth="4" />
            <rect x="180" y="96" width="50" height="58" rx="8" fill="#FF8552" stroke={O} strokeWidth="4" />
            <rect x="236" y="96" width="72" height="58" rx="8" fill="#66E39A" stroke={O} strokeWidth="4" />
            <path d="M28 24 H82 M28 36 H82 M28 48 H82 M164 22 H234 M164 34 H234 M164 46 H234 M90 110 H166 M90 124 H166 M90 138 H166" stroke={O} strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
          </g>
          <path d="M-10 92 C60 70 110 104 170 82 S280 64 330 78" fill="none" stroke={O} strokeWidth="20" strokeLinecap="round" />
          <path d="M-10 92 C60 70 110 104 170 82 S280 64 330 78" fill="none" stroke="#62B4FF" strokeWidth="13" strokeLinecap="round" />
        </g>
      )}
      {id === 'storms' && (
        <g>
          <path d="M-10 118 Q40 96 80 112 Q110 126 120 160 L-10 160 Z" fill="#7FE28E" stroke={O} strokeWidth="4" />
          <path d="M250 -10 Q240 30 268 48 Q300 62 330 52 L330 -10 Z" fill="#7FE28E" stroke={O} strokeWidth="4" />
          <g transform="translate(176 78)">
            <path d="M0 -58 C40 -58 62 -28 54 6" fill="none" stroke={O} strokeWidth="24" strokeLinecap="round" />
            <path d="M58 6 C50 44 14 64 -22 54" fill="none" stroke={O} strokeWidth="24" strokeLinecap="round" />
            <path d="M-26 52 C-60 38 -66 -4 -48 -30" fill="none" stroke={O} strokeWidth="24" strokeLinecap="round" />
            <path d="M-46 -32 C-34 -50 -18 -58 0 -58" fill="none" stroke={O} strokeWidth="24" strokeLinecap="round" />
            <path d="M0 -58 C40 -58 62 -28 54 6 M58 6 C50 44 14 64 -22 54 M-26 52 C-60 38 -66 -4 -48 -30 M-46 -32 C-34 -50 -18 -58 0 -58" fill="none" stroke="#F2F4FF" strokeWidth="16" strokeLinecap="round" />
            <path d="M0 -32 C22 -32 34 -14 30 6 C24 26 0 34 -18 26 C-34 16 -34 -10 -20 -22" fill="none" stroke="#C3CAEE" strokeWidth="14" strokeLinecap="round" />
            <circle r="10" fill="#1F2852" stroke={O} strokeWidth="4" />
          </g>
          <path d="M66 40 l6 -10 l6 10 M290 120 l6 -10 l6 10" fill="none" stroke="#62B4FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {id === 'ice' && (
        <g>
          <path d="M-10 70 Q40 30 110 44 Q160 18 220 40 Q280 22 330 50 L330 -10 L-10 -10 Z" fill="#F2F4FF" stroke={O} strokeWidth="4" strokeLinejoin="round" />
          <path d="M40 30 L70 20 L96 34 M150 14 L168 30 L200 24 M250 30 L274 18" fill="none" stroke="#C3CAEE" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M30 84 Q48 72 70 80 Q82 96 60 104 Q36 106 30 84 Z" fill="#F2F4FF" stroke={O} strokeWidth="4" />
          <path d="M120 92 Q150 74 186 86 Q196 108 170 116 Q130 120 120 92 Z" fill="#C3CAEE" stroke={O} strokeWidth="4" />
          <path d="M232 76 Q252 66 274 76 Q282 92 262 98 Q240 98 232 76 Z" fill="#F2F4FF" stroke={O} strokeWidth="4" />
          <path d="M82 132 Q96 124 110 130 Q114 142 100 146 Q84 146 82 132 Z M214 128 Q232 118 250 128 Q254 142 236 146 Q216 146 214 128 Z" fill="#F2F4FF" stroke={O} strokeWidth="4" />
          <path d="M0 150 Q160 120 320 150" fill="none" stroke="#4FD8C8" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
        </g>
      )}
    </svg>
  )
}

// The three orbits differ in shape, not only color: a small circle, a polar ellipse, a wide dotted ring.
const DIAGRAM: Record<string, { r: number; seconds: number; tilt?: string }> = {
  leo: { r: 31, seconds: 8 },
  sso: { r: 36, seconds: 10, tilt: 'translate(80 80) rotate(8) scale(0.36 1) translate(-80 -80)' },
  geo: { r: 66, seconds: 40 },
}

/** `id` is an orbit id from the catalog; `color` its token. Not to scale, and labelled so. */
export function OrbitDiagram({ id, short, color, className }: { id: string; short: string; color: string; className?: string }) {
  const d = DIAGRAM[id] ?? DIAGRAM.leo
  return (
    <svg viewBox="0 0 160 160" className={className} style={{ overflow: 'visible' }} role="img" aria-label={`${short} orbit diagram, not to scale`}>
      {id === 'geo' && <circle cx="80" cy="80" r="66" fill="none" stroke={color} strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" />}
      {id === 'leo' && <circle cx="80" cy="80" r="31" fill="none" stroke={color} strokeWidth="3" />}
      {id === 'sso' && <ellipse cx="80" cy="80" rx="13" ry="36" fill="none" stroke={color} strokeWidth="3" transform="rotate(8 80 80)" />}
      <circle cx="80" cy="80" r="24" fill="#62B4FF" stroke={O} strokeWidth="3.5" />
      <path d="M64 72 Q70 62 80 66 Q86 74 78 80 Q68 84 64 72 Z M84 88 Q94 84 98 92 Q96 100 88 100 Q82 96 84 88 Z" fill="#7FE28E" stroke={O} strokeWidth="2.5" />
      <g transform={d.tilt}>
        <g className="motion-safe:animate-spin" style={{ transformOrigin: '80px 80px', animationDuration: `${d.seconds}s` }}>
          <g transform={`translate(80 ${80 - d.r})`}>
            <rect x="-11" y="-4" width="7" height="8" rx="1.5" fill={color} stroke={O} strokeWidth="2" />
            <rect x="4" y="-4" width="7" height="8" rx="1.5" fill={color} stroke={O} strokeWidth="2" />
            <rect x="-4.5" y="-4.5" width="9" height="9" rx="2.5" fill="#F2F4FF" stroke={O} strokeWidth="2" />
          </g>
        </g>
      </g>
    </svg>
  )
}
