import { reasonSources, SOURCES, type Reason, type SourceId } from '../engine/sources'

export function Bar({ label, value, max = 5, color }: { label: string; value: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-sm" aria-label={`${label}: ${value} of ${max}`}>
      <span className="w-28 shrink-0 text-slate-300">{label}</span>
      <div className="flex flex-1 gap-1">
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={`h-3 flex-1 rounded-sm ${i < value ? color : 'bg-slate-700'}`} />
        ))}
      </div>
      <span className="w-6 text-right tabular-nums text-slate-400">{value}</span>
    </div>
  )
}

const chipLabel = (id: SourceId) => (id === 'GAME' ? 'illustrative' : id === 'PHYS' ? 'physics' : `NASA ${id}`)

/**
 * Source tag for a number. Links to the NASA resource when there is one.
 * Pass `link={false}` inside buttons: a link nested in a button is invalid HTML and steals the tap.
 */
export function SourceChip({ id, link = true }: { id: SourceId; link?: boolean }) {
  const s = SOURCES[id]
  const cls = 'ml-1 inline-block rounded bg-slate-700 px-1.5 py-0.5 align-middle text-[10px] font-semibold text-slate-200'
  return s.url && link ? (
    <a href={s.url} target="_blank" rel="noreferrer" title={s.title} className={`${cls} hover:bg-sky-700`}>
      {chipLabel(id)}
    </a>
  ) : (
    <span title={s.title} className={cls}>
      {chipLabel(id)}
    </span>
  )
}

export function SourceChips({ ids, link = true }: { ids: SourceId[]; link?: boolean }) {
  return (
    <>
      {ids.map((id) => (
        <SourceChip key={id} id={id} link={link} />
      ))}
    </>
  )
}

/** A sentence followed by the chips of every source it cites. */
export function Sourced({ reason }: { reason: Reason }) {
  return (
    <>
      {reason.text}
      <SourceChips ids={reasonSources(reason)} />
    </>
  )
}

export function ReasonList({ reasons }: { reasons: Reason[] }) {
  return (
    <ul className="space-y-1 text-sm">
      {reasons.map((r, i) => (
        <li key={i} className="leading-snug">
          <Sourced reason={r} />
        </li>
      ))}
    </ul>
  )
}

export function Gauge({ score, success }: { score: number; success: boolean }) {
  const r = 70
  const c = 2 * Math.PI * r
  const color = success ? '#22c55e' : '#f97316'
  return (
    <svg viewBox="0 0 180 180" className="h-44 w-44" role="img" aria-label={`Mission score ${score} out of 100`}>
      <circle cx="90" cy="90" r={r} fill="none" stroke="#334155" strokeWidth="14" />
      <circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${(c * score) / 100} ${c}`}
        transform="rotate(-90 90 90)"
      />
      <text x="90" y="92" textAnchor="middle" fontSize="40" fontWeight="700" fill="white">
        {score}
      </text>
      <text x="90" y="118" textAnchor="middle" fontSize="12" fill="#94a3b8">
        / 100
      </text>
    </svg>
  )
}

export function Meter({ label, value, max, unit, warnAt, source }: { label: string; value: number; max: number; unit: string; warnAt?: number; source?: SourceId }) {
  const pct = max ? Math.min(100, (100 * value) / max) : 0
  const over = value > max
  const warn = !over && warnAt !== undefined && value > warnAt
  return (
    <div className="text-xs">
      <div className="flex justify-between text-slate-300">
        <span>
          {label}
          {source && <SourceChip id={source} link={false} />}
        </span>
        <span className="tabular-nums">
          {unit}
          {Math.round(value)} / {unit}
          {Math.round(max)}
          {unit === '$' ? 'M' : ''}
        </span>
      </div>
      <div className="mt-1 h-2 rounded bg-slate-700">
        <div className={`h-2 rounded ${over ? 'bg-red-500' : warn ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
