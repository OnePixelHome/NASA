# BACKUP - NASA

## 2026-11-14 (PC de Edgar) — Borrador de la página del proyecto (`docs/project-page`, apilado sobre `fix/reserve-citation`)

- Nuevo `docs/PROJECT_PAGE.md` en inglés, con un apartado por campo de la página de Space Apps: resumen, descripción detallada, datos NASA y cómo se usa cada fuente, otras herramientas con su licencia, y la declaración de uso de IA.
- Las licencias se leyeron de los `package.json` instalados (todo MIT salvo TypeScript, Apache-2.0).
- Pendientes marcados como TODO en el archivo: enlaces del demo, del juego y del repo; herramientas de diseño y video de Thais y Belle; decidir si la fuente S9 se usa o se quita; ampliar la declaración de IA si se usan imágenes o voz generadas.

## 2026-11-14 (PC de Edgar) — Cita del 10% de reserva verificada (`fix/reserve-citation`, apilado sobre `feat/node-tooltips`)

- Se descargó el PDF de CubeSat 101 (96 páginas), se extrajo el texto y se buscó "reserve": hay una sola coincidencia, en el capítulo 2, página impresa 13 (página 21 del PDF): "When possible, project reserves of at least 10% should be part of the budget to address any unexpected events."
- La regla sigue etiquetada como NASA S2. `src/engine/sources.ts` guarda ahora la página (`cite`) y la cita textual (`quote`); la pantalla About las muestra.
- Se ajustó la redacción del aviso en Go/No-Go para que diga lo que dice la guía ("project reserves of at least 10% of the budget"), y se actualizaron README y `docs/COPY.md`.
- Verificado: 34 tests (2 nuevos sobre la regla) y build. Pendiente: merge después de los PR #1 a #6.

## 2026-11-14 (PC de Edgar) — Tooltips de nodos, HANDOFF §6-B2 (`feat/node-tooltips`, apilado sobre `docs/handoff-decisions`)

- Cada instrumento, sistema de energía, enlace y lanzador tiene un campo `tip` en `src/engine/catalog.ts` con 1–2 frases en inglés sencillo (texto borrador). Se muestra al tocar un nodo, encima de las razones.
- Nuevo `docs/COPY.md`: lista todos los textos que ve el jugador, dónde se editan y cuáles no debe tocar Belle (las frases generadas con números y etiquetas de fuente).
- Los tests limitan los tooltips a 2 frases, 170 caracteres y sin números (un número exigiría etiqueta de fuente).
- Verificado: 32 tests, build y recorrido a 390 px. Pendiente: revisión del texto por Belle; merge después de los PR #1 a #5.

## 2026-11-14 (PC de Edgar) — Decisiones aceptadas en HANDOFF §4 (`docs/handoff-decisions`, apilado sobre `feat/about-screen`)

- Se registraron en `docs/HANDOFF.md` §4 las decisiones que Edgar aceptó tras la validación: repo `belleavm/NASA`, PRs apilados, Go/No-Go con "Launch anyway" y puntos parciales, re-toque no destructivo, lema oculto en celular, aviso de no afiliación, `BACKUP.md` en español (interno) y todo lo que ve el jurado en inglés, y se omiten §6-B4 y §6-B5 salvo aviso.
- Se integró `main` (commits de Thais: prompts de diseño y hooks ejecutables) en los PR #1 a #4; el único conflicto era este archivo y se conservaron todas las entradas.
- Pendiente: tooltips (§6-B2), verificación de la cita del 10% de reserva, borrador de la página del proyecto y lista de entrega.

## 2026-11-14 (PC de Edgar) — Pantalla About & sources, HANDOFF §6-B3 (`feat/about-screen`, apilado sobre `feat/resource-panel`)

- Botón "About & sources" en el encabezado, disponible en cualquier paso; al volver se conserva el estado de la partida.
- La pantalla explica las etiquetas de fuente, lista los recursos NASA con enlace y cómo usa el juego cada uno, y muestra la declaración de uso de IA (HANDOFF §9) y un aviso de que el proyecto no está afiliado a NASA.
- Los textos viven en `src/engine/sources.ts` (`use` por fuente, `AI_DISCLOSURE`, `PITCH`, `DISCLAIMER`), no en el JSX.
- S9 (comunicaciones de satélites pequeños) aparece como lectura de referencia: ningún valor del juego sale de ahí todavía.
- Verificado: 29 tests, build y prueba en navegador a 390 px. Pendiente: confirmar en CubeSat 101 la cita de la reserva del 10% (S2); revisión y merge después de los PR #1–#3.

## 2026-11-14 (PC de Edgar) — Panel de recursos, HANDOFF §6-B1 (`feat/resource-panel`, apilado sobre `fix/go-no-go`)

- El encabezado muestra ahora cuatro medidores en vivo: Budget, Mass (kg vs capacidad del cohete), Power (W usados vs generados) y Data (Gbit/día recolectados vs bajados). Se actualizan al llenar el árbol.
- Nuevo `resources(choice)` en `src/engine/game.ts`; usa los mismos números que los candados, y un test comprueba que ningún camino viable exceda un medidor.
- Mientras falta elegir el nivel que fija el límite, el medidor indica qué elegir ("pick a launch vehicle"). El exceso se marca con texto además de color.
- En el celular el lema del encabezado se oculta al elegir misión para dejar espacio al panel.
- Verificado: 27 tests, build y recorrido a 390 px. Pendiente: revisión y merge después de los PR #1 y #2.

## 2026-11-14 (PC de Edgar) — Go/No-Go con puntaje real (`fix/go-no-go`, apilado sobre `fix/source-chips`)

- Antes el botón Launch exigía cuatro Go, así que el puntaje de equipo siempre era 15/15. Ahora se puede lanzar cuando los cuatro roles votaron; con algún No-Go el botón dice "Launch anyway" y solo se conserva la parte proporcional de los 15 puntos.
- Cambiar el diseño (órbita o cualquier nodo) reinicia la votación; antes los votos viejos seguían valiendo.
- Volver a tocar un nodo ya elegido solo muestra sus razones; antes borraba los niveles de abajo.
- El aviso de reserva ya no muestra porcentajes negativos: si se pasa del presupuesto lo dice directamente.
- Verificado: 22 tests, build y recorrido en navegador (2 Go + 2 No-Go → 8/15, puntaje 79). Pendiente: revisión y merge después del PR #1.

## 2026-11-14 (PC de Edgar) — Chips de fuente en todos los números (`fix/source-chips`)

- Cada número en pantalla lleva ahora su chip de fuente: presupuestos, medidor de presupuesto, datos de cada nodo, pasos de la simulación y los tres insights del scorecard.
- `Reason` admite fuentes adicionales (`also`) para frases que mezclan física con valores ilustrativos; se corrigieron etiquetas que presentaban supuestos del juego como física (pasadas por día, alcance del radar, batería).
- La lista de fuentes del scorecard se calcula a partir de lo citado en la misión, ya no está escrita a mano.
- Los chips dentro de botones ya no son enlaces (era HTML inválido).
- Verificado: 19 tests, build y recorrido a 390 px. Pendiente: revisión del equipo y merge del PR.
## 2026-11-14 (Mac de Thais) — Prompts de Claude Design

- Se creó `docs/design-prompts.md` con las decisiones base del diseño visual y el prompt de la fase 1 (sistema visual: paleta, tipografía, tokens, componentes base y tarjeta de nodo).
- Es documentación; no cambia código ni el motor.
- Pendiente: ejecutar la fase 1 en Claude Design; con su resultado escribir el prompt de la fase 2 (escalera + nave) y añadirlo a este archivo.

## 2026-11-14 (Mac de Thais) — Hooks ejecutables

- `.githooks/pre-commit` y `.githooks/post-commit` pasaron a modo ejecutable (100755). En la Mac git los ignoraba por falta de permiso, así que no corrían ni la exigencia de `BACKUP.md` ni el push automático.
- Al clonar en otra computadora: `git config core.hooksPath .githooks` (el permiso de ejecución ya viaja en el repo).
- Pendiente: prompts de Claude Design por fase (fase 1: sistema visual).

## 2026-11-14 (Mac de Thais) — Clon, hooks y validación local

- Se clonó `belleavm/NASA` en la Mac, se activaron los hooks (`git config core.hooksPath .githooks`) y se hizo `pull` de `main` (prototipo Trajectory Ladder v0.1).
- Validación HANDOFF §6-A1 en la Mac: `pnpm install`, `pnpm test` (15/15) y `pnpm build` pasan. `pnpm` no está instalado globalmente; se usó `corepack pnpm ...` (`corepack enable` falla por permisos en `/usr/local/bin`).
- Revisión estática del código: UI en inglés, sin logos de NASA, nodos y tarjetas accesibles con teclado. Sin verificar visualmente: móvil a 390 px y cobertura completa de chips de fuente (no hubo navegador en la sesión).
- Plan de diseño visual (rol de Thais, en Claude Design, luego implementan José y Edgar): estilo ilustrado y amigable con paleta de espacio nocturno; móvil primero (390 px); la escalera de 4 niveles y sus bloqueos NO cambian (el motor y los tests dependen de ella) y una nave SVG en capas se arma al lado; 4 personajes por rol con una sola base; SVG propios, imágenes de IA solo en fondos con marca "AI-generated"; entrega como componentes React + Tailwind v4 con las mismas props.
- Fases cortables para ahorrar tokens: sistema visual, escalera + nave, Brief y Órbita, Scorecard, Go/No-Go y Simulación, About/Sources, escritorio, extras.
- Pendiente: generar los prompts de Claude Design por fase; actualizar `docs/HANDOFF.md` con el rediseño de la experiencia cuando se apruebe.

## 2026-11-14 (PC de Edgar) — Importación del prototipo "Trajectory Ladder" v0.1

- Se importó el prototipo jugable (Vite + React 19 + TS, Tailwind v4, Vitest, pnpm): `src/engine` (física, catálogo, juego, fuentes, 15 tests) y `src/App.tsx` con las pantallas Brief → Órbita → Árbol → Go/No-Go → Simulación → Scorecard.
- Se agregaron `docs/HANDOFF.md` (decisiones del equipo, fuente de verdad) y `docs/REQUIREMENTS.md` (mapa requisito del reto → pantalla, con brechas).
- `README.md`: descripción del prototipo arriba; se conservó la sección de recursos del desafío. `CLAUDE.md`: se conservaron los imports y se añadieron las reglas del proyecto. `AGENTS.md`: sección Verificar con los comandos pnpm.
- `pnpm-workspace.yaml` fija `postcss` en 8.5.32: la 8.5.33 del lockfile original se publicó el 2026-11-13 y pnpm 12 la rechaza por antigüedad mínima. Se puede quitar el override después.
- Verificado: `pnpm test` (15/15) y `pnpm build` pasan; el flujo completo se recorrió a 390 px sin desbordes.
- Este cambio va en la rama `feat/prototype-import` con PR, no directo a `main`, porque ahora trabajan cuatro personas.
- Pendiente: HANDOFF §6-B (panel de recursos, tooltips, pantalla About/Sources, dificultad); chips de fuente faltantes; el puntaje de equipo siempre da 15/15; el repo sigue privado y la entrega necesita un enlace que el jurado pueda abrir (confirmar).

## 2026-11-14 (Windows) — Ideas de juego propuestas (hackatón desde el sábado 2026-11-15, 9 a. m.)

- Se propusieron 10 conceptos: 1) chat del equipo limitado por el enlace de comunicaciones de la nave; 2) consolas por rol en el celular (QR) con eventos en vivo; 3) comité de revisión con IA siguiendo CML 1→4; 4) juego de cartas de componentes con el lanzador como límite; 5) misión de observación sobre la ciudad del jugador con globo 3D; 6) satélite mascota para público juvenil; 7) misión diaria compartible comparada con misiones reales; 8) concurso de propuestas entre equipos; 9) sonificación de subsistemas; 10) autopsia narrada de misiones fallidas.
- Recomendación: combinar 2 + 1 + 10. Stack sugerido: web React, tiempo real con Supabase o Socket.io, motor de reglas en JSON con valores de CubeSat 101.
- Pendiente: elegir la idea con el equipo; revisar criterios del jurado, formato de entrega y reglas de marca; la página de ofertas globales pide login y no se pudo leer.

## 2026-11-14 (Windows) — Registro de recursos del desafío

- Se agregó a `README.md` una sección con los recursos de la pestaña Resources del desafío: referencias NASA/JPL sobre ingeniería de misiones, GMAT, niveles CML, Mission Design Lab, Mission Viz, el juego educativo de telescopios Webb, CubeSat 101 y el desafío VR de 2023; también se incluyó el recurso educativo de la Agencia Espacial Canadiense.
- Se añadió el aviso de NASA sobre no respaldar entidades no gubernamentales de EE. UU. y respetar los parámetros de uso de datos de cada sitio externo.
- Son referencias para investigación e inspiración; no se incorporaron dependencias ni se definió todavía el stack o el alcance del juego.

## 2026-11-14 (Windows) — Definición del desafío del proyecto

- Se definió el contexto del proyecto a partir del desafío NASA Space Apps Challenge 2026, [Space Mission Design Game](https://www.spaceappschallenge.org/2026/challenges/space-mission-design-game/).
- El concepto es un juego educativo interactivo para diseñar, administrar y simular misiones espaciales, haciendo visibles las compensaciones entre objetivos científicos, diseño de la nave, instrumentos, lanzador, órbita, presupuesto, masa, energía, comunicaciones, datos y duración.
- Se documentó como posibilidad el juego individual y colaborativo de hasta cuatro participantes, con retroalimentación educativa sobre resultados. Estas posibilidades no son todavía requisitos cerrados.
- Se actualizaron `README.md` y `AGENTS.md`. El stack y el alcance de implementación siguen pendientes.

## 2026-11-14 (Windows) — Creación y estructura harness

- Carpeta local `C:\Lab\Belle\NASA` y repositorio privado `belleavm/NASA`, solo rama `main`. Antes se verificó que no existía ninguna carpeta `nasa` en `C:\Lab` ni un repo NASA en `belleavm`.
- Harness copiado de las plantillas `C:\Lab\scripts\harness\`: `AGENTS.md`, `CLAUDE.md`, `.gitattributes`, `.githooks/pre-commit` y `post-commit`, y el hook Stop `.claude/hooks/remind-backup.mjs`.
- Hooks activados en esta Windows con `git config core.hooksPath .githooks`. En la Mac hay que activarlos al clonar.
- Es un repo anidado dentro de `Belle/` (`belleavm/cosas-mias`), que lo ignora en su `.gitignore`.
- Pendiente: definir el propósito y el stack del proyecto, y completar "Verificar" en `AGENTS.md`.
