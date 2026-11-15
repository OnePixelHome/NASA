import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `pnpm build:single` produces one self-contained HTML file (used for quick shareable previews).
// BASE_PATH is set by the GitHub Pages workflow (`/NASA/`); local dev and builds stay at `/`.
export default defineConfig(({ mode }) => ({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  test: { environment: 'node' },
}))
