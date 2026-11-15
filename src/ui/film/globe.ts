// Software-rendered Earth: an orthographic sphere textured with NASA's Blue Marble image, lit by the Sun,
// turning once per sidereal day. Everything that does not change between frames (which texture row and
// column each pixel shows, how brightly it is lit) is worked out once; a frame is then one table lookup per pixel.
import { SIDEREAL_DAY_S } from '../../engine/physics'
import { EARTH_ANGLE0_DEG, sunDot, unprojectSphere } from './geometry'

export interface Globe {
  /** Square canvas holding the latest frame; draw it scaled to the size needed. */
  canvas: HTMLCanvasElement
  /** Paint the Earth as it is `tS` seconds into the reference day. */
  render(tS: number): void
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** `texture` is an equirectangular world image (longitude −180…180 left to right); `size` is the canvas side in pixels. */
export function createGlobe(texture: ImageData, size: number): Globe {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const frame = ctx.createImageData(size, size)
  const { width: W, height: H, data: tex } = texture
  const R = size / 2

  const n = size * size
  const row = new Int32Array(n) // texture row for the pixel, or -1 outside the disc
  const baseCol = new Float32Array(n) // texture column at the start of the day
  const light = new Float32Array(n) // 0…1 brightness
  const alpha = new Uint8ClampedArray(n) // soft edge
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const i = py * size + px
      const x = (px + 0.5 - R) / R
      const y = (py + 0.5 - R) / R
      const r = Math.hypot(x, y)
      if (r > 1) {
        row[i] = -1
        continue
      }
      const v = unprojectSphere(x, y)
      const latDeg = (Math.asin(Math.max(-1, Math.min(1, v[2]))) * 180) / Math.PI
      const lonDeg = (Math.atan2(v[1], v[0]) * 180) / Math.PI - EARTH_ANGLE0_DEG
      row[i] = Math.min(H - 1, Math.max(0, Math.floor(((90 - latDeg) / 180) * H)))
      baseCol[i] = ((lonDeg + 180) / 360) * W
      // Day side fades into a dim night side across the terminator; the limb darkens a little.
      const day = smoothstep(-0.1, 0.22, sunDot(v))
      const limb = 0.7 + 0.3 * Math.sqrt(Math.max(0, 1 - r * r))
      light[i] = (0.1 + 0.9 * day) * limb
      alpha[i] = Math.max(0, Math.min(1, (1 - r) * R)) * 255
    }
  }

  return {
    canvas,
    render(tS: number) {
      const shift = (tS / SIDEREAL_DAY_S) * W
      const out = frame.data
      for (let i = 0; i < n; i++) {
        const o = i * 4
        if (row[i] < 0) {
          out[o + 3] = 0
          continue
        }
        let col = Math.floor(baseCol[i] - shift) % W
        if (col < 0) col += W
        const t = (row[i] * W + col) * 4
        const l = light[i]
        out[o] = tex[t] * l
        out[o + 1] = tex[t + 1] * l
        // A touch of blue keeps the night side from going flat black.
        out[o + 2] = Math.min(255, tex[t + 2] * l + 10)
        out[o + 3] = alpha[i]
      }
      ctx.putImageData(frame, 0, 0)
    },
  }
}

/** Decode an image URL into pixels. */
export async function loadTexture(url: string): Promise<{ pixels: ImageData; image: HTMLImageElement }> {
  const image = new Image()
  image.src = url
  await image.decode()
  const c = document.createElement('canvas')
  c.width = image.naturalWidth
  c.height = image.naturalHeight
  const x = c.getContext('2d')!
  x.drawImage(image, 0, 0)
  return { pixels: x.getImageData(0, 0, c.width, c.height), image }
}
