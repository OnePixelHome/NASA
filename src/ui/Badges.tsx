// Badges: the block on the scorecard and the mission log on the landing page.
// What is earned comes from the engine (src/engine/achievements.ts); this file only draws it and keeps the log
// in this browser (src/achievements/store.ts).
import { useState } from 'react'
import { clearLog, loadLog } from '../achievements/store'
import type { FlownMission } from '../achievements/useFlownMission'
import { ALL_BADGES, COLLECTION_BADGES, EMPTY_LOG, MISSION_BADGES, type Badge, type BadgeId } from '../engine/achievements'
import { BTN_SECONDARY, SourceChip } from './components'

const CARD = 'rounded-lg border border-space-border bg-space-card'

/** One badge. Earned or locked is said in words and with a different star, not only with color. */
function BadgeItem({ badge, earned, fresh = false }: { badge: Badge; earned: boolean; fresh?: boolean }) {
  return (
    <li
      className={`flex items-start gap-2.5 rounded-md border px-3 py-2 ${earned ? 'border-st-selected bg-space-raised' : 'border-space-border bg-space-page'}`}
      style={fresh ? { animation: 'pop 420ms ease-out both' } : undefined}
    >
      <span aria-hidden className={`font-display text-[1.25rem] leading-none ${earned ? 'text-st-selected' : 'text-st-locked'}`}>
        {earned ? '★' : '☆'}
      </span>
      <div className="min-w-0">
        <div className={`font-display leading-tight ${earned ? 'text-ink' : 'text-ink-2'}`}>
          {badge.name}
          {fresh && <span className="ml-2 rounded-pill bg-st-selected px-1.5 py-0.5 align-middle text-[11px] font-bold leading-none text-space-page">New</span>}
          {!earned && <span className="ml-2 text-caption font-bold text-st-locked">Locked</span>}
        </div>
        <p className="text-small text-ink-2">
          {badge.hint}
          {badge.source !== 'GAME' && <SourceChip id={badge.source} />}
        </p>
      </div>
    </li>
  )
}

const GRID = 'grid gap-2 sm:grid-cols-2 lg:grid-cols-3'

// Where each star of the shower starts, how big it is and when it falls. Fixed numbers, so every render draws the same shower.
const STARS = Array.from({ length: 22 }, (_, i) => ({ left: (i * 37 + 11) % 100, size: 14 + ((i * 7) % 5) * 5, delay: (i % 8) * 110, duration: 1900 + ((i * 13) % 6) * 160 }))

/**
 * Top of the scorecard, only when this mission brought a badge this browser did not have: a banner that names the
 * new badges and a short shower of stars. The banner stays; the stars fall once. With reduced motion the stars are
 * skipped by the global rule in index.css and the banner simply appears.
 */
export function BadgeCelebration({ fresh }: { fresh: Badge[] }) {
  if (fresh.length === 0) return null
  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {STARS.map((s, i) => (
          <span
            key={i}
            className={`absolute top-0 leading-none ${i % 3 === 0 ? 'text-ink' : 'text-st-selected'}`}
            style={{ left: `${s.left}%`, fontSize: s.size, opacity: 0, animation: `badge-fall ${s.duration}ms ease-in ${s.delay}ms both` }}
          >
            ★
          </span>
        ))}
      </div>
      <div
        role="status"
        className="mt-4 flex flex-col gap-3 rounded-lg border-2 border-st-selected bg-space-raised p-4 sm:flex-row sm:items-center"
        style={{ animation: 'pop 480ms ease-out both, badge-glow 1600ms ease-out 300ms 2' }}
      >
        <span aria-hidden className="font-display text-[2.5rem] leading-none text-st-selected">
          ★
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-card">{fresh.length === 1 ? 'New badge earned!' : `${fresh.length} new badges earned!`}</p>
          <p className="text-small text-ink-2">{fresh.map((b) => b.name).join(' · ')}</p>
        </div>
        <button type="button" className={BTN_SECONDARY} onClick={() => document.getElementById('badges')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
          See my badges
        </button>
      </div>
    </>
  )
}

/** Scorecard block: what this mission earned, what is still locked, and the running total on this device. */
export function MissionBadges({ mission }: { mission: FlownMission }) {
  const { earned, before, after } = mission
  const isNew = (id: BadgeId) => !before.badges.includes(id)
  const locked = MISSION_BADGES.filter((b) => !earned.includes(b.id))
  const collected = COLLECTION_BADGES.filter((b) => after.badges.includes(b.id) && isNew(b.id))

  return (
    // scroll-mt keeps the block clear of the sticky header and its resource panel when "See my badges" scrolls here.
    <section id="badges" aria-labelledby="h-badges" className={`${CARD} mt-4 flex scroll-mt-44 flex-col gap-3 p-4`}>
      <div>
        <h2 id="h-badges" className="text-section">
          Badges
        </h2>
        <p className="text-small text-ink-2">
          {earned.length > 0 ? `This mission earned ${earned.length} of ${MISSION_BADGES.length}.` : 'Badges are earned by successful missions.'}
          <SourceChip id="GAME" />
        </p>
      </div>
      {earned.length > 0 && (
        <ul className={GRID}>
          {MISSION_BADGES.filter((b) => earned.includes(b.id)).map((b) => (
            <BadgeItem key={b.id} badge={b} earned fresh={isNew(b.id)} />
          ))}
        </ul>
      )}
      {collected.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-caption font-bold uppercase tracking-widest text-ink-muted">Mission log</h3>
          <ul className={GRID}>
            {collected.map((b) => (
              <BadgeItem key={b.id} badge={b} earned fresh />
            ))}
          </ul>
        </div>
      )}
      {locked.length > 0 && (
        <details className="text-small">
          <summary className="min-h-[44px] cursor-pointer content-center font-bold text-ink-2">
            {locked.length} more to earn
          </summary>
          <ul className={`${GRID} mt-1`}>
            {locked.map((b) => (
              <BadgeItem key={b.id} badge={b} earned={false} />
            ))}
          </ul>
        </details>
      )}
      <p className="text-caption text-ink-muted">
        Mission log: {after.badges.length} of {ALL_BADGES.length} badges collected in this browser. It is kept only here and never sent anywhere.
      </p>
    </section>
  )
}

/** Landing page: the badges collected in this browser. Shows nothing until the first badge. */
export function MissionLogPanel() {
  const [log, setLog] = useState(loadLog)
  if (log.badges.length === 0) return null
  return (
    <section aria-labelledby="h-log" className={`${CARD} flex flex-col gap-3 p-4`}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="h-log" className="text-section">
            Your mission log
          </h2>
          <p className="text-small text-ink-2">
            {log.badges.length} of {ALL_BADGES.length} badges. Kept only in this browser.
            <SourceChip id="GAME" />
          </p>
        </div>
        <button
          type="button"
          className={BTN_SECONDARY}
          onClick={() => {
            clearLog()
            setLog(EMPTY_LOG)
          }}
        >
          Clear my log
        </button>
      </div>
      <ul className={GRID}>
        {ALL_BADGES.map((b) => (
          <BadgeItem key={b.id} badge={b} earned={log.badges.includes(b.id)} />
        ))}
      </ul>
    </section>
  )
}
