// Badges: the block on the scorecard and the mission log on the landing page.
// What is earned comes from the engine (src/engine/achievements.ts); this file only draws it and keeps the log
// in this browser (src/achievements/store.ts).
import { useEffect, useMemo, useState } from 'react'
import { clearLog, loadLog, saveLog } from '../achievements/store'
import { ALL_BADGES, COLLECTION_BADGES, EMPTY_LOG, MISSION_BADGES, missionBadges, recordMission, type Badge, type BadgeId } from '../engine/achievements'
import type { Choice } from '../engine/game'
import { BTN_SECONDARY, SourceChip } from './components'

const CARD = 'rounded-lg border border-space-border bg-space-card'

/** One badge. Earned or locked is said in words and with a different star, not only with color. */
function BadgeItem({ badge, earned, fresh = false }: { badge: Badge; earned: boolean; fresh?: boolean }) {
  return (
    <li className={`flex items-start gap-2.5 rounded-md border px-3 py-2 ${earned ? 'border-st-selected bg-space-raised' : 'border-space-border bg-space-page'}`}>
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

/** Scorecard block: what this mission earned, what is still locked, and the running total on this device. */
export function MissionBadges({ choice, goVotes, players }: { choice: Choice; goVotes: number; players: number }) {
  // Read once, add this mission, then store: recording is idempotent, so a second render or effect run changes nothing.
  const [before] = useState(loadLog)
  const after = useMemo(() => recordMission(before, choice, goVotes, players), [before, choice, goVotes, players])
  useEffect(() => saveLog(after), [after])

  const earned = missionBadges(choice, goVotes, players)
  const isNew = (id: BadgeId) => !before.badges.includes(id)
  const locked = MISSION_BADGES.filter((b) => !earned.includes(b.id))
  const collected = COLLECTION_BADGES.filter((b) => after.badges.includes(b.id) && isNew(b.id))

  return (
    <section aria-labelledby="h-badges" className={`${CARD} mt-4 flex flex-col gap-3 p-4`}>
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
