// "A day in orbit": a time-lapse of the finished mission, drawn from missionDay() in the engine.
// The map is a plain latitude/longitude plot, like a ground-track display: no coastlines, so nothing is implied
// that the model does not compute. Under prefers-reduced-motion it shows the finished day as a still.
import { useEffect, useMemo, useRef, useState } from 'react'
import type { MissionDay } from '../engine/missionDay'
import { BTN_SECONDARY, SourceChips } from './components'

/** Seconds of real time for the 24-hour day. */
const PLAY_SECONDS = 18
/** Draw one track point per minute; the engine samples every 20 s. */
const DRAW_EVERY = 3

const X = (lonDeg: number) => lonDeg + 180
const Y = (latDeg: number) => 90 - latDeg
const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d })
const clock = (tS: number) => `${String(Math.floor(tS / 3600)).padStart(2, '0')}:${String(Math.floor((tS % 3600) / 60)).padStart(2, '0')}`

export function DayView({ day, color, active }: { day: MissionDay; color: string; active: boolean }) {
  const reduced = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const last = day.samples.length - 1
  const [index, setIndex] = useState(reduced ? last : 0)
  const [playing, setPlaying] = useState(!reduced)
  const startRef = useRef<{ at: number; from: number } | null>(null)

  // Path commands for the ground track, one per drawn sample; a jump across the map edge starts a new stroke.
  const track = useMemo(() => {
    const cmds: string[] = []
    let prevLon: number | null = null
    for (let i = 0; i <= last; i += DRAW_EVERY) {
      const s = day.samples[i]
      const jump = prevLon === null || Math.abs(s.lonDeg - prevLon) > 180
      cmds.push(`${jump ? 'M' : 'L'}${X(s.lonDeg).toFixed(1)} ${Y(s.latDeg).toFixed(1)}`)
      prevLon = s.lonDeg
    }
    return cmds
  }, [day, last])

  // Which pass each sample belongs to (0 before the first one).
  const passAt = useMemo(() => {
    const out: number[] = []
    let n = 0
    day.samples.forEach((s, i) => {
      if (s.contact && (i === 0 || !day.samples[i - 1].contact)) n++
      out.push(n)
    })
    return out
  }, [day])

  useEffect(() => {
    if (!active || !playing || reduced) return
    let frame = 0
    const tick = (now: number) => {
      if (!startRef.current) startRef.current = { at: now, from: index }
      const { at, from } = startRef.current
      const next = Math.min(last, from + Math.floor(((now - at) / (PLAY_SECONDS * 1000)) * last))
      setIndex(next)
      if (next >= last) {
        setPlaying(false)
        startRef.current = null
      } else frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      startRef.current = null
    }
    // `index` is read only when a run starts; adding it would restart the clock on every frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, playing, reduced, last])

  const s = day.samples[index]
  const done = index >= last
  const stationary = day.maxLatDeg === 0 // geostationary: the track is a single point
  const lap = Math.min(day.orbitsPerDay, s.tS / (day.periodMin * 60))
  const batteryPct = (100 * s.batteryWh) / day.batteryCapacityWh
  const lowestPct = (100 * day.batteryMinWh) / day.batteryCapacityWh
  const st = day.station
  // On this plot a circle on the ground gets wider toward the poles.
  const widen = (latDeg: number) => 1 / Math.max(0.2, Math.cos((latDeg * Math.PI) / 180))
  const beam = st && s.contact && Math.abs(s.lonDeg - st.lonDeg) <= 180
  const outOfReach = !stationary && day.maxLatDeg + day.viewDeg < day.needLatDeg
  const link = day.passes === 'continuous' ? '● Always connected' : s.contact ? `▲ Pass ${passAt[index]} of ${day.passes}: sending data` : passAt[index] >= day.passes ? '✓ All passes done today' : '… Waiting for the next pass'
  const summary =
    `In one day: ${fmt(day.orbitsPerDay, 1)} laps, ${fmt(day.eclipseMin)} min in Earth’s shadow on each, ` +
    (day.passes === 'continuous' ? 'a link that never drops' : `${day.passes} passes over the ground station (${fmt(day.contactMin)} min in contact)`) +
    `, battery never below ${fmt(lowestPct)}%, ${fmt(day.deliveredGbit)} of ${fmt(day.collectedGbit)} Gbit delivered.`

  return (
    <section aria-labelledby="h-day" className="flex flex-col gap-3 rounded-lg border border-space-border bg-space-card p-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2 id="h-day" className="text-section">
          A day in orbit
        </h2>
        <span className="font-display tabular-nums text-ink-2" aria-hidden>
          T+{clock(s.tS)} · lap {fmt(lap, 1)} of {fmt(day.orbitsPerDay, 1)}
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <svg viewBox="0 0 360 180" role="img" aria-label={`Ground track of the spacecraft over one day. ${summary}`} className="w-full rounded-md border border-space-border bg-space-page">
          {/* Latitude and longitude grid, every 30°. */}
          <g stroke="var(--color-space-border)" strokeWidth="0.4" opacity="0.7">
            {[30, 60, 120, 150].map((y) => (
              <path key={`h${y}`} d={`M0 ${y} H360`} />
            ))}
            {[30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((x) => (
              <path key={`v${x}`} d={`M${x} 0 V180`} />
            ))}
          </g>
          <path d="M0 90 H360" stroke="var(--color-ink-muted)" strokeWidth="0.6" />

          {/* What the mission asks for. */}
          {outOfReach && (
            <g fill="var(--color-st-error)" opacity="0.16">
              <rect x="0" y={Y(day.needLatDeg)} width="360" height={day.needLatDeg - day.maxLatDeg - day.viewDeg} />
              <rect x="0" y={Y(-day.maxLatDeg - day.viewDeg)} width="360" height={day.needLatDeg - day.maxLatDeg - day.viewDeg} />
            </g>
          )}
          <g stroke="var(--color-role-science)" strokeWidth="0.7" strokeDasharray="3 3">
            <path d={`M0 ${Y(day.needLatDeg)} H360`} />
            <path d={`M0 ${Y(-day.needLatDeg)} H360`} />
          </g>

          {/* Ground station and the area where it can hear the spacecraft. */}
          {st && (
            <g>
              <ellipse cx={X(st.lonDeg)} cy={Y(st.latDeg)} rx={Math.min(180, st.reachDeg * widen(st.latDeg))} ry={st.reachDeg} fill="var(--color-role-ground)" fillOpacity={s.contact ? 0.22 : 0.08} stroke="var(--color-role-ground)" strokeWidth="0.6" strokeDasharray="2 2" />
              <path d={`M${X(st.lonDeg) - 3} ${Y(st.latDeg) + 2.5} L${X(st.lonDeg)} ${Y(st.latDeg) - 3.5} L${X(st.lonDeg) + 3} ${Y(st.latDeg) + 2.5} Z`} fill="var(--color-role-ground)" stroke="var(--color-space-page)" strokeWidth="0.8" />
            </g>
          )}

          {/* Track flown so far. */}
          <path d={track.slice(0, Math.floor(index / DRAW_EVERY) + 1).join('')} fill="none" stroke={color} strokeWidth="0.9" strokeLinejoin="round" opacity="0.75" />

          {beam && st && <path d={`M${X(s.lonDeg)} ${Y(s.latDeg)} L${X(st.lonDeg)} ${Y(st.latDeg)}`} stroke="var(--color-role-ground)" strokeWidth="1.2" strokeDasharray="2 1.5" />}

          {/* The spacecraft, with the patch of ground it can see. It dims while in Earth's shadow. */}
          <g transform={`translate(${X(s.lonDeg)} ${Y(s.latDeg)})`}>
            <ellipse rx={Math.min(180, day.viewDeg * widen(s.latDeg))} ry={Math.min(90, day.viewDeg)} fill={color} fillOpacity="0.1" stroke={color} strokeWidth="0.5" />
            <g opacity={s.sunlit ? 1 : 0.45}>
              <rect x="-6.5" y="-2" width="4" height="4" rx="0.8" fill={color} stroke="var(--color-space-page)" strokeWidth="0.7" />
              <rect x="2.5" y="-2" width="4" height="4" rx="0.8" fill={color} stroke="var(--color-space-page)" strokeWidth="0.7" />
              <rect x="-2.6" y="-2.6" width="5.2" height="5.2" rx="1.2" fill="var(--color-ink)" stroke="var(--color-space-page)" strokeWidth="0.7" />
            </g>
          </g>
        </svg>

        {/* Legend in page text, so it stays readable on a phone where the plot is small. */}
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-caption text-ink-2 lg:col-span-2 lg:row-start-2">
          <li>
            <span aria-hidden style={{ color }}>
              ━{' '}
            </span>
            Path over the ground
          </li>
          <li>
            <span aria-hidden className="text-role-science">
              ╌{' '}
            </span>
            Mission needs ±{fmt(day.needLatDeg)}°
          </li>
          {outOfReach && (
            <li>
              <span aria-hidden className="text-st-error">
                ▒{' '}
              </span>
              Never seen from this orbit
            </li>
          )}
          {st && (
            <li>
              <span aria-hidden className="text-role-ground">
                ▲{' '}
              </span>
              Ground station and its range
            </li>
          )}
          <li>
            <span aria-hidden className="text-ink-muted">
              ─{' '}
            </span>
            Equator
          </li>
        </ul>

        {/* Live readouts. Decorative for screen readers: the summary below says the same in one sentence. */}
        <dl className="grid grid-cols-2 content-start gap-2 text-small" aria-hidden>
          <Readout label="Sun" value={s.sunlit ? '☀ In sunlight' : '☾ In Earth’s shadow'} tone={s.sunlit ? 'var(--color-st-selected)' : 'var(--color-ink-muted)'} />
          <Readout label="Link" value={link} tone={s.contact ? 'var(--color-role-ground)' : 'var(--color-ink-2)'} />
          <Readout label="Battery" value={`${fmt(batteryPct)}% · ${fmt(s.batteryWh)} Wh`} bar={batteryPct} tone={s.sunlit ? 'var(--color-st-success)' : 'var(--color-st-warning)'} />
          <Readout label="Delivered to Earth" value={`${fmt(s.deliveredGbit)} of ${fmt(day.collectedGbit)} Gbit`} bar={(100 * s.deliveredGbit) / day.collectedGbit} tone="var(--color-role-ground)" />
          <Readout label="Waiting on board" value={`${fmt(s.storedGbit)} Gbit`} tone="var(--color-ink-2)" />
          <Readout label="Shadow each lap" value={`${fmt(day.eclipseMin)} of ${fmt(day.periodMin)} min`} tone="var(--color-ink-2)" />
        </dl>
      </div>

      <p className="text-small text-ink-2">
        {summary}
        <SourceChips ids={day.sources} />
      </p>
      <p className="text-caption text-ink-muted">A latitude and longitude plot, not a map: it shows where the spacecraft flies, not coastlines. {stationary ? 'A geostationary spacecraft stays over one point.' : 'Each lap lands further west because the Earth turns underneath.'}</p>

      {!reduced && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => {
              if (done) setIndex(0)
              setPlaying((p) => (done ? true : !p))
            }}
          >
            {done ? '↻ Replay the day' : playing ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>
      )}
    </section>
  )
}

function Readout({ label, value, tone, bar }: { label: string; value: string; tone: string; bar?: number }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-md bg-space-raised p-2.5">
      <dt className="text-caption text-ink-2">{label}</dt>
      <dd className="font-display leading-tight tabular-nums" style={{ color: tone }}>
        {value}
      </dd>
      {bar !== undefined && (
        <div className="h-1.5 rounded-pill bg-space-page">
          <div className="h-full rounded-pill" style={{ width: `${Math.max(0, Math.min(100, bar))}%`, background: tone }} />
        </div>
      )}
    </div>
  )
}
