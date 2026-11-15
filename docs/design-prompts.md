# Prompts de Claude Design — Trajectory Ladder

Prompts para generar el diseño visual en Claude Design. Se ejecutan por fases, en orden; cada fase usa los tokens de la anterior. José y Edgar implementan el resultado en React (`src/App.tsx`, `src/ui/components.tsx`) sin tocar `src/engine/`.

Decisiones base: estilo ilustrado y amigable con paleta de espacio nocturno; móvil primero (390 px); la escalera de 4 niveles y sus bloqueos en cascada no cambian; 4 personajes por rol con una sola base; nave SVG en capas que se arma al lado de la escalera; SVG propios, imágenes de IA solo en fondos y con marca "AI-generated".

Estado: fases 1 a 8B ejecutadas; fase 9 escrita (diseño que falta según `docs/design/IMPLEMENTATION-GUIDE.md`). se escriben cuando la anterior esté aprobada. Ejecutar cada fase en el mismo proyecto de Claude Design para que reutilice los tokens.

---

## Fase 1 — Sistema visual

```text
Design the VISUAL SYSTEM (not screens yet) for "Trajectory Ladder", a mobile-first educational web game where students design a space mission and watch every choice ripple down a 4-step ladder. Audience: students. Tone: friendly, illustrated, curious, never childish. Everything in English.

OUTPUT: a single style-guide page that I can hand to React developers, plus a design-tokens block. Stack: React 19 + Tailwind v4. Provide tokens as CSS custom properties in an @theme block, and the components as React + Tailwind v4 snippets with the props listed below. Design at 390 px wide first, then show how it scales to ~1280 px.

1. COLOR (dark "night space" base with vivid accents)
- Surfaces: 3 levels of deep night blue (page, card, raised card) + 1 border color.
- Text: primary, secondary, muted. All text must reach WCAG AA contrast on its surface.
- One accent per ORBIT: LEO, SSO, GEO. Distinct hues, still distinguishable for color-blind users.
- One accent per ROLE: Science, Spacecraft, Ground, Launch. Each role also gets an icon and a short label, so color is never the only signal.
- Status colors: available, selected, locked, warning, error, success. Each status pairs with an icon (✓, 🔒, ⚠, ✕) and a text label.
- Show every swatch with its hex value and its contrast ratio.

2. TYPOGRAPHY
- One friendly rounded display font for titles and numbers, one highly readable sans for body. Use free Google Fonts only.
- Type scale for mobile and desktop: screen title, section title, card title, body, small, caption (source chip), big score number.
- Numbers use tabular figures.

3. SHAPE, SPACING, MOTION
- Radius scale, spacing scale (4 px base), shadow/glow scale for "raised" and "selected".
- Minimum touch target 44 px. Visible keyboard focus ring on every interactive element.
- Motion tokens: fast / base / slow durations, one easing curve. Respect prefers-reduced-motion.

4. BASE COMPONENTS (restyle these existing ones, same props)
- Bar({ label, value, max = 5, color }): segmented bar with the value at the right.
- Meter({ label, value, max, unit, warnAt }): progress meter with three states (ok, warning at warnAt, over max).
- Gauge({ score, success }): circular 0–100 score gauge, with success and fell-short variants.
- SourceChip({ id }): small pill. id is one of S1, S2, S3, S6, S10 (shown as "NASA S1"), PHYS (shown as "physics"), GAME (shown as "illustrative"). Must be tappable when it has a link.
- ReasonList({ reasons }): list of sentences, each ending with a SourceChip.
- Show each component in all its states at 390 px.

5. NODE CARD (the key piece of the game)
Design one selectable card used on the ladder, with these states: available, selected, locked, focused. A locked card shows 🔒 + text "Locked — tap for why". Anatomy: name, 1–2 short facts, role tag. Also design the "Why it works / Why it is locked" explanation panel that opens under the card.

6. ILLUSTRATION RULES
- Flat vector style, rounded shapes, thick soft outlines, limited palette taken from the tokens above.
- No NASA logos, insignias, flags or mission patches anywhere.
- Any AI-generated image must carry a visible "AI-generated" label. Prefer hand-made SVG for interface elements.

DELIVERABLES, in this order: (a) tokens block, (b) color + type specimen, (c) the 5 base components in all states, (d) the node card with its explanation panel, (e) a short "do and don't" list. Keep the page compact.
```

Criterios de aceptación: contraste AA en todo el texto, cada estado con icono y texto además del color, foco de teclado visible, sin desbordes a 390 px, sin marcas de NASA.

---

## Fase 2 — Escalera + nave (pantalla 3)

```text
Using the visual system we already defined in this project (tokens, colors, typography, Bar/Meter/SourceChip/ReasonList and the Node Card with its states), design SCREEN 3 of "Trajectory Ladder": "Build the mission tree". Do not invent new colors or fonts; reuse the tokens. Mobile first at 390 px, then a ~1280 px layout. Everything in English. Output React + Tailwind v4 components.

GAME LOGIC (must not change): a vertical LADDER of 4 steps, always in this order, each owned by a role:
1. Scientific instrument (Science): High-Res Camera, Multispectral Imager, Imaging Radar, Weather Imager.
2. Power system (Spacecraft): Standard, Extended, Solar + Battery Hybrid.
3. Data downlink (Ground): Daily Pass, Polar Station Network, Continuous Link.
4. Launch vehicle (Launch): Small, Medium, Heavy.
Above the ladder sits the chosen ORBIT chip (LEO, SSO or GEO, with its orbit color) that can be tapped to change it. A step stays disabled ("choose the step above first") until the one above has a choice. Picking an option can lock options below it; locked options show 🔒 + "Locked — tap for why" and open the "Why it is locked" panel when tapped. Available options can also open "Why it works". Header shows a Budget Meter. Bottom has the button "Go to Go / No-Go →", disabled until all 4 steps are chosen.

NEW VISUAL IDEA — THE SHIP BUILDS ITSELF:
Next to (desktop) or above (mobile, sticky and compact) the ladder, show an illustrated spacecraft as ONE layered SVG. Each ladder step controls one group of layers:
- Instrument → the payload on the front (4 variants: camera lens, multispectral prism, radar dish, weather imager).
- Power → solar panels and battery (3 variants: small panels, big panels, panels + battery pack).
- Downlink → the antenna (3 variants: small antenna, polar-tracking dish, big relay dish).
- Launch → the rocket under the ship (3 sizes: small, medium, heavy).
Layer states: empty (dashed outline "ghost" slot with the role icon), placed (full color), and incompatible (the piece looks cracked or dimmed with a ⚠ badge and tooltip text). Each slot is tinted with its role color and labelled with the role icon, never color alone.

FOUR ROLE CHARACTERS: one shared base character (round astronaut-style, friendly, no mission patches) recolored per role with a different accessory: Science (goggles), Spacecraft (wrench), Ground (headset), Launch (hard hat). Show them small beside each ladder step as the "owner" of that step, with a speech bubble that appears when the step is waiting or locked.

ANIMATIONS (CSS only, respect prefers-reduced-motion):
1. Cascade: when a choice is made, the steps below flash and the options that become locked flip to their locked state one after another (staggered, about 80 ms apart).
2. Ship: a new piece slides into its slot with a short settle; an incompatible piece shakes once.
3. Orbit chip: tapping it spins the planet icon once.

STATES TO DRAW (at 390 px): (a) start, nothing chosen except the orbit; (b) mid-build with two pieces placed and one locked option explained; (c) complete, ready for Go / No-Go; (d) conflict, one incompatible piece. Then the same (c) at ~1280 px.

ACCESSIBILITY: every option is a button with aria-pressed and an aria-label like "Imaging Radar: available" or "Imaging Radar: locked"; 44 px touch targets; visible focus ring; the ship has role="img" with a text description that updates with the choices.

KEEP EXISTING PROPS/STATE: the screen receives { choice, orbit, focus, onFocus, onPick(tier, id), onChangeOrbit, onDone }, and each node has { id, name, ok, facts[], reasons[{ text, source }] }. Do not add game rules.

No NASA logos, insignias, flags or patches. Draw the ship and characters as hand-made SVG, flat vector style with rounded shapes.

DELIVERABLES: the four states at 390 px, the complete state at ~1280 px, the ship SVG with named layer groups (payload, power, antenna, launcher) so developers can toggle them, the character base with its four variants, and the React component structure.
```

Criterios de aceptación: los 4 niveles y sus bloqueos se leen igual que en el prototipo; cada capa de la nave se activa por separado; los bloqueos muestran 🔒 + texto; foco visible; sin desbordes a 390 px; animaciones respetan `prefers-reduced-motion`.

---

## Fase 3 — Brief y Órbita (pantallas 1 y 2)

```text
Using the visual system, the crew characters and the ship we already built in this project (tokens, Fredoka + Atkinson Hyperlegible, Node Card states, SourceChip, Bar, Meter, orbit and role colors), design SCREEN 1 "Pick your mission" and SCREEN 2 "Choose a trajectory" of "Trajectory Ladder". Do not invent new colors or fonts. Mobile first at 390 px, then ~1280 px. Everything in English. Output React + Tailwind v4 components, and keep the same props.

SCREEN 1 — Brief({ onPick(id) }). Title "1 · Pick your mission", subtitle "Every mission starts with a science goal. It decides what 'success' means."
Three mission cards. Each card: an illustration, title, one-sentence story, a "Mission requirements" list shown as NUMBERS, and the budget.
- Crop Watch — "Track the health of farmland worldwide (up to 60° latitude) every couple of weeks." Requirements: observe up to 60° latitude, global coverage, revisit every 16 days. Budget $200M.
- Storm Watch — "Follow hurricanes over the Americas with a new image every few minutes." Requirements: observe up to 40° latitude, regional coverage, revisit every 6 hours. Budget $300M.
- Polar Ice — "Measure Arctic sea ice up to 80° latitude — including during the months-long polar night." Requirements: observe up to 80° latitude, global coverage, revisit every 3 days. Budget $250M.
Illustrations: flat SVG, one per mission (farmland patchwork seen from above, hurricane swirl, ice sheet). Cards are buttons; the whole card is tappable (44 px minimum, visible focus ring).
Add the Science character as a friendly guide with one speech bubble: "Pick the goal first. It decides what success means."

SCREEN 2 — OrbitPick({ scenario, selected, onPick(id) }). Title "2 · Choose a trajectory". Show the chosen mission as a small summary chip at the top (title + requirements). Show a small amber note: "Bars are illustrative values for educational purposes, derived from the physics below."
Three orbit cards: LEO (Low Earth Orbit, 500 km), SSO (Sun-Synchronous Orbit, 705 km), GEO (Geostationary Orbit, 35,786 km). Each card contains:
- A small orbit diagram in SVG: Earth with the orbit ring at a believable relative distance, a tiny satellite, and the orbit color. Not to scale, but GEO must look much farther than LEO.
- Name, short code and orbit color dot.
- Three 5-segment bars: "Fuel cost", "Coverage", "Lifetime" (use the Bar component).
- One-sentence blurb.
- Three fact lines: "Altitude 500 km · 95 min/orbit", "Reaches ±51.6° latitude" or "Fixed view of one hemisphere" (GEO), "+0.17 km/s beyond a 200 km orbit".
- Source chips (NASA S10 for LEO, NASA S6 for SSO, physics for GEO).
- Selected state (when `selected` matches) with the orbit color border and a ✓ label.
Add a one-line "Why this matters" helper that compares the cards without picking for the player.

ANIMATIONS (CSS only, respect prefers-reduced-motion, keep it to two):
1. Orbit diagram: the tiny satellite moves slowly around its ring; GEO is slower than LEO.
2. Mission card: a short lift and glow on hover, focus and press.

STATES TO DRAW at 390 px: Screen 1 default; Screen 2 default; Screen 2 with one orbit selected. Then both screens at ~1280 px, with the three cards side by side.

ACCESSIBILITY: each card is a button with an aria-label that includes the name and key numbers; color is never the only signal (orbit color + code + diagram shape); text meets AA on its surface; no horizontal scroll at 390 px.

No NASA logos, insignias, flags or patches. Hand-made SVG only, flat vector, rounded shapes.

DELIVERABLES: the states above, the three mission illustrations, the three orbit diagrams as reusable SVG components (OrbitDiagram({ orbitId })), and the React component structure for Brief and OrbitPick.
```

Criterios de aceptación: los requisitos de la misión aparecen como números (cierra una brecha de `docs/REQUIREMENTS.md`); las 3 órbitas se distinguen sin depender del color; las tarjetas son botones con foco visible; sin desbordes a 390 px; texto en inglés; sin marcas de NASA.

### Corrección de la fase 3 (valores reales del motor)

Los números de las tarjetas deben salir de `orbitStats()` y del catálogo, no escribirse a mano. Claude Design inventó varios; estos son los reales:

| Órbita | Periodo | Latitud máxima | Δv extra | Barras (combustible / cobertura / vida) |
|---|---|---|---|---|
| LEO 500 km | 94.6 min | ±51.6° | +0.17 km/s | 1 / 4 / 2 |
| SSO 705 km | 98.9 min | ±81.8° | +0.68 km/s | 2 / 5 / 3 |
| GEO 35,786 km | 1,436 min | vista fija de un hemisferio | +4.29 km/s | 5 / 3 / 5 |

Polar Ice real: hasta 80°, cobertura global, revisita cada 3 días, presupuesto $250M. En el diseño apareció ±82° y "polar coverage", que no coinciden.

---

## Fase 4 — Scorecard (pantalla 6)

```text
Using the visual system, crew characters and ship we already built in this project, design SCREEN 6 "Mission scorecard" of "Trajectory Ladder". Reuse the tokens, Gauge, Meter, Bar, SourceChip and Node Card. No new colors or fonts. Mobile first at 390 px, then ~1280 px. Everything in English. Output React + Tailwind v4 components with these props: Score({ choice, goVotes, onReplay, onRevise }). The data comes from evaluateMission() and has this shape: { score: 0-100, success: boolean, breakdown: [{ label, points, max }] (Science return /50, Data delivered /20, Budget & reserve /15, Team Go/No-Go /15), primaryConstraint: string, biggestImpact: string, lesson: string, timeline: [{ label, detail }] }. Do not invent game rules or numbers; use placeholders that look like real values.

LAYOUT, top to bottom:
1. Result banner: the ship from screen 3, complete, with the final score. Two variants: "Mission success" (celebration: the 4 crew characters cheer, confetti-like stars) and "Mission fell short" (the crew look worried, one damaged part highlighted, no shaming, encouraging tone).
2. Gauge (0–100) with the label "Illustrative score" underneath.
3. Breakdown: four Meters (Science return, Data delivered, Budget & reserve, Team Go/No-Go) showing points / max.
4. Three insight cards, each with an icon and a character as the speaker: "Primary constraint", "Biggest impact", "Lesson learned". The lesson card is the most prominent; it is what the student should remember.
5. A compact recap of the design chosen: orbit chip + the four chosen parts (instrument, power, downlink, launcher) with their role tags.
6. "Sources & assumptions": a collapsible section listing every source as a SourceChip + title (S1 Earth Fact Sheet, S2 CubeSat 101, S3 Design and Develop Science Missions, S6 Landsat 9, S10 ISS FAQ, plus "physics" and "illustrative"). Chips here ARE links.
7. Two buttons: "← Try another design" (secondary) and "Replay mission" (primary). Both at least 44 px, bottom-aligned on mobile.

ANIMATIONS (CSS only, respect prefers-reduced-motion, keep to three): the gauge fills from 0 to the score; the four meters fill one after another; the crew reaction pops in once. Nothing loops.

STATES at 390 px: (a) success with a high score, (b) fell short with a mid score and one broken ship part, (c) the Sources section open. Then (a) at ~1280 px with the ship and gauge on the left and the cards on the right.

ACCESSIBILITY: score and result also stated as text, not only in the gauge; meters have aria-labels "Science return: 40 of 50"; contrast AA; keyboard focus visible; no horizontal scroll at 390 px.

No NASA logos, insignias, flags or patches. Hand-made SVG, flat vector, rounded shapes.

DELIVERABLES: the states above, the React component structure with the props listed, and the success and fell-short crew reaction poses as reusable SVG.
```

Criterios de aceptación: el puntaje se lee también como texto; el tono de "fell short" es alentador, no de castigo; las fuentes enlazan a las URL reales de `src/engine/sources.ts`; sin desbordes a 390 px.

### Ajuste 4b — "Mission failed" en lugar de "fell short"

Decisión: el motor tiene dos resultados (`success = !overBudget && score >= 50`). Se diseña "Mission failed" cuando el presupuesto se excede o el puntaje es menor de 50, y desaparece "fell short". No se toca el motor.

```text
Update SCREEN 6 "Mission scorecard" in this project. The game has exactly TWO outcomes, decided by the engine: "Mission success" (within budget AND score 50 or more) and "Mission failed" (over budget OR score below 50). Remove every "fell short" wording and make "Mission failed" a complete, clearly different state, not a variation of success.

MISSION FAILED, design these two variants at 390 px (then the first one at ~1280 px):
(a) Low score: score 38, within budget.
(b) Over budget: score 61, but the budget Meter is red and over its maximum, so the mission fails anyway. The banner must say WHY in one plain sentence, e.g. "The design cost more than the budget, so the mission was cancelled before launch."
Each failed variant has:
- Banner "Mission failed" with its own icon (✕ plus a broken-part icon, never color alone) and the ship with the part that caused the problem cracked and highlighted. In variant (b) the ship stays on the ground, unlaunched.
- The four crew characters in a worried pose, one of them (the role responsible) stepping forward with a speech bubble that names the problem. Encouraging, never shaming tone; the title line under the banner says "Every real mission learns from this." 
- The same gauge, breakdown Meters, three insight cards and recap as in success. The "Lesson learned" card is the most prominent and is paired with a primary button "Try another design".
- Buttons: "← Try another design" becomes the PRIMARY action; "Replay mission" is secondary. (In success they stay the other way round.)
- Keep animations to three, none looping: gauge fills, meters fill in sequence, crew reaction pops in once.

Use placeholder numbers that look real. Do not add game rules or thresholds beyond: success = within budget AND score ≥ 50.

ALSO FIX: the Sources & assumptions section must list these exact links (replace the ones you guessed):
- S1 NASA Earth Fact Sheet — https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html
- S2 NASA CubeSat 101 — https://www.nasa.gov/wp-content/uploads/2017/03/nasa_csli_cubesat_101_508.pdf
- S3 NASA Design and Develop Science Missions — https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf
- S6 NASA Landsat 9 — https://science.nasa.gov/mission/landsat-9
- S10 NASA International Space Station FAQ — https://www.nasa.gov/?p=532244
- "physics" and "illustrative" have no link.

DELIVERABLES: failed (a) and failed (b) at 390 px, failed (a) at ~1280 px, the success state kept as before, the updated Score props { choice, goVotes, onReplay, onRevise } with a derived `failureReason: 'budget' | 'score' | null`, and the failed crew poses as reusable SVG.
```

Criterios de aceptación: el fracaso se distingue sin depender del color; el motivo se explica en una frase; el botón primario cambia a "Try another design"; ya no aparece "fell short"; los enlaces coinciden con `src/engine/sources.ts`.

---

## Fase 5 — Go/No-Go y Simulación (pantallas 4 y 5)

```text
Using the visual system, crew characters, ship and scorecard we already built in this project, design SCREEN 4 "Go / No-Go poll" and SCREEN 5 "Mission simulation" of "Trajectory Ladder". Reuse the tokens, Meter, SourceChip, the ship and the four crew characters. No new colors or fonts. Mobile first at 390 px, then ~1280 px. Everything in English. Output React + Tailwind v4 components. Do not add game rules.

SCREEN 4 — GoNoGo({ votes, setVotes, choice, onBack, onLaunch }). votes is { science, space, ground, launch }, each true (Go), false (No-Go) or null (waiting). Title "4 · Go / No-Go poll". Subtitle "Like a real launch: every role must say 'Go'. Playing as a team? Each player votes for their role."
- Four role cards (Science, Spacecraft, Ground, Launch), each with its crew character, role tag and icon, status text ("waiting…", "GO" or "NO-GO"), and two large buttons "Go" and "No-Go" (44 px minimum). Status uses icon + text, not only color.
- A compact ship recap with the chosen design (orbit chip + the four chosen parts) so the team reviews what they vote on.
- A budget Meter. If the reserve is under 10%, show an amber notice: "Budget reserve is X%. NASA guidance recommends keeping at least 10% in reserve." followed by a "NASA S2" SourceChip.
- If any vote is No-Go, show a red notice: "A No-Go means someone sees a problem. Go back, discuss and change the design." and make the crew member who voted No-Go look concerned.
- Buttons: "← Revise design" (secondary) and "🚀 Launch" (primary), disabled until all four roles say Go.
- States at 390 px: (a) nobody has voted, (b) three Go and one waiting, (c) one No-Go with the red notice, (d) all Go, Launch enabled.
- Animations (CSS only, none looping): a vote button presses in; the crew reaction pops once; the Launch button gets a short pulse when it becomes enabled.

SCREEN 5 — MissionRun({ choice, onDone }). Title "5 · Mission simulation". A progress bar fills while six timeline steps appear one every ~1.3 s, each a card with a label and one sentence. The steps, in order, with example text:
1. Launch — "Medium rocket lifts 214 kg (capacity 480 kg to SSO)."
2. Orbit reached — "Sun-Synchronous Orbit: one lap every 98.9 min, 36 min in shadow."
3. First light — "Multispectral Imager sees 30 m per pixel."
4. Daily operations — "9 of 12 Gbit/day reach Earth."
5. Coverage — "Revisits each spot about every 16 days."
6. End of mission — "~10 years of operations. Budget used: $105M of $200M."
Make this screen a small show, not just a list: above the cards, an animated scene that matches the current step — the ship on the pad and lift-off for step 1, the ship circling the planet on its orbit color for step 2, a camera flash and a small image appearing for step 3, a data line from the ship to a ground station for step 4, a coverage band sweeping the planet for step 5, and the crew waving for step 6. One scene at a time, CSS only, each plays once, and prefers-reduced-motion shows a still frame.
Buttons: "Skip" (secondary, only while running) and "See scorecard →" (primary, disabled until the last step is shown).
States at 390 px: step 1, step 3, step 6 finished. Then step 3 at ~1280 px with the scene on the left and the step cards on the right.

ACCESSIBILITY: votes and steps are readable as text; the progress bar has an aria-label "Mission progress: step 3 of 6"; new steps are announced with aria-live="polite"; visible focus; no horizontal scroll at 390 px.

No NASA logos, insignias, flags or patches. Hand-made SVG, flat vector, rounded shapes.

DELIVERABLES: the states above, the animated scene as a reusable component (MissionScene({ step, orbitId })) with one SVG group per step, and the React component structure with the props listed.
```

Criterios de aceptación: Launch solo se activa con los 4 Go; cada voto se lee con icono y texto; el aviso del 10 % de reserva lleva el chip "NASA S2"; las escenas de la simulación se reproducen una vez y respetan `prefers-reduced-motion`; sin desbordes a 390 px.

Notas para la implementación (no son diseño): hoy el puntaje de equipo siempre da 15/15 porque Launch exige los 4 Go, y "Try another design" conserva los votos anteriores, así que un diseño cambiado puede lanzarse sin nueva votación. Ver `docs/REQUIREMENTS.md`.

---

## Fase 6 — About / Sources

```text
Using the visual system, crew characters and ship we already built in this project, design the extra screen "About & sources" of "Trajectory Ladder". Reuse the tokens, SourceChip, Node Card and the crew. No new colors or fonts. Mobile first at 390 px, then ~1280 px. Everything in English. Output React + Tailwind v4 components. No game rules and no invented facts.

ENTRY POINT: a small "About" button in the app header, visible on every screen (icon + text, 44 px), that opens this screen. Show the header button and a "← Back to the game" button on the screen.

SECTIONS, top to bottom:
1. "What is Trajectory Ladder?": a two-sentence pitch — "Design a space mission and watch every choice ripple down. The game calculates the orbit and resources your mission needs to succeed." — with the ship and the four crew characters.
2. "How to play" in four short steps with an icon each: pick a mission, choose a trajectory, build the ladder, vote Go / No-Go and watch the simulation. Mention the four roles (Science, Spacecraft, Ground, Launch) as NASA's four mission segments.
3. "Where the numbers come from": explain the three kinds of chip — "NASA S#" (an official NASA resource), "physics" (standard orbital mechanics) and "illustrative" (a simplified game value). Show an example of each chip.
4. "Sources": the full list as SourceChip + title + link, opening in a new tab:
   - S1 NASA Earth Fact Sheet — https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html
   - S2 NASA CubeSat 101 — https://www.nasa.gov/wp-content/uploads/2017/03/nasa_csli_cubesat_101_508.pdf
   - S3 NASA Design and Develop Science Missions — https://www.nasa.gov/wp-content/uploads/2025/04/250323-design-and-develop-science-mission.pdf
   - S6 NASA Landsat 9 — https://science.nasa.gov/mission/landsat-9
   - S9 NASA Small Spacecraft Technology State-of-the-Art, Communications — https://www.nasa.gov/smallsat-institute/sst-soa/communications
   - S10 NASA International Space Station FAQ — https://www.nasa.gov/?p=532244
   - physics: Standard orbital mechanics (Kepler, Hohmann, rocket equation). No link.
   - illustrative: Simplified game value for educational purposes. No link.
5. "AI use" box, clearly visible with an icon, with this exact text: "Code scaffolding, the physics engine and documentation were drafted with Claude (Anthropic) and reviewed, tested and adapted by the team. Physics formulas are covered by automated tests; illustrative values are labelled in the game." Add a second line: "Images marked 'AI-generated' were made with AI." and show a sample "AI-generated" label exactly as it will appear on an image.
6. "Not affiliated with NASA": "Trajectory Ladder is an independent project made for the NASA Space Apps Challenge 2026. It is not affiliated with or endorsed by NASA. NASA does not endorse any non-U.S. Government entity." Use no NASA logos or insignia.
7. "Team": "One Pixel Home" with four small crew portraits and role titles (software architect, full-stack developer, product designer, MarTech specialist). Leave the names as editable placeholders.
8. Footer: "MIT License" and "No accounts, no cookies, no analytics."

STATES: 390 px full scroll as 3 stacked frames (top, middle, bottom); the entry button in the header on two other screens; ~1280 px with a two-column layout (sections 1–3 on the left, sources and AI box on the right).

ACCESSIBILITY: proper heading order, link text that names the destination ("NASA Earth Fact Sheet, opens in a new tab"), contrast AA, visible focus, no horizontal scroll at 390 px. No animations except a short fade when the screen opens.

DELIVERABLES: the frames above, the React component About({ onBack }), and a reusable AiGeneratedLabel component for images.
```

Criterios de aceptación: aviso de uso de IA con el texto exacto de `docs/HANDOFF.md`; todas las fuentes enlazadas, incluida S9; aviso de no afiliación con NASA; sin logos de NASA; sin desbordes a 390 px.

### Nota para la fase 6 (aviso de IA)

El aviso de `docs/HANDOFF.md` habla de código, motor de física y documentación. El diseño visual y las ilustraciones también se hicieron con IA (Claude Design), así que el aviso debe mencionarlo. Texto sugerido, a confirmar con el equipo: "Code scaffolding, the physics engine and documentation were drafted with Claude (Anthropic). The visual design and illustrations were drafted with Claude Design (Anthropic). All of it was reviewed, tested and adapted by the team. Physics formulas are covered by automated tests; illustrative values are labelled in the game."

---

## Fase 7 — Revisión de consistencia y tablero del flujo

```text
Do a CONSISTENCY PASS over the whole "Trajectory Ladder" design in this project, and then build a single FLOW BOARD page. Do not redesign anything and do not add features. Reuse the existing tokens, components, ship and crew.

PART 1 — CHECK AND FIX. Render every screen at 390 px and ~1280 px: Brief, Orbit pick, Mission tree, Go / No-Go, Mission simulation, Scorecard (success, failed by score, failed over budget) and About & sources. Look at each one yourself and fix, directly in the existing files:
- text that overlaps or is cut off (earlier reviews flagged the orbit chip, speech bubbles and one heading),
- anything that scrolls horizontally at 390 px,
- text below WCAG AA contrast (list each failing pair with its ratio, then fix it using the existing tokens),
- touch targets under 44 px, missing focus rings, and states that use color alone,
- inconsistent spacing, radius, type size or button style between screens,
- any NASA logo, insignia, flag or patch, and any AI image without a visible "AI-generated" label.
Report a short checklist with ✅ or ❌ per screen, and what you changed. Do not claim a check you did not do.

PART 2 — FLOW BOARD. One compact page, in the same night-space style, with all screens in order (Brief → Orbit → Tree → Go/No-Go → Simulation → Scorecard) as thumbnails connected by arrows, plus About. Mark the three key moments for a 30-second video with a small label each: "Lock cascade" (Mission tree), "Launch" (Simulation step 1) and "Score" (Scorecard). Under the board, add one line per screen with its purpose in under 10 words. At 1280 px as a horizontal strip and at 390 px as a vertical list.

DELIVERABLES: the checklist, the fixes applied to the existing pages, and the flow board page.
```

Criterios de aceptación: lista ✅/❌ por pantalla sin afirmar revisiones que no se hicieron; cada par de colores que falla AA corregido con los tokens existentes; ningún desborde a 390 px; tablero con los tres momentos clave del video.

---

## Fase 8A — Escritorio completo (~1280 px)

Estado real tras la fase 7: el tablero del flujo usa miniaturas de 390 px en fila; no es una versión de escritorio. A 1280 px solo existen: Brief, Orbit pick, Mission tree (completo), Go/No-Go (todo Go), Simulación (paso 3), Scorecard (éxito y fallo por puntaje) y About. Claude Design confirmó que a 1280 px solo vio partes de las pantallas.

```text
Complete the DESKTOP (~1280 px wide) version of "Trajectory Ladder". Reuse the existing tokens, components, ship and crew; do not redesign anything and do not add game rules. First list which desktop frames already exist in this project, then create ONLY the missing ones, so you do not redo work:
- Orbit pick with one orbit selected (SSO).
- Mission tree: start state, mid-build with one locked option explained, and the conflict state.
- Go / No-Go: nobody voted, and one No-Go with the red notice.
- Simulation: step 1 (launch) and step 6 (finished, crew waving).
- Scorecard: failed over budget (ship on the pad, red budget meter) and the Sources section open.
Desktop rules: content max-width 1280 px centered; the ship and the crew stay in a left column that is sticky while the right column scrolls; three cards side by side wherever the mobile version stacks three; keep the 44 px minimum targets and visible focus rings.
Then look at EVERY desktop frame yourself (not only an automated scan) and check: no overlapping or cut-off text, no sideways scroll, contrast AA, consistent spacing with the mobile frames. Report a ✅/❌ list per frame and say clearly which frames you did not look at.
DELIVERABLES: one "Desktop 1280" page with all desktop frames in screen order, the checklist, and any responsive notes (which breakpoints change layout) for the React developers.
```

Criterios de aceptación: ninguna pantalla sin versión de escritorio; lista ✅/❌ que dice qué cuadros no se vieron; notas de breakpoints para José y Edgar.

---

## Fase 8B — Extras (en este orden; parar cuando se acaben los tokens)

```text
Add these extras to "Trajectory Ladder" in this project, in this order. Reuse tokens, ship, crew; no new colors or fonts; keep CSS-only animation that respects prefers-reduced-motion; no game rules. Mobile first at 390 px, then ~1280 px, everything in English. For each extra, deliver the frames and a React component with its props.

1. VIDEO CARDS for the 30-second demo video. (a) Title card: the ship with the four crew, the name "Trajectory Ladder", the pitch line "Design a space mission and watch every choice ripple down." and the team name "One Pixel Home". (b) End card: the scorecard gauge at 86, the line "Every choice has a consequence." and "Built on NASA orbital data and Landsat 9 parameters." Both at 1920×1080 and 1080×1920. Add the team name; no NASA logos or insignia.
2. DEAD-END STATE on the Mission tree: a step where every option is locked. Show the crew member of that role with a helpful speech bubble ("Nothing fits here. Go back and change an earlier choice.") and a button "Change the step above". Keep it encouraging.
3. FIRST-RUN HINT: a three-bubble coach-mark sequence on the Mission tree ("Tap an option", "A 🔒 means something above doesn't fit — tap it to see why", "The ship builds as you choose"), dismissable, with "Skip" and "Got it". Must be keyboard accessible and not trap focus.
4. DIFFICULTY SELECTOR (optional, needs engine work, mark it clearly as a proposal for the developers): on the Brief screen, an "Easy / Standard / Hard" segmented control. Easy also explains why green options work; Hard hides numbers until the scorecard. Show how the Mission tree card looks in each mode.
DELIVERABLES: the frames per extra, the React components, and a short note for each saying whether it needs engine changes (only item 4 should).
```

Criterios de aceptación: los dos formatos de las tarjetas de video; el estado sin salida usa tono alentador; las pistas se pueden cerrar con teclado; solo la dificultad requiere cambios del motor.

---

## Fase 9 — Panel de recursos y "Launch anyway"

Dos piezas que existen en el código de `main` y no en el diseño.

```text
Using the visual system, ship and crew already built in this project, design two missing pieces of "Trajectory Ladder". Reuse the tokens and the Meter and SourceChip components; no new colors or fonts, no new game rules. Mobile first at 390 px, then ~1280 px, everything in English, React + Tailwind v4.

1. RESOURCE PANEL, shown in the app header on every game screen once a mission is picked (Mission tree, Go / No-Go, Simulation). Four compact meters: Budget (e.g. "$120M / $200M"), Mass (e.g. "390 / 1,207 kg"), Power (e.g. "96 / 140 W"), Data (e.g. "150 / 200 Gbit/day"). Each meter has: label, value text, a thin bar, a small status line and its source chips (illustrative or physics). States, always with an icon and words, never color alone: ok, low reserve (amber, "⚠ low reserve"), over limit (red, "⚠ over limit"), and "waiting" when its limit is not known yet, with a hint such as "pick a launcher to see the limit". Layout: a 2×2 grid at 390 px that collapses into a one-line summary with an expand button, and a 4-column row at ~1280 px. It must fit under the header without hiding the content, and stay compact. Draw: waiting, mid-build, all ok, and one meter over limit.

2. "LAUNCH ANYWAY" on the Go / No-Go screen. When every role has voted but at least one voted No-Go, the game still lets the team launch, at a cost to the team score. Design that state: the red notice ("A No-Go means someone sees a problem. Go back, discuss and change the design — or launch anyway and keep only 8 of 15 team points."), the crew member who voted No-Go looking worried, the primary button changing to an orange "Launch anyway (2 of 4 Go)" with a warning icon, and the secondary button "← Revise design" gaining emphasis. Draw it at 390 px and ~1280 px. Keep the all-Go state as it is.

DELIVERABLES: the frames above and the React components ResourcePanel({ meters }) and the updated GoNoGo footer. A meter is { id: 'budget'|'mass'|'power'|'data', label, used, limit: number|null, text, hint?, warnAbove?, over, sources }.
```

Criterios de aceptación: cada estado se lee con icono y texto; el panel cabe bajo el encabezado a 390 px; "Launch anyway" se distingue claramente de "Launch"; sin desbordes.
