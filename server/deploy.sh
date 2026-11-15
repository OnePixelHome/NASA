#!/usr/bin/env bash
# Builds server/leaderboard.ts (with the game engine) and deploys it as the Neon Function "leaderboard".
# Needs a Neon login: the first run opens the browser (neon login). DATABASE_URL is injected by Neon, so no secret
# passes through this script or the repo.
set -euo pipefail

PROJECT_ID="crimson-shadow-12546769"   # Neon project status-go-leaderboard-use1 (aws-us-east-1)
BRANCH_ID="br-nameless-bread-bc9remdp" # its default branch "main"
REGISTRY="${NPM_REGISTRY:-https://registry.yarnpkg.com/}" # this network cannot reach registry.npmjs.org

REPO="$(cd "$(dirname "$0")/.." && pwd)"
BUILD="${TEMP:-${TMPDIR:-/tmp}}/sg-build"
if command -v cygpath >/dev/null 2>&1; then REPO="$(cygpath -m "$REPO")"; BUILD="$(cygpath -m "$BUILD")"; fi

mkdir -p "$BUILD" && cd "$BUILD"
[ -f package.json ] || echo '{"name":"sg-build","private":true}' > package.json
npm install --no-audit --no-fund --registry="$REGISTRY" pg@8 esbuild@0.25 neon@latest

node --input-type=module -e "
import { build } from 'esbuild'
await build({
  entryPoints: ['$REPO/server/leaderboard.ts'], bundle: true, platform: 'node', target: 'node24', format: 'esm', minify: true,
  nodePaths: ['$BUILD/node_modules'], outfile: 'dist/index.mjs', logLevel: 'warning',
  banner: { js: \"import{createRequire as ___cr}from'module';import{fileURLToPath as ___f}from'url';import{dirname as ___d}from'path';const require=___cr(import.meta.url);const __filename=___f(import.meta.url);const __dirname=___d(__filename);\" },
})
"
echo "Bundle ready: $BUILD/dist/index.mjs"

npx neon me >/dev/null 2>&1 || npx neon login
npx neon functions deploy leaderboard --src dist/index.mjs --no-bundle --project-id "$PROJECT_ID" --branch "$BRANCH_ID"
npx neon functions get leaderboard --project-id "$PROJECT_ID" --branch "$BRANCH_ID"
