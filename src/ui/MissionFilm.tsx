// The mission film: a rendered, frame-by-frame animation of the player's own mission.
// Launch → orbit and solar panels → first picture → a full day in orbit → end.
// The rocket and spacecraft are drawn from the chosen parts; the day act replays missionDay() from the engine,
// over NASA's Blue Marble image of the Earth. It is a canvas, so screen readers get a text description instead,
// and the timeline beside it carries every number with its source.
import { useEffect, useRef, useState } from 'react'
import earthUrl from '../assets/earth-bmng-200408-1024.jpg'
import type { MissionDay } from '../engine/missionDay'
import { AiGeneratedLabel, BTN_SECONDARY, SourceChip } from './components'
import { createGlobe, loadTexture, type Globe } from './film/globe'
import { drawDay, drawDeploy, drawEnd, drawFirstLight, drawLaunch, FILM_H, FILM_W, type DayFrame } from './film/scenes'
import { FILM_SECONDS, momentAt } from './film/timing'
import type { ShipParts } from './theme'

export interface FilmProgress {
  /** Timeline step being shown, 1–6. */
  step: number
  /** Sample of the mission day being shown, or null before the day act starts. */
  dayIndex: number | null
  done: boolean
}

/** Where on Earth each mission's first picture is taken: [latitude, longitude]. Illustration only. */
const FIRST_PICTURE: Record<string, [number, number]> = { crops: [40, -95], storms: [22, -75], ice: [72, -40] }

const clock = (tS: number) => `${String(Math.floor(tS / 3600)).padStart(2, '0')}:${String(Math.floor((tS % 3600) / 60)).padStart(2, '0')}`

export function MissionFilm({
  day,
  parts,
  color,
  scenarioId,
  stepLabels,
  finish,
  onProgress,
}: {
  day: MissionDay
  parts: ShipParts
  /** Orbit color token value. */
  color: string
  scenarioId: string
  /** The six timeline labels, used for the caption. */
  stepLabels: string[]
  /** Increase this number to jump to the end (the Skip button). */
  finish: number
  onProgress: (p: FilmProgress) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const elapsed = useRef(0)
  const lastFrame = useRef<number | null>(null)
  const [paused, setPaused] = useState(false)
  const [ended, setEnded] = useState(false)
  const [hud, setHud] = useState({ step: 1, clock: '', sunlit: true, contact: false, showDay: false })
  const earth = useRef<{ globe: Globe; image: HTMLImageElement } | null>(null)
  // Always call the latest callback without restarting the animation loop when the parent re-renders.
  const report = useRef(onProgress)
  useEffect(() => {
    report.current = onProgress
  }, [onProgress])
  const last = day.samples.length - 1
  // The whole orbit must fit across the film; a geostationary orbit makes the Earth small, and that is to scale.
  const earthPx = Math.min(122, 252 / day.orbitRadiusEarths)

  // Load the Earth image once and build the globe for this orbit's scale.
  useEffect(() => {
    let alive = true
    loadTexture(earthUrl)
      .then(({ pixels, image }) => {
        if (alive) earth.current = { globe: createGlobe(pixels, Math.round(earthPx * 3)), image }
      })
      .catch(() => {
        // Without the image the film still runs, with a plain blue Earth.
      })
    return () => {
      alive = false
    }
  }, [earthPx])

  // Skip: jump straight to the last frame.
  useEffect(() => {
    if (finish > 0) elapsed.current = FILM_SECONDS
  }, [finish])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = FILM_W * dpr
    canvas.height = FILM_H * dpr
    let frame = 0
    let sent = ''

    const draw = (now: number) => {
      // The clock lives in refs, so it keeps its place if this effect ever restarts.
      if (lastFrame.current !== null && !paused) elapsed.current = Math.min(FILM_SECONDS, elapsed.current + Math.min(0.1, (now - lastFrame.current) / 1000))
      lastFrame.current = now
      const m = momentAt(elapsed.current)
      const index = m.act === 'day' ? Math.min(last, Math.floor(m.progress * last)) : m.act === 'end' ? last : 0
      const dayFrame: DayFrame = { day, index, inclDeg: day.inclDeg, radius: day.orbitRadiusEarths, color, globe: earth.current?.globe ?? null, earthPx, time: elapsed.current }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (m.act === 'launch') drawLaunch(ctx, m.t, parts)
      else if (m.act === 'deploy') drawDeploy(ctx, m.t, parts)
      else if (m.act === 'firstLight') {
        const img = earth.current?.image
        const [lat, lon] = FIRST_PICTURE[scenarioId] ?? [0, -75]
        const [sw, sh] = [110, 70]
        const photo = img
          ? { image: img, sw, sh, sx: Math.max(0, Math.min(img.naturalWidth - sw, ((lon + 180) / 360) * img.naturalWidth - sw / 2)), sy: Math.max(0, Math.min(img.naturalHeight - sh, ((90 - lat) / 180) * img.naturalHeight - sh / 2)) }
          : null
        drawFirstLight(ctx, m.t, parts, photo)
      } else if (m.act === 'day') drawDay(ctx, dayFrame)
      else drawEnd(ctx, dayFrame, m.t)

      // Tell the screen what the film is showing, but only when it changes.
      const showDay = m.act === 'day' || m.act === 'end'
      const s = day.samples[index]
      const key = `${m.step}|${showDay ? index : -1}|${m.done}`
      if (key !== sent) {
        sent = key
        report.current({ step: m.step, dayIndex: showDay ? index : null, done: m.done })
        setHud({ step: m.step, clock: clock(s.tS), sunlit: s.sunlit, contact: s.contact, showDay })
        setEnded(m.done)
      }
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [day, parts, color, scenarioId, last, earthPx, paused])

  const chip = 'rounded-pill border border-space-border bg-space-page/85 px-2.5 py-0.5 text-caption font-bold tabular-nums text-ink'
  const link = day.passes === 'continuous' ? '● Always connected' : hud.contact ? '▲ Sending data' : '… No contact'
  return (
    <figure className="flex flex-col gap-2">
      <div className="relative overflow-hidden rounded-lg border border-space-border bg-space-page">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Mission film: your rocket lifts off, the spacecraft reaches orbit and unfolds its solar panels, takes its first picture, then circles the Earth for a day, passing through Earth’s shadow and sending data to the ground. The timeline lists every step with its numbers."
          className="block aspect-[16/10] w-full"
        />
        <span className={`absolute left-2.5 top-2.5 ${chip}`} aria-hidden>
          {hud.step} · {stepLabels[hud.step - 1]}
        </span>
        {hud.showDay && (
          <div className="absolute inset-x-2.5 bottom-2.5 flex flex-wrap gap-1.5" aria-hidden>
            <span className={chip}>T+{hud.clock}</span>
            <span className={chip}>{hud.sunlit ? '☀ Sunlight' : '☾ Earth’s shadow'}</span>
            <span className={chip}>{link}</span>
          </div>
        )}
      </div>
      <figcaption className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-ink-muted">
        <span>
          Earth image: NASA Earth Observatory, Blue Marble
          <SourceChip id="S12" />
        </span>
        <span>· Orbit height drawn to scale ·</span>
        <span className="flex items-center gap-1.5">
          Rocket and spacecraft drawings <AiGeneratedLabel />
        </span>
      </figcaption>
      <div className="flex flex-wrap gap-2">
        {ended ? (
          <button
            type="button"
            className={BTN_SECONDARY}
            onClick={() => {
              elapsed.current = 0
              setPaused(false)
            }}
          >
            ↻ Replay the film
          </button>
        ) : (
          <button type="button" className={BTN_SECONDARY} onClick={() => setPaused((p) => !p)}>
            {paused ? '▶ Play' : '⏸ Pause'}
          </button>
        )}
      </div>
    </figure>
  )
}
