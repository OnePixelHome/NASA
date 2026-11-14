# Prompts de Claude Design — Trajectory Ladder

Prompts para generar el diseño visual en Claude Design. Se ejecutan por fases, en orden; cada fase usa los tokens de la anterior. José y Edgar implementan el resultado en React (`src/App.tsx`, `src/ui/components.tsx`) sin tocar `src/engine/`.

Decisiones base: estilo ilustrado y amigable con paleta de espacio nocturno; móvil primero (390 px); la escalera de 4 niveles y sus bloqueos en cascada no cambian; 4 personajes por rol con una sola base; nave SVG en capas que se arma al lado de la escalera; SVG propios, imágenes de IA solo en fondos y con marca "AI-generated".

Estado: fase 1 lista para ejecutar. Fases 2 a 8 se escriben cuando la anterior esté aprobada.

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
