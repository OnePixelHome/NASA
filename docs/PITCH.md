# Pitch & presentation — STATUS: GO

**Name:** **STATUS: GO — Mission Simulator** (short form *Status: GO*; keep the colon and capitals in the logo). Chosen Sun 2026-11-15, replacing "Trajectory Ladder". Call it a **simulator**, never a game. The only exception is the official challenge name, *Space Mission Design Game*.
Hashtag: `#StatusGoMission`.

Owner: Belle. Written Sun 2026-11-15 against `main` at `eef686d` (mission film + GitHub Pages).
Every number below was read from the engine on that commit (Polar Ice demo path). If the catalog changes, re-check §4.

**Rules (official Submission Guide):** video **≤ 30 s** with **English subtitles**; slides **≤ 7 including title and intro**;
must show **team name, members, challenge**, an image of the project, the user experience, and how NASA data makes it possible.
Over the limit = not eligible for Global Judging. No NASA logos, flags or patches. SI-generated frames (HeyGen avatar,
Gemini Flow clips, Claude Design art) carry a visible **"AI-generated"** label. Nobody under 18 in any frame.

---

## 1. Pitch line

> **STATUS: GO — Mission Simulator. Design a space mission. Every choice decides the launch.**

Tagline for title cards: *Every choice decides the launch.*

## 2. 30-second video script

Follows the official timeline (intro → challenge → title → idea + NASA data → future). 70 words ≈ 27 s at a calm pace,
leaving ~3 s of buffer. Read it aloud with a stopwatch before recording.

| Time | Voice (HeyGen avatar / Belle) | On screen | Label |
|---|---|---|---|
| 0:00–0:03 | "Hi, I'm Belle, from team One Pixel Home in Lima, Peru." | Avatar + team name + 4 names | AI-generated (avatar) |
| 0:03–0:06 | "We took on the Space Mission Design Game challenge." | Challenge title card | — |
| 0:06–0:10 | "Meet Status: GO — design a mission, and every choice decides the launch." | Title screen: `● STATUS: GO` | — |
| 0:10–0:20 | "Polar Ice in geostationary orbit? The radar locks — 511-meter pixels. Switch to Landsat 9's orbit, and everything turns green." | Screen recording: Polar Ice → GEO → radar 🔒 "511 m per pixel" → SSO → tree turns green → mission film launch | Film art: AI-generated (already labelled in the simulator) |
| 0:20–0:30 | "Built on NASA orbital data, it lets any student think like a mission engineer — on any phone, for free." | Scorecard **86/100** → Earth from the film → play URL | — |

**Recording notes**
- Record the simulator from the **public URL** (https://belleavm.github.io/NASA/), not a local build.
- Phone-shaped recording (390 px wide) reads best; zoom in on the lock reason so "511 m per pixel" is legible.
- Gemini Flow clips: no NASA logos, no real mission markings, no flags. Watermark every clip.
- HeyGen voice is synthetic → write "Voice and avatar: AI-generated (HeyGen)" in the YouTube description and in the file metadata.
- Music: none, or royalty-free with its licence listed in References.
- Export, then check the **exported file's** duration is ≤ 30.0 s.

### Subtitles (`pitch.srt`, adjust timings to the final edit)

```srt
1
00:00:00,000 --> 00:00:03,000
Hi, I'm Belle, from team
One Pixel Home in Lima, Peru.

2
00:00:03,000 --> 00:00:06,000
We took on the Space Mission
Design Game challenge.

3
00:00:06,000 --> 00:00:10,000
Meet Status: GO — design a mission,
and every choice decides the launch.

4
00:00:10,000 --> 00:00:14,500
Polar Ice in geostationary orbit?
The radar locks — 511-meter pixels.

5
00:00:14,500 --> 00:00:20,000
Switch to Landsat 9's orbit,
and everything turns green.

6
00:00:20,000 --> 00:00:25,000
Built on NASA orbital data, it lets any
student think like a mission engineer —

7
00:00:25,000 --> 00:00:29,500
on any phone, for free.
```

## 3. Slide deck (7 slides, including title)

Big type, few words, one visual per slide. Speaker notes are for a live pitch; they don't appear on the slides.

### Slide 1 — Title
- **STATUS: GO — Mission Simulator**
- *Design a space mission. Every choice decides the launch.*
- Team **One Pixel Home** · Lima, Peru · NASA Space Apps Challenge 2026
- Challenge: **Space Mission Design Game**
- Edgar Cardona — software architect · José Gómez — full-stack developer · Thais Rodríguez — product designer · Belle Vásquez Machado — MarTech specialist
- Visual: simulator title screen with the crew and the ship (AI-generated label)

> Notes: "We're One Pixel Home, four people from Lima, and this is Status: GO, a mission simulator."

### Slide 2 — The problem
- **Real missions fail when one choice breaks another.**
- Students learn orbits, cameras, batteries and rockets one at a time — rarely the chain between them.
- Visual: a broken chain of four icons (instrument → power → downlink → rocket)

> Notes: "In a real mission, the orbit decides which camera works, the camera decides how much power you need, and the power decides which rocket can lift you. Students almost never get to see that chain."

### Slide 3 — How it plays
- 1 Pick a mission → 2 Choose an orbit → 3 Build the tree → 4 Go/No-Go → 5 Watch your mission fly → 6 Scorecard
- Every option is **open** or **🔒 locked — and says why**.
- Visual: screenshot of the mission tree with one lock reason open

> Notes: "Three missions: Crop Watch, Storm Watch and Polar Ice. You choose an orbit, then four tiers: instrument, power, downlink, rocket. Anything that can't work with your earlier choices locks and tells you the number that broke it."

### Slide 4 — Every choice has a consequence (Polar Ice)
| Choice | What the simulator computes |
|---|---|
| Geostationary orbit | Radar 🔒 — 511 m per pixel (needs ≤ 50 m) |
| Sun-synchronous, like Landsat 9 | Radar ✓ — 10 m per pixel |
| Power | Only the hybrid works: the 35-min eclipse needs a 568 Wh battery |
| Rocket | Small rocket 🔒 — the rocket equation leaves 241 kg; the spacecraft is 390 kg |
| **Result** | **86 / 100** · $210M of $250M · 16% reserve kept |
- Visual: scorecard gauge at 86

> Notes: "Here's one run. From geostationary orbit the radar is far too blurry. Move to Landsat 9's orbit and it works — but now the batteries must survive a 35-minute shadow, and the rocket must lift 390 kilograms. 86 points, inside budget."

### Slide 5 — NASA data at the core
- **NASA Earth Fact Sheet** → every orbit formula (period, shadow, coverage, transfers)
- **Landsat 9** → the sun-synchronous orbit and the multispectral camera
- **ISS** → the 51.6° low orbit that never sees the poles
- **CubeSat 101** → the 10% budget reserve rule
- **Design and Develop Science Missions** → NASA's four segments = our four team roles
- **Blue Marble** (NASA Earth Observatory) → the Earth in the mission film
- ✓ Tested: reproduces Landsat 9's ~99-min orbit, the 92.6-min orbit at 400 km and the 35,786 km geostationary altitude
- Visual: the film frame of the Earth (credit: NASA Earth Observatory)

> Notes: "Status: GO isn't a quiz with made-up answers. NASA constants drive every formula, and automated tests check that the engine matches real missions like Landsat 9."

### Slide 6 — Built for classrooms
- **Up to 4 players, one screen** — Science, Spacecraft, Ground, Launch — the Go/No-Go vote turns disagreement into a decision
- Plain English · 🔒 icon + text, not color alone · keyboard-friendly · phone-first
- **Honest numbers:** every value is tagged NASA, physics or illustrative
- Free, in the browser, no install, no accounts, no data collected
- Visual: four crew characters voting (AI-generated label)

> Notes: "It's built for a classroom: four students, one phone or projector, each owning a part of the spacecraft — just like a real mission team."

### Slide 7 — What's next
- More orbits (Molniya), Moon and Mars missions, a teacher mode with lesson plans, real-time multiplayer on separate phones
- **Play it:** https://belleavm.github.io/NASA/ · **Code:** github.com/belleavm/NASA (MIT)
- *Built with help from SI tools (Claude, Claude Design, ChatGPT, HeyGen, Gemini Flow); reviewed and tested by the team. Not affiliated with or endorsed by NASA.*
- Visual: QR code to the simulator

> Notes: "Next: more orbits, Moon and Mars, and a teacher mode. Scan the code and fly your own mission — every choice has a consequence."

## 4. Numbers used, and where they come from

| Number | Source in code |
|---|---|
| 511 m per pixel (radar at GEO), ≤ 50 m needed | `tierOptions('instrument')`, PHYS (GSD scaling) |
| 10 m per pixel (radar at SSO) | same |
| 35-min eclipse, 568 Wh battery | `powerBudget()`, PHYS + GAME (depth of discharge) |
| 241 kg vs 390 kg (small rocket) | `launchNode()`, PHYS (rocket equation) + GAME (masses) |
| 86/100, $210M of $250M, 16% reserve | `evaluateMission()`, `budget()`, GAME + S2 |
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
