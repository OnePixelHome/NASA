# Belle — task checklist (Trajectory Ladder · NASA Space Apps 2026)

Role: MarTech — copy, pitch script, video voice-over and subtitles. Source of truth: `docs/HANDOFF.md` (§3 rules, §8 timeline, §9 drafts).
Branch: `belle` → PR into `main`. Every commit must include `BACKUP.md` (the pre-commit hook enforces it, and the post-commit hook pushes automatically).

**Rules that apply to everything below**
- English only (UI, video, project page).
- Never write a number without a source: NASA or a partner agency (S1–S19), PHYS (standard physics) or GAME (illustrative). When in doubt, leave the number out.
- The video is **30 s maximum**, with English subtitles (or ≤ 7 slides). Anything longer is not eligible.
- No NASA logos, insignia, flags or mission patches. AI-generated images need a visible "AI-generated" watermark.
- Copy lives in `src/engine/catalog.ts`, never in JSX.

---

## 1. Game copy — Sat 15:00–17:00

### 1a. Tooltips (HANDOFF §6-B2)
- [x] Add a `tooltip` field to orbits, instruments, power, downlinks and launchers in `catalog.ts`, with a first draft for all 16 options.
- [ ] Read each tooltip aloud. Would a 14-year-old understand it? 1–2 sentences, with no jargon left unexplained.
- [ ] Check that each one hints at the **trade-off** (what you gain and what it costs), because that is the game's lesson.
- [ ] Check that no tooltip contradicts the lock reasons in `game.ts` (e.g. GEO allows only the weather imager).
- [ ] Commit `docs: tooltip copy for every option` and tell Edgar it's ready to wire up (he owns the UI step, Sun 09:00).

### 1b. Mission briefs (`story` in `SCENARIOS`)
- [ ] Rewrite each brief as: *who needs it* → *what to observe* → *the requirement in numbers*. Gap from `docs/REQUIREMENTS.md` #1: the requirements are only implied today.
  - Crop Watch: up to 60° latitude, revisit ≈ 16 days, global.
  - Storm Watch: up to 40° latitude, regional (the Americas).
  - Polar Ice: up to 80° latitude, revisit ≈ 3 days, works in polar night.
- [x] (done 2026-11-15: the story now says "at least every 6 hours", matching the engine) **Fix the Storm Watch inconsistency.** The story says "a new image every few minutes", but the engine target is `targetRevisitDays: 0.25` (6 hours). Decide with Edgar which one is true, and make the text match the number.
- [ ] Keep each brief to one or two sentences: it's the first screen judges see.

### 1c. Lessons (`why` in `instrumentFit`)
- [ ] These 12 sentences appear as the scorecard's "Lesson learned". Read all 12 and make each one teach a cause → effect ("Radar brings its own light, **so** it works in polar night").
- [ ] Keep the `source` tag of each one honest. If you add a fact, add or change the source.

### 1d. Orbit card blurbs (`blurb` in `ORBITS`)
- [ ] Light polish only: they already work. Keep the ones that mention the ISS and Landsat 9, because they connect the game to NASA data.

### 1e. Verify and ship
- [ ] `pnpm test` and `pnpm build` pass (the copy can't break the balance test, but run them anyway).
- [ ] `pnpm dev` and play all 3 scenarios once on a phone-width window (≈390 px). Check that no text overflows.
- [ ] Update `BACKUP.md`, commit, then open a PR from `belle` to `main`.

---

## 2. 30-second video script + project page summary — Sat 17:00–21:00

### 2a. Video script
- [ ] Start from the script in `docs/SUBMISSION-PLAN.md` §5. It follows the official timeline (team intro → challenge → title → idea + NASA data → future), which the HANDOFF §9 draft skipped.
- [ ] Time it: read it aloud with a stopwatch. Target **≤ 27 s**, which leaves a buffer. At a normal pace, that's about 65–70 words.
- [ ] Play the exact demo path once (Polar Ice → GEO locks → SSO → radar + hybrid → Go/No-Go → 86) and confirm the score and the lock text still match the script. Teammates' PRs (resource panel, Go/No-Go fix) may change them.
- [ ] Write it as a two-column table: **time / voice line / what's on screen**. Thais needs the visual column.
- [ ] Send it to Thais (visuals) and José (screen recording on the deployed build).

### 2b. Project page summary
- [ ] Project page fields: title, one-line pitch, summary (what it is, how it works, benefits, intended impact), NASA data used, AI use.
- [ ] Use the pitch line from HANDOFF §9 as the hook.
- [ ] Map the summary to the judging criteria: **Impact, Creativity, Validity, Relevance, Presentation** (one sentence for each).
- [ ] List every NASA source used (S1, S2, S3, S6, S9, S10, S12, S13, S15, S16, S17, S19) with its URL, from `src/engine/sources.ts`. List S14 (NOAA–NASA GOES-R) and S18 (ESA Sentinel-1) in the "Space agency partner and other data" field; the text is ready in `docs/PROJECT_PAGE.md`.
- [ ] Paste the AI disclosure from HANDOFF §9 word for word.
- [ ] Hand the text to Edgar, who owns the final project page (Sun 14:00–17:00).

---

## 3. Record voice-over — Sun 09:00–12:00
- [ ] Choose a quiet room. Record on a phone held about 20 cm away, with the mic pointing at your mouth.
- [ ] Record 3 takes of each section (hook / demo / close) so Thais can choose the best one.
- [ ] Confirm the total is ≤ 30 s, including pauses.
- [ ] Export as `.m4a` or `.wav`, name the files `vo-hook-1`, `vo-demo-1`, and so on, and share them with Thais.

## 4. Full team playtest — Sun 12:00
- [ ] Play as one of the four roles (Science / Spacecraft / Ground / Launch).
- [ ] Note any copy that confuses someone: tooltip, brief, lock reason or lesson.
- [ ] Fix copy issues the same afternoon in a small PR (before the 18:00 freeze).

## 5. English subtitles — Sun 14:00–17:00
- [ ] Write the `.srt` from the final script, matching the timings in Thais's edit.
- [ ] Keep each line ≤ 42 characters and on screen ≥ 1 s.
- [ ] Burn the subtitles into the video or upload the `.srt`, and check them on a phone screen.
- [ ] Final check: ≤ 30 s, English subtitles, no NASA logos, "AI-generated" watermark on any AI image.

## 6. Deadlines
- [ ] **Sun 18:00** code freeze: no copy changes after this.
- [ ] **Sun 20:00** submit (the hard deadline is 23:59; keep the buffer).
