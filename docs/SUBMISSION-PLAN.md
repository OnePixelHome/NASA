# Submission plan — One Pixel Home · Trajectory Ladder

Sources (read Sat 2026-11-14): Space Apps *Project Submission Guide*, *Judging & Awards Guide*, *Participant FAQs*, *Space Apps Connect Guide* (all on spaceappschallenge.org/resources), and `github.com/nasa/spaceapps`.
Quotes below are from those guides. Where this file and `docs/HANDOFF.md` disagree on a submission rule, this file wins (it comes from the official guides).

---

## 1. Hard rules (break one = not eligible for Global Judging)

| # | Rule | Official wording / source | Our status |
|---|---|---|---|
| R1 | Submit before **Sun Nov 15, 23:59 Lima time** (our Local Event's time zone) | "Any projects saved or submitted past this deadline will not be eligible for judging." | Target 20:00 ✅ |
| R2 | **All 4 members confirmed at the same Local Event** (Lima), not waitlisted, and listed on the team's Members tab | "Teams will not be able to add new members after project submission has closed." | ✅ Confirmed |
| R3 | **Demo: video ≤ 30 s** or **slides ≤ 7** (incl. title and intro) | "Projects that exceed these limits will not be eligible for Global Judging." | We make **both**: 30-s pitch video + 7-slide deck (Belle). Each one must respect its own limit |
| R4 | **Everything in English** (page and linked materials). A video may be spoken in another language **only with English subtitles** | Submission Guide, Language Requirements | ✅ plan: English voice + English subtitles |
| R5 | **Demo and final-project links must be public**: "should not require a password, permission, or registration" | "If judges can't access your project, it can't be evaluated or judged." | **Decided: make `belleavm/NASA` public.** History scanned, no secrets. See §3 |
| R6 | Use **at least one NASA data or resource** | "To be eligible for a Global Award, you must use at least one NASA data or resource." | ✅ S1, S2, S3, S6, S9, S10, S12, S13, S15, S16, S17, S19 (plus S14 NOAA–NASA and S18 ESA as partner agency data) |
| R7 | **All required fields** filled in | "If you have not completed all of the required sections … you will not be able to submit." | Pending: the 8 fields in §2. The guide doesn't mark which ones are optional, so we fill **all 8** |
| R8 | Tick both boxes: **Terms & Conditions** and **"Confirm All Work is Original"** (every external resource listed in References; no copyrighted material without permission) | Judging Guide, Eligibility | Pending: build the References list from **free / licensed materials only**; nothing copyrighted |
| R9 | **No images, video, audio or likeness of anyone under 18** in the demo or project | Submission Guide | ✅ |
| R10 | **SI (AI) rules**: SI "should not be used to come up with your idea". Images and videos need a **visible watermark**. Audio, code and data need an acknowledgement **in descriptive text and metadata**. No NASA logos, flags or mission identifiers in generated content | Project Page Form, "Use of Super Intelligence" | 🟡 Check while producing each asset. See §4 |
| R11 | Click **"Submit for Judging"** and see the confirmation banner. You can resubmit until the deadline; **only the last saved submission is judged** | Submitting Your Project | Pending |

The guides now say **"Super Intelligence (SI)"** instead of "AI" (after a US Executive Order of 2026-09-29). Use "SI" on the project page.

## 2. Project page fields (what judges read)

The page is what judges mainly score: "the majority of judges' evaluation will be based on your project submission". The demo mostly feeds **Presentation**.

| Field | What to write | Owner | Source material |
|---|---|---|---|
| Project Name | **Trajectory Ladder** | — | — |
| High-Level Project Summary | What we built, how it answers the challenge, why it matters. 3–5 sentences | Belle (draft) → Edgar | Pitch line, HANDOFF §9 |
| Link to Project Demo | Public YouTube link to the 30-s video (**Unlisted** is fine: no login needed). The 7-slide deck goes as a public link in the Detailed Description or on the hosted site | Belle | §5 |
| Link to Final Project | Public URL of the game on the **GoDaddy server that Space Apps / NASA provides** (+ the public repo in References) | José | §3 |
| Detailed Project Description | What it does · how it works · benefits · what we hope to achieve · **tools and languages** (Vite, React 19, TypeScript, Tailwind v4, Vitest, Vercel) | Edgar + Belle | README, HANDOFF §5 |
| Use of SI | Every SI tool and what it was used for (table in §4). Only for data collection; **judges don't see this field**, but they do see watermarks and disclosure text in the project | Belle | §4 below |
| NASA Data | Each NASA resource **and how the game uses it** (e.g. "Landsat 9 orbit: 705 km, 98.2°, sets the SSO card; the model reproduces its ~99-min period and 16-day revisit") | Edgar | `src/engine/sources.ts` |
| Space Agency Partner Data & Other References | **Everything else**: open-source libraries, fonts, icons, music, images, even if free | José | `package.json` + §4 |
| Images (optional) | Screenshots of the game, JPG/PNG/GIF ≤ 10 MB (no video or document uploads) | Thais | — |

**Relevance** asks for NASA data "as a core component … rather than a superficial addition". Spell out in the NASA Data field that the orbit physics run on NASA constants and that the tests check Landsat 9 and ISS values.

## 3. Public links (R5) — decided

- **Final Project** = the game published on the **GoDaddy server provided by Space Apps**. José deploys it (this replaces the Vercel plan in HANDOFF).
- **Repo `OnePixelHome/NASA` is public** (moved from `belleavm/NASA` to the One Pixel Home org on Sun 2026-11-15) so judges can read the code and the physics tests (this helps Validity).
  - [x] History scanned for secrets: none found.
  - [ ] Heads-up: once public, the commit author emails are visible (Belle's and Edgar's). Fine if you're both OK with it; otherwise tell me before flipping.
  - [x] Public. Simulator: https://statusgo.earth/
- [ ] Open every link (site, repo, video, deck) in a **private/incognito window** and on a phone.
- [ ] Optional but recommended: request a **FortiGuard Web Filter Classification** for the GoDaddy URL so judges' networks don't block it (category "Education", Company Name "N/A"). Do it as soon as the URL exists.

## 4. SI disclosure and references checklist

- [ ] **Idea origin**: the concept comes from the team's Miro sticky and PRD ("Escalera de Trayectorias"), not from SI. Say so on the page. The SI-proposed ideas in `BACKUP.md` (Windows, 2026-11-14) were not adopted.
**SI tools the team uses, and what each one needs:**

| Tool | Used by / for | What the rules require |
|---|---|---|
| Claude (Anthropic) | Edgar / José: game code, physics engine, docs drafts | Text + metadata acknowledgement: README "Use of SI", in-game About screen, optional header comment in `src/engine/*.ts` |
| Claude Code | Belle: tooltip/brief copy drafts, video editing, slide deck | Copy: text acknowledgement. Video/deck: a watermark on any SI-generated frame or slide image |
| Claude Design | Thais: graphic design (cards, illustrations, visuals) | A visible **"AI-generated"** watermark on every SI-generated image used in the game, deck, video or project page |
| ChatGPT (OpenAI) | Belle: documentation | Text acknowledgement |
| HeyGen | Belle: SI avatar and synthetic voice in the pitch video | **Video**: a visible watermark while the avatar is on screen. **Audio**: say it's SI-generated in the video description and the file metadata. The avatar is Belle's own (adult) likeness, so it's OK under R9 |
| Gemini Flow (Google) — **not used in the end** (Sun 15 Nov), do not list it | Belle: clips for the demo and pitch video (planned) | A visible watermark on each clip; no NASA logos, rockets with real mission markings, flags or patches in the prompts or the output |

- [ ] **Code**: README "Use of AI" → rename to "Use of SI" and list the tools above.
- [ ] **Images and video**: every SI-generated frame, illustration or clip gets a visible **"AI-generated"** watermark. The game's own screen recording isn't SI-generated.
- [ ] **Voice**: the HeyGen voice is synthetic → disclose it in the video description and the file metadata (e.g. the title/comment field when exporting).
- [ ] **Music**: royalty-free only (e.g. the YouTube Audio Library), with its license listed in References, or no music.
- [ ] **No NASA logos, flags or mission patches** anywhere (game, video, thumbnail).
- [ ] **References list — free/licensed materials only, nothing copyrighted**: React, Vite, Tailwind CSS, Vitest, TypeScript (MIT/Apache licences), the Vite template icons in `public/` (or replace them), any font (e.g. Google Fonts, OFL), any royalty-free music or sound, and the NASA pages in `sources.ts`.

## 5. Demo video (≤ 30 s) — follow the official structure

The guide gives a suggested timeline. The draft in HANDOFF §9 skips the team intro and the future vision, so here is a version aligned with the guide (~70 words, aim for 27 s):

| Time | Voice (EN) | On screen |
|---|---|---|
| 0:00–0:02 | "We're One Pixel Home, from Lima, Peru." | Team name + 4 names |
| 0:02–0:05 | "Our challenge: the Space Mission Design Game." | Challenge title |
| 0:05–0:10 | "Meet Trajectory Ladder — where every mission choice ripples down." | Title + tagline |
| 0:10–0:20 | "Pick Polar Ice. Choose a geostationary orbit, and the radar locks: too far away. Switch to a sun-synchronous orbit, like Landsat 9, and the whole chain turns green." | Screen recording: Polar Ice → GEO lock → SSO → green tree → score |
| 0:20–0:30 | "Built on NASA orbital data, it lets any student think like a mission engineer — and see why real missions succeed or fail." | Scorecard + sources screen |

- [ ] Burn the English subtitles into the video (they must be there even with English voice-over, so it's safe to always include them).
- [ ] Use a final duration of **≤ 30.0 s**, and check the exported file (not the timeline).
- [ ] Upload to YouTube as **Unlisted** (or Public), with no age restriction. Test the link logged out.
- [ ] Description: team, challenge, the game link, and an SI note if any SI asset is used.
- [ ] No people under 18 in it (R9).

## 6. Timeline (Lima time)

| When | Step | Who |
|---|---|---|
| **Sat now** | Confirm R2: all 4 registered for the Lima event, not waitlisted, on the Members tab. Check every member's **Full Name** in their profile (it's printed on the certificate) | Each member; Edgar checks the team page |
| Sat now | Ask the **Local Lead**: is there a live pitch or local judging session, and when? Local times "may differ from the global submission times" | Edgar (at the venue) |
| Sat evening | Make the repo public (Belle). José deploys to the GoDaddy server. Request FortiGuard classification | Belle / José |
| Sat 17:00–21:00 | Draft the Summary + Detailed Description + NASA Data text (§2), and the video script (§5) | Belle (+ Edgar for the NASA Data field) |
| Sat 21:00 | **Save Progress** on the project page with the drafts (only the team can see them until submission) | Belle |
| Sun 09:00–12:00 | Record the voice-over. Screen-record the demo path on the deployed build | Belle / José |
| Sun 12:00 | Team playtest. **First "Submit for Judging"** with the drafts and a placeholder demo, as insurance: we can resubmit until 23:59 | Edgar |
| Sun 14:00–17:00 | Edit the video, add subtitles, upload. Finish the References and SI text | Thais / Belle / José / Edgar |
| Sun 18:00 | Code freeze. Final deploy to GoDaddy | José |
| **Sun 20:00** | **Final submit**: final links, tick both checkboxes, Submit for Judging, see the **banner** | Edgar (one person only) |
| Sun 20:00–23:59 | Buffer. Test every link in incognito. Download the participant certificates | All |

## 7. Editing the project page without overwriting each other

- Only **one person edits at a time**: turn **Edit Lock ON**, and tell the team chat before and after. Someone else can still break the lock and overwrite unsaved changes.
- Click **Save Progress** often.
- Write the long text in a shared doc first, then paste it in. That way a lost edit isn't lost work.
- Path to the page: profile icon → **My Team** → **Project** tab → **Edit**.

## 8. Final pre-submit checklist (Sun 20:00)

- [ ] All 4 members on the Members tab, same Lima event, none waitlisted
- [ ] Every required field filled, all in English
- [ ] Demo link opens logged out; video ≤ 30 s; English subtitles
- [ ] Final-project link opens logged out, on a phone too
- [ ] NASA Data field lists each resource and how it's used
- [ ] References list every library, icon, font and music track
- [ ] SI disclosure on the page + in the README/About screen; watermarks on any SI image
- [ ] No NASA logos; no people under 18
- [ ] Both checkboxes ticked → **Submit for Judging** → confirmation banner seen
- [ ] Screenshot of the banner posted to the team chat

## 9. After submitting

- Participant certificate: Profile → Participant Information → "Download Participant Certificate" (PDF, Letter size, from a laptop).
- Results: Global Nominees **Dec 3, 2026** · Global Finalists and Honorable Mentions **Dec 17, 2026** · Global Winners **Jan 26, 2027**.
- Awards that fit us best: **Best Mission Concept**, **Best Storytelling**, **Art & Technology**, **Best Use of Data**.
- Questions during the hackathon: Space Apps Connect (GitHub Discussions at `github.com/nasa/spaceapps`, category **"Project Submission Help"**; you need to be logged in to GitHub).

## 10. How we're scored (each criterion 1–5, at every judging level)

| Criterion | What judges look for | How we score high |
|---|---|---|
| Impact | Size of the problem, reach | Students learn systems thinking on a phone, free, no install |
| Creativity | Novel concept or meaningful improvement | A live dependency tree driven by real formulas, not a quiz |
| Validity | Scientifically grounded, feasible, usable | Physics tests reproduce ISS / Landsat 9 / GEO; mobile-friendly UI |
| Relevance | Directly answers the challenge; NASA data is core | Requirements map (`docs/REQUIREMENTS.md`); NASA constants run the game |
| Presentation | Clear storytelling in the demo **and** the page | §5 script; screenshots on the page; a clear summary |
