// Bundles server/azure/index.ts (with the game engine, pg and @azure/functions) into api-build/, the folder the
// Azure Static Web Apps action deploys as the site's API. Run: npm install --prefix server/azure && node server/azure/build.mjs
import { build } from 'esbuild'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const out = join(here, '..', '..', 'api-build')
mkdirSync(out, { recursive: true })
await build({
  entryPoints: [join(here, 'index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  nodePaths: [join(here, 'node_modules')],
  external: ['@azure/functions-core'], // provided by the Azure Functions worker at run time
  outfile: join(out, 'index.js'),
  logLevel: 'warning',
})
writeFileSync(join(out, 'package.json'), JSON.stringify({ name: 'status-go-api', private: true, main: 'index.js' }, null, 2))
writeFileSync(
  join(out, 'host.json'),
  JSON.stringify({ version: '2.0', extensionBundle: { id: 'Microsoft.Azure.Functions.ExtensionBundle', version: '[4.*, 5.0.0)' } }, null, 2),
)
console.log('API bundle ready:', out)
