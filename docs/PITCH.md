# Pitch & presentation — STATUS: GO

**Name:** **STATUS: GO — Mission Simulator** (short form *Status: GO*; keep the colon and capitals in the logo). Chosen Sun 2026-11-15, replacing "Trajectory Ladder". Call it a **simulator**, never a game. The only exception is the official challenge name, *Space Mission Design Game*.
Hashtag: `#StatusGoMission`.

Owner: Belle. Rewritten Sun 2026-11-15 around three points: the problem (managing a mission's limited resources), the target user, and the NASA resources used.
Every number below was read from the engine on that commit (Polar Ice demo path). If the catalog changes, re-check §4.

**Rules (official Submission Guide):** video **≤ 30 s** with **English subtitles**; slides **≤ 7 including title and intro**;
must show **team name, members, challenge**, an image of the project, the user experience, and how NASA data makes it possible.
Over the limit = not eligible for Global Judging. No NASA logos, flags or patches. SI-generated frames (HeyGen avatar,
Gemini Flow clips, Claude Design art) carry a visible **"AI-generated"** label. Nobody under 18 in any frame.

---

## 1. Message: problem, user, NASA resources

Every piece of the pitch answers three questions, in this order:

| Question | Answer |
|---|---|
| **The problem we fix** | A space mission has a **fixed budget, mass, power and data capacity**. Overspend one and the mission fails, because every choice uses up resources the next one needs. Students learn orbits, instruments and rockets one at a time, and rarely get to practise **managing limited resources to design a mission that succeeds**. |
| **Who it's for** | **High-school and early university students** with no engineering background, playing alone or in classroom groups of up to four, one role each. It runs free in the browser, on a phone or a projector. |
| **The NASA resources it's built on** | **Landsat 9** (the sun-synchronous orbit and the multispectral camera), **NASA Earth Fact Sheet** (the constants behind every orbit formula), **CubeSat 101** (the 10% budget reserve rule), **ISS** (the 51.6° low orbit), **Design and Develop Science Missions** (the four mission segments = the four team roles), **Blue Marble** (the Earth in the mission film). |

**Pitch line**

> **STATUS: GO — Mission Simulator.** *Learn to manage a mission's budget, mass, power and data — on any phone.*

## 2. 30-second video script

Official timeline: intro → challenge → title → idea + NASA data → future. **72 words** ≈ 27–28 s at a calm pace.
Read it aloud with a stopwatch before recording. The challenge name is shown on screen rather than spoken, to save time.

| Time | Voice (HeyGen avatar) | On screen | Label |
|---|---|---|---|
| 0:00–0:03 | "Hi, I'm Belle, from One Pixel Home in Lima, Peru." | Avatar + team name + 4 names + card "Challenge: Space Mission Design Game" | AI-generated (avatar) |
| 0:03–0:08 | "Every mission has a fixed budget, mass, power and data. Overspend one, it fails." | The four resource meters filling up; one turns red | — |
| 0:08–0:12 | "Status: GO is a mission simulator for high-school and university students." | Landing page `● STATUS: GO` → Start mission | — |
| 0:12–0:22 | "Pick an orbit, instrument and rocket, and watch budget, mass, power and data run out." | Screen recording: Polar Ice → GEO locks the radar → SSO → hybrid power → medium rocket; the four meters move live | Film art: AI-generated (already labelled in the simulator) |
| 0:22–0:30 | "Built on NASA data — Landsat 9, CubeSat 101, the Earth Fact Sheet. Learn to manage a real mission — on any phone." | Scorecard **86/100** → the Earth from the film (credit: NASA Earth Observatory) → play URL | — |

**Recording notes**
- Record the simulator from the **public URL** (https://statusgo.earth/), not a local build.
- Zoom in on the **resource meters**: they are the hero of this version.
- Gemini Flow was planned for clips but was not used in the end, so there are no such clips to watermark.
- HeyGen voice and avatar are SI-generated → say so in the YouTube description and the file metadata.
- Music: none, or royalty-free with its licence listed in References.
- Check the **exported file's** duration is ≤ 30.0 s.

### Subtitles (`pitch.srt`, adjust timings to the final edit)

```srt
1
00:00:00,000 --> 00:00:03,000
Hi, I'm Belle, from
One Pixel Home in Lima, Peru.

2
00:00:03,000 --> 00:00:05,500
Every mission has a fixed
budget, mass, power and data.

3
00:00:05,500 --> 00:00:08,000
Overspend one, it fails.

4
00:00:08,000 --> 00:00:12,000
Status: GO is a mission simulator
for high-school and university students.

5
00:00:12,000 --> 00:00:16,500
Pick an orbit,
instrument and rocket,

6
00:00:16,500 --> 00:00:21,500
and watch budget, mass,
power and data run out.

7
00:00:21,500 --> 00:00:25,000
Built on NASA data — Landsat 9,
CubeSat 101, the Earth Fact Sheet.

8
00:00:25,000 --> 00:00:27,500
Learn to manage a real mission —

9
00:00:27,500 --> 00:00:29,500
on any phone.
```

## 3. Slide deck (7 slides, including title)

Big type, few words, one visual per slide. Speaker notes are for a live pitch; they don't appear on the slides.

### Slide 1 — Title
- **STATUS: GO — Mission Simulator**
- *Learn to manage a mission's budget, mass, power and data.*
- Team **One Pixel Home** · Lima, Peru · NASA Space Apps Challenge 2026
- Challenge: **Space Mission Design Game**
- Edgar Cardona — software architect · José Gómez — full-stack developer · Thais Rodríguez — product designer · Belle Vásquez Machado — MarTech specialist
- Visual: landing page with the globe and the orbit

> Notes: "We're One Pixel Home, four people from Lima, and this is Status: GO, a mission simulator."

### Slide 2 — The problem: limited resources
- **Every mission has a fixed budget, mass, power and data.**
- One choice uses up what the next one needs: a bigger instrument needs more power, more power needs a heavier spacecraft, a heavier spacecraft needs a bigger rocket.
- **Overspend one, and the mission fails.**
- Visual: four meters (budget, mass, power, data) with one in the red

> Notes: "Real missions aren't designed one part at a time. They're designed inside a fixed budget, a mass limit, a power supply and a data link. Students almost never get to practise that trade-off — and that's what makes or breaks a mission."

### Slide 3 — Who it's for
- **High-school and early university students** — no engineering background needed
- **Alone or in a classroom group of up to 4**, one role each: Science, Spacecraft, Ground, Launch (NASA's four mission segments)
- Free, in the browser, on a phone or a projector · no install, no accounts, no data collected
- Plain English · 🔒 icon + text, not color alone · keyboard-friendly
- Visual: the four crew characters (AI-generated label)

> Notes: "It's built for a classroom: one screen, four students, each owning a part of the spacecraft and its resources — just like a real mission team."

### Slide 4 — How it works
- 1 Pick a science goal (with its budget) → 2 Choose an orbit → 3 Choose instrument, power, downlink and rocket → 4 Team Go/No-Go → 5 Watch the mission fly → 6 Scorecard
- **Four live meters: budget, mass, power, data.** Every choice moves them.
- Anything that no longer fits is **🔒 locked — and says why**, with the number that broke it.
- Visual: screenshot of the mission tree with the resource panel

> Notes: "Each choice spends resources. If an option no longer fits what's left, it locks and tells you exactly which resource ran out."

### Slide 5 — Managing resources: one mission (Polar Ice)
| Resource | Used | Limit |
|---|---|---|
| **Budget** | $210M | $250M — keeps a 16% reserve (CubeSat 101 asks for ≥ 10%) |
| **Mass** | 390 kg spacecraft | 1,207 kg medium rocket to SSO (the small rocket lifts only 241 kg → 🔒) |
| **Power** | 170 W used | 309 W generated; 568 Wh battery for each 35-min eclipse → only the hybrid fits |
| **Data** | 200 Gbit/day collected | 396 Gbit/day downlinked over 3 station passes |
| **Result** | **86 / 100 — mission success** | |
- Visual: scorecard gauge at 86

> Notes: "Here's one mission to study Arctic ice. In geostationary orbit the radar is too blurry, so we move to Landsat 9's orbit. Then the radar needs more power, the battery adds mass, and the mass decides the rocket. We land at 86 points with 16% of the budget still in reserve."

### Slide 6 — NASA resources we used
| NASA resource | How Status: GO uses it |
|---|---|
| **Landsat 9** | The sun-synchronous orbit and the multispectral camera; our validation case |
| **NASA Earth Fact Sheet** | Earth's radius and gravity in every orbit formula |
| **CubeSat 101** | The ≥ 10% budget reserve rule, quoted in the simulator |
| **ISS** | The 51.6° low orbit that never sees the poles |
| **Design and Develop Science Missions** | NASA's four mission segments = our four team roles |
| **Blue Marble** (NASA Earth Observatory) | The Earth in the mission film |
- ✓ Automated tests: the engine reproduces Landsat 9's ~99-min orbit, the 92.6-min orbit at 400 km and the 35,786 km geostationary altitude
- Visual: the film frame of the Earth (credit: NASA Earth Observatory)

> Notes: "The simulator isn't a quiz with made-up answers. NASA data drives the orbits and the rules, and automated tests check the engine against real missions like Landsat 9."

### Slide 7 — What's next
- More orbits (Molniya), Moon and Mars missions, a teacher mode with lesson plans, real-time multiplayer on separate phones
- **Fly it:** https://statusgo.earth/ · **Code:** github.com/OnePixelHome/NASA (MIT)
- *Built with help from SI tools (Claude, Claude Design, ChatGPT, HeyGen); reviewed and tested by the team. Not affiliated with or endorsed by NASA.*
- Visual: QR code to the simulator

> Notes: "Next: more orbits, the Moon and Mars, and a teacher mode. Scan the code, manage your own mission, and see if it's a GO."


## 4. Numbers used, and where they come from

Read from the engine on `a005892` (Polar Ice: SSO, Imaging Radar, Solar + Battery Hybrid, Daily Pass, Medium Launcher, 4 Go votes). Re-check if the catalog changes.

| Number | Source in code |
|---|---|
| Radar 511 m per pixel at GEO (needs ≤ 50 m); 10 m at SSO | `tierOptions('instrument')`, PHYS (resolution scaling) |
| $210M of $250M, 16% reserve; ≥ 10% rule | `budget()`, GAME + S2 (CubeSat 101) |
| 390 kg spacecraft; 1,207 kg (medium) and 241 kg (small) capacity to SSO | `spacecraftMassKg()`, `launchNode()`, PHYS (rocket equation) + GAME (masses) |
| 309 W generated vs 170 W used; 568 Wh battery; 35-min eclipse | `powerBudget()`, PHYS + GAME (depth of discharge) |
| 200 Gbit/day collected vs 396 Gbit/day downlinked; 3 passes/day | `downlinkCapacity()`, PHYS (pass geometry) + GAME (rates) |
| 86/100 | `evaluateMission()`, GAME |
| ~99 min, 92.6 min, 35,786 km | `engine.test.ts`, S1 / S6 / S10 |

## 5. Rename checklist for the team ("Trajectory Ladder" → "STATUS: GO", "game" → "simulator")

The pitch and deck above already use the new name. These are the other places that still say the old name, and who owns each:

| Where | What to change | Owner |
|---|---|---|
| `index.html` `<title>`, `src/App.tsx` (3 places), `src/index.css` (comment) | Title and header → **STATUS: GO** | Edgar / José (PR) |
| `src/engine/sources.ts` | Tagline (line 77): "…the game calculates…" → "…the simulator calculates…"; AI note (line 84): "labelled in the game" → "labelled in the simulator"; "illustrative **game** value" → "illustrative **simulator** value" (lines 70–71) | Edgar (PR) + Belle (copy) |
| `src/App.tsx` line 847 | "Every number in the game carries a tag…" → "in the simulator" | Edgar (PR) |
| Title screen, app header, video card, visual system (`docs/design/pages/*`) | New logo: `● STATUS: GO` status pill | Thais |
| `docs/PROJECT_PAGE.md` (project name + summary), `README.md`, `docs/COPY.md` | New name; "browser game" → "browser simulator" | Edgar + Belle |
| GitHub repo description and Pages "About" box | "STATUS: GO — Mission Simulator · NASA Space Apps 2026" | Belle (repo owner) |

Keep: the official challenge name *Space Mission Design Game*, and the `GAME` source tag in the code (internal; it shows as "illustrative" on screen).
