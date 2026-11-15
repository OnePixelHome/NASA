# Diseño visual — Claude Design

Exportación del diseño de Trajectory Ladder hecho en Claude Design (2026-11-14). Es **referencia y código base**: no está conectado a `src/` ni al motor. Los prompts con los que se generó están en `../design-prompts.md`.

## `handoff/` — código base para React 19 + Tailwind v4
- `theme.css` — tokens (colores, tipografía, radios, movimiento) y animaciones.
- `components.tsx` — Bar, Meter, Gauge, SourceChip, ReasonList y tarjeta de nodo.
- `Ship.tsx` — nave SVG en capas (`payload`, `power`, `antenna`, `launcher`).
- `MissionTree.tsx` — pantalla 3 y personajes de rol (`RoleCharacter`).
- `BriefOrbit.tsx` — pantallas 1 y 2.
- `GoNoGoRun.tsx` — pantallas 4 y 5.
- `Score.tsx` — pantalla 6 (éxito y "Mission failed").
- `About.tsx` — pantalla About, `AppHeader` y `AiGeneratedLabel`.
- `Extras.tsx` — pistas de primer uso, estado sin salida y selector de dificultad (propuesta).

Huecos conocidos: ilustraciones de misión, escenas de la simulación y `DesignRecap` están vacías en el React; los dibujos completos están en las páginas `.dc.html`.

## `pages/` — páginas de diseño (referencia visual)
Se abren en un navegador (necesitan `support.js` en la misma carpeta). Principales: `Trajectory Ladder Visual System`, `Screens 1-2 Brief and Orbit`, `Screen 3 Mission Tree`, `Screens 4-5 GoNoGo and Simulation`, `Screen 6 Scorecard`, `About and Sources`, `Desktop 1280`, `Extras` y `Flow Board`. Las demás (`MissionTree`, `Score`, `Ship`, `Character`, `MissionArt`, `MissionScene`, `OrbitDiagram`, …) son componentes y láminas de apoyo; `About.dc.html` y `FlowBoard.dc.html` son versiones anteriores de `About and Sources` y `Flow Board`.

## Antes de implementar
Leer los avisos de `../../BACKUP.md` (entradas del 2026-11-14 de la Mac de Thais): valores que deben salir del motor y no de las páginas, props que difieren del prototipo, reglas de demo que no existen en el juego y enlaces de fuentes que deben leerse de `src/engine/sources.ts`.
