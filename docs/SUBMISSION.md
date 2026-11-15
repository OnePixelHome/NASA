# Submission checklist — Trajectory Ladder

**Hard deadline:** Sunday 2026-11-15, 23:59 (final; late submissions are not eligible).
**Team target:** submit Sunday 20:00. **Code freeze:** Sunday 18:00.

Status as of Saturday 2026-11-14, afternoon: ✅ done · 🟡 in progress · ❌ not done.
Whoever closes an item changes its status here and adds the evidence (link or date).

## The six must-haves

| # | Item | Owner | Status | How to verify |
| --- | --- | --- | --- | --- |
| 1 | Public repository | Belle (repo owner) | ❌ | Open `github.com/belleavm/NASA` in a private browser window, signed out. It must load. Today it is private. |
| 2 | Public demo URL (GitHub Pages, https://belleavm.github.io/NASA/) that works on a phone | José | 🟡 | Open the URL on a phone on mobile data, signed out of GitHub. Play one mission to the scorecard. |
| 3 | 30-second video with English subtitles | Belle, Thais | ❌ | Length is 30 s or less. Subtitles are in English and burned in or enabled by default. The link opens signed out. |
| 4 | All sources cited | Edgar | 🟡 | In the game: every number has a source tag and the About screen lists every source (PRs #1, #4, #7). On the project page: the "NASA data" table from `docs/PROJECT_PAGE.md` is pasted in. |
| 5 | No NASA logos, insignia, flags or mission patches | Thais, Edgar | 🟡 | The code has none today. Re-check after the visual redesign: the game, the video, the slides, the favicon and every image. |
| 6 | MIT license present | Edgar | ✅ | `LICENSE` is in the repo root (MIT, "Copyright (c) 2026 One Pixel Home") and GitHub detects it as MIT. |

## Before making the repository public (item 1)

- [ ] All open pull requests are merged or closed, and `main` passes `pnpm test` and `pnpm build`.
- [ ] No secrets in the repo or its history. A pattern scan on 2026-11-14 over every branch found no tokens, keys or
      passwords and no `.env` files. Repeat it after the last merge.
- [ ] The team is comfortable with what becomes visible: `BACKUP.md` and `AGENTS.md` are internal notes in Spanish and
      mention local folder paths. They contain no secrets, but judges will be able to read them.
- [ ] `README.md` starts with the project description in English and links to the live demo.
- [ ] The repository description on GitHub is in English (today: "Proyecto personal NASA").

## Demo URL (item 2)

- [x] `.github/workflows/deploy-pages.yml` runs `pnpm test` and `pnpm build` (base `/NASA/`) and publishes `dist` on every push to `main`.
- [ ] Settings → Pages → Source is "GitHub Actions" (needs repo admin: Belle). The legacy branch source serves the raw `index.html` and the game does not load.
- [ ] The Pages site is public, so judges are not asked to log in.
- [ ] Tested on a real phone at about 390 px wide: no sideways scrolling, every button reachable with a thumb.
- [ ] Tested in a second browser.
- [ ] The URL is in the README, in the GitHub repository's "About" box and on the project page.

## Video or slides (item 3)

- [ ] **Video: 30 seconds at most**, with English subtitles. Or slides: 7 at most, including the title slide.
      Longer is **not eligible for Global Judging**.
- [ ] Recorded from the public demo URL, not from a local build.
- [ ] Hosted where anyone can watch without an account, and the link works signed out.
- [ ] No NASA logos, insignia, flags or mission patches in any frame.
- [ ] Any AI-generated image, voice or music is disclosed on the project page; AI-generated images show a visible
      "AI-generated" watermark.

## Project page

- [ ] Every field is filled from `docs/PROJECT_PAGE.md`, with all **TODO** items resolved.
- [ ] Everything is in English.
- [ ] NASA data: at least one NASA source is listed with how it was used (required for Global Award eligibility).
- [ ] Use of AI: the disclosure is present and matches the game's About screen.
- [ ] Links to the demo, the video and the repository open in a private browser window.
- [ ] The right challenge is selected: Space Mission Design Game.
- [ ] All four team members are on the team page.

## Game content

- [ ] All user-facing text is in English and reviewed by Belle (`docs/COPY.md`).
- [ ] Mentor answers applied to the catalog and the balance test re-run (HANDOFF §6-B6), or the values stay tagged
      "illustrative".
- [x] `public/favicon.svg` is the team's own (planet, tilted orbit and satellite in the game palette, no NASA marks);
      the unused Vite icon sprite `public/icons.svg` was deleted (2026-11-15).
- [ ] Full team playtest done (planned Sunday 12:00): each mission played to the scorecard at least once.

## Final hour

- [ ] Code freeze at 18:00: only fixes for things that block the demo.
- [ ] Submit at 20:00. Take a screenshot of the confirmation.
- [ ] After submitting, open the public project page signed out and click every link once more.
