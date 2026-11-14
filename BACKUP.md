# BACKUP - NASA

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
