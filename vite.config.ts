import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `pnpm build:single` produces one self-contained HTML file (used for quick shareable previews).
// The game is served from the site root (Azure Static Web Apps). BASE_PATH can override it for a sub-path host.
export default defineConfig(({ mode }) => ({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  test: { environment: 'node' },
}))
