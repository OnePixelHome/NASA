# NASA

Repositorio público del equipo One Pixel Home (`OnePixelHome/NASA`, antes `belleavm/NASA`), en `C:\Lab\Belle\NASA` (Windows). Ramas por persona/tema con PR a `main`. El proyecto explorará un juego educativo interactivo de diseño y simulación de misiones espaciales basado en el desafío Space Apps 2026. El stack y el alcance concreto todavía no están definidos.

## Al empezar

- Leer `BACKUP.md` para conocer el contexto.
- `git fetch` y revisar si hay commits nuevos de la otra computadora antes de trabajar.

## Verificar

- Stack: Vite + React 19 + TypeScript, Tailwind v4, Vitest, pnpm (juego "Status: GO", antes "Trajectory Ladder"; ver `docs/HANDOFF.md`).
- `pnpm install`, `pnpm test` y `pnpm build` deben pasar antes de subir cambios.
- Despliegue: cada push a `main` publica el juego en GitHub Pages (https://onepixelhome.github.io/NASA/) con `.github/workflows/deploy-pages.yml`, y también en Azure Static Web Apps (https://victorious-pebble-0fcf34b10.6.azurestaticapps.net/) con `.github/workflows/azure-static-web-apps.yml`, que necesita el secreto `AZURE_STATIC_WEB_APPS_API_TOKEN`.

## Reglas

- Todo cambio se documenta en `BACKUP.md` en la misma sesión y antes del commit: qué cambió, por qué y qué quedó pendiente. Nunca incluir secretos.
- Los secretos no van en el repo: van en `C:\Users\bvasquez\lab_secrets\nasa\` (en la Mac, `~/lab_secrets/nasa/`).
- Desde el 2026-11-14 trabajan cuatro personas: cada cambio va en su propia rama (p. ej. `belle`, `feat/...`, `fix/...`) con PR a `main`. No hacer push directo a `main`.

## Harness del workspace

- `.githooks/pre-commit` exige `BACKUP.md` en cada commit y `.githooks/post-commit` hace el push solo. Confirmar con `git status -sb` que no quedó nada adelante de GitHub.
- El hook de cierre de Claude (`.claude/hooks/remind-backup.mjs`, en Node) no deja terminar si hay cambios sin backup o commits sin subir.
- En otra computadora: `git config core.hooksPath .githooks`.
