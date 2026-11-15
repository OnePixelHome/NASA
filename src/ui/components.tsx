// Base components, styled with the design tokens in src/index.css (visual system: docs/design/).
// Signatures are stable: screens and the engine contract do not depend on how these look.
import type { Role } from '../engine/catalog'
import { ROLE_UI } from './theme'
import type { ResourceMeter } from '../engine/game'
import { reasonSources, SOURCES, type Reason, type SourceId } from '../engine/sources'

// ---------- Buttons ----------
const BTN = 'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-pill border-2 px-5 font-display text-[16px] transition duration-[var(--duration-fast)]'
/** The one recommended action on a screen. */
export const BTN_PRIMARY = `${BTN} border-st-selected bg-st-selected text-space-page hover:brightness-110 disabled:border-space-border disabled:bg-space-raised disabled:text-ink-2 disabled:hover:brightness-100`
/** The landing page's "Start mission": a green GO light (#7FE28E, the same green as the Science role). */
export const BTN_GO = `${BTN} border-role-science bg-role-science text-space-page hover:brightness-110`
export const BTN_SECONDARY =`${BTN} border-space-border bg-space-card text-ink hover:border-st-available`
/** Allowed but costly, e.g. launching over a No-Go. Outlined so it never reads as the recommended action. */
export const BTN_WARNING = `${BTN} border-st-warning bg-space-page text-st-warning hover:bg-space-raised disabled:border-space-border disabled:text-ink-2`

// ---------- Roles ----------
export function RoleTag({ role, label }: { role: Role; label: string }) {
  const r = ROLE_UI[role]
  return (
    <span className="whitespace-nowrap text-caption font-bold" style={{ color: r.color }}>
      <span aria-hidden>{r.icon} </span>
      {label}
    </span>
  )
}

// ---------- AI label ----------
/**
 * Visible "AI-generated" mark. The Space Apps rules require it on every AI-generated image,
 * and the game's illustrations were drafted with Claude Design (docs/DESIGN-RULES.md).
 */
export function AiGeneratedLabel({ className = '' }: { className?: string }) {
  return (
    <span role="note" aria-label="AI-generated image" className={`inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-pill border-[1.5px] border-ink bg-space-page pl-2 pr-2.5 text-caption font-bold tracking-wide text-ink ${className}`}>
      <svg viewBox="0 0 12 12" className="size-[11px]" aria-hidden>
        <path d="M6 0 L7.4 4.6 L12 6 L7.4 7.4 L6 12 L4.6 7.4 L0 6 L4.6 4.6 Z" fill="currentColor" />
      </svg>
      AI-generated
    </span>
  )
}

// ---------- Bars and chips ----------/** Segmented 1–5 bar. `color` is any CSS color, usually an orbit token. */
export function Bar({ label, value, max = 5, color }: { label: string; value: number; max?: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-small" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={`${label}: ${value} of ${max}`}>
      <span className="w-24 shrink-0 text-ink-2">{label}</span>
      <div className="flex flex-1 gap-1" aria-hidden>
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className="h-3 flex-1 rounded-sm" style={{ background: i < value ? color : 'var(--color-space-raised)' }} />
        ))}
      </div>
      <span className="w-9 text-right font-display tabular-nums text-ink" aria-hidden>
        {value}/{max}
      </span>
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
  const cls = 'ml-1 inline-flex h-5 items-center gap-0.5 whitespace-nowrap rounded-pill border border-space-border bg-space-raised px-1.5 align-middle text-[11px] font-bold leading-none text-ink-2'
  return s.url && link ? (
    // The ::after box stretches the tap target to 44 px tall without changing the line height.
    <a
      href={s.url}
      target="_blank"
      rel="noreferrer"
      title={s.title}
      className={`${cls} relative underline-offset-2 after:absolute after:inset-x-0 after:-inset-y-3 hover:border-st-available hover:text-ink`}
    >
      {chipLabel(id)}
      <span aria-hidden>↗</span>
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
    <ul className="flex flex-col gap-2 text-[15px] text-ink-2">
      {reasons.map((r, i) => (
        <li key={i} className="flex gap-2 leading-snug">
          <span aria-hidden className="text-ink-muted">
            •
          </span>
          <span>
            <Sourced reason={r} />
          </span>
        </li>
      ))}
    </ul>
  )
}

// ---------- Score ----------
export function Gauge({ score, success }: { score: number; success: boolean }) {
  const r = 52
  const c = 2 * Math.PI * r
  const color = success ? 'var(--color-st-success)' : 'var(--color-st-error)'
  return (
    <div className="relative size-40" role="img" aria-label={`Mission score ${score} out of 100`}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--color-space-raised)" strokeWidth="12" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(c * score) / 100} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden>
        <span className="font-display text-score tabular-nums text-ink">{score}</span>
        <span className="text-caption text-ink-muted">/ 100</span>
      </div>
    </div>
  )
}

/** Plain progress meter, used for the scorecard breakdown. */
export function Meter({ label, value, max, unit, warnAt, source }: { label: string; value: number; max: number; unit: string; warnAt?: number; source?: SourceId }) {
  const pct = max ? Math.min(100, (100 * value) / max) : 0
  const over = value > max
  const warn = !over && warnAt !== undefined && value > warnAt
  const color = over ? 'var(--color-st-error)' : warn ? 'var(--color-st-warning)' : 'var(--color-st-success)'
  return (
    <div className="text-small">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-ink-2">
          {label}
          {source && <SourceChip id={source} link={false} />}
        </span>
        <span className="font-display tabular-nums text-ink">
          {unit}
          {Math.round(value)} / {unit}
          {Math.round(max)}
          {unit === '$' ? 'M' : ''}
        </span>
      </div>
      <div className="mt-1 h-3 rounded-pill bg-space-raised">
        <div className="h-full rounded-pill transition-[width] duration-[var(--duration-base)]" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

// ---------- Resource panel ----------
type MeterState = 'ok' | 'warn' | 'over' | 'waiting'
const METER_UI: Record<MeterState, { icon: string; color: string; text: string }> = {
  ok: { icon: '✓', color: 'var(--color-st-success)', text: 'ok' },
  warn: { icon: '⚠', color: 'var(--color-st-warning)', text: 'low reserve' },
  over: { icon: '✕', color: 'var(--color-st-error)', text: 'over limit' },
  waiting: { icon: '…', color: 'var(--color-ink-muted)', text: 'waiting' },
}
const meterState = (m: ResourceMeter): MeterState =>
  m.over ? 'over' : m.limit === null ? 'waiting' : m.warnAbove !== undefined && m.used > m.warnAbove ? 'warn' : 'ok'

/**
 * Live resource meters (budget, mass, power, data) for the app header.
 * Every state is written with an icon and words, never color alone. On a phone the 2×2 grid can be
 * collapsed into a one-line summary (`open={false}`); from 640 px up it is always one row of four.
 */
export function ResourcePanel({ meters, open = true }: { meters: ResourceMeter[]; open?: boolean }) {
  return (
    <section aria-label="Mission resources">
      {!open && (
        <ul className="flex flex-wrap gap-x-3 gap-y-0.5 text-caption font-bold sm:hidden">
          {meters.map((m) => {
            const ui = METER_UI[meterState(m)]
            return (
              <li key={m.id} className="whitespace-nowrap" style={{ color: ui.color }} aria-label={`${m.label}: ${m.text}, ${m.hint ?? ui.text}`}>
                <span aria-hidden>{ui.icon} </span>
                {m.label}
              </li>
            )
          })}
        </ul>
      )}
      <div className={`${open ? 'grid' : 'hidden sm:grid'} grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4`}>
        {meters.map((m) => {
          const state = meterState(m)
          const ui = METER_UI[state]
          const status = state === 'waiting' ? (m.hint ?? ui.text) : ui.text
          const pct = m.limit ? Math.min(100, (100 * m.used) / m.limit) : 0
          return (
            <div key={m.id} role="group" aria-label={`${m.label}: ${m.text}, ${status}`} className="min-w-0 text-caption">
              <div className="flex items-baseline justify-between gap-1">
                <span className="font-bold text-ink-2">{m.label}</span>
                <span className="truncate text-right font-display tabular-nums text-ink">{m.text}</span>
              </div>
              <div className="mt-1 h-2 rounded-pill bg-space-raised">
                <div className="h-full rounded-pill transition-[width] duration-[var(--duration-base)]" style={{ width: `${pct}%`, background: ui.color }} />
              </div>
              <div className="mt-0.5 flex flex-wrap items-center justify-between gap-x-1">
                <span className="font-bold" style={{ color: ui.color }}>
                  <span aria-hidden>{ui.icon} </span>
                  {status}
                </span>
                {/* A long hint pushes the chips to a second line instead of cutting the numbers. */}
                <span className="shrink-0">
                  <SourceChips ids={m.sources} link={false} />
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
