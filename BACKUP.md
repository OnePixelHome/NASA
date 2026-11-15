# BACKUP - NASA

## 2026-11-14 (PC de Edgar) — Paso 0 del diseño y las dos piezas que faltaban (`feat/design-base`)

- Este branch incluye el commit de Thais de `docs/design-handoff` (exportación de Claude Design y guía de entrega), que no tenía PR.
- Paso 0 de la guía: los tokens de `handoff/theme.css` están en `src/index.css` (`@theme` de Tailwind v4) y todas las pantallas usan ya la paleta, la tipografía, los botones y los estados del diseño. Las firmas de `src/ui/components.tsx` no cambian; `ROLE_UI` vive en `src/ui/theme.ts`.
- Fuentes Fredoka y Atkinson Hyperlegible instaladas como paquetes (`@fontsource`, licencia OFL-1.1) en vez de cargarlas de Google: funcionan sin red y en `pnpm build:single`.
- Diseño que faltaba, resuelto en código: (1) panel de recursos con cuatro estados escritos con icono y texto (ok, low reserve, over limit, y "pick a…" mientras falta el límite), rejilla 2×2 en celular que se pliega a una línea con el botón "Resources", fila de cuatro desde 640 px; (2) estado "Launch anyway": con algún No-Go, "← Revise design" pasa a ser el botón principal y "⚠ Launch anyway (n of 4 Go)" queda con borde ámbar, sin relleno.
- "Mission fell short" pasó a "✕ Mission failed", con un aviso que dice cuál regla falló (presupuesto o puntaje). El umbral de 50 puntos se exporta del motor como `SUCCESS_SCORE_MIN`; la lógica no cambia.
- `AI_DISCLOSURE` menciona ahora el diseño hecho con Claude Design; se actualizaron la página del proyecto, `docs/COPY.md` y `docs/HANDOFF.md` §9 para que coincidan. Fuentes y Claude Design añadidos a la tabla de herramientas de `docs/PROJECT_PAGE.md`.
- `oxlint` ignora `docs/design/` (es código de referencia).
- Verificado: 34 tests, build, lint y recorrido completo en Edge a 390 y 1280 px sin desbordes ni errores, objetivos táctiles de 44 px.
- Pendiente (pasos 1 a 6 de la guía): nave y personajes en la escalera, ilustraciones de misión, escenas de la simulación, banner del scorecard, "How to play" y equipo en About, diseño de dos columnas en escritorio.

## 2026-11-14 (Mac de Thais) — Guía de entrega del diseño (`docs/design-handoff`)

- Se añadió `docs/design/IMPLEMENTATION-GUIDE.md` para José y Edgar, a partir de revisar `main` (PR #1 a #9): orden de implementación por impacto en el video, tabla de diferencias entre el diseño y el código, mapeo de la nave a los ids del catálogo, qué no implementar y huecos del código base.
- Hallazgos principales: `main` ya tiene panel de recursos (`ResourcePanel`), tooltips (`tip`), chips de fuente con `link`, About con contenido del motor y un Go/No-Go que permite "Launch anyway" con puntaje de equipo real; el diseño no tiene panel de recursos ni "Launch anyway", y dice "Mission fell short" donde el diseño dice "Mission failed". El motor manda.
- Se añadió la fase 9 (panel de recursos y "Launch anyway") a `docs/design-prompts.md`.
- La fase 9 no se ejecutó: Claude Design se quedó sin tokens. Decisión: Edgar resuelve el panel de recursos y "Launch anyway" en código, reutilizando los tokens y los componentes del diseño.
- Se commiteó `docs/DESIGN-RULES.md` (reglas de diseño y arte del Space Apps 2026): quedó sin seguimiento desde la sesión del 14/11 aunque ya se citaba en este archivo.
- Se abrió el PR de `docs/design-handoff` hacia `main` con revisión solicitada a José (@josel120) y Edgar (@edgarcardona872).
- Pendiente: ampliar `AI_DISCLOSURE` (y la página del proyecto) para mencionar el diseño hecho con Claude Design; revisión y merge del PR.

## 2026-11-14 (Mac de Thais) — Exportación de Claude Design ordenada en `docs/design/` (`docs/design-handoff`)

- Se abrió el zip de Claude Design (`NASAGAMEMISIONSIMULATOR.zip`, extraído en una carpeta temporal fuera del repo) y se ordenó: `docs/design/handoff/` (9 archivos: `theme.css` y los componentes React) y `docs/design/pages/` (las páginas `.dc.html` y `support.js`). Se añadió `docs/design/README.md` con el índice y los huecos conocidos.
- No se copiaron `uploads/` (copias antiguas de `HANDOFF.md`, `REQUIREMENTS.md` y `design-prompts.md`, que pisarían las versiones vigentes) ni `.thumbnail`. Se eliminaron de la raíz `About.tsx` y `GoNoGoRun.tsx` (sin seguimiento y verificados idénticos a los del zip).
- Es referencia: no toca `src/` ni el motor. Edgar ya implementó por su cuenta partes del diseño (pantalla About, panel de recursos, tooltips, chips de fuente); la guía de entrega debe partir de lo que hay en `origin/main`.
- Según `docs/DESIGN-RULES.md`, toda fuente o recurso externo, incluso gratuito, va en References con su licencia: Fredoka y Atkinson Hyperlegible (Google Fonts). Pasarle a Belle nombre y licencia.
- Pendiente: ejecutar en este branch el prompt de entrega de Claude Design; revisar `origin/main` y escribir la guía de entrega; no commitear el zip ni las capturas.

## 2026-11-14 (PC de Edgar) — Lista de entrega (`docs/submission-checklist`, apilado sobre `docs/project-page`)

- Nuevo `docs/SUBMISSION.md`: los seis requisitos de entrega con responsable, estado y cómo verificar cada uno (repo público, demo en Vercel que funcione en celular, video de 30 s con subtítulos en inglés, fuentes citadas, sin logos de NASA, licencia MIT), más listas para el repo, el demo, el video, la página del proyecto y la última hora.
- Estado hoy: licencia MIT lista; fuentes y logos en curso; repo público, demo y video sin hacer.
- Se revisó todo el historial con patrones de secretos antes de recomendar hacer público el repo: no se encontró ninguno. Repetir tras el último merge.
- Pendiente: que cada responsable marque su ítem; la descripción del repo en GitHub sigue en español ("Proyecto personal NASA") y el favicon sigue siendo el de la plantilla de Vite.

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

## 2026-11-14 (Mac de Thais) — Resultados de las fases 8A y 8B

- Fase 8A hecha en Claude Design: `Desktop 1280.dc.html` con 18 cuadros de escritorio (D1 a D18, todas las pantallas). Ya existían D1, D2, D3, D6, D10, D12, D14, D15 y D18; nuevos: D4, D5, D7 (árbol), D8, D9 (Go/No-Go), D11, D13 (simulación), D16, D17 (scorecard). Arreglos: títulos del árbol en una línea, etiquetas de rol y chip NASA S2 en una línea, chip de resumen de misión en el Orbit pick (cambia también la versión de 390 px), columna izquierda fija en Go/No-Go, y la lista de fuentes del scorecard ahora incluye S9 y coincide con About. Un solo punto de corte en 1024 px: debajo, una columna; desde ahí, columna izquierda fija y tres tarjetas en fila donde el móvil las apila (notas al pie de la página).
- Sin comprobar del todo: D10 (solo cabecera y mitad inferior), D17 (solo lista de fuentes y pie) y los cuadros de 390 px tras los cambios de 8A (el chip del Orbit pick sí cambia). Sin contraste nuevo: no se tocaron colores.
- Fase 8B hecha: `Extras.dc.html` y `handoff/Extras.tsx`. Tarjetas de video (título y cierre, 1920×1080 y 1080×1920, con "One Pixel Home" y sin marcas de NASA; el 86 es un ejemplo); estado sin salida en el árbol (para mostrarlo se bajó el presupuesto de demo a $120M y se inventó una regla de demo que no existe en el motor); pistas de primer uso (Skip / Next / Got it, Esc cierra, no atrapan el foco, "ya visto" solo en la sesión, sin guardar nada); selector de dificultad Easy / Standard / Hard marcado como propuesta que necesita cambios del motor.
- Por resolver al implementar: en Hard el diseño oculta solo "150 kg", pero el ayudante de `Extras.tsx` ocultaría también el "8" de "8 colors"; hay que decidir qué números se ocultan. Comprobar si el estado sin salida puede ocurrir con el catálogo real (la prueba de balance garantiza ≥ 3 caminos viables, así que solo aparecería tras malas elecciones previas).
- Pendiente: guía de entrega para José y Edgar; mover los archivos de entrega a `docs/design/handoff/`; descargar de Claude Design los archivos que aún no están (`theme.css`, `components.tsx`, `Ship.tsx`, `MissionTree.tsx`, `BriefOrbit.tsx`, `Score.tsx`, `Extras.tsx`); rehacer el prompt de revisión a 390 px del Orbit pick; completar nombres del equipo y el aviso de IA ampliado.

## 2026-11-14 (Mac de Thais) — Resultado de la fase 7 y prompts de la fase 8

- Fase 7 hecha en Claude Design: revisión de consistencia a 390 px y tablero del flujo (`Flow Board.dc.html`: seis miniaturas de 390 px con flechas en una tira horizontal, más About; los tres momentos del video marcados: "Lock cascade", "Launch", "Score"). Sin fallos AA (el más bajo, 5.2:1). Cambios: contador "of 6" en las pantallas 1 a 3, presupuesto $200M en el árbol, botón About en todos los encabezados, pasos en espera sin opacidad reducida, botón "Go to Go / No-Go →" de 16 px, flecha ↗ de los enlaces de About.
- Aclaración: el tablero no es la versión de escritorio. A 1280 px Claude Design solo vio partes de las pantallas, y solo existen algunos cuadros de escritorio. Se escribieron la fase 8A (completar escritorio) y la 8B (extras: tarjetas de video, estado sin salida, pistas de primer uso y selector de dificultad como propuesta) en `docs/design-prompts.md`.
- Nota de implementación: el selector de dificultad (8B, punto 4) requiere cambios del motor; el resto de extras no.
- Pendiente: ejecutar 8A y 8B; luego guía de entrega para José y Edgar y mover los archivos de entrega a `docs/design/handoff/`.

## 2026-11-14 (Mac de Thais) — Resultado de la fase 6 y prompt de la fase 7

- Fase 6 hecha en Claude Design: `About and Sources.dc.html` (390 px en tres cuadros, botón About en el encabezado, `AiGeneratedLabel` y diseño de dos columnas a 1280 px). Entrega: `About.tsx` con `About({ onBack })`, `AppHeader` y `AiGeneratedLabel`. Sin comprobar visualmente.
- `About.tsx` y `GoNoGoRun.tsx` están en la raíz del repo sin seguimiento (`??`); falta decidir su carpeta final (propuesta: `docs/design/handoff/`, sin tocar `src/`).
- Revisión de `About.tsx`: define su propia lista `SOURCES` (mismo nombre que la de `src/engine/sources.ts`, otra forma y títulos más cortos); en la implementación debe leer la del motor. Usa un `Chip` propio en lugar de `SourceChip`. El texto del aviso de IA coincide con `docs/HANDOFF.md`, pero ese texto no menciona que el diseño visual y las ilustraciones también se hicieron con IA (Claude Design); se propone ampliarlo (ver `docs/design-prompts.md`) y confirmarlo con el equipo. "MIT License" coincide con `LICENSE`; "No accounts, no cookies, no analytics" es coherente con el código actual (no hay `localStorage` en `src/`), pero deja de ser exacto si se añade la tabla de posiciones opcional. Nombres del equipo: marcadores `[Name]`; faltan por completar. Los textos de "How to play" los redactó Claude Design y deben revisarse con Belle.
- Se añadió el prompt de la fase 7 (revisión de consistencia y tablero del flujo con los tres momentos clave del video de 30 s) a `docs/design-prompts.md`.
- Pendiente: ejecutar la fase 7; descargar todos los archivos de `handoff/`; completar nombres del equipo.

## 2026-11-14 (Mac de Thais) — Resultado de la fase 5 y prompt de la fase 6

- Fase 5 hecha en Claude Design: `Screens 4-5 GoNoGo and Simulation.dc.html` (Go/No-Go en 4 estados a 390 px y todo-Go a 1280 px; simulación en los pasos 1, 3 y 6, una corrida completa y el paso 3 a 1280 px; las 6 escenas lado a lado). Archivo de entrega recibido: `GoNoGoRun.tsx` (guardado por ahora en Descargas, fuera del repo). Sin comprobar visualmente.
- Revisión de `GoNoGoRun.tsx` contra el juego: `GoNoGo` añade la prop `budget` ({ value, max }) y `MissionRun` recibe `timeline` y `orbitId` en vez de calcularlos; deben salir de `budget(choice)` y `evaluateMission(choice).timeline`. `orbitId` está tipado "LEO"|"SSO"|"GEO", pero el catálogo usa `leo|sso|geo`; pasar `orbit.short`. El aviso de reserva redondea (`Math.round`) y el motor no: con 9.6 % de reserva el diseño no avisa y el motor sí; usar `budget(choice).reserveFraction < RESERVE_FRACTION`. `SourceChip` recibe `href` a mano; usar `SOURCES` de `src/engine/sources.ts`. Las importaciones (`./components`, `./Ship`, `./MissionTree`) chocan con `src/ui/components.tsx` existente; hay que decidir dónde se colocan los archivos de entrega.
- Huecos: `DesignRecap` devuelve `null`; las escenas de la simulación están vacías (copiar de `MissionScene.dc.html`) y el paso 6 (tripulación saludando) no tiene escena ni en comentario ejecutable.
- Se mantienen como notas del motor: el puntaje de equipo siempre da 15/15 y los votos sobreviven a "Try another design".
- Se añadió el prompt de la fase 6 (About / Sources) a `docs/design-prompts.md`, con el texto exacto del aviso de IA de `docs/HANDOFF.md`, todas las fuentes (incluida S9) y el aviso de no afiliación con NASA.
- Pendiente: ejecutar la fase 6; fase 7 (escritorio) y, si hay tokens, la 8 (extras). Descargar todos los archivos de `handoff/` de Claude Design para dejarlos en el repo.

## 2026-11-14 (Mac de Thais) — Resultado del ajuste 4b y prompt de la fase 5

- Ajuste 4b hecho en Claude Design: la pantalla 6 tiene dos resultados, éxito (86) y "Mission failed" con dos variantes (puntaje bajo 38; presupuesto excedido 61, con la nave en la plataforma y un medidor rojo de $238M / $200M). Desapareció "fell short". El botón primario pasa a ser "Try another design" en el fallo. Enlaces de fuentes: los reales. Sin comprobar visualmente.
- El diseño añade un medidor de Budget que no estaba en el desglose de `evaluateMission()` (que solo tiene 4 puntajes); mostrar el gasto sale de `budget(choice)`. La regla de resultado en la página es `!overBudget && score >= 50`; `failureReason` ('budget' | 'score' | null) se deriva de ahí, no está en el motor.
- Hueco en `handoff/Score.tsx`: el globo de diálogo del banner de fallo está vacío; quién habla y qué dice debe salir de los datos del juego.
- Se añadió el prompt de la fase 5 (Go/No-Go y Simulación) a `docs/design-prompts.md`, con una escena animada por cada uno de los 6 pasos del timeline de `evaluateMission()`.
- Pendiente: ejecutar la fase 5 en Claude Design; luego fase 6 (About/Sources) y fase 7 (escritorio). Para la implementación: el puntaje de equipo siempre da 15/15 y "Try another design" conserva los votos (ver `docs/REQUIREMENTS.md`).

## 2026-11-14 (Mac de Thais) — Resultado de la fase 4 (Scorecard)

- Fase 4 hecha en Claude Design: `Screen 6 Scorecard.dc.html` con éxito (86), "fell short" (58, cohete pequeño agrietado), sección Sources abierta y éxito a 1280 px; poses de celebración y preocupación de la tripulación. Entrega en `handoff/Score.tsx`, con huecos: el resumen del diseño y las estrellas están vacíos, y faltan los ayudantes que convierten `choice` en piezas de la nave y el personaje con estados de ánimo (el dibujo completo está en `Score.dc.html` y `Character.dc.html`). Sin comprobar visualmente.
- Incoherencia con el motor: el diseño muestra 58 como "fell short", pero `evaluateMission()` da `success = !overBudget && score >= 50`, así que 58 dentro del presupuesto es éxito. Solo hay fracaso con puntaje < 50 o presupuesto excedido.
- Los enlaces de fuentes del diseño son a mano y S2, S3 y S10 son suposiciones; los reales están en `src/engine/sources.ts` y el React ya los lee de ahí.
- Los umbrales de color de las barras (verde ≥ 70 %, ámbar ≥ 50 %, rojo debajo) son solo de diseño, no una regla del juego.
- Decisión: dos resultados (éxito, o fallida si se excede el presupuesto o el puntaje es < 50); se elimina "fell short" y el motor no cambia. Se añadió el ajuste 4b a `docs/design-prompts.md`, que también fija los enlaces reales de las fuentes.
- Pendiente: ejecutar el ajuste 4b en Claude Design; luego fases 5 (Go/No-Go y Simulación) y 6 (About/Sources).

## 2026-11-14 (Mac de Thais) — Resultado de la fase 3, corrección de valores y prompt de la fase 4

- Fase 3 hecha en Claude Design: `Screens 1-2 Brief and Orbit.dc.html` (3 estados a 390 px, ambas pantallas a 1280 px, 3 ilustraciones de misión y 3 diagramas de órbita) y `handoff/BriefOrbit.tsx`. Sin renderizar todavía; las ilustraciones de misión en el React están vacías (copiar de `MissionArt.dc.html`).
- Valores inventados por Claude Design contrastados con el motor (`orbitStats()` y el catálogo). Periodo/latitud/Δv: LEO 94.6 min, ±51.6°, +0.17 km/s; SSO 98.9 min, ±81.8°, +0.68; GEO 1436 min, vista fija, +4.29. Barras reales (combustible/cobertura/vida): LEO 1/4/2, SSO 2/5/3, GEO 5/3/5. Claude Design puso LEO cobertura 2, SSO +0.28 y vida 4, GEO +3.9. Polar Ice real: hasta 80°, global, cada 3 días, $250M (el diseño puso ±82° y "polar coverage"). Dos errores (93 min y +0.10 para LEO) venían de mi prompt y se corrigieron en `docs/design-prompts.md`.
- Regla para la implementación: los números de las tarjetas deben salir de `orbitStats()` y del catálogo, no escribirse a mano.
- Los chips de fuente de las tarjetas de órbita no pueden ser enlaces porque la tarjeta entera es un botón; si deben enlazar, el enlace va fuera de la tarjeta.
- Se añadió el prompt de la fase 4 (Scorecard) a `docs/design-prompts.md`.
- Pendiente: ejecutar la fase 4 en Claude Design; comprobar contraste AA y textos superpuestos a 390 px; luego fases 5 (Go/No-Go y Simulación) y 6 (About/Sources).

## 2026-11-14 (Mac de Thais) — Resultado de la fase 2 y prompt de la fase 3

- Fase 2 hecha en Claude Design: pantalla 3 en `Screen 3 Mission Tree.dc.html` con los estados inicio, a medias, completo y conflicto a 390 px, y completo a 1280 px; nave en capas (`payload`, `power`, `antenna`, `launcher`) con hueco vacío y versión rota con ⚠; hoja de piezas y de los 4 tripulantes. Archivos de entrega: `handoff/MissionTree.tsx` y `handoff/Ship.tsx`. Siguen en Claude Design, no en el repo.
- Claude Design no vio la página renderizada; dice que carga sin errores. Una revisión marcó textos que se superponen en el chip de órbita, los globos de diálogo y un encabezado, pero solo en sus capturas.
- Para la implementación: las reglas de bloqueo de ese diseño son de relleno; las reales son `tierOptions()` en `src/engine/game.ts`. El estado de conflicto es solo de diseño, porque `choose()` limpia lo que depende de un cambio anterior. `Ship.tsx` omite detalles finos (líneas de los paneles). El personaje del React aún no tiene accesorios (gafas, llave, auricular, casco); los dibujos completos están en `Ship.dc.html` y `Character.dc.html`. La tarjeta lleva un botón "?" para abrir "Why it works", y tocar la tarjeta sigue eligiendo la opción.
- Se añadió el prompt de la fase 3 (Brief y Órbita) a `docs/design-prompts.md`; incluye los requisitos de la misión como números.
- Pendiente: ejecutar la fase 3 en Claude Design; comprobar el contraste AA y los textos superpuestos a 390 px; luego escribir la fase 4 (Scorecard).

## 2026-11-14 (Mac de Thais) — Prompt de la fase 2

- Se añadió a `docs/design-prompts.md` el prompt de la fase 2 (escalera + nave, pantalla 3): nave SVG en capas (payload, power, antenna, launcher), 4 personajes por rol y 3 animaciones CSS. La lógica de la escalera no cambia.
- Se ejecutó la fase 1 en Claude Design (guía `Trajectory Ladder Visual System.dc.html`; para desarrolladores `handoff/theme.css` con los tokens de Tailwind v4 y `handoff/components.tsx`). Fuentes: Fredoka (títulos y números) y Atkinson Hyperlegible (cuerpo). Esos archivos viven en Claude Design; aún no están en el repo.
- Por revisar de la fase 1: confirmar contraste AA (Claude Design no abrió la página para comprobarlo) y reemplazar los enlaces de los `SourceChip`, que son marcadores y no apuntan a nada; deben usar las URL de `src/engine/sources.ts`.
- Pendiente: ejecutar la fase 2 en Claude Design y, con su resultado, escribir la fase 3 (Brief y Órbita).

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
