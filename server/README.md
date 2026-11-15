# Leaderboard API

The online leaderboard is a managed function of the game's Azure Static Web App (`/api/leaderboard`, same address as
the game, so no CORS is involved) next to an Azure Database for PostgreSQL.

- Source: `server/handler.ts` (all the logic) and `server/azure/index.ts` (Azure Functions entry). It imports the game
  engine, so the server **recalculates every score** from the submitted design and votes with `evaluateMission()`;
  the client never sends a score.
- Name rules: `src/leaderboard/name.ts` (shared with the game, tested in `name.test.ts`): 2–24 characters, letters in any
  language, digits, spaces and `. ' _ -`, plus a short English/Spanish blocklist.
- Abuse limits: 6 saves per minute per IP, CORS limited to the game on Azure (`https://victorious-pebble-0fcf34b10.6.azurestaticapps.net`), its custom domain (`https://statusgo.earth`, `https://www.statusgo.earth`) and local dev.
- Database: Neon project `status-go-leaderboard-use1` (`crimson-shadow-12546769`, aws-us-east-1), table `scores`.
  `DATABASE_URL` is injected by Neon; there are no secrets in this repo.

## Deploy

Every push to `main` builds the API (`server/azure/build.mjs` → `api-build/`) and deploys it with the site
(`.github/workflows/azure-static-web-apps.yml`).

## Turn it off

Set `LEADERBOARD_URL = ''` in `src/leaderboard/api.ts` and push: every leaderboard button and form disappears.
To remove a single entry: `DELETE FROM scores WHERE id = …;` (Azure portal → `statusgo-db` → or any psql client after
adding your IP to the firewall).

## Old Neon Function

`server/leaderboard.ts` and `server/deploy.sh` publish the same handler as a Neon Function next to a Neon database
(project `crimson-shadow-12546769`). The game stopped using it when the leaderboard moved to Azure; kept so the move
can be undone by putting its URL back in `LEADERBOARD_URL`.
