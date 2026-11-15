# Leaderboard API

The online leaderboard is a Neon Function (`leaderboard`) running next to a Neon Postgres database.

- Source: `server/leaderboard.ts`. It imports the game engine, so the server **recalculates every score** from the
  submitted design and votes with `evaluateMission()`; the client never sends a score.
- Name rules: `src/leaderboard/name.ts` (shared with the game, tested in `name.test.ts`): 2–24 characters, letters in any
  language, digits, spaces and `. ' _ -`, plus a short English/Spanish blocklist.
- Abuse limits: 6 saves per minute per IP, CORS limited to the game on Azure (`https://victorious-pebble-0fcf34b10.6.azurestaticapps.net`) and local dev.
- Database: Neon project `status-go-leaderboard-use1` (`crimson-shadow-12546769`, aws-us-east-1), table `scores`.
  `DATABASE_URL` is injected by Neon; there are no secrets in this repo.

## Deploy

```bash
bash server/deploy.sh
```

The first run asks you to sign in to Neon in the browser. The script prints the function's `invocation_url`; put it in
`LEADERBOARD_URL` in `src/leaderboard/api.ts` and push.

## Turn it off

Set `LEADERBOARD_URL = ''` in `src/leaderboard/api.ts` and push: every leaderboard button and form disappears.
To remove a single entry: `DELETE FROM scores WHERE id = …;` in the Neon SQL editor.
