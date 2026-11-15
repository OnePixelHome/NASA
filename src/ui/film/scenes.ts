// Scene drawing for the mission film, on a 640 × 400 canvas. No game rules here: every position and state
// comes in from the engine (missionDay) through the geometry module.
import type { MissionDay } from '../../engine/missionDay'
import type { ShipParts } from '../theme'
import { groundDirection, hiddenByEarth, orbitDirection, project, scale, SUN } from './geometry'
import type { Globe } from './globe'
import { ease } from './timing'

export const FILM_W = 640
export const FILM_H = 400
const OUT = '#0B1026'
const INK = '#F2F4FF'

type Ctx = CanvasRenderingContext2D

/** Small repeatable random numbers, so the film looks the same every time. */
function lcg(seed: number) {
  let s = seed
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296
}
const STARS = (() => {
  const r = lcg(7)
  return Array.from({ length: 110 }, () => ({ x: r() * FILM_W, y: r() * FILM_H, size: 0.5 + r() * 1.3, phase: r() * 6.28 }))
})()
const SMOKE = (() => {
  const r = lcg(21)
  return Array.from({ length: 46 }, (_, i) => ({ born: 1.9 + i * 0.055, dir: r() * 2 - 1, rise: 0.4 + r(), size: 0.7 + r() * 0.6 }))
})()
const CLOUDS = (() => {
  const r = lcg(3)
  return Array.from({ length: 7 }, (_, i) => ({ x: r() * FILM_W, height: 260 + i * 150 + r() * 60, w: 90 + r() * 110 }))
})()

const mix = (a: number[], b: number[], t: number) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`

export function drawStars(ctx: Ctx, alpha: number, time: number) {
  if (alpha <= 0) return
  ctx.save()
  ctx.fillStyle = INK
  for (const s of STARS) {
    ctx.globalAlpha = alpha * (0.45 + 0.4 * Math.sin(time * 1.3 + s.phase) ** 2)
    ctx.beginPath()
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function shape(ctx: Ctx, d: string, fill: string, line = 4) {
  const p = new Path2D(d)
  ctx.fillStyle = fill
  ctx.fill(p)
  if (line) {
    ctx.lineWidth = line
    ctx.strokeStyle = OUT
    ctx.lineJoin = 'round'
    ctx.stroke(p)
  }
}
function box(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string, line = 4) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fillStyle = fill
  ctx.fill()
  if (line) {
    ctx.lineWidth = line
    ctx.strokeStyle = OUT
    ctx.stroke()
  }
}

// The drawings below use the 240 × 320 coordinates of the design's ship (docs/design/handoff/Ship.tsx).

/** Launch vehicle with its nose fairing closed over the spacecraft. */
function drawRocket(ctx: Ctx, launcher: ShipParts['launcher']) {
  const kind = launcher ?? 'medium'
  if (kind === 'small') {
    shape(ctx, 'M106 270 L94 290 L106 286 Z M134 270 L146 290 L134 286 Z', '#FF8552')
    box(ctx, 106, 150, 28, 130, 10, INK)
    ctx.fillStyle = '#FF8552'
    ctx.fillRect(108, 222, 24, 10)
    shape(ctx, 'M106 160 Q120 96 134 160 Z', '#62B4FF')
  } else if (kind === 'medium') {
    shape(ctx, 'M100 270 L84 300 L100 294 Z M140 270 L156 300 L140 294 Z', '#FF8552')
    box(ctx, 100, 146, 40, 150, 12, INK)
    ctx.fillStyle = '#FF8552'
    ctx.fillRect(102, 222, 36, 12)
    shape(ctx, 'M100 158 Q120 84 140 158 Z', '#62B4FF')
  } else {
    shape(ctx, 'M72 228 Q72 210 84 206 Q96 210 96 228 L96 300 L72 300 Z', INK)
    shape(ctx, 'M144 228 Q144 210 156 206 Q168 210 168 228 L168 300 L144 300 Z', INK)
    box(ctx, 98, 140, 44, 166, 12, INK)
    ctx.fillStyle = '#FF8552'
    ctx.fillRect(100, 222, 40, 12)
    shape(ctx, 'M98 154 Q120 74 142 154 Z', '#62B4FF')
  }
}
/** Where the engines are, in ship coordinates: [x, y, width] per nozzle. */
const NOZZLES: Record<string, [number, number, number][]> = {
  small: [[120, 282, 18]],
  medium: [[120, 298, 26]],
  heavy: [
    [84, 302, 18],
    [120, 308, 28],
    [156, 302, 18],
  ],
}

/** The spacecraft with the player's parts. `deploy` unfolds the solar panels (0–1); `antenna` raises the dish (0–1). */
function drawSpacecraft(ctx: Ctx, parts: ShipParts, deploy: number, antenna: number) {
  const panel = (x: number, y: number, w: number, h: number) => box(ctx, x, y, w, h, 7, '#62B4FF')
  // Panels unfold outward from the body's edges.
  const fold = (pivotX: number, draw: () => void) => {
    ctx.save()
    ctx.translate(pivotX, 0)
    ctx.scale(Math.max(0.02, deploy), 1)
    ctx.translate(-pivotX, 0)
    draw()
    ctx.restore()
  }
  if (parts.power) {
    const [lx, rx, w, y, h] = parts.power === 'small' ? [40, 166, 34, 108, 38] : parts.power === 'big' ? [6, 166, 68, 102, 50] : [22, 166, 52, 104, 46]
    fold(92, () => {
      box(ctx, 72, 122, 22, 8, 3, '#C3CAEE', 3)
      panel(lx, y, w, h)
    })
    fold(148, () => {
      box(ctx, 146, 122, 22, 8, 3, '#C3CAEE', 3)
      panel(rx, y, w, h)
    })
    if (parts.power === 'hybrid') box(ctx, 100, 158, 40, 18, 6, '#62B4FF')
  }
  box(ctx, 92, 96, 56, 64, 16, INK)
  ctx.beginPath()
  ctx.arc(120, 118, 9, 0, Math.PI * 2)
  ctx.fillStyle = '#1F2852'
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = OUT
  ctx.stroke()

  if (parts.antenna && antenna > 0) {
    ctx.save()
    ctx.translate(142, 100)
    ctx.scale(antenna, antenna)
    ctx.translate(-142, -100)
    const [mx, my] = parts.antenna === 'small' ? [170, 68] : parts.antenna === 'polar' ? [164, 78] : [160, 82]
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(142, 100)
    ctx.lineTo(mx, my)
    ctx.lineWidth = 7
    ctx.strokeStyle = OUT
    ctx.stroke()
    ctx.lineWidth = 3
    ctx.strokeStyle = '#C3CAEE'
    ctx.stroke()
    if (parts.antenna === 'small') {
      ctx.beginPath()
      ctx.arc(173, 64, 8, 0, Math.PI * 2)
      ctx.fillStyle = '#FF93B8'
      ctx.fill()
      ctx.lineWidth = 4
      ctx.strokeStyle = OUT
      ctx.stroke()
    } else shape(ctx, parts.antenna === 'polar' ? 'M150 74 Q172 96 194 58 Z' : 'M140 76 Q174 112 212 44 Z', '#FF93B8')
    ctx.restore()
  }

  if (parts.payload === 'camera') {
    box(ctx, 102, 70, 36, 28, 7, '#7FE28E')
    for (const [r, c, l] of [[16, '#1F2852', 4], [8, '#4FD8C8', 3]] as const) {
      ctx.beginPath()
      ctx.arc(120, 64, r, 0, Math.PI * 2)
      ctx.fillStyle = c
      ctx.fill()
      ctx.lineWidth = l
      ctx.strokeStyle = OUT
      ctx.stroke()
    }
  } else if (parts.payload === 'prism') {
    box(ctx, 100, 80, 40, 18, 6, '#7FE28E')
    shape(ctx, 'M120 42 L142 80 L98 80 Z', INK)
  } else if (parts.payload === 'radar') {
    box(ctx, 114, 74, 12, 24, 4, '#7FE28E', 3.5)
    shape(ctx, 'M94 58 Q120 96 146 58 Z', '#7FE28E')
  } else if (parts.payload === 'weather') {
    box(ctx, 102, 56, 36, 42, 11, '#7FE28E')
    ctx.beginPath()
    ctx.arc(120, 76, 10, 0, Math.PI * 2)
    ctx.fillStyle = '#1F2852'
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = OUT
    ctx.stroke()
    box(ctx, 96, 48, 48, 10, 5, INK, 3.5)
  }
}

// ---------- Act 1: launch ----------
export function drawLaunch(ctx: Ctx, t: number, parts: ShipParts) {
  const climb = ease((t - 2.4) / 4.4) // 0 on the pad, 1 in space
  const sky = ctx.createLinearGradient(0, 0, 0, FILM_H)
  sky.addColorStop(0, mix([30, 44, 110], [5, 8, 26], climb))
  sky.addColorStop(1, mix([255, 170, 96], [11, 16, 38], climb))
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, FILM_W, FILM_H)
  drawStars(ctx, climb, t)

  // The camera follows the rocket, so the ground and the clouds fall away below.
  const drop = climb * 620
  for (const c of CLOUDS) {
    const y = FILM_H - c.height + drop * 2.2
    if (y < -60 || y > FILM_H + 60) continue
    ctx.fillStyle = `rgba(242,244,255,${0.5 * (1 - climb)})`
    ctx.beginPath()
    ctx.ellipse(c.x, y, c.w, 16, 0, 0, Math.PI * 2)
    ctx.ellipse(c.x + c.w * 0.3, y - 10, c.w * 0.55, 14, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  const shake = t > 2.2 && t < 4.6 ? Math.sin(t * 61) * 1.6 : 0
  const groundY = 330 + drop
  const s = 0.95
  const rocketY = 330 - ease((t - 2.4) / 2.2) * 40 + shake // where the rocket's base sits on screen

  // Pad and service tower.
  if (groundY < FILM_H + 140) {
    ctx.fillStyle = '#34407A'
    ctx.fillRect(404, groundY - 210, 14, 210)
    ctx.fillRect(372, groundY - 170, 34, 6)
    ctx.fillRect(372, groundY - 110, 34, 6)
    ctx.fillStyle = '#1F2852'
    ctx.fillRect(0, groundY, FILM_W, FILM_H)
    ctx.fillStyle = '#34407A'
    ctx.fillRect(0, groundY, FILM_W, 4)
    ctx.fillStyle = '#C3CAEE'
    ctx.fillRect(248, groundY - 6, 144, 8)
  }

  // Exhaust smoke billows from the pad and stays behind with it.
  for (const p of SMOKE) {
    const age = t - p.born
    if (age <= 0) continue
    const a = Math.max(0, 0.6 - age * 0.11)
    if (!a) continue
    const spread = 1 - Math.exp(-age * 1.1)
    ctx.fillStyle = `rgba(195,202,238,${a})`
    ctx.beginPath()
    ctx.arc(320 + p.dir * (24 + 130 * spread), groundY - 8 - p.rise * 12 * spread, (12 + 30 * spread) * p.size, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.save()
  ctx.translate(320 - 120 * s + shake, rocketY - 306 * s)
  ctx.scale(s, s)
  if (t > 1.9) {
    const flick = 0.75 + 0.25 * Math.sin(t * 47) * Math.sin(t * 31)
    const power = Math.min(1, (t - 1.9) / 0.6)
    for (const [x, y, w] of NOZZLES[parts.launcher ?? 'medium']) {
      const len = (70 + 60 * power) * flick
      const g = ctx.createLinearGradient(0, y, 0, y + len)
      g.addColorStop(0, '#FFF3C4')
      g.addColorStop(0.35, '#FFD166')
      g.addColorStop(1, 'rgba(255,133,82,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(x - w / 2, y)
      ctx.quadraticCurveTo(x, y + len * 1.25, x + w / 2, y)
      ctx.fill()
    }
  }
  drawRocket(ctx, parts.launcher)
  ctx.restore()

  // Countdown.
  const label = t < 0.8 ? '3' : t < 1.6 ? '2' : t < 2.4 ? '1' : t < 3.6 ? 'Liftoff' : ''
  if (label) {
    const into = t < 2.4 ? (t % 0.8) / 0.8 : (t - 2.4) / 1.2
    ctx.save()
    ctx.globalAlpha = Math.max(0, 1 - into * into)
    ctx.fillStyle = INK
    ctx.font = '600 46px Fredoka, ui-rounded, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, FILM_W / 2, 74)
    ctx.restore()
  }
}

// ---------- Acts 2 and 3: close-up above the Earth ----------
function drawHorizon(ctx: Ctx, t: number) {
  const cx = 320
  const cy = 1245
  const r = 900
  ctx.save()
  ctx.shadowColor = '#7FC4FF'
  ctx.shadowBlur = 34
  const g = ctx.createRadialGradient(cx, cy, r - 120, cx, cy, r)
  g.addColorStop(0, '#123A8C')
  g.addColorStop(0.75, '#2B6FD1')
  g.addColorStop(1, '#8CCBFF')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // Cloud bands drifting slowly along the limb.
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.clip()
  ctx.strokeStyle = 'rgba(242,244,255,0.22)'
  ctx.lineCap = 'round'
  for (let i = 0; i < 6; i++) {
    const a0 = -Math.PI / 2 - 0.34 + i * 0.13 + t * 0.006
    ctx.lineWidth = 6 + (i % 3) * 5
    ctx.beginPath()
    ctx.arc(cx, cy, r - 18 - i * 11, a0, a0 + 0.07 + (i % 2) * 0.05)
    ctx.stroke()
  }
  ctx.restore()
}

/** The spacecraft seen up close, instrument pointing down at the Earth. */
function placeSpacecraft(ctx: Ctx, draw: () => void) {
  ctx.save()
  ctx.translate(320, 168)
  ctx.rotate(Math.PI)
  ctx.scale(1.15, 1.15)
  ctx.translate(-120, -124)
  draw()
  ctx.restore()
}

export function drawDeploy(ctx: Ctx, t: number, parts: ShipParts) {
  ctx.fillStyle = '#05081A'
  ctx.fillRect(0, 0, FILM_W, FILM_H)
  drawStars(ctx, 1, t)
  drawHorizon(ctx, t)
  // The spent upper stage drifts away.
  const fade = Math.max(0, 1 - t / 3.6)
  if (fade > 0) {
    ctx.save()
    ctx.globalAlpha = fade
    ctx.translate(210 - 34 * t, 250 + 22 * t)
    ctx.rotate(-0.7 - 0.12 * t)
    ctx.scale(0.42, 0.42)
    ctx.translate(-120, -230)
    drawRocket(ctx, parts.launcher)
    ctx.restore()
  }
  placeSpacecraft(ctx, () => drawSpacecraft(ctx, parts, ease((t - 0.7) / 2.2), ease((t - 2.9) / 1)))
}

/** `photo` is the patch of the Earth image shown as the first picture. */
export function drawFirstLight(ctx: Ctx, t: number, parts: ShipParts, photo: { image: CanvasImageSource; sx: number; sy: number; sw: number; sh: number } | null) {
  ctx.fillStyle = '#05081A'
  ctx.fillRect(0, 0, FILM_W, FILM_H)
  drawStars(ctx, 1, t + 5)
  drawHorizon(ctx, t + 5)
  // Instrument beam sweeping the ground.
  const sweep = Math.sin(t * 1.6) * 34
  ctx.fillStyle = `rgba(255,209,102,${0.16 + 0.08 * Math.sin(t * 6)})`
  ctx.beginPath()
  ctx.moveTo(320, 250)
  ctx.lineTo(250 + sweep, FILM_H)
  ctx.lineTo(390 + sweep, FILM_H)
  ctx.closePath()
  ctx.fill()
  placeSpacecraft(ctx, () => drawSpacecraft(ctx, parts, 1, 1))
  // Shutter flash.
  const flash = Math.max(0, 1 - Math.abs(t - 1.25) / 0.35)
  if (flash > 0) {
    ctx.fillStyle = `rgba(242,244,255,${0.75 * flash})`
    ctx.beginPath()
    ctx.arc(320, 252, 20 + 70 * (1 - flash), 0, Math.PI * 2)
    ctx.fill()
  }
  // The first picture slides in.
  const show = ease((t - 1.5) / 0.9)
  if (show > 0 && photo) {
    ctx.save()
    ctx.globalAlpha = show
    ctx.translate(505, 150 + 26 * (1 - show))
    ctx.rotate(0.05)
    box(ctx, -98, -72, 196, 150, 10, INK, 4)
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(photo.image, photo.sx, photo.sy, photo.sw, photo.sh, -88, -62, 176, 112)
    ctx.fillStyle = '#C3CAEE'
    ctx.fillRect(-88, 58, 96, 8)
    ctx.restore()
  }
}

// ---------- Acts 4 and 5: a day in orbit, and the ending ----------
export interface DayFrame {
  day: MissionDay
  /** Index into day.samples for this frame. */
  index: number
  inclDeg: number
  /** Orbit radius in Earth radii. */
  radius: number
  /** Orbit color token value. */
  color: string
  globe: Globe | null
  /** Earth radius on screen, in pixels. */
  earthPx: number
  time: number
}

export function drawDay(ctx: Ctx, f: DayFrame) {
  const cx = FILM_W / 2
  const cy = FILM_H / 2 + 6
  const R = f.earthPx
  const s = f.day.samples[f.index]
  const at = (v: { x: number; y: number }) => [cx + v.x * R, cy + v.y * R] as const

  ctx.fillStyle = '#05081A'
  ctx.fillRect(0, 0, FILM_W, FILM_H)
  drawStars(ctx, 1, f.time)

  // The Sun, off to the side it really shines from.
  const sun = project(SUN)
  const [sx, sy] = [cx + Math.sign(sun.x) * (FILM_W / 2 - 34), cy + sun.y * 60]
  const glow = ctx.createRadialGradient(sx, sy, 2, sx, sy, 46)
  glow.addColorStop(0, 'rgba(255,243,196,1)')
  glow.addColorStop(0.3, 'rgba(255,209,102,0.55)')
  glow.addColorStop(1, 'rgba(255,209,102,0)')
  ctx.fillStyle = glow
  ctx.fillRect(sx - 50, sy - 50, 100, 100)

  // Orbit path: the far half first, so the Earth covers it.
  const periodS = f.day.periodMin * 60
  const ring = Array.from({ length: 181 }, (_, i) => project(scale(orbitDirection(f.inclDeg, (i / 180) * Math.PI * 2), f.radius)))
  const strokeRing = (front: boolean) => {
    ctx.beginPath()
    let pen = false
    for (const v of ring) {
      const visible = front ? v.depth >= 0 : v.depth < 0 && !hiddenByEarth(v)
      if (!visible) {
        pen = false
        continue
      }
      const [x, y] = at(v)
      if (pen) ctx.lineTo(x, y)
      else ctx.moveTo(x, y)
      pen = true
    }
    ctx.strokeStyle = f.color
    ctx.globalAlpha = front ? 0.75 : 0.3
    ctx.lineWidth = 1.5
    ctx.setLineDash(front ? [] : [3, 4])
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1
  }
  strokeRing(false)

  // Atmosphere, then the Earth itself.
  const halo = ctx.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.12)
  halo.addColorStop(0, 'rgba(127,196,255,0.5)')
  halo.addColorStop(1, 'rgba(127,196,255,0)')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(cx, cy, R * 1.12, 0, Math.PI * 2)
  ctx.fill()
  if (f.globe) {
    f.globe.render(s.tS)
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(f.globe.canvas, cx - R, cy - R, R * 2, R * 2)
  } else {
    ctx.fillStyle = '#2B6FD1'
    ctx.beginPath()
    ctx.arc(cx, cy, R, 0, Math.PI * 2)
    ctx.fill()
  }

  // Ground already flown over, painted on the surface. It turns with the Earth.
  ctx.fillStyle = f.color
  for (let i = Math.max(0, f.index - 1500); i <= f.index; i += 2) {
    const p = f.day.samples[i]
    const v = project(groundDirection(p.latDeg, p.lonDeg, s.tS))
    if (v.depth <= 0.02) continue
    const [x, y] = at(v)
    ctx.globalAlpha = 0.2 + 0.6 * ((i - (f.index - 1500)) / 1500)
    ctx.fillRect(x - 0.9, y - 0.9, 1.8, 1.8)
  }
  ctx.globalAlpha = 1

  // Ground station.
  const st = f.day.station
  const stV = st ? project(groundDirection(st.latDeg, st.lonDeg, s.tS)) : null
  if (stV && stV.depth > 0) {
    const [x, y] = at(stV)
    ctx.fillStyle = '#FF93B8'
    ctx.strokeStyle = OUT
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x, y - 6)
    ctx.lineTo(x + 5, y + 4)
    ctx.lineTo(x - 5, y + 4)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
  }

  strokeRing(true)

  // The spacecraft.
  const u = (2 * Math.PI * s.tS) / periodS
  const sat = project(scale(orbitDirection(f.inclDeg, u), f.radius))
  if (!hiddenByEarth(sat)) {
    const [x, y] = at(sat)
    // Downlink beam during a pass, when both ends are in view.
    if (s.contact && stV && stV.depth > 0) {
      const [gx, gy] = at(stV)
      ctx.strokeStyle = '#FF93B8'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 4])
      ctx.lineDashOffset = -f.time * 40
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(gx, gy)
      ctx.stroke()
      ctx.setLineDash([])
    }
    ctx.save()
    ctx.translate(x, y)
    ctx.globalAlpha = s.sunlit ? 1 : 0.42
    if (s.sunlit) {
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 14)
      g.addColorStop(0, 'rgba(242,244,255,0.55)')
      g.addColorStop(1, 'rgba(242,244,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(-14, -14, 28, 28)
    }
    box(ctx, -11, -3, 7, 6, 1.5, f.color, 1.2)
    box(ctx, 4, -3, 7, 6, 1.5, f.color, 1.2)
    box(ctx, -4, -4, 8, 8, 2, INK, 1.2)
    ctx.restore()
  }
}

export function drawEnd(ctx: Ctx, f: DayFrame, t: number) {
  drawDay(ctx, f)
  ctx.fillStyle = `rgba(5,8,26,${0.45 * ease(t / 1.2)})`
  ctx.fillRect(0, 0, FILM_W, FILM_H)
  ctx.save()
  ctx.globalAlpha = ease((t - 0.3) / 1)
  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.font = '600 40px Fredoka, ui-rounded, system-ui, sans-serif'
  ctx.fillText('Mission complete', FILM_W / 2, FILM_H / 2 + 12)
  ctx.restore()
}
