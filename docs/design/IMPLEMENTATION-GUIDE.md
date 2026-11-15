# Guía de entrega del diseño — para José y Edgar

Cómo llevar el diseño de Claude Design (`docs/design/`) al código de `main`. Se redactó el 2026-11-14 contrastando el diseño con `src/` (incluidos los PR #1 a #9 de Edgar).

## Regla de oro
**El motor manda.** `src/engine/` y sus tests no se tocan para encajar el diseño; el diseño se adapta a las funciones y tipos que ya existen. Los números, textos de reglas y enlaces de fuentes salen del motor (`orbitStats()`, `tierOptions()`, `budget()`, `resources()`, `evaluateMission()`, `SOURCES`), nunca de las páginas `.dc.html`, que traen valores de ejemplo. Los archivos de `handoff/` son código base a adaptar, no a copiar tal cual: sus importaciones (`./components`, `./Ship`, `./MissionTree`) chocan con `src/ui/components.tsx`.

## Orden recomendado (por impacto en el video de 30 s y el jurado)
Si el tiempo aprieta, parar donde se acabe: cada paso deja el juego funcionando. Congelar código: domingo 18:00.

| # | Paso | Archivos de diseño | Por qué en este orden |
|---|---|---|---|
| 0 | Base: tokens, fuentes y componentes | `handoff/theme.css`, `handoff/components.tsx` | Todo lo demás se apoya en esto |
| 1 | Escalera + nave (pantalla 3) | `MissionTree.tsx`, `Ship.tsx` | Es el momento "Lock cascade" del video |
| 2 | Scorecard (pantalla 6) | `Score.tsx` | Es el momento "Score" del video |
| 3 | Simulación (pantalla 5) | `GoNoGoRun.tsx` | Es el momento "Launch" del video |
| 4 | Brief y Órbita (pantallas 1 y 2) | `BriefOrbit.tsx` | Primera impresión |
| 5 | Go/No-Go (pantalla 4) | `GoNoGoRun.tsx` | |
| 6 | Encabezado y About | `About.tsx` | Aviso de IA obligatorio; ya existe una versión funcional |
| 7 | Extras | `Extras.tsx` | Solo si sobra tiempo |

Una preocupación por PR, `pnpm test` y `pnpm build` en verde antes de subir, y entrada en `BACKUP.md` (reglas de `AGENTS.md`).

## Paso 0 — Base
- Pasar `theme.css` a Tailwind v4 (`@theme`, en `src/index.css`) y cargar las fuentes **Fredoka** (títulos y números) y **Atkinson Hyperlegible** (cuerpo). Ambas son libres (licencia OFL): registrarlas en References con su licencia (`docs/DESIGN-RULES.md`). Revisar que sigan funcionando con `pnpm build:single` (HTML único): las fuentes de Google se cargan desde fuera, así que o se alojan en local o hay que aceptar el cambio.
- Sustituir las clases `slate-*`, `sky-*` y `emerald-*` de `src/App.tsx` por los tokens, sin cambiar la estructura.
- **Mantener las firmas actuales de `src/ui/components.tsx`**: `SourceChip({ id, link })`, `SourceChips`, `Sourced({ reason })`, `ReasonList`, `Meter({ …, source })`, `ResourcePanel({ meters })`, `Gauge`, `Bar`. Solo cambia su aspecto. El `SourceChip` del diseño recibe `href` a mano: no usarlo; el enlace sale de `SOURCES[id].url`, y dentro de botones `link={false}` (el diseño y el código coinciden en esto).

## Diferencias entre el diseño y el código actual (resolver así)

| Tema | Diseño | `main` hoy | Qué hacer |
|---|---|---|---|
| Panel de recursos | Solo un medidor de presupuesto | `ResourcePanel` con presupuesto, masa, energía y datos en el encabezado | **Conservar el panel actual y darle el estilo nuevo.** Falta diseño para él (ver "Diseño que falta") |
| Go/No-Go | "Launch" solo con 4 Go | Se puede lanzar con No-Go ("Launch anyway (n of 4 Go)") y el puntaje de equipo baja (`teamPoints()`) | **Seguir el código.** El botón naranja "Launch anyway" no está en el diseño: reutilizar el botón principal con el estilo de aviso |
| Aviso de reserva | Redondea el porcentaje | Usa `b.reserveFraction < C.RESERVE_FRACTION` y un aviso rojo si hay exceso de presupuesto | Seguir el código y sus textos |
| Resultado | "Mission failed" (puntaje < 50 o presupuesto excedido) | "Mission fell short" | Cambiar el texto a "Mission failed". No cambia la lógica: `card.success` ya es `!overBudget && score >= 50` |
| Motivo del fallo | `failureReason` | No existe | Derivarlo en la pantalla: `budget(choice).spentM > budget(choice).totalM` → "budget"; si no, `card.score < 50` → "score" |
| Medidor rojo del scorecard | `$238M / $200M` | — | Sale de `budget(choice)` |
| Tres insights | Textos sueltos | `primaryConstraint`, `biggestImpact`, `lesson` son `Reason` (texto + fuente) | Pintarlos con `Sourced` |
| Fuentes del scorecard | Lista fija | `card.sources` (calculada) | Usar `card.sources` |
| Simulación | Cada paso es `{ label, detail }`, empieza en el paso 1 | `TimelineStep` = `label` + `Reason`; empieza en 0 | Usar `Sourced` para el texto. Las 6 escenas SVG salen de `pages/MissionScene.dc.html` |
| `orbitId` de la escena | `"LEO" \| "SSO" \| "GEO"` | `leo \| sso \| geo` | Pasar `orbit.short` o convertir |
| About | Lista de fuentes propia y simplificada | Lista del motor con `use`, `quote` y `cite`, `AI_DISCLOSURE`, `DISCLAIMER`, `PITCH` | **Conservar el contenido del motor** y estilizarlo. Añadir del diseño: personajes, "How to play" y equipo |
| Botón About | Icono "i" en el encabezado de todas las pantallas | Botón de texto que alterna "About & sources" / "← Back to mission" y conserva el estado | Mantener el comportamiento actual, con el estilo nuevo |
| Tooltips de nodos | Botón "?" en la tarjeta | `title={n.tip}` y panel con `tip` + razones | Mantener `tip`; el "?" del diseño abre el mismo panel |
| Números de las tarjetas | Valores de ejemplo (algunos erróneos) | `orbitStats()` y el catálogo | Ignorar los del diseño. Tabla real en `docs/design-prompts.md` |
| Requisitos de la misión | Tres cifras por tarjeta | `needLatDeg`, `coverage`, `targetRevisitDays` en el escenario | Mostrarlos desde el escenario (0.25 días → "6 h"). Polar Ice es 80°, global, 3 días |

## Mapeo de la nave (`ShipSvg`) a los ids del catálogo
`ShipSvg` recibe `payload`, `power`, `antenna`, `launcher` y `bad`. Convertir así:

| Paso | id del catálogo → variante |
|---|---|
| Instrumento | `hires`→`camera`, `multispectral`→`prism`, `radar`→`radar`, `weather`→`weather` |
| Energía | `standard`→`small`, `extended`→`big`, `hybrid`→`hybrid` |
| Enlace | `daily`→`small`, `polar`→`polar`, `continuous`→`relay` |
| Lanzador | `small`, `medium`, `heavy` (igual) |

Una opción bloqueada o sin elegir pasa `null`. El estado "conflicto" (`bad`) es solo de diseño: `choose()` limpia lo que depende de un cambio anterior, así que no ocurre en el juego. No implementarlo.

## Lo que NO se implementa
- Las reglas de bloqueo del diseño (son de relleno; las reales están en `tierOptions()`).
- El estado de conflicto y el "estado sin salida" tal como se muestra: usa una regla de demo que no existe en el motor. Comprobar primero si el catálogo real puede dejar un paso sin opciones (la prueba de balance garantiza al menos 3 caminos viables); si no puede ocurrir, omitirlo.
- El selector de dificultad: necesita cambios del motor (modo Easy con razones, modo Hard con números ocultos) y el diseño de Hard ocultaría de más (el "8" de "8 colors"). Solo con tiempo.
- Las tarjetas de video (`pages/VideoCard.dc.html`): son para el video, no para la app.

## Huecos en el código de `handoff/`
- Ilustraciones de misión (`BriefOrbit.tsx`): copiar de `pages/MissionArt.dc.html`.
- Escenas de la simulación y `DesignRecap` (`GoNoGoRun.tsx`): copiar de `pages/MissionScene.dc.html` y `pages/GoNoGo.dc.html`. El paso 6 (tripulación saludando) no tiene escena en el React.
- Accesorios de los personajes (gafas, llave, auricular, casco): en `pages/Character.dc.html` y `pages/Ship.dc.html`.
- Globo de diálogo del banner de fallo (`Score.tsx`): vacío; quién habla y qué dice debe salir de los datos del juego.
- Las estrellas y el resumen del diseño de `Score.tsx`.

## Diseño que falta
1. **Panel de recursos** (masa, energía y datos junto al presupuesto): existe en el código y no está en el diseño.
2. **Estado "Launch anyway"** del Go/No-Go (lanzar con un No-Go).
La fase 9 de `docs/design-prompts.md` los cubre, pero **no se ejecutó** (Claude Design se quedó sin tokens): Edgar los resuelve en código con los tokens y el estilo de `Meter` y de los botones del diseño. El código actual ya cubre la funcionalidad; solo falta el estilo.

## Accesibilidad y reglas del hackatón al implementar
- Estados con icono y texto, no solo color; objetivos táctiles de 44 px; foco visible; `prefers-reduced-motion` desactiva animaciones (las animaciones del diseño son solo CSS).
- Sin logos, insignias, banderas ni parches de NASA. Toda imagen hecha con IA lleva la etiqueta visible "AI-generated" (`AiGeneratedLabel` en `About.tsx`).
- **Aviso de IA:** `AI_DISCLOSURE` en `src/engine/sources.ts` (y la página del proyecto, que debe coincidir) solo menciona código, física y documentación. El diseño visual y las ilustraciones también se hicieron con IA (Claude Design). Ampliar el texto; redacción sugerida en `docs/design-prompts.md`.
- `DISCLAIMER` puede ganar la frase "NASA does not endorse any non-U.S. Government entity", que sí está en el diseño y en `docs/DESIGN-RULES.md`.
- "No accounts, no cookies, no analytics" (pie del About) es cierto hoy; dejaría de serlo si se añade la tabla de posiciones con `localStorage`.
- Nombres del equipo en el About: el diseño trae `[Name]`.
